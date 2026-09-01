import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Mail, Lock, User, Phone, AlertCircle, CheckCircle, ShoppingCart } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [checkoutData, setCheckoutData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const pendingCheckout = localStorage.getItem('checkout_pending');
    if (pendingCheckout) {
      setCheckoutData(JSON.parse(pendingCheckout));
    }
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);
      
      const registerPayload = { name, lastName, phone, email, password };
      
      if (checkoutData) {
        registerPayload.plan = checkoutData.plan.replace('Plan ', '').trim();
        registerPayload.checkoutPrice = checkoutData.price;
        registerPayload.broker = checkoutData.broker; // <-- NUEVO: Enviamos el broker a la BD
      } else {
        registerPayload.plan = 'Plata';
        registerPayload.checkoutPrice = 199; 
        registerPayload.broker = 'independent';
      }

      // 1. Registramos al usuario guardando su precio permanentemente
      const response = await api.post('/auth/register', registerPayload);

      const userData = response.data.user || response.data;
      const userId = userData._id || userData.id;
      const userEmail = userData.email;

      localStorage.setItem('userInfo', JSON.stringify(response.data));

      // 2. Verificamos si hay que cobrarle
      if (checkoutData) {
        const paymentRes = await api.post('/payments/create-preference', {
            plan: registerPayload.plan,
            email: userEmail,
            name: name,
            userId: userId,
            price: registerPayload.checkoutPrice // Enviamos el precio!
        });

        localStorage.removeItem('checkout_pending');
        
        if (paymentRes.data.init_point) {
          window.location.href = paymentRes.data.init_point;
        } else {
          throw new Error("No se recibió el link de pago");
        }
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 2000);
      }

    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Ocurrió un error al registrarse');
      setLoading(false);
    }
  };

  return (
    // ... Pega aquí exactamente el mismo return (HTML) que tienes actualmente en Register.jsx
    // No hay cambios visuales, solo lógicos.
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-darkCard p-8 rounded-2xl border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black italic tracking-tighter mb-2">UNIRSE</h2>
            <p className="text-gray-400">Creá tu cuenta para comenzar</p>
          </div>

          {checkoutData && (
            <div className="mb-6 bg-brandOrange/10 border border-brandOrange/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-brandOrange mb-2">
                <ShoppingCart size={20} />
                <h3 className="font-bold">Resumen de tu inscripción</h3>
              </div>
              <div className="text-sm text-gray-300 space-y-1">
                <p><strong>Plan:</strong> {checkoutData.plan}</p>
                <p><strong>Modalidad:</strong> {checkoutData.broker === 'independent' ? 'Independiente' : `Broker ${checkoutData.broker.charAt(0).toUpperCase() + checkoutData.broker.slice(1)}`}</p>
                <p className="text-lg text-white font-bold mt-2">
                  Total a pagar: ${checkoutData.price.toLocaleString('es-AR')}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 flex items-center text-sm">
              <AlertCircle size={18} className="mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && !checkoutData && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-3 rounded-lg mb-6 flex items-center text-sm">
              <CheckCircle size={18} className="mr-2 flex-shrink-0" />
              ¡Registro exitoso! Redirigiendo...
            </div>
          )}

          <form onSubmit={submitHandler} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-darkBg border border-white/10 rounded-xl focus:ring-2 focus:ring-brandOrange focus:border-transparent transition-all outline-none text-white placeholder-gray-500 text-sm"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Apellido"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-darkBg border border-white/10 rounded-xl focus:ring-2 focus:ring-brandOrange focus:border-transparent transition-all outline-none text-white placeholder-gray-500 text-sm"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone size={18} className="text-gray-500" />
              </div>
              <input
                type="tel"
                placeholder="Teléfono / WhatsApp"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-darkBg border border-white/10 rounded-xl focus:ring-2 focus:ring-brandOrange focus:border-transparent transition-all outline-none text-white placeholder-gray-500 text-sm"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-500" />
              </div>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-darkBg border border-white/10 rounded-xl focus:ring-2 focus:ring-brandOrange focus:border-transparent transition-all outline-none text-white placeholder-gray-500 text-sm"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-500" />
              </div>
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-darkBg border border-white/10 rounded-xl focus:ring-2 focus:ring-brandOrange focus:border-transparent transition-all outline-none text-white placeholder-gray-500 text-sm"
                required
                minLength={6}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-500" />
              </div>
              <input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-darkBg border border-white/10 rounded-xl focus:ring-2 focus:ring-brandOrange focus:border-transparent transition-all outline-none text-white placeholder-gray-500 text-sm"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold transition-all ${
                loading 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-brandOrange hover:bg-brandOrangeHover text-white shadow-[0_0_15px_rgba(255,90,0,0.3)]'
              }`}
            >
              {loading ? 'Procesando...' : (checkoutData ? 'Registrarse y Pagar' : 'Registrarse')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-brandOrange hover:text-white transition-colors font-medium">
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}