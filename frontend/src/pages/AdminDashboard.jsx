import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Trash2, Users, Video, Plus, Search, Shield, Edit3, X } from 'lucide-react';
import api from '../api/axios';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [modules, setModules] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [editingId, setEditingId] = useState(null);
  
  // 🎯 AGREGAMOS 'category' AL ESTADO INICIAL
  const [newModule, setNewModule] = useState({ 
    title: '', 
    description: '', 
    videoUrl: '', 
    duration: '', 
    level: 'Principiante', 
    category: 'Clases Grabadas', 
    planRequired: 'Acceso Total' 
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

  const fetchUsers = async () => {
    try { const { data } = await api.get('/admin/users'); setUsers(data); } 
    catch (error) { console.error('Error fetching users', error); }
  };

  const approveHandler = async (user) => {
    if (window.confirm(`¿Aprobar el acceso total a ${user.name}?`)) {
      await api.put(`/admin/users/${user._id}/approve`, { plan: 'Acceso Total' });
      fetchUsers();
    }
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
      try { await api.put(`/admin/users/${id}/role`, { role: newRole }); fetchUsers(); } 
      catch (error) { alert(error.response?.data?.message || 'Error al actualizar rol'); }
    }
  };

  const fetchModules = async () => {
    try { const { data } = await api.get('/courses/modules'); setModules(data); } 
    catch (error) { console.error('Error fetching modules', error); }
  };

  const createOrUpdateModuleHandler = async (e) => {
    e.preventDefault();
    if (!newModule.videoUrl) {
      alert("Por favor, ingresa el link del video antes de guardar.");
      return;
    }
    try {
      if (editingId) {
        await api.put(`/courses/modules/${editingId}`, newModule);
        alert('Módulo actualizado con éxito');
      } else {
        await api.post('/courses/modules', newModule);
        alert('Módulo creado con éxito');
      }
      
      // 🎯 RESETEA INCLUYENDO CATEGORÍA
      setNewModule({ title: '', description: '', videoUrl: '', duration: '', level: 'Principiante', category: 'Clases Grabadas', planRequired: 'Acceso Total' });
      setEditingId(null);
      fetchModules();
    } catch (error) { 
      console.error('Error guardando módulo', error); 
      alert('Error al guardar el módulo');
    }
  };

  const startEditHandler = (mod) => {
    setEditingId(mod._id);
    setNewModule({
      title: mod.title,
      description: mod.description || '',
      videoUrl: mod.videoUrl,
      duration: mod.duration,
      level: mod.level,
      category: mod.category || 'Clases Grabadas', // 🎯 CARGA LA CATEGORÍA SI EXISTE
      planRequired: mod.planRequired || 'Acceso Total'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditHandler = () => {
    setEditingId(null);
    setNewModule({ title: '', description: '', videoUrl: '', duration: '', level: 'Principiante', category: 'Clases Grabadas', planRequired: 'Acceso Total' });
  };

  const deleteModuleHandler = async (id) => {
    if (window.confirm('¿Eliminar módulo?')) {
      await api.delete(`/courses/modules/${id}`);
      fetchModules();
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'approved' && user.isApproved) || (filterStatus === 'pending' && !user.isApproved);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-8 text-white">Panel de Administración</h1>

      <div className="flex space-x-4 mb-8 border-b border-white/10 pb-4">
        <button onClick={() => setActiveTab('users')} className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'users' ? 'bg-brandOrange text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <Users size={18} className="mr-2" /> Gestión de Alumnos
        </button>
        <button onClick={() => setActiveTab('modules')} className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${activeTab === 'modules' ? 'bg-brandOrange text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
          <Video size={18} className="mr-2" /> Módulos y Clases
        </button>
      </div>

      {activeTab === 'users' && (
        <>
          <div className="mb-6 bg-darkCard p-4 rounded-xl border border-white/10 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={18} className="text-gray-400" /></div>
              <input type="text" placeholder="Buscar por nombre o email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-darkBg border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-brandOrange outline-none transition-colors placeholder-gray-500" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
              <div className="flex gap-2 text-sm font-medium">
                <div className="bg-white/5 text-gray-300 px-3 py-1.5 rounded-lg border border-white/10 text-center">Total: {filteredUsers.length}</div>
                <div className="bg-green-500/10 text-green-500 px-3 py-1.5 rounded-lg border border-green-500/20 text-center">Aprobados: {filteredUsers.filter(u => u.isApproved).length}</div>
                <div className="bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-lg border border-yellow-500/20 text-center">Pendientes: {filteredUsers.filter(u => !u.isApproved).length}</div>
              </div>

              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-darkBg border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-brandOrange outline-none cursor-pointer w-full sm:w-auto">
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
                    <th className="px-4 py-4 text-center">Modalidad Bróker</th>
                    <th className="px-4 py-4 text-center">Medio de Pago</th>
                    <th className="px-4 py-4 text-center">Estado Pago</th>
                    <th className="px-4 py-4 text-center">Acceso Plataforma</th>
                    <th className="px-4 py-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-4 text-white font-medium">{user.name} {user.lastName}</td>
                      <td className="px-4 py-4 text-xs">{user.email}</td>
                      
                      <td className="px-4 py-4 text-center">
                        {user.broker === 'vantage' 
                          ? <span className="text-green-400 font-bold uppercase tracking-wider text-[10px] bg-green-500/10 border border-green-500/20 px-2 py-1 rounded">Vantage (Bono)</span> 
                          : <span className="text-gray-400 uppercase tracking-wider text-[10px] bg-gray-500/10 border border-gray-500/20 px-2 py-1 rounded">Independiente</span>
                        }
                      </td>

                      <td className="px-4 py-4 text-center">
                        {user.paymentMethod === 'crypto' 
                          ? <span className="text-[#F3BA2F] font-bold uppercase text-[10px] tracking-widest border border-[#F3BA2F]/30 bg-[#F3BA2F]/10 px-2 py-1 rounded">USDT (Crypto)</span> 
                          : <span className="text-[#009EE3] font-bold uppercase text-[10px] tracking-widest border border-[#009EE3]/30 bg-[#009EE3]/10 px-2 py-1 rounded">Mercado Pago</span>
                        }
                      </td>

                      <td className="px-4 py-4 text-center">
                        {user.isPaid 
                          ? <span className="bg-green-500/10 text-green-500 px-2.5 py-1 rounded text-xs font-bold border border-green-500/20">Pagado</span>
                          : <span className="bg-red-500/10 text-red-400 px-2.5 py-1 rounded text-xs font-bold border border-red-500/20">Pendiente</span>
                        }
                      </td>

                      <td className="px-4 py-4 text-center">
                        {user.isApproved 
                          ? <span className="text-green-500 font-bold text-xs flex items-center justify-center"><CheckCircle size={14} className="mr-1" /> Aprobado</span>
                          : <span className="text-yellow-500 font-bold text-xs flex items-center justify-center"><XCircle size={14} className="mr-1" /> Pendiente</span>}
                      </td>

                      <td className="px-4 py-4 flex justify-center space-x-2 items-center">
                        {!user.isApproved && (
                          <button 
                            onClick={() => approveHandler(user)} 
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${user.isPaid ? 'bg-green-600 hover:bg-green-500 animate-pulse text-white' : 'bg-brandOrange hover:bg-brandOrangeHover text-white'}`} 
                            title={user.isPaid ? "Ya pagó. Aprobar acceso" : "Aprobar (Aún no paga)"}
                          >
                            Aprobar
                          </button>
                        )}
                        <button onClick={() => toggleRoleHandler(user._id, user.role)} className={`p-1 transition-colors ${user.role === 'admin' ? 'text-purple-400 hover:text-purple-300' : 'text-gray-500 hover:text-purple-400'}`} title="Cambiar Rol"><Shield size={20} /></button>
                        <button onClick={() => deleteUserHandler(user._id)} className="text-red-500 hover:text-red-400 p-1 transition-colors" title="Eliminar usuario"><Trash2 size={20} /></button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-500">No hay usuarios disponibles.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'modules' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-darkCard p-6 rounded-xl border border-white/10 h-fit">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center text-white">
                {editingId ? <Edit3 size={20} className="text-brandOrange mr-2"/> : <Plus size={20} className="text-brandOrange mr-2"/>} 
                {editingId ? 'Editar Módulo' : 'Nuevo Módulo'}
              </h2>
              {editingId && (
                <button onClick={cancelEditHandler} className="text-gray-400 hover:text-white text-xs flex items-center bg-white/5 px-2 py-1 rounded">
                  <X size={14} className="mr-1" /> Cancelar
                </button>
              )}
            </div>

            <form onSubmit={createOrUpdateModuleHandler} className="space-y-4">
              <div><label className="block text-sm text-gray-400 mb-1">Título</label><input type="text" required value={newModule.title} onChange={e => setNewModule({...newModule, title: e.target.value})} className="w-full bg-darkBg border border-white/10 rounded px-3 py-2 text-white focus:border-brandOrange outline-none" /></div>
              
              {/* 🎯 NUEVO SELECTOR DE CATEGORÍA */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Categoría</label>
                <select 
                  value={newModule.category} 
                  onChange={e => setNewModule({...newModule, category: e.target.value})} 
                  className="w-full bg-darkBg border border-brandOrange/50 text-brandOrange rounded px-3 py-2 focus:border-brandOrange outline-none font-bold"
                >
                  <option value="Clases Grabadas">🎬 Clases Grabadas</option>
                  <option value="Videos Técnicos">💻 Videos Técnicos</option>
                </select>
              </div>

              <div><label className="block text-sm text-gray-400 mb-1">Descripción</label><textarea rows="2" value={newModule.description} onChange={e => setNewModule({...newModule, description: e.target.value})} className="w-full bg-darkBg border border-white/10 rounded px-3 py-2 text-white focus:border-brandOrange outline-none"></textarea></div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Enlace del Video (Google Drive)</label>
                <input 
                  type="url" 
                  required 
                  value={newModule.videoUrl} 
                  onChange={e => setNewModule({...newModule, videoUrl: e.target.value})} 
                  className="w-full bg-darkBg border border-white/10 rounded px-3 py-2 text-white focus:border-brandOrange outline-none" 
                  placeholder="https://drive.google.com/file/d/..." 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-400 mb-1">Duración</label><input type="text" required value={newModule.duration} onChange={e => setNewModule({...newModule, duration: e.target.value})} className="w-full bg-darkBg border border-white/10 rounded px-3 py-2 text-white focus:border-brandOrange outline-none" placeholder="ej. 45 min" /></div>
                <div><label className="block text-sm text-gray-400 mb-1">Nivel</label><select value={newModule.level} onChange={e => setNewModule({...newModule, level: e.target.value})} className="w-full bg-darkBg border border-white/10 rounded px-3 py-2 text-white focus:border-brandOrange outline-none"><option>Principiante</option><option>Intermedio</option><option>Avanzado</option></select></div>
              </div>
              
              <button type="submit" className="w-full bg-brandOrange hover:bg-brandOrangeHover text-white font-bold py-2.5 rounded mt-2 transition-colors shadow-[0_0_15px_rgba(255,90,0,0.3)]">
                {editingId ? 'Actualizar Módulo' : 'Guardar Módulo'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {/* 🎯 ORDENAMOS LOS MÓDULOS POR FECHA DE CREACIÓN ANTES DE MAPEARLOS */}
            {modules.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map(mod => (
              <div key={mod._id} className="bg-darkCard p-4 rounded-xl border border-white/10 flex justify-between items-center hover:border-white/30 transition-colors">
                <div>
                  {/* 🎯 ETIQUETA VISUAL EN EL ADMIN PARA SABER QUÉ TIPO DE VIDEO ES */}
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded mb-1 inline-block ${mod.category === 'Videos Técnicos' ? 'bg-blue-500/20 text-blue-400' : 'bg-brandOrange/20 text-brandOrange'}`}>
                    {mod.category || 'Clases Grabadas'}
                  </span>
                  <h3 className="text-lg font-bold text-white mb-1">{mod.title}</h3>
                  <p className="text-sm text-gray-400">{mod.level} • {mod.duration}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => startEditHandler(mod)} className="text-blue-400 hover:bg-blue-500/10 p-2 rounded transition-colors" title="Editar Módulo">
                    <Edit3 size={20} />
                  </button>
                  <button onClick={() => deleteModuleHandler(mod._id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded transition-colors" title="Eliminar Módulo">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
            {modules.length === 0 && <div className="text-center text-gray-500 py-10 border border-dashed border-white/10 rounded-xl">No has creado ningún módulo aún.</div>}
          </div>
        </div>
      )}
    </div>
  );
}