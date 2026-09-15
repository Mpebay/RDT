import { useState, useEffect } from 'react';
import ChangePassword from './ChangePassword'; // Verifica si la ruta es /pages/ o /components/ según tu proyecto
import api from '../api/axios';
import { User, Mail, ShieldCheck, Clock, Camera, Phone, Briefcase, Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // 🎯 ESTADOS PARA EL TELÉFONO
  const [phone, setPhone] = useState('');
  const [updatingPhone, setUpdatingPhone] = useState(false);
  const [phoneMessage, setPhoneMessage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        setProfile(data);
        setPhone(data.phone || ''); // Carga el teléfono actual
      } catch (error) {
        console.error("Error al cargar perfil", error);
      }
    };
    fetchProfile();
  }, []);

  const openCloudinaryWidget = () => {
    if (!window.cloudinary) {
      alert("El widget de carga aún no está listo. Refresca la página.");
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'gfiz5pez', // Tu cloudName
        uploadPreset: 'academia_preset',
        sources: ['local', 'camera'],
        resourceType: 'image',
        clientAllowedFormats: ['png', 'jpeg', 'jpg', 'webp'],
        maxFileSize: 5000000, 
        theme: 'minimal'
      },
      async (error, result) => {
        if (!error && result && result.event === "success") {
          try {
            setUploading(true);
            const secureUrl = result.info.secure_url;
            
            const { data } = await api.put('/auth/profile/avatar', { avatar: secureUrl });
            
            setProfile((prev) => ({ ...prev, avatar: data.avatar }));
            
            const localUser = JSON.parse(localStorage.getItem('userInfo'));
            localUser.avatar = data.avatar;
            localStorage.setItem('userInfo', JSON.stringify(localUser));

          } catch (err) {
            console.error("Error al actualizar avatar", err);
            alert("Error al guardar la imagen de perfil.");
          } finally {
            setUploading(false);
          }
        }
      }
    );
    widget.open();
  };

  // 🎯 FUNCIÓN PARA ACTUALIZAR EL TELÉFONO
  const handleUpdatePhone = async () => {
    if (!phone.trim()) return;
    
    try {
      setUpdatingPhone(true);
      setPhoneMessage(null);
      
      const { data } = await api.put('/auth/profile/phone', { phone });
      
      setProfile((prev) => ({ ...prev, phone: data.phone }));
      
      // Actualiza localStorage si es necesario
      const localUser = JSON.parse(localStorage.getItem('userInfo'));
      localUser.phone = data.phone;
      localStorage.setItem('userInfo', JSON.stringify(localUser));

      setPhoneMessage({ type: 'success', text: 'Teléfono actualizado correctamente.' });
    } catch (err) {
      setPhoneMessage({ type: 'error', text: err.response?.data?.message || 'Error al actualizar.' });
    } finally {
      setUpdatingPhone(false);
      setTimeout(() => setPhoneMessage(null), 3500); // Borra el mensaje después de 3.5s
    }
  };

  if (!profile) return <div className="text-center py-10 text-gray-400 flex items-center justify-center min-h-[50vh]"><Loader2 size={30} className="animate-spin mr-3 text-brandOrange" /> Cargando perfil...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>
        <p className="text-gray-400 mt-1">Administra la configuración de tu cuenta, foto y seguridad.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* 🎯 COLUMNA IZQUIERDA: TARJETA DE USUARIO */}
        <div className="bg-darkCard border border-white/10 rounded-2xl p-6 h-fit text-white flex flex-col items-center shadow-lg relative overflow-hidden">
          
          {/* Brillo decorativo superior */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[50px] bg-brandOrange/20 blur-[40px] pointer-events-none" />

          {/* Avatar */}
          <div className="relative group mb-4 mt-2">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-darkBg border-2 border-brandOrange/50 flex items-center justify-center text-3xl font-bold text-brandOrange shadow-[0_0_15px_rgba(255,90,0,0.2)]">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                profile.name ? profile.name.charAt(0).toUpperCase() : <User size={36} />
              )}
            </div>
            
            <button 
              onClick={openCloudinaryWidget}
              disabled={uploading}
              className="absolute inset-0 bg-black/70 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none outline-none backdrop-blur-sm"
            >
              <Camera size={20} className="text-white mb-1" />
              <span className="text-[10px] text-white font-medium">{uploading ? 'Subiendo...' : 'Cambiar Foto'}</span>
            </button>
          </div>

          <h2 className="text-xl font-bold text-white mb-1 text-center">
            {profile.name} {profile.lastName || ''}
          </h2>
          
          {/* Badges de Estado */}
          <div className="w-full mt-2 mb-6 flex justify-center">
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

          {/* Formulario de Datos (Read-only + Editable Phone) */}
          <div className="w-full space-y-4 border-t border-white/10 pt-5 mt-2">
            
            {/* Email (Solo lectura) */}
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1 block ml-1">Email Registrado</label>
              <div className="bg-darkBg border border-white/5 rounded-xl px-4 py-3 text-gray-300 text-sm flex items-center shadow-inner cursor-not-allowed">
                <Mail size={16} className="mr-3 text-gray-500" />
                {profile.email}
              </div>
            </div>

            {/* Bróker (Solo lectura) */}
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1 block ml-1">Modalidad Bróker</label>
              <div className="bg-darkBg border border-white/5 rounded-xl px-4 py-3 text-gray-300 text-sm flex items-center capitalize shadow-inner cursor-not-allowed">
                <Briefcase size={16} className="mr-3 text-gray-500" />
                {profile.broker === 'independent' ? 'Independiente' : profile.broker}
              </div>
            </div>

            {/* Teléfono (EDITABLE) */}
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1 block ml-1">Teléfono / WhatsApp</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone size={16} className="text-gray-400" />
                  </div>
                  <input 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Tu número..."
                    className="w-full bg-darkBg border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm focus:border-brandOrange outline-none transition-colors"
                  />
                </div>
                <button 
                  onClick={handleUpdatePhone}
                  disabled={updatingPhone || phone === profile.phone}
                  className="bg-brandOrange hover:bg-brandOrangeHover disabled:bg-gray-800 disabled:text-gray-500 disabled:border-white/5 text-white px-4 rounded-xl transition-colors flex items-center justify-center border border-transparent shadow-lg"
                  title="Guardar teléfono"
                >
                  {updatingPhone ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                </button>
              </div>
              
              {/* Mensaje de Éxito / Error */}
              {phoneMessage && (
                <p className={`text-xs mt-3 font-medium flex items-center ${phoneMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                   {phoneMessage.type === 'success' ? <CheckCircle size={14} className="mr-1.5"/> : <AlertCircle size={14} className="mr-1.5"/>}
                   {phoneMessage.text}
                </p>
              )}
            </div>

          </div>
        </div>

        {/* 🎯 COLUMNA DERECHA: CAMBIO DE CONTRASEÑA */}
        <div className="md:col-span-2">
          <ChangePassword />
        </div>

      </div>
    </div>
  );
}