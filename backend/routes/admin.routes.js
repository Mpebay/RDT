const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  approveUser, 
  updateUserPlan, 
  deleteUser, 
  assignRole 
} = require('../controllers/admin.controller');
const { protect, admin } = require('../middleware/auth.middleware);');

router.get('/users', protect, admin, getUsers);
router.put('/users/:id/approve', protect, admin, approveUser);
router.put('/users/:id/plan', protect, admin, updateUserPlan);
router.put('/users/:id/role', protect, admin, assignRole);
router.delete('/users/:id', protect, admin, deleteUser);

module.exports = router;