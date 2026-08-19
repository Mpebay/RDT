import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Trash2, Users, Video, Plus } from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [modules, setModules] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  
  // Estado para el formulario de nuevo módulo
  const [newModule, setNewModule] = useState({ title: '', description: '', videoUrl: '', duration: '', level: 'Principiante' });

  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchUsers();
    fetchModules();
  }, [navigate]);

  // -- LOGICA DE ALUMNOS --
  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users`, config);
      setUsers(data);
    } catch (error) { console.error('Error fetching users', error); }
  };

  const approveHandler = async (id) => {
    if (window.confirm('¿Aprobar a este usuario?')) {
      await axios.put(`${import.meta.env.VITE_API_URL}/admin/users/${id}/approve`, {}, config);
      fetchUsers();
    }
  };

  const deleteUserHandler = async (id) => {
    if (window.confirm('¿Eliminar usuario?')) {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/users/${id}`, config);
      fetchUsers();
    }
  };

  // -- LOGICA DE MODULOS --
  const fetchModules = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/courses/modules`, config);
      setModules(data);
    } catch (error) { console.error('Error fetching modules', error); }
  };

  const createModuleHandler = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/courses/modules`, newModule, config);
      setNewModule({ title: '', description: '', videoUrl: '', duration: '', level: 'Principiante' });
      fetchModules();
      alert('Módulo creado con éxito');
    } catch (error) { console.error('Error creando', error); }
  };

  const deleteModuleHandler = async (id) => {
    if (window.confirm('¿Eliminar módulo?')) {
      await axios.delete(`${import.meta.env.VITE_API_URL}/courses/modules/${id}`, config);
      fetchModules();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>

      {/* TABS */}
      <div className="flex space-x-4 mb-8 border-b border-white/10 pb-4">
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'users' ? 'bg-brandOrange text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <Users size={18} className="mr-2" /> Gestión de Alumnos
        </button>
        <button 
          onClick={() => setActiveTab('modules')}
          className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'modules' ? 'bg-brandOrange text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <Video size={18} className="mr-2" /> Módulos y Clases
        </button>
      </div>

      {/* CONTENIDO TAB 1: ALUMNOS */}
      {activeTab === 'users' && (
        <div className="bg-darkCard rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-white/5 text-gray-200 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    {user.isApproved ? <span className="flex items-center text-green-500"><CheckCircle size={16} className="mr-2" /> Aprobado</span>
                                     : <span className="flex items-center text-yellow-500"><XCircle size={16} className="mr-2" /> Pendiente</span>}
                  </td>
                  <td className="px-6 py-4 flex justify-center space-x-3">
                    {!user.isApproved && <button onClick={() => approveHandler(user._id)} className="bg-brandOrange hover:bg-brandOrangeHover text-white px-3 py-1.5 rounded-md text-xs font-bold">Aprobar</button>}
                    <button onClick={() => deleteUserHandler(user._id)} className="text-red-500 hover:text-red-400 p-1"><Trash2 size={20} /></button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan="4" className="px-6 py-8 text-center">No hay alumnos registrados.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* CONTENIDO TAB 2: MODULOS */}
      {activeTab === 'modules' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario Crear Módulo */}
          <div className="lg:col-span-1 bg-darkCard p-6 rounded-xl border border-white/10 h-fit">
            <h2 className="text-xl font-bold mb-4 flex items-center"><Plus size={20} className="text-brandOrange mr-2"/> Nuevo Módulo</h2>
            <form onSubmit={createModuleHandler} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Título</label>
                <input type="text" required value={newModule.title} onChange={e => setNewModule({...newModule, title: e.target.value})} className="w-full bg-darkBg border border-white/10 rounded px-3 py-2 text-white focus:border-brandOrange outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Descripción</label>
                <textarea rows="2" value={newModule.description} onChange={e => setNewModule({...newModule, description: e.target.value})} className="w-full bg-darkBg border border-white/10 rounded px-3 py-2 text-white focus:border-brandOrange outline-none"></textarea>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">URL del Video (YouTube/Vimeo)</label>
                <input type="url" required value={newModule.videoUrl} onChange={e => setNewModule({...newModule, videoUrl: e.target.value})} className="w-full bg-darkBg border border-white/10 rounded px-3 py-2 text-white focus:border-brandOrange outline-none" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Duración</label>
                  <input type="text" required value={newModule.duration} onChange={e => setNewModule({...newModule, duration: e.target.value})} className="w-full bg-darkBg border border-white/10 rounded px-3 py-2 text-white focus:border-brandOrange outline-none" placeholder="ej. 45 min" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nivel</label>
                  <select value={newModule.level} onChange={e => setNewModule({...newModule, level: e.target.value})} className="w-full bg-darkBg border border-white/10 rounded px-3 py-2 text-white focus:border-brandOrange outline-none">
                    <option>Principiante</option>
                    <option>Intermedio</option>
                    <option>Avanzado</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-brandOrange hover:bg-brandOrangeHover text-white font-bold py-2.5 rounded mt-2 transition-colors">Subir Módulo</button>
            </form>
          </div>

          {/* Lista de Módulos */}
          <div className="lg:col-span-2 space-y-4">
            {modules.map(mod => (
              <div key={mod._id} className="bg-darkCard p-4 rounded-xl border border-white/10 flex justify-between items-center hover:border-white/30 transition-colors">
                <div>
                  <h3 className="text-lg font-bold text-white">{mod.title}</h3>
                  <p className="text-sm text-gray-400">{mod.level} • {mod.duration}</p>
                </div>
                <button onClick={() => deleteModuleHandler(mod._id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded transition-colors" title="Eliminar Módulo">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            {modules.length === 0 && <div className="text-center text-gray-500 py-10 border border-dashed border-white/10 rounded-xl">No has creado ningún módulo aún.</div>}
          </div>
        </div>
      )}
    </div>
  );
}