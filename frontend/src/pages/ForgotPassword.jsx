import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import api from '../api/axios'; // Importa la instancia de Axios con interceptores

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Ocurrió un error al enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] px-4">
      <div className="bg-darkCard p-8 rounded-2xl border border-white/10 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold mb-2 text-center">Recuperar Contraseña</h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          Ingresa tu correo electrónico y te enviaremos las instrucciones.
        </p>

        {message && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-3 rounded-lg mb-6 text-sm text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5 font-medium">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                placeholder="tu@email.com"
                className="w-full bg-darkBg border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brandOrange transition-colors"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brandOrange hover:bg-brandOrangeHover text-white font-bold py-3 rounded-lg transition-colors duration-200 mt-2 shadow-[0_0_15px_rgba(255,90,0,0.3)] disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link to="/login" className="text-gray-400 hover:text-white text-sm flex items-center justify-center transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}