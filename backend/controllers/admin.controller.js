const User = require('../models/User');

// Obtener todos los usuarios (excepto el propio admin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo usuarios' });
  }
};

// Aprobar usuario
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.isApproved = true;
      const updatedUser = await user.save();
      
      // Aquí podrías agregar lógica para enviarle un correo al alumno avisando que ya tiene acceso
      
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error aprobando usuario' });
  }
};

// Eliminar/Rechazar usuario
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: 'Usuario eliminado' });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando usuario' });
  }
};