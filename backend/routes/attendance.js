const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', authorize('admin', 'hr', 'manager'), attendanceController.getAllAttendance);
router.get('/employee/:employeeId', attendanceController.getEmployeeAttendance);
router.get('/month/:employeeId/:year/:month', attendanceController.getMonthlyReport);
router.post('/clock-in', attendanceController.clockIn);
router.post('/clock-out', attendanceController.clockOut);
router.post('/', authorize('admin', 'hr'), attendanceController.createAttendance);
router.put('/:id', authorize('admin', 'hr'), attendanceController.updateAttendance);

module.exports = router;
