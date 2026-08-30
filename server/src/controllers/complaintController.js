const complaintService = require('../services/complaintService');
const { analyzeGrievance } = require('../services/aiClassifierService');

const createComplaint = async (req, res, next) => {
  try {
    const complaint = await complaintService.createComplaint(req.body, req.user);
    res.status(201).json({
      success: true,
      message: 'Complaint lodged successfully',
      data: complaint
    });
  } catch (err) {
    next(err);
  }
};

const getComplaints = async (req, res, next) => {
  try {
    const result = await complaintService.getComplaints(req.query, req.user);
    res.status(200).json({
      success: true,
      data: result.complaints,
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
};

const getComplaintById = async (req, res, next) => {
  try {
    const result = await complaintService.getComplaintById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: result.complaint,
      comments: result.comments
    });
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const complaint = await complaintService.updateStatus(req.params.id, req.body, req.user);
    res.status(200).json({
      success: true,
      message: `Status updated to ${req.body.status}`,
      data: complaint
    });
  } catch (err) {
    next(err);
  }
};

const assignOfficer = async (req, res, next) => {
  try {
    const complaint = await complaintService.assignOfficer(req.params.id, req.body, req.user);
    res.status(200).json({
      success: true,
      message: 'Officer assigned successfully',
      data: complaint
    });
  } catch (err) {
    next(err);
  }
};

const resolveComplaint = async (req, res, next) => {
  try {
    const complaint = await complaintService.resolveComplaint(req.params.id, req.body, req.user);
    res.status(200).json({
      success: true,
      message: 'Complaint marked as Resolved',
      data: complaint
    });
  } catch (err) {
    next(err);
  }
};

const submitFeedback = async (req, res, next) => {
  try {
    const complaint = await complaintService.submitFeedback(req.params.id, req.body, req.user);
    res.status(200).json({
      success: true,
      message: 'Thank you! Your feedback has been recorded.',
      data: complaint
    });
  } catch (err) {
    next(err);
  }
};

const reopenComplaint = async (req, res, next) => {
  try {
    const complaint = await complaintService.reopenComplaint(req.params.id, req.body, req.user);
    res.status(200).json({
      success: true,
      message: 'Complaint has been reopened for further action.',
      data: complaint
    });
  } catch (err) {
    next(err);
  }
};

const escalateComplaint = async (req, res, next) => {
  try {
    const complaint = await complaintService.escalateComplaint(req.params.id, req.body, req.user);
    res.status(200).json({
      success: true,
      message: 'Complaint escalated to Grievance Redressal Committee.',
      data: complaint
    });
  } catch (err) {
    next(err);
  }
};

const addComment = async (req, res, next) => {
  try {
    const comment = await complaintService.addComment(req.params.id, req.body, req.user);
    res.status(201).json({
      success: true,
      message: 'Comment posted',
      data: comment
    });
  } catch (err) {
    next(err);
  }
};

const analyzePrompt = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const analysis = analyzeGrievance(title, description);
    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (err) {
    next(err);
  }
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
  addComment,
  analyzePrompt
};
