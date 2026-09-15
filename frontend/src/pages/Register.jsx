import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Mail, Lock, User, Phone, AlertCircle, CheckCircle, ShoppingCart, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // 🎯 Estados para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const navigate = useNavigate();

  const USD_TO_ARS_RATE = 1545;
  const defaultArsPrice = 97 * USD_TO_ARS_RATE;

  useEffect(() => {
    const pendingCheckout = localStorage.getItem('checkout_pending');
    if (pendingCheckout) {
      setCheckoutData(JSON.parse(pendingCheckout));
    } else {
      setCheckoutData({
        plan: 'Membresía Total Academia',
        broker: 'vantage',
        price: defaultArsPrice,
        paymentMethod: 'mercadopago'
      });
    }
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(false);

    if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); return; }

    try {
      setLoading(true);
      const registerPayload = {
        name, 
        lastName, 
        phone, 
        email, 
        password,
        plan: 'Acceso Total',
        checkoutPrice: checkoutData?.price || defaultArsPrice,
        broker: checkoutData?.broker || 'vantage',
        paymentMethod: checkoutData?.paymentMethod || 'mercadopago'
      };

      const response = await api.post('/auth/register', registerPayload);
      const userData = response.data;
      
      localStorage.setItem('userInfo', JSON.stringify(userData));
      if (userData.token) {
        localStorage.setItem('token', userData.token);
      }

      if (registerPayload.paymentMethod === 'crypto') {
        localStorage.removeItem('checkout_pending');
        setSuccess(true);
        setTimeout(() => navigate('/dashboard?payment=crypto_pending'), 1500);
      } else {
        const paymentRes = await api.post('/payments/create-preference', {
            email: userData.email,
            name: name,
            userId: userData._id || userData.id
        });
        localStorage.removeItem('checkout_pending');
        window.location.href = paymentRes.data.init_point;
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Ocurrió un error al registrarse');
      setLoading(false);
    }
  };

  const isCrypto = checkoutData?.paymentMethod === 'crypto';

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12 relative z-10">
      <div className="max-w-md w-full">
        <div className="bg-darkCard p-8 rounded-2xl border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black italic tracking-tighter mb-2">UNIRSE</h2>
            <p className="text-gray-400">Creá tu cuenta para comenzar</p>
          </div>

          {checkoutData && (
            <div className="mb-6 bg-brandOrange/10 border border-brandOrange/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-brandOrange mb-2"><ShoppingCart size={20} /><h3 className="font-bold">Resumen de inscripción</h3></div>
              <div className="text-sm text-gray-300 space-y-1">
                <p><strong>Plan:</strong> Pase Total Academia</p>
                {/* 🎯 AQUÍ SE ACTUALIZÓ PARA LEER LA OPCIÓN DE LIBERTEX */}
                <p><strong>Bróker:</strong> {
                  checkoutData.broker === 'vantage' ? 'Vantage (Con Bono)' : 
                  checkoutData.broker === 'libertex' ? 'Libertex (Sin Bono)' : 
                  'Independiente'
                }</p>
                <p><strong>Pago:</strong> {isCrypto ? 'USDT (Binance)' : 'Mercado Pago (ARS)'}</p>
                <p className="text-lg text-white font-bold mt-2">
                  Total: {isCrypto ? `${checkoutData.price} USDT` : `$ ${Number(checkoutData.price).toLocaleString('es-AR')} ARS`}
                </p>
              </div>
            </div>
          )}

          {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 flex items-center text-sm"><AlertCircle size={18} className="mr-2 flex-shrink-0" />{error}</div>}
          {success && <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-3 rounded-lg mb-6 flex items-center text-sm"><CheckCircle size={18} className="mr-2 flex-shrink-0" />¡Registro exitoso! Redirigiendo...</div>}

          <form onSubmit={submitHandler} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative"><input type="text" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-darkBg border border-white/10 rounded-xl focus:border-brandOrange text-white text-sm" required /></div>
              <div className="relative"><input type="text" placeholder="Apellido" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-4 py-3 bg-darkBg border border-white/10 rounded-xl focus:border-brandOrange text-white text-sm" required /></div>
            </div>
            <div className="relative"><input type="tel" placeholder="Teléfono / WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 bg-darkBg border border-white/10 rounded-xl focus:border-brandOrange text-white text-sm" required /></div>
            <div className="relative"><input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-darkBg border border-white/10 rounded-xl focus:border-brandOrange text-white text-sm" required /></div>
            
            {/* 🎯 Input de Contraseña con Ojo */}
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Contraseña" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 pr-10 py-3 bg-darkBg border border-white/10 rounded-xl focus:border-brandOrange text-white text-sm transition-colors" 
                required 
                minLength={6} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* 🎯 Input de Confirmar Contraseña con Ojo */}
            <div className="relative">
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                placeholder="Confirmar contraseña" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="w-full px-4 pr-10 py-3 bg-darkBg border border-white/10 rounded-xl focus:border-brandOrange text-white text-sm transition-colors" 
                required 
                minLength={6} 
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-bold bg-brandOrange hover:bg-brandOrangeHover text-white transition-all shadow-[0_0_15px_rgba(255,90,0,0.3)]">
              {loading ? 'Procesando...' : 'Registrarse y Pagar'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            ¿Ya tienes cuenta? <Link to="/login" className="text-brandOrange hover:text-white transition-colors font-medium">Inicia sesión aquí</Link>
          </div>
        </div>
      </div>
    </div>
  );
}