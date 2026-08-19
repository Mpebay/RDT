const express = require('express');
const router = express.Router();
const { 
  getModules, 
  createModule,
  deleteModule 
} = require('../controllers/course.controller');
const { protect, admin } = require('../middleware/auth.middleware');

// Ruta pública o protegida para ver los módulos (solo usuarios logueados y aprobados)
router.get('/modules', protect, getModules);

// Rutas exclusivas para administradores
router.post('/modules', protect, admin, createModule);
router.delete('/modules/:id', protect, admin, deleteModule);

module.exports = router;