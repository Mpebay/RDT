require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const courseRoutes = require('./routes/course.routes');

const app = express();

app.use(express.json());
app.use(cors());

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);

// Conexión a Base de Datos y arranque del servidor
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Conectado');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
  })
  .catch(err => console.log('Error conectando a MongoDB:', err));