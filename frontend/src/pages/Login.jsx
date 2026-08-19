import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, formData);

      // Guardar información del usuario y token en localStorage
      localStorage.setItem('userInfo', JSON.stringify(data));

      // Redireccionar según el rol
      if (data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }

      // Recargar la ventana para actualizar el estado del Navbar
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales inválidas o error en el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] px-4">
      <div className="bg-darkCard p-8 rounded-2xl border border-white/10 w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-bold mb-2 text-center">Iniciar Sesión</h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          Ingresa tus credenciales para acceder a la plataforma
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5 font-medium">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={formData.email}
                placeholder="tu@email.com"
                className="w-full bg-darkBg border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brandOrange transition-colors"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5 font-medium">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={formData.password}
                placeholder="••••••••"
                className="w-full bg-darkBg border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brandOrange transition-colors"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end mt-1">
            <Link to="/forgot-password" className="text-xs text-gray-400 hover:text-brandOrange transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brandOrange hover:bg-brandOrangeHover text-white font-bold py-3 rounded-lg transition-colors duration-200 mt-2 shadow-[0_0_15px_rgba(255,90,0,0.3)] disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          ¿Aún no tienes cuenta?{' '}
          <Link to="/register" className="text-brandOrange hover:underline font-semibold">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}