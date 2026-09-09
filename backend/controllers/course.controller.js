const CourseModule = require('../models/CourseModule');

exports.getModules = async (req, res) => {
  try {
    // Al haber un único plan "Acceso Total", los usuarios aprobados/admin ven todos los módulos cargados
    const modules = await CourseModule.find({}).sort({ createdAt: -1 });
    res.json(modules);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los módulos' });
  }
};

exports.createModule = async (req, res) => {
  try {
    const { title, description, videoUrl, duration, level, planRequired } = req.body;

    const module = new CourseModule({
      title,
      description,
      videoUrl,
      duration,
      level,
      planRequired: planRequired || 'Acceso Total'
    });

    await module.save();
    res.status(201).json(module);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el módulo' });
  }
};

exports.updateModulePlan = async (req, res) => {
  try {
    const { planRequired } = req.body;
    const module = await CourseModule.findById(req.params.id);
    if (!module) return res.status(404).json({ message: 'Módulo no encontrado' });

    module.planRequired = planRequired || 'Acceso Total';
    const updatedModule = await module.save();
    res.json(updatedModule);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el plan del módulo' });
  }
};

exports.deleteModule = async (req, res) => {
  try {
    const module = await CourseModule.findById(req.params.id);
    if (!module) return res.status(404).json({ message: 'Módulo no encontrado' });

    await module.deleteOne();
    res.json({ message: 'Módulo eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el módulo' });
  }
};