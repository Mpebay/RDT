const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const brevo = require('@getbrevo/brevo');

// Detección segura para evitar errores de módulos en Render
const brevoModule = brevo.default || brevo;

// Configurar Brevo con tu API Key
let apiInstance = new brevoModule.TransactionalEmailsApi();
let apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'El usuario ya existe' });

    const isAdmin = email === process.env.ADMIN_EMAIL;
    const role = isAdmin ? 'admin' : 'user';
    const isApproved = isAdmin; 

    const user = await User.create({ name, email, password, role, isApproved });

    if (!isAdmin) {
      try {
        let sendSmtpEmail = new brevoModule.SendSmtpEmail();
        sendSmtpEmail.subject = 'Nuevo Registro - El Rincón del Trading';
        sendSmtpEmail.htmlContent = `
          <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
            <h3>Nuevo usuario registrado</h3>
            <p><strong>Nombre:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p>Ingresa al panel de administración para autorizarlo.</p>
          </div>
        `;
        sendSmtpEmail.sender = { name: "Academia", email: process.env.SENDER_EMAIL };
        sendSmtpEmail.to = [{ email: process.env.ADMIN_EMAIL }];

        await apiInstance.sendTransacEmail(sendSmtpEmail);
      } catch (err) {
        console.error('⚠️ No se pudo enviar el correo al administrador:', err.message);
      }
    }

    res.status(201).json({
      _id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved, token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved, token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Credenciales inválidas' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json({
        _id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved
      });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Solicitar enlace de recuperación de contraseña
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No existe una cuenta registrada con este correo' });
    }

    // Generar token único de recuperación
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Expira en 1 hora
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    let sendSmtpEmail = new brevoModule.SendSmtpEmail();
    sendSmtpEmail.subject = 'Recuperación de Contraseña - El Rincón del Trading';
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
        <h2 style="color: #ff5a00;">Solicitud de restablecimiento</h2>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para continuar:</p>
        <a href="${resetUrl}" style="background-color: #ff5a00; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin-top: 15px;">Restablecer Contraseña</a>
        <p style="margin-top: 20px; font-size: 12px; color: #777;">Si no solicitaste esto, puedes ignorar este correo de forma segura.</p>
      </div>
    `;
    sendSmtpEmail.sender = { name: "Academia", email: process.env.SENDER_EMAIL };
    sendSmtpEmail.to = [{ email: user.email }];

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    res.json({ message: 'Se ha enviado un correo con las instrucciones.' });

  } catch (error) {
    console.error('⚠️ Error enviando correo con Brevo:', error);
    res.status(500).json({ message: 'Error al enviar el correo electrónico' });
  }
};

// Ejecutar el cambio de contraseña con el token
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'El enlace es inválido o ha expirado' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.' });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};