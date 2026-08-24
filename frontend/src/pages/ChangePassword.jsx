import { useState } from 'react';
import axios from 'axios';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Las nuevas contraseñas no coinciden', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ text: 'La nueva contraseña debe tener al menos 6 caracteres', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      // Obtenemos el token del usuario logueado (ajusta la clave según cómo guardes el login en tu localStorage)
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo?.token}`
        }
      };

      const { data } = await axios.put(
        `${import.meta.env.VITE_API_URL}/auth/update-password`,
        { currentPassword, newPassword },
        config
      );

      setMessage({ text: data.message || 'Contraseña actualizada con éxito', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Error al actualizar la contraseña',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#13131a] border border-white/10 rounded-2xl p-8 shadow-2xl text-white">
      <h2 className="text-xl font-bold mb-2">Cambiar Contraseña</h2>
      <p className="text-gray-400 text-sm mb-6">
        Asegúrate de usar una contraseña segura para proteger tu cuenta de trading.
      </p>

      {message.text && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === 'error'
              ? 'bg-red-500/10 border border-red-500/20 text-red-400'
              : 'bg-green-500/10 border border-green-500/20 text-green-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Contraseña Actual
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full bg-[#0b0b0f] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff5a00] transition"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Nueva Contraseña
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full bg-[#0b0b0f] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff5a00] transition"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Confirmar Nueva Contraseña
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full bg-[#0b0b0f] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#ff5a00] transition"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#ff5a00] hover:bg-[#e04f00] text-white font-bold py-3 rounded-full shadow-[0_0_15px_rgba(255,90,0,0.4)] transition disabled:opacity-50 mt-2"
        >
          {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
        </button>
      </form>
    </div>
  );
}