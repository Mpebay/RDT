const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  videoUrl: { type: String, required: true },
  duration: { type: String, required: true },
  level: { type: String, required: true, enum: ['Principiante', 'Intermedio', 'Avanzado'] },
  planRequired: { type: String, enum: ['Bronce', 'Plata', 'Oro'], default: 'Bronce' }
}, { timestamps: true });

module.exports = mongoose.model('CourseModule', moduleSchema);