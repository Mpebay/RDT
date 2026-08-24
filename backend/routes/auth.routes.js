const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { updatePassword } = require('../controllers/auth.controller');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile); // <-- Nueva ruta de sincronización
router.post('/forgot-password', require('../controllers/auth.controller').forgotPassword);
router.post('/reset-password/:token', require('../controllers/auth.controller').resetPassword);
router.put('/update-password', protect, updatePassword);

module.exports = router;