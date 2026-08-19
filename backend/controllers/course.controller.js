const CourseModule = require('../models/CourseModule');

// Solo Admin: Crear Módulo
exports.createModule = async (req, res) => {
  try {
    const newModule = await CourseModule.create(req.body);
    res.status(201).json(newModule);
  } catch (error) {
    res.status(500).json({ message: 'Error creando módulo', error: error.message });
  }
};

// Solo Admin: Eliminar Módulo
exports.deleteModule = async (req, res) => {
  try {
    await CourseModule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Módulo eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando módulo' });
  }
};

// Usuarios Aprobados: Ver Módulos
exports.getModules = async (req, res) => {
  try {
    if (!req.user.isApproved && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes acceso al contenido.' });
    }
    const modules = await CourseModule.find().sort({ createdAt: 1 });
    res.json(modules);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo módulos' });
  }
};