import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, PlayCircle, Lock } from 'lucide-react';

export default function Dashboard() {
  const [userInfo, setUserInfo] = useState(JSON.parse(localStorage.getItem('userInfo')));
  const [modules, setModules] = useState([]);

  // Opción C: Sincronización automática
  useEffect(() => {
    if (!userInfo) return;

    const checkApprovalStatus = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/auth/profile`, config);
        
        if (data.isApproved !== userInfo.isApproved) {
          const updatedUser = { ...data, token: userInfo.token };
          localStorage.setItem('userInfo', JSON.stringify(updatedUser));
          setUserInfo(updatedUser);
        }
      } catch (error) {
        console.error("Error sincronizando perfil", error);
      }
    };

    // Si no está aprobado, preguntar al servidor cada 10 segundos
    let interval;
    if (!userInfo.isApproved && userInfo.role !== 'admin') {
      interval = setInterval(checkApprovalStatus, 10000);
    }

    return () => clearInterval(interval);
  }, [userInfo]);

  // Opción B: Cargar Módulos si está aprobado
  useEffect(() => {
    if (userInfo?.isApproved || userInfo?.role === 'admin') {
      const fetchModules = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
          const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/courses/modules`, config);
          setModules(data);
        } catch (error) {
          console.error("Error cargando módulos", error);
        }
      };
      fetchModules();
    }
  }, [userInfo]);

  if (!userInfo) {
    return <div className="flex justify-center items-center h-[calc(100vh-64px)] text-gray-400">Inicia sesión para acceder.</div>;
  }

  // Vista de Espera
  if (!userInfo.isApproved && userInfo.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center">
        <div className="bg-darkCard p-8 rounded-2xl border border-white/10 max-w-lg w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brandOrange to-yellow-500 animate-pulse"></div>
          <div className="w-16 h-16 bg-brandOrange/10 border border-brandOrange/30 text-brandOrange rounded-full flex items-center justify-center mx-auto mb-6 mt-4">
            <Clock size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-3">Solicitud en revisión</h2>
          <p className="text-gray-400 mb-6">
            Hola <span className="text-white font-semibold">{userInfo.name}</span>, tu acceso se habilitará en cuanto el administrador revise tu cuenta. Esta pantalla se actualizará automáticamente.
          </p>
          <div className="bg-white/5 p-4 rounded-lg text-sm text-gray-400 flex items-center justify-center space-x-2">
            <Lock size={16} />
            <span>Actualizando estado...</span>
          </div>
        </div>
      </div>
    );
  }

  // Vista de Academia (Aprobado)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold">Aulas & Módulos Exclusivos</h1>
        <p className="text-gray-400 mt-1">Selecciona un módulo para comenzar tu formación.</p>
      </div>

      {modules.length === 0 ? (
        <p className="text-gray-400 text-center py-10">Aún no hay módulos disponibles. El administrador pronto subirá contenido.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <ModuleCard key={mod._id} data={mod} />
          ))}
        </div>
      )}
    </div>
  );
}

function ModuleCard({ data }) {
  return (
    <a href={data.videoUrl} target="_blank" rel="noreferrer" className="block bg-darkCard rounded-xl border border-white/10 overflow-hidden hover:border-brandOrange/50 transition-all group hover:shadow-[0_0_20px_rgba(255,90,0,0.15)] cursor-pointer">
      <div className="h-48 bg-black flex items-center justify-center text-brandOrange group-hover:scale-105 transition-transform duration-500 relative">
        <PlayCircle size={48} className="z-10 group-hover:scale-110 transition-transform" />
        <div className="absolute inset-0 bg-brandOrange/5 group-hover:bg-brandOrange/10 transition-colors"></div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-bold text-brandOrange bg-brandOrange/10 border border-brandOrange/20 px-2.5 py-1 rounded-full uppercase tracking-wider">{data.level}</span>
          <span className="text-xs text-gray-400">{data.duration}</span>
        </div>
        <h3 className="text-lg font-bold mb-2 text-white group-hover:text-brandOrange transition-colors">{data.title}</h3>
        <p className="text-sm text-gray-400 line-clamp-2">{data.description}</p>
      </div>
    </a>
  );
}