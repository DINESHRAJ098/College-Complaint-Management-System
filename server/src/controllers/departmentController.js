const departmentService = require('../services/departmentService');

const getDepartments = async (req, res, next) => {
  try {
    const departments = await departmentService.getDepartments();
    res.status(200).json({
      success: true,
      data: departments
    });
  } catch (err) {
    next(err);
  }
};

const getDepartmentById = async (req, res, next) => {
  try {
    const department = await departmentService.getDepartmentById(req.params.id);
    res.status(200).json({
      success: true,
      data: department
    });
  } catch (err) {
    next(err);
  }
};

const createDepartment = async (req, res, next) => {
  try {
    const department = await departmentService.createDepartment(req.body);
    res.status(201).json({
      success: true,
      message: 'Department created',
      data: department
    });
  } catch (err) {
    next(err);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const department = await departmentService.updateDepartment(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Department updated',
      data: department
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment
};
