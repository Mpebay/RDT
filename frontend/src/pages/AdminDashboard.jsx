import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// 1. Agregamos el icono 'Shield' para representar al administrador
import { CheckCircle, XCircle, Trash2, Users, Video, Plus, Search, Shield } from 'lucide-react';
import api from '../api/axios'; // Importa la instancia de Axios con interceptores

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [modules, setModules] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  
  // -- ESTADOS PARA EL BUSCADOR Y FILTROS --
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'approved', 'pending'
  
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
      const { data } = await api.get(`${import.meta.env.VITE_API_URL}/admin/users`);
      setUsers(data);
    } catch (error) { console.error('Error fetching users', error); }
  };

  const approveHandler = async (id) => {
    if (window.confirm('¿Aprobar a este usuario?')) {
      await api.put(`${import.meta.env.VITE_API_URL}/admin/users/${id}/approve`, {}, config);
      fetchUsers();
    }
  };

  const deleteUserHandler = async (id) => {
    if (window.confirm('¿Eliminar usuario?')) {
      await api.delete(`${import.meta.env.VITE_API_URL}/admin/users/${id}`, config);
      fetchUsers();
    }
  };

  // 2. NUEVA FUNCIÓN: Cambiar rol del usuario
  const toggleRoleHandler = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const confirmMessage = newRole === 'admin' 
      ? '¿Estás seguro de hacer a este usuario ADMINISTRADOR? Tendrá control total sobre el panel.'
      : '¿Quitar permisos de administrador a este usuario?';

    if (window.confirm(confirmMessage)) {
      try {
        await api.put(`${import.meta.env.VITE_API_URL}/admin/users/${id}/role`, { role: newRole }, config);
        fetchUsers();
      } catch (error) {
        console.error('Error actualizando rol', error);
        alert(error.response?.data?.message || 'Hubo un error al actualizar el rol');
      }
    }
  };

  // -- LÓGICA DE FILTRADO DE USUARIOS (FRONTEND) --
  const filteredUsers = users.filter((user) => {
    // 1. Filtro por búsqueda (Nombre o Email)
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Filtro por estado
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'approved' && user.isApproved) || 
      (filterStatus === 'pending' && !user.isApproved);

    return matchesSearch && matchesStatus;
  });

  // -- LOGICA DE MODULOS --
  const fetchModules = async () => {
    try {
      const { data } = await api.get(`${import.meta.env.VITE_API_URL}/courses/modules`, config);
      setModules(data);
    } catch (error) { console.error('Error fetching modules', error); }
  };

  const createModuleHandler = async (e) => {
    e.preventDefault();
    try {
      await api.post(`${import.meta.env.VITE_API_URL}/courses/modules`, newModule, config);
      setNewModule({ title: '', description: '', videoUrl: '', duration: '', level: 'Principiante' });
      fetchModules();
      alert('Módulo creado con éxito');
    } catch (error) { console.error('Error creando', error); }
  };

  const deleteModuleHandler = async (id) => {
    if (window.confirm('¿Eliminar módulo?')) {
      await api.delete(`${import.meta.env.VITE_API_URL}/courses/modules/${id}`, config);
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
        <>
          {/* BARRA DE BÚSQUEDA Y FILTROS */}
          <div className="mb-6 bg-darkCard p-4 rounded-xl border border-white/10 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg">
            
            {/* Buscador de Texto */}
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-darkBg border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-brandOrange outline-none transition-colors placeholder-gray-500"
              />
            </div>

            {/* Contadores y Filtro de Estado */}
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
              
              {/* Contadores Estadísticos */}
              <div className="flex gap-2 text-sm font-medium">
                <div className="bg-white/5 text-gray-300 px-3 py-1.5 rounded-lg border border-white/10 text-center">
                  Total: {filteredUsers.length}
                </div>
                <div className="bg-green-500/10 text-green-500 px-3 py-1.5 rounded-lg border border-green-500/20 text-center">
                  Aprobados: {filteredUsers.filter(u => u.isApproved).length}
                </div>
                <div className="bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-lg border border-yellow-500/20 text-center">
                  Pendientes: {filteredUsers.filter(u => !u.isApproved).length}
                </div>
              </div>

              {/* Selector de Estado */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-darkBg border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-brandOrange outline-none cursor-pointer w-full sm:w-auto"
              >
                <option value="all">Todos los estados</option>
                <option value="approved">Solo Aprobados</option>
                <option value="pending">Solo Pendientes</option>
              </select>
            </div>
          </div>

          {/* TABLA DE USUARIOS */}
          <div className="bg-darkCard rounded-xl border border-white/10 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400 min-w-[600px]">
                <thead className="bg-white/5 text-gray-200 uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Nombre</th>
                    <th className="px-6 py-4">Email</th>
                    {/* Nueva Columna */}
                    <th className="px-6 py-4">Rol</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{user.name}</td>
                      <td className="px-6 py-4">{user.email}</td>
                      
                      {/* Indicador Visual de Rol */}
                      <td className="px-6 py-4">
                        {user.role === 'admin' ? (
                          <span className="bg-purple-500/10 text-purple-400 px-2 py-1 rounded text-xs font-bold border border-purple-500/20">
                            Admin
                          </span>
                        ) : (
                          <span className="bg-gray-500/10 text-gray-400 px-2 py-1 rounded text-xs border border-gray-500/20">
                            Usuario
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {user.isApproved 
                          ? <span className="flex items-center text-green-500"><CheckCircle size={16} className="mr-2" /> Aprobado</span>
                          : <span className="flex items-center text-yellow-500"><XCircle size={16} className="mr-2" /> Pendiente</span>}
                      </td>
                      <td className="px-6 py-4 flex justify-center space-x-3 items-center">
                        {!user.isApproved && (
                          <button onClick={() => approveHandler(user._id)} className="bg-brandOrange hover:bg-brandOrangeHover text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors">
                            Aprobar
                          </button>
                        )}
                        
                        {/* Botón para cambiar a Admin/User */}
                        <button 
                          onClick={() => toggleRoleHandler(user._id, user.role)} 
                          className={`p-1 transition-colors ${user.role === 'admin' ? 'text-purple-400 hover:text-purple-300' : 'text-gray-500 hover:text-purple-400'}`}
                          title={user.role === 'admin' ? 'Quitar rol de Administrador' : 'Hacer Administrador'}
                        >
                          <Shield size={20} />
                        </button>

                        <button onClick={() => deleteUserHandler(user._id)} className="text-red-500 hover:text-red-400 p-1 transition-colors" title="Eliminar usuario">
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Mensajes de estado vacío */}
                  {users.length === 0 && (
                    <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">No hay alumnos registrados en la base de datos.</td></tr>
                  )}
                  {users.length > 0 && filteredUsers.length === 0 && (
                    <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">No se encontraron usuarios que coincidan con la búsqueda.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
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