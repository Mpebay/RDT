import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios'; 

// Importación y parche de compatibilidad para Vite
import PhoneInputRaw from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
const PhoneInput = PhoneInputRaw?.default || PhoneInputRaw;

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    phone: '', 
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (formData.email !== formData.confirmEmail) {
      setIsError(true);
      setMessage('Los correos electrónicos no coinciden.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setIsError(true);
      setMessage('Las contraseñas no coinciden.');
      return;
    }

    if (!formData.phone || formData.phone.length < 8) {
      setIsError(true);
      setMessage('El número de teléfono es obligatorio y debe ser válido.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        lastName: formData.lastName,
        phone: `+${formData.phone}`, 
        email: formData.email,
        password: formData.password
      };

      const res = await api.post('/auth/register', payload);
      
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      setIsError(false);
      setMessage('¡Registro exitoso! Un administrador revisará tu solicitud para darte acceso.');
      
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] py-8 px-4">
      <div className="bg-darkCard p-8 rounded-2xl border border-white/10 w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-bold mb-2 text-center">Únete a la Academia</h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          Completa tus datos para registrarte en la plataforma
        </p>

        {message && (
          <div className={`p-3 rounded-lg mb-6 text-sm text-center border ${
            isError 
              ? 'bg-red-500/10 border-red-500/50 text-red-400' 
              : 'bg-green-500/10 border-green-500/50 text-green-400'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            {/* Nombre */}
            <div className="w-1/2">
              <label className="block text-sm text-gray-300 mb-1.5 font-medium">Nombre</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  required 
                  placeholder="Nombre"
                  value={formData.name}
                  className="w-full bg-darkBg border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brandOrange transition-colors"
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                />
              </div>
            </div>

            {/* Apellido */}
            <div className="w-1/2">
              <label className="block text-sm text-gray-300 mb-1.5 font-medium">Apellido</label>
              <div className="relative">
                <input 
                  type="text" 
                  required 
                  placeholder="Apellido"
                  value={formData.lastName}
                  className="w-full bg-darkBg border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brandOrange transition-colors"
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                />
              </div>
            </div>
          </div>

          {/* Teléfono Inteligente con Banderas */}
          <div>
            <label className="block text-sm text-gray-300 mb-1.5 font-medium">Teléfono (WhatsApp)</label>
            <PhoneInput
              country={'ar'} 
              value={formData.phone}
              onChange={phone => setFormData({...formData, phone})}
              enableSearch={true} 
              searchPlaceholder="Buscar país..."
              searchNotFound="País no encontrado"
              containerClass="!w-full"
              inputClass="!w-full !bg-darkBg !border !border-white/10 !text-white !h-[46px] !rounded-lg focus:!border-brandOrange !pl-[50px] !transition-colors"
              buttonClass="!bg-transparent !border-0 !border-r !border-white/10 !rounded-l-lg hover:!bg-white/5"
              dropdownClass="!bg-[#1a1a2e] !text-white !border !border-white/10 custom-phone-dropdown" 
              searchClass="!bg-darkBg !text-white !border-b !border-white/10 !p-2"
            />
            <style>{`
              .custom-phone-dropdown .search-box {
                background-color: #1a1a2e !important;
                color: white !important;
              }
              .custom-phone-dropdown li:hover {
                background-color: rgba(255, 90, 0, 0.2) !important;
              }
            `}</style>
          </div>

          {/* Correo Electrónico */}
          <div>
            <label className="block text-sm text-gray-300 mb-1.5 font-medium">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input 
                type="email" 
                required 
                placeholder="tu@email.com"
                value={formData.email}
                className="w-full bg-darkBg border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brandOrange transition-colors"
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
            </div>
          </div>

          {/* Confirmar Correo Electrónico */}
          <div>
            <label className="block text-sm text-gray-300 mb-1.5 font-medium">Confirmar Correo Electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input 
                type="email" 
                required 
                placeholder="Repite tu@email.com"
                value={formData.confirmEmail}
                className="w-full bg-darkBg border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brandOrange transition-colors"
                onChange={(e) => setFormData({...formData, confirmEmail: e.target.value})} 
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm text-gray-300 mb-1.5 font-medium">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input 
                type={showPassword ? 'text' : 'password'} 
                required 
                placeholder="••••••••"
                value={formData.password}
                className="w-full bg-darkBg border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brandOrange transition-colors"
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label className="block text-sm text-gray-300 mb-1.5 font-medium">Confirmar Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                required 
                placeholder="••••••••"
                value={formData.confirmPassword}
                className="w-full bg-darkBg border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brandOrange transition-colors"
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brandOrange hover:bg-brandOrangeHover text-white font-bold py-3 rounded-lg transition-colors duration-200 mt-4 shadow-[0_0_15px_rgba(255,90,0,0.3)] disabled:opacity-50"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-brandOrange hover:underline font-semibold">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}