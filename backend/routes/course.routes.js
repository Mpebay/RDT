const express = require('express');
const router = express.Router();
const { getModules, createModule, updateModulePlan, deleteModule } = require('../controllers/course.controller');
const { protect, admin } = require('../middleware/auth.middleware');

router.get('/modules', protect, getModules);
router.post('/modules', protect, admin, createModule);
router.put('/modules/:id/plan', protect, admin, updateModulePlan);
router.delete('/modules/:id', protect, admin, deleteModule);

module.exports = router;