const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  lastName: { type: String, required: true }, 
  phone: { type: String, required: true }, 
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isApproved: { type: Boolean, default: false }, // Acceso a la plataforma
  isPaid: { type: Boolean, default: false }, // NUEVO: Si completó el pago en MP
  role: { type: String, default: 'user' },
  plan: { type: String, enum: ['Plata', 'Oro'], default: 'Plata' },
  broker: { type: String, enum: ['vantage', 'libertex', 'independent'], default: 'independent' }, // NUEVO
  checkoutPrice: { type: Number, default: 0 }, 
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);