const analyticsService = require('../services/analyticsService');

const getOverview = async (req, res, next) => {
  try {
    const overview = await analyticsService.getOverviewStats(req.user);
    res.status(200).json({
      success: true,
      data: overview
    });
  } catch (err) {
    next(err);
  }
};

const getCategoryStats = async (req, res, next) => {
  try {
    const categories = await analyticsService.getCategoryDistribution();
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (err) {
    next(err);
  }
};

const getDepartmentStats = async (req, res, next) => {
  try {
    const departments = await analyticsService.getDepartmentPerformance();
    res.status(200).json({
      success: true,
      data: departments
    });
  } catch (err) {
    next(err);
  }
};

const getTrends = async (req, res, next) => {
  try {
    const trends = await analyticsService.getMonthlyTrends();
    res.status(200).json({
      success: true,
      data: trends
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOverview,
  getCategoryStats,
  getDepartmentStats,
  getTrends
};
