const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/admin', authorize('admin'), dashboardController.getAdminDashboard);
router.get('/hr', authorize('admin', 'hr'), dashboardController.getHRDashboard);
router.get('/manager/:id', authorize('admin', 'hr', 'manager'), dashboardController.getManagerDashboard);
router.get('/employee/:id', dashboardController.getEmployeeDashboard);

module.exports = router;
