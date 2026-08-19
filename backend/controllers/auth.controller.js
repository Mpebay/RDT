const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { z } = require('zod');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Función auxiliar para enviar correos mediante la API HTTP de Brevo
const sendBrevoEmail = async (toEmail, subject, htmlContent) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL;

  if (!apiKey) {
    throw new Error('La variable de entorno BREVO_API_KEY no está configurada.');
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: "Academia", email: senderEmail },
      to: [{ email: toEmail }],
      subject: subject,
      htmlContent: htmlContent
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Respuesta de error de Brevo:', errorData);
    throw new Error(errorData.message || 'Error al enviar correo con Brevo');
  }
  return await response.json();
};

// Esquemas de validación con Zod
const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria')
});

exports.registerUser = async (req, res, next) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      const errorMessage = validation.error.errors.map(e => e.message).join(', ');
      const error = new Error(errorMessage);
      error.statusCode = 400;
      return next(error);
    }

    const { name, email, password } = validation.data;

    const userExists = await User.findOne({ email });
    if (userExists) {
      const error = new Error('El usuario ya existe');
      error.statusCode = 400;
      return next(error);
    }

    const isAdmin = email === process.env.ADMIN_EMAIL;
    const role = isAdmin ? 'admin' : 'user';
    const isApproved = isAdmin; 

    const user = await User.create({ name, email, password, role, isApproved });

    if (!isAdmin) {
      try {
        await sendBrevoEmail(
          process.env.ADMIN_EMAIL,
          'Nuevo Registro - El Rincón del Trading',
          `<h3>Nuevo usuario registrado</h3>
           <p><strong>Nombre:</strong> ${user.name}</p>
           <p><strong>Email:</strong> ${user.email}</p>
           <p>Ingresa al panel de administración para autorizarlo.</p>`
        );
      } catch (err) {
        console.error('⚠️ No se pudo enviar el correo al administrador:', err.message);
      }
    }

    res.status(201).json({
      _id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved, token: generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      const errorMessage = validation.error.errors.map(e => e.message).join(', ');
      const error = new Error(errorMessage);
      error.statusCode = 400;
      return next(error);
    }

    const { email, password } = validation.data;

    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved, token: generateToken(user._id)
      });
    } else {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      return next(error);
    }
  } catch (error) {
    next(error);
  }
};

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json({
        _id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved
      });
    } else {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      return next(error);
    }
  } catch (error) {
    next(error);
  }
};

// Solicitar enlace de recuperación de contraseña
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      const error = new Error('El correo es obligatorio');
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('No existe una cuenta registrada con este correo');
      error.statusCode = 404;
      return next(error);
    }

    // Generar token único de recuperación
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Expira en 1 hora
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendBrevoEmail(
      user.email,
      'Recuperación de Contraseña - El Rincón del Trading',
      `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
          <h2 style="color: #ff5a00;">Solicitud de restablecimiento</h2>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para continuar:</p>
          <a href="${resetUrl}" style="background-color: #ff5a00; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin-top: 15px;">Restablecer Contraseña</a>
          <p style="margin-top: 20px; font-size: 12px; color: #777;">Si no solicitaste esto, puedes ignorar este correo de forma segura.</p>
        </div>
      `
    );

    res.json({ message: 'Se ha enviado un correo con las instrucciones.' });

  } catch (error) {
    console.error('⚠️ Error enviando correo con Brevo:', error);
    next(error);
  }
};

// Ejecutar el cambio de contraseña con el token
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      const error = new Error('La nueva contraseña debe tener al menos 6 caracteres');
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      const error = new Error('El enlace es inválido o ha expirado');
      error.statusCode = 400;
      return next(error);
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.' });
  } catch (error) {
    next(error);
  }
};