const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  lastName: { type: String, required: true }, 
  phone: { type: String, required: true }, 
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  isApproved: { type: Boolean, default: false },
  isPaid: { type: Boolean, default: false },
  role: { type: String, default: 'user' },
  plan: { type: String, default: 'Acceso Total' }, 
  broker: { type: String, enum: ['vantage', 'libertex', 'independent'], default: 'independent' },
  brokerAccountId: { type: String, default: '' }, 
  paymentMethod: { type: String, enum: ['mercadopago', 'crypto'], default: 'mercadopago' },
  checkoutPrice: { type: Number, default: 97 },
  requirePasswordChange: { type: Boolean, default: false }, // 🎯 EL NUEVO CANDADO
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);