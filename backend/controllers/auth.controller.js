const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { z } = require('zod');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const sendBrevoEmail = async (toEmail, subject, htmlContent) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL;
  const targetEmail = toEmail || process.env.ADMIN_EMAIL || senderEmail;

  if (!apiKey) throw new Error('La variable de entorno BREVO_API_KEY no está configurada.');
  if (!targetEmail) throw new Error('No hay un destinatario válido para enviar el correo.');

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: "El Rincón del Trading", email: senderEmail },
      to: [{ email: targetEmail }],
      subject: subject,
      htmlContent: htmlContent
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al enviar correo con Brevo');
  }
  return await response.json();
};

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  phone: z.string().min(6, 'El número de teléfono no es válido'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  plan: z.string().optional(),
  checkoutPrice: z.number().optional(),
  broker: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria')
});

const parseZodError = (error) => {
  const issuesList = error.errors || error.issues;
  if (Array.isArray(issuesList) && issuesList.length > 0) {
    return issuesList.map(err => err.message).join('. ');
  }
  return error.message || 'Datos inválidos';
};

exports.registerUser = async (req, res, next) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      const error = new Error(parseZodError(validation.error));
      error.statusCode = 400;
      return next(error);
    }

    const { name, lastName, phone, email, password, plan, checkoutPrice, broker } = validation.data;

    const userExists = await User.findOne({ email });
    if (userExists) {
      const error = new Error('El usuario ya existe con ese correo');
      error.statusCode = 400;
      return next(error);
    }

    const isAdmin = email === process.env.ADMIN_EMAIL;
    const role = isAdmin ? 'admin' : 'user';

    const user = await User.create({ 
      name, lastName, phone, email, password, role, 
      isApproved: isAdmin, 
      isPaid: isAdmin, 
      plan, checkoutPrice, 
      broker: broker || 'independent' 
    });

    try {
      await sendBrevoEmail(
        process.env.ADMIN_EMAIL,
        'Nuevo Registro - El Rincón del Trading',
        `<h3>Nuevo usuario registrado en la plataforma</h3>
         <p><strong>Nombre:</strong> ${user.name} ${user.lastName}</p>
         <p><strong>Email:</strong> ${user.email}</p>
         <p><strong>Teléfono:</strong> ${user.phone}</p>
         <p><strong>Modalidad (Broker):</strong> ${user.broker.toUpperCase()}</p>
         <p><strong>Plan Elegido:</strong> ${user.plan}</p>
         <br>
         <p>Ingresa al panel de administración para gestionar su cuenta.</p>`
      );
    } catch (err) { console.error('⚠️ Error enviando correo al admin:', err.message); }

    res.status(201).json({
      _id: user._id, 
      name: user.name, 
      lastName: user.lastName,
      email: user.email, 
      role: user.role, 
      isApproved: user.isApproved,
      isPaid: user.isPaid, // NUEVO
      broker: user.broker, // NUEVO
      plan: user.plan,
      checkoutPrice: user.checkoutPrice,
      token: generateToken(user._id)
    });
  } catch (error) { next(error); }
};

exports.loginUser = async (req, res, next) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      const error = new Error(parseZodError(validation.error));
      error.statusCode = 400;
      return next(error);
    }

    const { email, password } = validation.data;
    const user = await User.findOne({ email });
    
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        isApproved: user.isApproved,
        isPaid: user.isPaid, // NUEVO
        broker: user.broker, // NUEVO
        plan: user.plan,
        checkoutPrice: user.checkoutPrice,
        token: generateToken(user._id)
      });
    } else {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      return next(error);
    }
  } catch (error) { next(error); }
};

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json({
        _id: user._id, 
        name: user.name, 
        lastName: user.lastName, 
        email: user.email, 
        role: user.role, 
        isApproved: user.isApproved,
        isPaid: user.isPaid, // NUEVO
        broker: user.broker, // NUEVO
        plan: user.plan,
        checkoutPrice: user.checkoutPrice
      });
    } else {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      return next(error);
    }
  } catch (error) { next(error); }
};

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

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; 
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
        </div>
      `
    );
    res.json({ message: 'Se ha enviado un correo con las instrucciones.' });
  } catch (error) { next(error); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      const error = new Error('La contraseña debe tener al menos 6 caracteres');
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
  } catch (error) { next(error); }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      const error = new Error('Ingresa tu contraseña actual y la nueva');
      error.statusCode = 400;
      return next(error);
    }
    if (newPassword.length < 6) {
      const error = new Error('La contraseña debe tener al menos 6 caracteres');
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      return next(error);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      const error = new Error('La contraseña actual es incorrecta');
      error.statusCode = 400;
      return next(error);
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) { next(error); }
};