const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.get('/overview', analyticsController.getOverview);
router.get('/categories', analyticsController.getCategoryStats);
router.get('/departments', analyticsController.getDepartmentStats);
router.get('/trends', analyticsController.getTrends);

module.exports = router;
