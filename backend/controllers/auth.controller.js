const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  family: 4
});

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
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: 'Nuevo Registro - El Rincón del Trading',
        html: `<h3>Nuevo usuario registrado</h3>
               <p><strong>Nombre:</strong> ${user.name}</p>
               <p><strong>Email:</strong> ${user.email}</p>
               <p>Ingresa al panel de administración para autorizarlo.</p>`
      };
      transporter.sendMail(mailOptions, (err) => {
        if (err) console.error('⚠️ No se pudo enviar el correo:', err.message);
      });
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

// NUEVA FUNCIÓN: Para saber si el admin ya lo aprobó en la base de datos
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