const CourseModule = require('../models/CourseModule');

exports.getModules = async (req, res) => {
  try {
    let query = {};

    if (req.user.role !== 'admin') {
      const userPlan = req.user.plan || 'Plata';
      // Si el usuario es Plata, solo ve módulos Plata. Si es Oro, no le ponemos filtro (ve todo).
      if (userPlan === 'Plata') {
        query.planRequired = 'Plata';
      }
    }

    const modules = await CourseModule.find(query).sort({ createdAt: -1 });
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
      planRequired: planRequired || 'Plata'
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
    if (!['Plata', 'Oro'].includes(planRequired)) {
      return res.status(400).json({ message: 'Plan no válido' });
    }

    const module = await CourseModule.findById(req.params.id);
    if (!module) return res.status(404).json({ message: 'Módulo no encontrado' });

    module.planRequired = planRequired;
    const updatedModule = await module.save();
    res.json(updatedModule);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el plan' });
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