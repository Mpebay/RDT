const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  forgotPassword, 
  resetPassword, 
  updatePassword,
  updatePaymentMethod,
  updateAvatar // NUEVO
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/payment-method', protect, updatePaymentMethod); // NUEVO
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.put('/update-password', protect, updatePassword);
router.put('/profile/avatar', protect, updateAvatar); // NUEVO

module.exports = router;