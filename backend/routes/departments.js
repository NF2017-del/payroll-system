const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', departmentController.getAllDepartments);
router.get('/:id', departmentController.getDepartmentById);
router.post('/', authorize('admin', 'hr'), departmentController.createDepartment);
router.put('/:id', authorize('admin', 'hr'), departmentController.updateDepartment);
router.delete('/:id', authorize('admin'), departmentController.deleteDepartment);

module.exports = router;
