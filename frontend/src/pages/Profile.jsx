import { useState, useEffect } from 'react';
import ChangePassword from '../pages/ChangePassword'; // O la ruta donde lo hayas guardado
import api from '../api/axios';

export default function Profile() {
  const [profile, setProfile] = useState(null);

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

  if (!profile) return <div className="text-center py-10 text-gray-400">Cargando perfil...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>
        <p className="text-gray-400 mt-1">Administra la configuración de tu cuenta y seguridad.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Información general del usuario */}
        <div className="bg-[#13131a] border border-white/10 rounded-2xl p-6 h-fit text-white">
          <h3 className="text-lg font-bold mb-4 text-[#ff5a00]">Datos Personales</h3>
          <p className="text-sm text-gray-400 mb-2">Nombre:</p>
          <p className="font-semibold mb-4">{profile.name}</p>
          
          <p className="text-sm text-gray-400 mb-2">Correo Electrónico:</p>
          <p className="font-semibold mb-4">{profile.email}</p>

          <p className="text-sm text-gray-400 mb-2">Rol:</p>
          <span className="inline-block bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs uppercase tracking-wider">
            {profile.role}
          </span>
        </div>

        {/* Formulario de Cambio de Contraseña */}
        <div className="md:col-span-2">
          <ChangePassword />
        </div>
      </div>
    </div>
  );
}