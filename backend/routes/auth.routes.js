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
  updateAvatar,
  submitBrokerId, // 🎯 IMPORTAMOS LA NUEVA FUNCIÓN
  updatePhone // 🎯 IMPORTAMOS LA NUEVA FUNCIÓN
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/payment-method', protect, updatePaymentMethod); 
router.put('/broker-id', protect, submitBrokerId); // 🎯 NUEVA RUTA
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.put('/update-password', protect, updatePassword);
router.put('/profile/avatar', protect, updateAvatar); 
router.put('/profile/phone', protect, updatePhone);

module.exports = router;