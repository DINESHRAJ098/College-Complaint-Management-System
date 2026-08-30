const Complaint = require('../models/Complaint');
const Department = require('../models/Department');
const User = require('../models/User');

const getOverviewStats = async (user) => {
  const filter = {};
  if (user.role === 'student') {
    filter.complainant = user._id;
  } else if (user.role === 'officer' && user.department) {
    filter.department = user.department;
  }

  const [
    total,
    resolved,
    inProgress,
    underReview,
    submitted,
    critical,
    escalated,
    allComplaints
  ] = await Promise.all([
    Complaint.countDocuments(filter),
    Complaint.countDocuments({ ...filter, status: 'Resolved' }),
    Complaint.countDocuments({ ...filter, status: 'In Progress' }),
    Complaint.countDocuments({ ...filter, status: 'Under Review' }),
    Complaint.countDocuments({ ...filter, status: 'Submitted' }),
    Complaint.countDocuments({ ...filter, priority: 'Critical' }),
    Complaint.countDocuments({ ...filter, isEscalated: true }),
    Complaint.find(filter).select('status priority createdAt resolution feedback slaDeadline')
  ]);

  // Average resolution time
  const resolvedList = allComplaints.filter((c) => c.status === 'Resolved' && c.resolution && c.resolution.resolvedAt);
  let totalHours = 0;
  resolvedList.forEach((c) => {
    const diff = (new Date(c.resolution.resolvedAt) - new Date(c.createdAt)) / (1000 * 3600);
    totalHours += diff;
  });
  const avgResolutionHours = resolvedList.length > 0 ? Math.round((totalHours / resolvedList.length) * 10) / 10 : 0;

  // Average Satisfaction Rating
  const ratedList = allComplaints.filter((c) => c.feedback && c.feedback.rating);
  const totalRating = ratedList.reduce((acc, c) => acc + c.feedback.rating, 0);
  const avgRating = ratedList.length > 0 ? Math.round((totalRating / ratedList.length) * 10) / 10 : 4.8;

  // SLA Compliance
  const now = new Date();
  const breachedCount = allComplaints.filter((c) => {
    if (c.status === 'Resolved') return false;
    return c.slaDeadline && new Date(c.slaDeadline) < now;
  }).length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;

  return {
    total,
    resolved,
    inProgress,
    underReview,
    submitted,
    pending: total - resolved,
    critical,
    escalated,
    breachedCount,
    resolutionRate,
    avgResolutionHours,
    avgRating,
    ratedCount: ratedList.length
  };
};

const getCategoryDistribution = async () => {
  const categories = await Complaint.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        resolved: {
          $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);

  return categories.map((c) => ({
    category: c._id || 'Unassigned',
    count: c.count,
    resolved: c.resolved,
    rate: Math.round((c.resolved / c.count) * 100)
  }));
};

const getDepartmentPerformance = async () => {
  const departments = await Department.find({ isActive: true });
  
  const results = await Promise.all(
    departments.map(async (dept) => {
      const total = await Complaint.countDocuments({ department: dept._id });
      const resolved = await Complaint.countDocuments({ department: dept._id, status: 'Resolved' });
      const pending = total - resolved;
      const critical = await Complaint.countDocuments({ department: dept._id, priority: 'Critical' });
      const escalated = await Complaint.countDocuments({ department: dept._id, isEscalated: true });
      const rate = total > 0 ? Math.round((resolved / total) * 100) : 100;

      return {
        id: dept._id,
        name: dept.name,
        code: dept.code,
        color: dept.color,
        head: dept.headOfficerName,
        total,
        resolved,
        pending,
        critical,
        escalated,
        resolutionRate: rate
      };
    })
  );

  return results.sort((a, b) => b.total - a.total);
};

const getMonthlyTrends = async () => {
  // Aggregate complaints created in the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const complaints = await Complaint.find({
    createdAt: { $gte: sixMonthsAgo }
  }).select('createdAt status');

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trendMap = {};

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
    trendMap[key] = { month: key, submitted: 0, resolved: 0 };
  }

  complaints.forEach((c) => {
    const d = new Date(c.createdAt);
    const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
    if (trendMap[key]) {
      trendMap[key].submitted += 1;
      if (c.status === 'Resolved') {
        trendMap[key].resolved += 1;
      }
    }
  });

  return Object.values(trendMap);
};

module.exports = {
  getOverviewStats,
  getCategoryDistribution,
  getDepartmentPerformance,
  getMonthlyTrends
};
