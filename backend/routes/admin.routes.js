const express = require('express');
const router = express.Router();
const { getUsers, approveUser, deleteUser } = require('../controllers/admin.controller');
const { protect, admin } = require('../middleware/auth.middleware');

router.get('/users', protect, admin, getUsers);
router.put('/users/:id/approve', protect, admin, approveUser);
router.delete('/users/:id', protect, admin, deleteUser);

module.exports = router;