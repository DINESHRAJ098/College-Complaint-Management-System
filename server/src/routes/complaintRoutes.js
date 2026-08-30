const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);

router.post('/analyze-prompt', complaintController.analyzePrompt);
router.get('/', complaintController.getComplaints);
router.post('/', complaintController.createComplaint);
router.get('/:id', complaintController.getComplaintById);
router.patch('/:id/status', authorize('officer', 'admin', 'committee'), complaintController.updateStatus);
router.patch('/:id/assign', authorize('officer', 'admin', 'committee'), complaintController.assignOfficer);
router.patch('/:id/resolve', authorize('officer', 'admin', 'committee'), complaintController.resolveComplaint);
router.post('/:id/feedback', complaintController.submitFeedback);
router.post('/:id/reopen', complaintController.reopenComplaint);
router.post('/:id/escalate', complaintController.escalateComplaint);
router.post('/:id/comments', complaintController.addComment);

module.exports = router;
