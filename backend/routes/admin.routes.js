const express = require('express');
const router = express.Router();
const { getUsers, approveUser, deleteUser, assignRole } = require('../controllers/admin.controller');
const { protect, admin } = require('../middleware/auth.middleware');

router.get('/users', protect, admin, getUsers);
router.put('/users/:id/approve', protect, admin, approveUser);
router.delete('/users/:id', protect, admin, deleteUser);

router.put('/users/:id/role', protect, admin, assignRole);

module.exports = router;