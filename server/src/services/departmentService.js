const Department = require('../models/Department');
const Complaint = require('../models/Complaint');
const User = require('../models/User');

const getDepartments = async () => {
  const departments = await Department.find({ isActive: true }).sort({ name: 1 });
  
  // Attach complaint counts and resolution statistics
  const enhanced = await Promise.all(
    departments.map(async (dept) => {
      const total = await Complaint.countDocuments({ department: dept._id });
      const resolved = await Complaint.countDocuments({ department: dept._id, status: 'Resolved' });
      const inProgress = await Complaint.countDocuments({
        department: dept._id,
        status: { $in: ['Submitted', 'Under Review', 'In Progress', 'Assigned'] }
      });
      const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;

      return {
        ...dept.toObject(),
        stats: {
          total,
          resolved,
          inProgress,
          resolutionRate
        }
      };
    })
  );

  return enhanced;
};

const getDepartmentById = async (id) => {
  const dept = await Department.findById(id);
  if (!dept) {
    const error = new Error('Department not found');
    error.statusCode = 404;
    throw error;
  }

  const officers = await User.find({ department: dept._id, role: 'officer' }).select('name email phone avatar');
  return { ...dept.toObject(), officers };
};

const createDepartment = async (data) => {
  const department = await Department.create(data);
  return department;
};

const updateDepartment = async (id, data) => {
  const department = await Department.findByIdAndUpdate(id, data, { new: true });
  return department;
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment
};
