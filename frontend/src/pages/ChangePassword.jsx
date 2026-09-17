import { useState } from 'react';
import api from '../api/axios';
import { Eye, EyeOff } from 'lucide-react';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));

      const { data } = await api.put('/auth/update-password', { currentPassword, newPassword });

      // 🎯 ACTUALIZAMOS EL LOCALSTORAGE PARA APAGAR EL BLOQUEO EN EL FRONTEND
      const updatedUser = { ...userInfo, requirePasswordChange: false };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));

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
          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full bg-[#0b0b0f] border border-white/10 rounded-lg px-4 pr-10 py-3 text-white focus:outline-none focus:border-[#ff5a00] transition"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors focus:outline-none"
            >
              {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Nueva Contraseña
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full bg-[#0b0b0f] border border-white/10 rounded-lg px-4 pr-10 py-3 text-white focus:outline-none focus:border-[#ff5a00] transition"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors focus:outline-none"
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Confirmar Nueva Contraseña
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full bg-[#0b0b0f] border border-white/10 rounded-lg px-4 pr-10 py-3 text-white focus:outline-none focus:border-[#ff5a00] transition"
              placeholder="••••••••"
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
          className="w-full bg-[#ff5a00] hover:bg-[#e04f00] text-white font-bold py-3 rounded-full shadow-[0_0_15px_rgba(255,90,0,0.4)] transition disabled:opacity-50 mt-2"
        >
          {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
        </button>
      </form>
    </div>
  );
}