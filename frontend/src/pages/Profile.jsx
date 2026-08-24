import { useState, useEffect } from 'react';
import ChangePassword from '../pages/ChangePassword'; 
import api from '../api/axios';
import { User, Mail, ShieldCheck, Clock, Camera } from 'lucide-react';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        setProfile(data);
      } catch (error) {
        console.error("Error al cargar perfil", error);
      }
    };
    fetchProfile();
  }, []);

  // Función simulada/preparada para cuando implementes la subida de avatares
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setUploading(true);
      // Endpoint que deberás crear en tu backend para subir la foto
      const { data } = await api.put('/auth/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setProfile((prev) => ({ ...prev, avatar: data.avatar }));
      
      // Actualizar localStorage para que el Navbar refleje la nueva foto al instante
      const localUser = JSON.parse(localStorage.getItem('userInfo'));
      localUser.avatar = data.avatar;
      localStorage.setItem('userInfo', JSON.stringify(localUser));

    } catch (error) {
      console.error("Error al subir la imagen", error);
    } finally {
      setUploading(false);
    }
  };

  if (!profile) return <div className="text-center py-10 text-gray-400">Cargando perfil...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>
        <p className="text-gray-400 mt-1">Administra la configuración de tu cuenta, foto y seguridad.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Información general y Avatar */}
        <div className="bg-[#13131a] border border-white/10 rounded-2xl p-6 h-fit text-white flex flex-col items-center text-center">
          
          {/* Contenedor de la Foto de Perfil */}
          <div className="relative group mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-white/5 border-2 border-brandOrange/50 flex items-center justify-center text-2xl font-bold text-brandOrange">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                profile.name ? profile.name.charAt(0).toUpperCase() : <User size={36} />
              )}
            </div>
            
            {/* Botón flotante para cambiar foto */}
            <label htmlFor="avatar-input" className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera size={20} className="text-white mb-1" />
              <span className="text-[10px] text-white font-medium">{uploading ? 'Subiendo...' : 'Cambiar'}</span>
            </label>
            <input 
              id="avatar-input" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarChange} 
            />
          </div>

          <h2 className="text-xl font-bold text-white mb-1">{profile.name}</h2>
          <p className="text-xs text-gray-400 mb-4">{profile.email}</p>

          {/* Estado de Aprobación */}
          <div className="w-full mb-6">
            {profile.role === 'admin' ? (
              <span className="inline-flex items-center gap-1.5 bg-brandOrange/10 border border-brandOrange/30 text-brandOrange px-3 py-1 rounded-full text-xs font-semibold">
                <ShieldCheck size={14} /> Administrador
              </span>
            ) : profile.isApproved ? (
              <span className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 text-green-400 px-3 py-1 rounded-full text-xs font-semibold">
                <ShieldCheck size={14} /> Cuenta Aprobada
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-3 py-1 rounded-full text-xs font-semibold">
                <Clock size={14} /> En Revisión
              </span>
            )}
          </div>

          <div className="w-full border-t border-white/10 pt-4 text-left space-y-3">
            <div>
              <p className="text-xs text-gray-400">Rol en la Academia:</p>
              <p className="text-sm font-medium uppercase tracking-wider text-gray-200">{profile.role}</p>
            </div>
          </div>
        </div>

        {/* Formulario de Cambio de Contraseña */}
        <div className="md:col-span-2">
          <ChangePassword />
        </div>

      </div>
    </div>
  );
}