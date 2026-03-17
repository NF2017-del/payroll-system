const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', authorize('admin', 'hr', 'manager'), payrollController.getAllPayroll);
router.post('/process', authorize('admin', 'hr'), payrollController.processPayroll);
router.get('/employee/:employeeId', payrollController.getEmployeePayroll);
router.get('/month/:year/:month', authorize('admin', 'hr', 'manager'), payrollController.getPayrollByMonth);
router.get('/:id', payrollController.getPayrollById);
router.post('/', authorize('admin', 'hr'), payrollController.createPayroll);
router.put('/:id', authorize('admin', 'hr'), payrollController.updatePayroll);
router.delete('/:id', authorize('admin'), payrollController.deletePayroll);

module.exports = router;
