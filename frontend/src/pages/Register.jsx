import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, formData);
      localStorage.setItem('userInfo', JSON.stringify(res.data));
      setMessage('¡Registro exitoso! Un administrador revisará tu solicitud para darte acceso.');
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error al registrarse');
    }
  };

  return (
    <div className="flex justify-center items-center h-[calc(100vh-64px)]">
      <div className="bg-darkCard p-8 rounded-2xl border border-white/10 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">Únete a la Academia</h2>
        {message && <div className="bg-brandOrange/20 border border-brandOrange text-brandOrange p-3 rounded mb-4 text-sm">{message}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre Completo</label>
            <input type="text" required className="w-full bg-darkBg border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-brandOrange"
              onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Correo Electrónico</label>
            <input type="email" required className="w-full bg-darkBg border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-brandOrange"
              onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Contraseña</label>
            <input type="password" required className="w-full bg-darkBg border border-white/10 rounded px-4 py-2 text-white focus:outline-none focus:border-brandOrange"
              onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>
          <button type="submit" className="w-full bg-brandOrange hover:bg-brandOrangeHover text-white font-bold py-3 rounded transition-colors mt-4">
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
}