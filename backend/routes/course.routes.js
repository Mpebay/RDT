const express = require('express');
const router = express.Router();
const { 
  getModules, 
  createModule, 
  updateModule, // <-- IMPORTAR
  deleteModule 
} = require('../controllers/course.controller');
const { protect, admin } = require('../middleware/auth.middleware');

router.get('/modules', getModules);
router.post('/modules', protect, admin, createModule);
router.put('/modules/:id', protect, admin, updateModule); // <-- NUEVA RUTA PUT
router.delete('/modules/:id', protect, admin, deleteModule);

module.exports = router;