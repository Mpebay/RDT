const User = require('../models/User');
const axios = require('axios'); // Usamos el paquete estándar de Node

// Obtener todos los usuarios (excepto el propio admin que hace la petición)
exports.getUsers = async (req, res) => {
  try {
    // MEJORA: Buscar todos excepto el usuario actual para no auto-modificarnos
    const users = await User.find({ _id: { $ne: req.user._id } }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo usuarios' });
  }
};

// Aprobar usuario y enviar correo de bienvenida mediante la API HTTP de Brevo
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    user.isApproved = true;
    const updatedUser = await user.save();
    
    // Plantilla HTML del correo con la estética de la academia
    const emailHtml = `
      <div style="background-color: #0b0b0f; color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px 0; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #13131a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Logo / Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="font-size: 24px; font-weight: 900; font-style: italic; margin: 0; letter-spacing: -1px; color: #ffffff;">
              EL RINCÓN <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #ff5a00; font-style: normal; display: inline-block;">del trading</span>
            </h2>
          </div>

          <!-- Mensaje Principal -->
          <h1 style="font-size: 22px; font-weight: bold; color: #ffffff; margin-bottom: 20px; text-align: center;">
            ¡Cuenta Aprobada con Éxito! 🚀
          </h1>
          
          <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
            Hola <strong style="color: #ffffff;">${user.name || 'Trader'}</strong>,
          </p>
          
          <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
            Nos complace informarte que tu solicitud de acceso ha sido aprobada por nuestro equipo. Has entrado a un espacio exclusivo donde la teoría se convierte en rentabilidad y disciplina.
          </p>

          <!-- Botón de Acción -->
          <div style="text-align: center; margin-bottom: 35px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
               style="background-color: #ff5a00; color: #ffffff; padding: 14px 28px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 0 15px rgba(255,90,0,0.4);">
              Acceder a la Plataforma
            </a>
          </div>

          <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin-bottom: 10px;">
            Prepara tus herramientas y domina el mercado con precisión. ¡Nos vemos adentro!
          </p>

          <!-- Footer -->
          <div style="border-top: 1px solid rgba(255, 255, 255, 0.05); margin-top: 30px; padding-top: 20px; text-align: center;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} El Rincón del Trading. Todos los derechos reservados.
            </p>
          </div>

        </div>
      </div>
    `;

    // Petición HTTP POST a la API de Brevo
    try {
      await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { 
            name: "El Rincón del Trading", 
            email: process.env.SENDER_EMAIL 
          },
          to: [{ email: user.email, name: user.name || 'Trader' }],
          subject: '¡Tu acceso ha sido aprobado! - El Rincón del Trading',
          htmlContent: emailHtml,
        },
        {
          headers: {
            'api-key': process.env.BREVO_API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
    } catch (mailError) {
      console.error('Error al enviar el correo con la API de Brevo:', mailError.response?.data || mailError.message);
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error aprobando usuario' });
  }
};

// Eliminar/Rechazar usuario
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // PROTECCIÓN: Evita que el administrador se borre a sí mismo
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta' });
    }

    await user.deleteOne();
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando usuario' });
  }
};

// NUEVA FUNCIÓN: Asignar o quitar el rol de administrador de forma segura
exports.assignRole = async (req, res) => {
  try {
    const { role } = req.body; 
    
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Rol no válido' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // PROTECCIÓN: Evita que el administrador se quite el rol a sí mismo
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'No puedes cambiar tu propio rol por seguridad' });
    }

    user.role = role;
    
    // Si asciende a administrador, se aprueba su cuenta automáticamente
    if (role === 'admin') {
      user.isApproved = true;
    }

    const updatedUser = await user.save();
    res.json({ message: `Rol actualizado exitosamente a ${role}`, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando el rol' });
  }
};