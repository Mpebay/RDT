const CourseModule = require('../models/CourseModule');

exports.getModules = async (req, res) => {
  try {
    const modules = await CourseModule.find({}).sort({ createdAt: -1 });
    res.json(modules);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los módulos' });
  }
};

exports.createModule = async (req, res) => {
  try {
    // 🎯 AQUÍ FALTABA RECIBIR 'category' DESDE EL FRONTEND
    const { title, description, videoUrl, duration, level, planRequired, category } = req.body;

    const module = new CourseModule({
      title,
      description,
      videoUrl,
      duration,
      level,
      category: category || 'Clases Grabadas', // 🎯 AHORA SÍ SE GUARDA
      planRequired: planRequired || 'Acceso Total'
    });

    await module.save();
    res.status(201).json(module);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el módulo' });
  }
};

exports.updateModule = async (req, res) => {
  try {
    // 🎯 TAMBIÉN LO AGREGAMOS AQUÍ PARA QUE PUEDAS EDITARLO
    const { title, description, videoUrl, duration, level, planRequired, category } = req.body;
    const module = await CourseModule.findById(req.params.id);
    
    if (!module) return res.status(404).json({ message: 'Módulo no encontrado' });

    module.title = title || module.title;
    module.description = description !== undefined ? description : module.description;
    module.videoUrl = videoUrl || module.videoUrl;
    module.duration = duration || module.duration;
    module.level = level || module.level;
    module.category = category || module.category; // 🎯 SE ACTUALIZA LA CATEGORÍA
    module.planRequired = planRequired || module.planRequired;

    const updatedModule = await module.save();
    res.json(updatedModule);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el módulo' });
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