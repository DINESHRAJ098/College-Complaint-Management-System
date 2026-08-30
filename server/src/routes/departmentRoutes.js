const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { protect, authorize } = require('../middlewares/auth');

router.get('/', departmentController.getDepartments);
router.get('/:id', departmentController.getDepartmentById);

router.post('/', protect, authorize('admin'), departmentController.createDepartment);
router.put('/:id', protect, authorize('admin'), departmentController.updateDepartment);

module.exports = router;
