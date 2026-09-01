import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Trash2, Users, Video, Plus, Search, Shield } from 'lucide-react';
import api from '../api/axios';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [modules, setModules] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Estado inicial limpio del Plan Bronce
  const [newModule, setNewModule] = useState({ 
    title: '', 
    description: '', 
    videoUrl: '', 
    duration: '', 
    level: 'Principiante', 
    planRequired: 'Plata' // Cambiado a Plata
  });

  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchUsers();
    fetchModules();
  }, [navigate]);

  // -- GESTIÓN DE ALUMNOS --
  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (error) { console.error('Error fetching users', error); }
  };

  const approveHandler = async (user) => {
    const chosenPlan = user.plan || 'Plata';
    if (window.confirm(`¿Aprobar a ${user.name} en el Plan ${chosenPlan}?`)) {
      await api.put(`/admin/users/${user._id}/approve`, { plan: chosenPlan });
      fetchUsers();
    }
  };

  const changePlanHandler = async (userId, newPlan) => {
    try {
      await api.put(`/admin/users/${userId}/plan`, { plan: newPlan });
      fetchUsers();
    } catch (error) { alert('Error al cambiar el plan'); }
  };

  const deleteUserHandler = async (id) => {
    if (window.confirm('¿Eliminar usuario?')) {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    }
  };

  const toggleRoleHandler = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (window.confirm(newRole === 'admin' ? '¿Hacer ADMINISTRADOR a este usuario?' : '¿Quitar permisos?')) {
      try {
        await api.put(`/admin/users/${id}/role`, { role: newRole });
        fetchUsers();
      } catch (error) { alert(error.response?.data?.message || 'Error al actualizar rol'); }
    }
  };

  // -- GESTIÓN DE MÓDULOS --
  const fetchModules = async () => {
    try {
      const { data } = await api.get('/courses/modules');
      setModules(data);
    } catch (error) { console.error('Error fetching modules', error); }
  };

  const createModuleHandler = async (e) => {
    e.preventDefault();
    try {
      await api.post('/courses/modules', newModule);
      setNewModule({ title: '', description: '', videoUrl: '', duration: '', level: 'Principiante', planRequired: 'Plata' });
      fetchModules();
      alert('Módulo creado con éxito');
    } catch (error) { console.error('Error creando módulo', error); }
  };

  const changeModulePlanHandler = async (moduleId, newPlan) => {
    try {
      await api.put(`/courses/modules/${moduleId}/plan`, { planRequired: newPlan });
      fetchModules();
    } catch (error) { alert('Error actualizando el plan'); }
  };

  const deleteModuleHandler = async (id) => {
    if (window.confirm('¿Eliminar módulo?')) {
      await api.delete(`/courses/modules/${id}`);
      fetchModules();
    }
  };

  const getPlanBadgeStyle = (planName) => {
    switch (planName) {
      case 'Oro':
        return 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10';
      case 'Plata':
      default:
        return 'border-slate-400/50 text-slate-300 bg-slate-500/10';
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'approved' && user.isApproved) || 
      (filterStatus === 'pending' && !user.isApproved);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>

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

      {/* TAB: ALUMNOS */}
      {activeTab === 'users' && (
        <>
          <div className="mb-6 bg-darkCard p-4 rounded-xl border border-white/10 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg">
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

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
              <div className="flex gap-2 text-sm font-medium">
                <div className="bg-white/5 text-gray-300 px-3 py-1.5 rounded-lg border border-white/10 text-center">Total: {filteredUsers.length}</div>
                <div className="bg-green-500/10 text-green-500 px-3 py-1.5 rounded-lg border border-green-500/20 text-center">Aprobados: {filteredUsers.filter(u => u.isApproved).length}</div>
                <div className="bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-lg border border-yellow-500/20 text-center">Pendientes: {filteredUsers.filter(u => !u.isApproved).length}</div>
              </div>

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

          <div className="bg-darkCard rounded-xl border border-white/10 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400 min-w-[700px]">
                <thead className="bg-white/5 text-gray-200 uppercase font-semibold text-xs">
                  <tr>
                    <th className="px-4 py-4">Nombre</th>
                    <th className="px-4 py-4">Email</th>
                    <th className="px-4 py-4">Rol</th>
                    <th className="px-4 py-4 text-center">Bróker</th>
                    <th className="px-4 py-4 text-center">Pago (MP)</th>
                    <th className="px-4 py-4">Plan (Acceso)</th>
                    <th className="px-4 py-4 text-center">Estado</th>
                    <th className="px-4 py-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-4 text-white font-medium">{user.name} {user.lastName}</td>
                      <td className="px-4 py-4 text-xs">{user.email}</td>
                      <td className="px-4 py-4">
                        {user.role === 'admin' ? (
                          <span className="bg-purple-500/10 text-purple-400 px-2 py-1 rounded text-xs font-bold border border-purple-500/20">Admin</span>
                        ) : (
                          <span className="bg-gray-500/10 text-gray-400 px-2 py-1 rounded text-xs border border-gray-500/20">Usuario</span>
                        )}
                      </td>
                      
                      {/* BRÓKER */}
                      <td className="px-4 py-4 text-center">
                        {user.broker === 'vantage' && <span className="text-green-400 font-bold uppercase tracking-wider text-[10px]">Vantage</span>}
                        {user.broker === 'libertex' && <span className="text-blue-400 font-bold uppercase tracking-wider text-[10px]">Libertex</span>}
                        {(!user.broker || user.broker === 'independent') && <span className="text-gray-400 uppercase tracking-wider text-[10px]">Independ.</span>}
                      </td>

                      {/* PAGO */}
                      <td className="px-4 py-4 text-center">
                        {user.isPaid 
                          ? <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs border border-green-500/20 font-bold">Pagado</span>
                          : <span className="bg-red-500/10 text-red-400 px-2 py-1 rounded text-xs border border-red-500/20">Debe</span>
                        }
                      </td>

                      <td className="px-4 py-4">
                        <select
                          value={user.plan || 'Plata'}
                          onChange={(e) => changePlanHandler(user._id, e.target.value)}
                          className={`bg-darkBg border rounded px-2.5 py-1 text-xs font-bold outline-none cursor-pointer ${getPlanBadgeStyle(user.plan || 'Plata')}`}
                        >
                          <option value="Plata" className="bg-darkBg text-white">Plan Plata</option>
                          <option value="Oro" className="bg-darkBg text-white">Plan Oro 👑</option>
                        </select>
                      </td>
                      
                      {/* ESTADO APROBACIÓN */}
                      <td className="px-4 py-4 text-center">
                        {user.isApproved 
                          ? <span className="text-green-500 font-bold text-xs flex items-center justify-center"><CheckCircle size={14} className="mr-1" /> Aprobado</span>
                          : <span className="text-yellow-500 font-bold text-xs flex items-center justify-center"><XCircle size={14} className="mr-1" /> Pendiente</span>}
                      </td>

                      {/* ACCIONES */}
                      <td className="px-4 py-4 flex justify-center space-x-2 items-center">
                        {!user.isApproved && (
                          <button 
                            onClick={() => approveHandler(user)} 
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${user.isPaid ? 'bg-green-600 hover:bg-green-500 animate-pulse text-white' : 'bg-brandOrange hover:bg-brandOrangeHover text-white'}`}
                            title={user.isPaid ? "Ya pagó en MP. Aprobar acceso" : "Aprobar (Aún no paga)"}
                          >
                            Aprobar
                          </button>
                        )}
                        <button onClick={() => toggleRoleHandler(user._id, user.role)} className={`p-1 transition-colors ${user.role === 'admin' ? 'text-purple-400 hover:text-purple-300' : 'text-gray-500 hover:text-purple-400'}`} title="Cambiar Rol">
                          <Shield size={20} />
                        </button>
                        <button onClick={() => deleteUserHandler(user._id)} className="text-red-500 hover:text-red-400 p-1 transition-colors" title="Eliminar usuario">
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan="8" className="px-6 py-10 text-center text-gray-500">No hay usuarios disponibles.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB: MÓDULOS */}
      {activeTab === 'modules' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
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

              <div>
                <label className="block text-sm text-gray-400 mb-1">Plan Requerido para Verlo</label>
                <select 
                  value={newModule.planRequired} 
                  onChange={e => setNewModule({...newModule, planRequired: e.target.value})} 
                  className="w-full bg-darkBg border border-white/10 rounded px-3 py-2 text-white focus:border-brandOrange outline-none font-semibold"
                >
                  <option value="Plata">Plan Plata (Disponible para Plata y Oro)</option>
                  <option value="Oro">Plan Oro 👑 (Exclusivo usuarios Oro)</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-brandOrange hover:bg-brandOrangeHover text-white font-bold py-2.5 rounded mt-2 transition-colors">Subir Módulo</button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {modules.map(mod => (
              <div key={mod._id} className="bg-darkCard p-4 rounded-xl border border-white/10 flex justify-between items-center hover:border-white/30 transition-colors">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="text-lg font-bold text-white">{mod.title}</h3>

                    <select
                      value={mod.planRequired || 'Plata'}
                      onChange={(e) => changeModulePlanHandler(mod._id, e.target.value)}
                      className={`border rounded px-2.5 py-1 text-xs font-bold outline-none cursor-pointer ${getPlanBadgeStyle(mod.planRequired || 'Plata')}`}
                    >
                      <option value="Plata" className="bg-darkBg text-white">Plan Plata</option>
                      <option value="Oro" className="bg-darkBg text-white">Plan Oro 👑</option>
                    </select>
                  </div>
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