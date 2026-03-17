const express = require('express');
const router = express.Router();
const leaveRequestController = require('../controllers/leaveRequestController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', leaveRequestController.getAllLeaveRequests);
router.get('/employee/:employeeId', leaveRequestController.getEmployeeLeaveRequests);
router.get('/:id', leaveRequestController.getLeaveRequestById);
router.post('/', leaveRequestController.createLeaveRequest);
router.put('/:id', leaveRequestController.updateLeaveRequest);
router.post('/:id/approve', authorize('admin', 'hr', 'manager'), leaveRequestController.approveLeaveRequest);
router.post('/:id/reject', authorize('admin', 'hr', 'manager'), leaveRequestController.rejectLeaveRequest);
router.delete('/:id', leaveRequestController.deleteLeaveRequest);

module.exports = router;
