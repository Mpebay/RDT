const User = require('../models/User');
const axios = require('axios');
const { approvalEmailTemplate } = require('../utils/emailTemplates');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo usuarios' });
  }
};

exports.approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const { plan } = req.body;
    if (plan && ['Plata', 'Oro'].includes(plan)) {
      user.plan = plan;
    }

    user.isApproved = true;
    user.isPaid = true; 
    const updatedUser = await user.save();
    
    let planBadgeColor = user.plan === 'Oro' ? '#eab308' : '#94a3b8';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    if (typeof approvalEmailTemplate === 'function') {
      const emailHtml = approvalEmailTemplate(user.name, user.plan, planBadgeColor, frontendUrl);

      try {
        await axios.post(
          'https://api.brevo.com/v3/smtp/email',
          {
            sender: { name: "El Rincón del Trading", email: process.env.SENDER_EMAIL },
            to: [{ email: user.email, name: user.name || 'Trader' }],
            subject: '¡Tu acceso ha sido aprobado! - El Rincón del Trading',
            htmlContent: emailHtml,
          },
          { headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' } }
        );
      } catch (mailError) {
        console.error('Error al enviar correo:', mailError.message);
      }
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error aprobando usuario' });
  }
};

exports.updateUserPlan = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['Plata', 'Oro'].includes(plan)) {
      return res.status(400).json({ message: 'Plan no válido' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    user.plan = plan;
    const updatedUser = await user.save();
    res.json({ message: `Plan actualizado a ${plan}`, user: updatedUser });
  } catch (error) { res.status(500).json({ message: 'Error actualizando el plan' }); }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta' });
    }
    if (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL) {
      return res.status(403).json({ message: 'Acción denegada: Administrador Principal.' });
    }

    await user.deleteOne();
    res.json({ message: 'Usuario eliminado' });
  } catch (error) { res.status(500).json({ message: 'Error eliminando usuario' }); }
};

exports.assignRole = async (req, res) => {
  try {
    const { role } = req.body; 
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Rol no válido' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (user._id.toString() === req.user._id.toString()) return res.status(400).json({ message: 'No puedes cambiar tu propio rol' });
    if (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL) return res.status(403).json({ message: 'Acción denegada.' });

    user.role = role;
    if (role === 'admin') {
      user.isApproved = true;
      user.isPaid = true;
    }

    const updatedUser = await user.save();
    res.json({ message: `Rol actualizado a ${role}`, user: updatedUser });
  } catch (error) { res.status(500).json({ message: 'Error actualizando el rol' }); }
};