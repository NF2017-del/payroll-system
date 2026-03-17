const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', authorize('admin', 'hr', 'manager'), employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.post('/', authorize('admin', 'hr'), employeeController.createEmployee);
router.put('/:id', authorize('admin', 'hr'), employeeController.updateEmployee);
router.delete('/:id', authorize('admin'), employeeController.deleteEmployee);

module.exports = router;
