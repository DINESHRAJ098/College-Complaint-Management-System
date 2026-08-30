const Complaint = require('../models/Complaint');
const Department = require('../models/Department');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { analyzeGrievance } = require('./aiClassifierService');
const { createNotification } = require('./notificationService');
const { emitComplaintCreated, emitComplaintUpdated, emitCommentAdded } = require('../config/socket');

const createComplaint = async (data, user) => {
  const { title, description, category, subcategory, departmentId, isAnonymous, location, attachments } = data;

  // Run AI / Smart analysis on grievance
  const aiAnalysis = analyzeGrievance(title, description);

  // Determine Department
  let targetDepartment;
  if (departmentId) {
    targetDepartment = await Department.findById(departmentId);
  }

  if (!targetDepartment) {
    // Attempt auto-match by suggested category
    targetDepartment = await Department.findOne({
      categories: aiAnalysis.suggestedCategory,
      isActive: true
    });
  }

  if (!targetDepartment) {
    // Fallback to first active department
    targetDepartment = await Department.findOne({ isActive: true });
  }

  const finalCategory = category || aiAnalysis.suggestedCategory;
  const finalPriority = aiAnalysis.suggestedPriority;

  // Calculate SLA Deadline
  const slaHours = targetDepartment ? targetDepartment.defaultSlaHours : 48;
  const slaMultiplier = finalPriority === 'Critical' ? 0.25 : finalPriority === 'High' ? 0.5 : 1;
  const targetHours = Math.max(4, Math.round(slaHours * slaMultiplier));
  const slaDeadline = new Date(Date.now() + targetHours * 3600 * 1000);

  const complaint = new Complaint({
    title,
    description,
    category: finalCategory,
    subcategory: subcategory || '',
    department: targetDepartment ? targetDepartment._id : null,
    departmentName: targetDepartment ? targetDepartment.name : 'General',
    complainant: user._id,
    complainantName: isAnonymous ? 'Anonymous Student' : user.name,
    complainantRollNo: isAnonymous ? 'HIDDEN' : user.studentId || '',
    isAnonymous: Boolean(isAnonymous),
    priority: finalPriority,
    status: 'Submitted',
    location: location || { block: '', floor: '', roomOrArea: '' },
    attachments: attachments || [],
    slaDeadline,
    aiAnalysis,
    timeline: [
      {
        status: 'Submitted',
        actor: user._id,
        actorName: isAnonymous ? 'Anonymous Student' : user.name,
        actorRole: user.role,
        note: isAnonymous ? 'Confidential complaint registered' : 'Complaint registered by student',
        timestamp: new Date()
      }
    ]
  });

  await complaint.save();

  // Notify Department Officers / Admins
  const officers = await User.find({
    $or: [{ department: complaint.department, role: 'officer' }, { role: 'admin' }]
  });

  for (const off of officers) {
    await createNotification({
      recipient: off._id,
      complaint: complaint._id,
      title: `New ${finalPriority} Priority Grievance`,
      message: `Ticket #${complaint.ticketNumber}: "${complaint.title}" requires attention in ${complaint.departmentName}.`,
      type: 'new_complaint'
    });
  }

  // Socket broadcast
  emitComplaintCreated(complaint);

  return complaint;
};

const getComplaints = async (query = {}, user) => {
  const {
    search,
    category,
    status,
    priority,
    department,
    isEscalated,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = query;

  const filter = {};

  // Role visibility scoping
  if (user.role === 'student') {
    filter.complainant = user._id;
  } else if (user.role === 'officer' && user.department) {
    filter.department = user.department;
  }

  if (status && status !== 'all') {
    filter.status = status;
  }

  if (category && category !== 'all') {
    filter.category = category;
  }

  if (priority && priority !== 'all') {
    filter.priority = priority;
  }

  if (department && department !== 'all') {
    filter.department = department;
  }

  if (isEscalated === 'true') {
    filter.isEscalated = true;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { ticketNumber: { $regex: search, $options: 'i' } },
      { 'location.roomOrArea': { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [complaints, total] = await Promise.all([
    Complaint.find(filter)
      .populate('department', 'name code color icon')
      .populate('assignedOfficer', 'name email avatar')
      .populate('complainant', 'name email studentId avatar')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Complaint.countDocuments(filter)
  ]);

  return {
    complaints,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    }
  };
};

const getComplaintById = async (id, user) => {
  const complaint = await Complaint.findById(id)
    .populate('department', 'name code location email phone color icon headOfficerName')
    .populate('assignedOfficer', 'name email phone avatar')
    .populate('complainant', 'name email studentId batch avatar phone')
    .populate('resolution.resolvedBy', 'name email role');

  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  // Security check: Students can only view their own complaints
  if (user.role === 'student' && complaint.complainant._id.toString() !== user._id.toString()) {
    const error = new Error('Access denied. You can only view your own complaints.');
    error.statusCode = 403;
    throw error;
  }

  // Fetch comments (students cannot see internal notes)
  const commentFilter = { complaint: complaint._id };
  if (user.role === 'student') {
    commentFilter.isInternalNote = false;
  }

  const comments = await Comment.find(commentFilter)
    .populate('author', 'name role avatar')
    .sort({ createdAt: 1 });

  return {
    complaint,
    comments
  };
};

const updateStatus = async (id, { status, note }, user) => {
  const complaint = await Complaint.findById(id);
  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  const prevStatus = complaint.status;
  complaint.status = status;

  complaint.timeline.push({
    status,
    actor: user._id,
    actorName: user.name,
    actorRole: user.role,
    note: note || `Status updated from ${prevStatus} to ${status}`,
    timestamp: new Date()
  });

  await complaint.save();

  // Notify student
  await createNotification({
    recipient: complaint.complainant,
    complaint: complaint._id,
    title: `Complaint #${complaint.ticketNumber} Status: ${status}`,
    message: `Your complaint is now marked as "${status}". Note: ${note || 'No additional note.'}`,
    type: 'status_updated'
  });

  emitComplaintUpdated(complaint);
  return complaint;
};

const assignOfficer = async (id, { officerId, officerName, slaHours }, user) => {
  const complaint = await Complaint.findById(id);
  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  complaint.assignedOfficer = officerId;
  complaint.assignedOfficerName = officerName;
  if (complaint.status === 'Submitted') {
    complaint.status = 'Assigned';
  }

  if (slaHours) {
    complaint.slaDeadline = new Date(Date.now() + Number(slaHours) * 3600 * 1000);
  }

  complaint.timeline.push({
    status: 'Assigned',
    actor: user._id,
    actorName: user.name,
    actorRole: user.role,
    note: `Assigned to ${officerName}. Target resolution within ${slaHours || 48} hours.`,
    timestamp: new Date()
  });

  await complaint.save();

  // Notify assigned officer
  await createNotification({
    recipient: officerId,
    complaint: complaint._id,
    title: 'Grievance Assigned to You',
    message: `You have been assigned complaint #${complaint.ticketNumber} (${complaint.title}).`,
    type: 'assigned'
  });

  emitComplaintUpdated(complaint);
  return complaint;
};

const resolveComplaint = async (id, { notes, proofAttachments }, user) => {
  const complaint = await Complaint.findById(id);
  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  complaint.status = 'Resolved';
  complaint.resolution = {
    notes: notes || 'Complaint resolved by assigned department authority.',
    resolvedAt: new Date(),
    resolvedBy: user._id,
    resolvedByName: user.name,
    proofAttachments: proofAttachments || []
  };

  complaint.timeline.push({
    status: 'Resolved',
    actor: user._id,
    actorName: user.name,
    actorRole: user.role,
    note: `Resolution: ${notes || 'Issue resolved.'}`,
    timestamp: new Date()
  });

  await complaint.save();

  // Notify student to rate
  await createNotification({
    recipient: complaint.complainant,
    complaint: complaint._id,
    title: 'Complaint Resolved 🎉',
    message: `Your complaint #${complaint.ticketNumber} has been marked as Resolved. Please review and provide your satisfaction feedback!`,
    type: 'status_updated'
  });

  emitComplaintUpdated(complaint);
  return complaint;
};

const submitFeedback = async (id, { rating, comment }, user) => {
  const complaint = await Complaint.findById(id);
  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  if (complaint.complainant.toString() !== user._id.toString()) {
    const error = new Error('Only the original complainant can submit resolution feedback.');
    error.statusCode = 403;
    throw error;
  }

  complaint.feedback = {
    rating: Number(rating),
    comment: comment || '',
    submittedAt: new Date()
  };

  complaint.timeline.push({
    status: 'Feedback Received',
    actor: user._id,
    actorName: user.name,
    actorRole: user.role,
    note: `Student rated resolution ${rating}/5 stars: "${comment || 'No comment'}"`,
    timestamp: new Date()
  });

  await complaint.save();

  if (complaint.assignedOfficer) {
    await createNotification({
      recipient: complaint.assignedOfficer,
      complaint: complaint._id,
      title: 'Resolution Feedback Received',
      message: `Student gave a ${rating}★ rating on #${complaint.ticketNumber}.`,
      type: 'feedback_received'
    });
  }

  emitComplaintUpdated(complaint);
  return complaint;
};

const reopenComplaint = async (id, { reason }, user) => {
  const complaint = await Complaint.findById(id);
  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  complaint.status = 'Reopened';
  complaint.timeline.push({
    status: 'Reopened',
    actor: user._id,
    actorName: user.name,
    actorRole: user.role,
    note: `Complaint reopened by student. Reason: ${reason || 'Unsatisfied with resolution.'}`,
    timestamp: new Date()
  });

  await complaint.save();

  if (complaint.assignedOfficer) {
    await createNotification({
      recipient: complaint.assignedOfficer,
      complaint: complaint._id,
      title: 'Complaint Reopened ⚠️',
      message: `Student reopened ticket #${complaint.ticketNumber}: "${reason || 'Unresolved issue'}"`,
      type: 'status_updated'
    });
  }

  emitComplaintUpdated(complaint);
  return complaint;
};

const escalateComplaint = async (id, { reason }, user) => {
  const complaint = await Complaint.findById(id);
  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  complaint.isEscalated = true;
  complaint.escalatedAt = new Date();
  complaint.escalationReason = reason || 'SLA timeline exceeded without resolution.';
  complaint.priority = 'Critical';

  complaint.timeline.push({
    status: 'Escalated',
    actor: user._id,
    actorName: user.name,
    actorRole: user.role,
    note: `Escalated to Grievance Redressal Committee & Principal: ${reason || 'SLA Breached'}`,
    timestamp: new Date()
  });

  await complaint.save();

  // Notify Admins & Committee
  const authorities = await User.find({ role: { $in: ['admin', 'committee'] } });
  for (const auth of authorities) {
    await createNotification({
      recipient: auth._id,
      complaint: complaint._id,
      title: `🚨 Escalated Grievance #${complaint.ticketNumber}`,
      message: `Escalated in ${complaint.departmentName}: "${complaint.title}". Reason: ${reason}`,
      type: 'escalation'
    });
  }

  emitComplaintUpdated(complaint);
  return complaint;
};

const addComment = async (complaintId, { content, isInternalNote, attachments }, user) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  const comment = await Comment.create({
    complaint: complaint._id,
    author: user._id,
    authorName: user.name,
    authorRole: user.role,
    content,
    isInternalNote: user.role !== 'student' ? Boolean(isInternalNote) : false,
    attachments: attachments || []
  });

  // Notify student or officer
  if (user.role === 'student' && complaint.assignedOfficer) {
    await createNotification({
      recipient: complaint.assignedOfficer,
      complaint: complaint._id,
      title: 'New Reply from Student',
      message: `Reply on #${complaint.ticketNumber}: "${content.substring(0, 80)}..."`,
      type: 'new_comment'
    });
  } else if (user.role !== 'student' && !comment.isInternalNote) {
    await createNotification({
      recipient: complaint.complainant,
      complaint: complaint._id,
      title: 'New Update from Grievance Cell',
      message: `${user.name} posted on #${complaint.ticketNumber}: "${content.substring(0, 80)}..."`,
      type: 'new_comment'
    });
  }

  emitCommentAdded(complaintId, comment);
  return comment;
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateStatus,
  assignOfficer,
  resolveComplaint,
  submitFeedback,
  reopenComplaint,
  escalateComplaint,
  addComment
};
