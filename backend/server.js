require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const courseRoutes = require('./routes/course.routes'); // <-- NUEVO

const app = express();

app.use(express.json());
app.use(cors());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes); // <-- NUEVO

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Conectado');
    app.listen(process.env.PORT, () => console.log(`Servidor corriendo en puerto ${process.env.PORT}`));
  })
  .catch(err => console.log(err));