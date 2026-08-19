require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const courseRoutes = require('./routes/course.routes');

const app = express();
app.set('trust proxy', 1);
app.use(express.json());
app.use(cors());

// Rate Limiting: Protege las rutas de autenticación de fuerza bruta
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 15, // Máximo 15 peticiones por IP en ese periodo
  message: { message: 'Demasiados intentos desde esta IP, por favor intenta más tarde.' }
});

// Rutas de la API
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);

// Middleware Global de Manejo de Errores (Centraliza todos los errores del backend)
app.use((err, req, res, next) => {
  console.error('🔥 Error detectado:', err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Error interno del servidor',
  });
});

// Conexión a Base de Datos y arranque del servidor
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Conectado');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
  })
  .catch(err => console.log('Error conectando a MongoDB:', err));