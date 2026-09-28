import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Trash2, Users, Video, Plus, Search, Shield, Edit3, X, MonitorPlay, Terminal, UserPlus, Loader2, Send } from 'lucide-react';
import api from '../api/axios';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [modules, setModules] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [editingId, setEditingId] = useState(null);
  const [activeCategoryAdmin, setActiveCategoryAdmin] = useState('Clases Grabadas');
  
  const [showMigrateModal, setShowMigrateModal] = useState(false);
  const [migrateEmailsInput, setMigrateEmailsInput] = useState('');
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrateResults, setMigrateResults] = useState(null);

  // 🎯 AÑADIMOS "order: 1" AL ESTADO INICIAL
  const [newModule, setNewModule] = useState({ 
    title: '', description: '', videoUrl: '', duration: '', level: 'Principiante', category: 'Clases Grabadas', planRequired: 'Acceso Total', order: 1 
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
    if (!newModule.videoUrl) { alert("Por favor, ingresa el link del video antes de guardar."); return; }
    try {
      if (editingId) {
        await api.put(`/courses/modules/${editingId}`, newModule);
        alert('Módulo actualizado con éxito');
      } else {
        await api.post('/courses/modules', newModule);
        alert('Módulo creado con éxito');
      }
      setActiveCategoryAdmin(newModule.category);
      setNewModule({ title: '', description: '', videoUrl: '', duration: '', level: 'Principiante', category: 'Clases Grabadas', planRequired: 'Acceso Total', order: 1 });
      setEditingId(null);
      fetchModules();
    } catch (error) { alert('Error al guardar el módulo'); }
  };

  const startEditHandler = (mod) => {
    setEditingId(mod._id);
    // 🎯 CARGAMOS EL ORDEN ACTUAL AL EDITAR
    setNewModule({ title: mod.title, description: mod.description || '', videoUrl: mod.videoUrl, duration: mod.duration, level: mod.level, category: mod.category || 'Clases Grabadas', planRequired: mod.planRequired || 'Acceso Total', order: mod.order || 1 });
    setActiveCategoryAdmin(mod.category || 'Clases Grabadas');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditHandler = () => {
    setEditingId(null);
    setNewModule({ title: '', description: '', videoUrl: '', duration: '', level: 'Principiante', category: 'Clases Grabadas', planRequired: 'Acceso Total', order: 1 });
  };

  const deleteModuleHandler = async (id) => {
    if (window.confirm('¿Eliminar módulo?')) {
      await api.delete(`/courses/modules/${id}`);
      fetchModules();
    }
  };

  const handleMigrateSubmit = async () => {
    if (!migrateEmailsInput.trim()) return;
    const emailArray = migrateEmailsInput.split(/[\s,]+/).map(e => e.trim().toLowerCase()).filter(e => e.includes('@'));
    if (emailArray.length === 0) { alert('No se detectaron correos válidos en la caja de texto.'); return; }

    if (window.confirm(`Se van a migrar y notificar ${emailArray.length} usuarios. ¿Proceder?`)) {
      setIsMigrating(true);
      setMigrateResults(null);
      try {
        const { data } = await api.post('/auth/admin/migrate', { emails: emailArray });
        setMigrateResults(data.resultados);
        fetchUsers(); 
      } catch (error) { alert(error.response?.data?.message || 'Ocurrió un error en la migración masiva.'); } 
      finally { setIsMigrating(false); }
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'approved' && user.isApproved) || (filterStatus === 'pending' && !user.isApproved);
    return matchesSearch && matchesStatus;
  });

  // 🎯 MODIFICAMOS LA LÓGICA DE ORDENAMIENTO (AQUÍ SE ORDENA POR EL NÚMERO DE ORDEN)
  const filteredAdminModules = modules
    .filter(mod => (mod.category || 'Clases Grabadas') === activeCategoryAdmin)
    .sort((a, b) => (a.order || 0) - (b.order || 0) || new Date(a.createdAt) - new Date(b.createdAt));

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
            <div className="flex gap-4 w-full md:w-auto flex-col md:flex-row">
              <div className="relative w-full md:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={18} className="text-gray-400" /></div>
                <input type="text" placeholder="Buscar por nombre o email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-darkBg border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:border-brandOrange outline-none transition-colors placeholder-gray-500" />
              </div>

              <button 
                onClick={() => { setShowMigrateModal(true); setMigrateResults(null); }}
                className="bg-brandOrange hover:bg-brandOrangeHover text-white px-4 py-2.5 rounded-lg font-bold flex items-center justify-center transition-colors shadow-[0_0_15px_rgba(255,90,0,0.3)] whitespace-nowrap"
              >
                <UserPlus size={18} className="mr-2" /> Migrar Alumnos
              </button>
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

          {showMigrateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-darkCard border border-brandOrange/50 rounded-2xl w-full max-w-lg p-6 shadow-[0_0_40px_rgba(255,90,0,0.2)] relative">
                <button onClick={() => setShowMigrateModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                  <X size={24}/>
                </button>
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                  <UserPlus className="mr-2 text-brandOrange"/> Migración Masiva
                </h2>
                <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                  Pega aquí los correos electrónicos de los alumnos de la vieja plataforma. Se les creará una cuenta aprobada automáticamente y recibirán un mail con su contraseña temporal.
                </p>

                <textarea
                  rows="5"
                  placeholder="alumno1@gmail.com, alumno2@hotmail.com, etc..."
                  value={migrateEmailsInput}
                  onChange={(e) => setMigrateEmailsInput(e.target.value)}
                  className="w-full bg-darkBg border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brandOrange outline-none transition-colors mb-4 resize-none font-mono text-sm"
                ></textarea>

                {migrateResults && (
                  <div className="mb-4 bg-black/50 border border-white/5 rounded-xl p-4 max-h-48 overflow-y-auto">
                    <p className="text-xs font-bold text-brandOrange mb-3 uppercase tracking-widest">Resultados de la operación:</p>
                    {migrateResults.map((res, i) => (
                      <div key={i} className="flex justify-between items-center text-xs mb-2 border-b border-white/5 pb-2 last:border-0 last:pb-0 last:mb-0">
                        <span className="text-gray-300 font-mono">{res.email}</span>
                        <span className={`font-bold ${res.status.includes('✅') ? 'text-green-400' : res.status.includes('❌') ? 'text-yellow-500' : 'text-red-400'}`}>
                          {res.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleMigrateSubmit}
                  disabled={isMigrating || !migrateEmailsInput.trim()}
                  className="w-full bg-brandOrange hover:bg-brandOrangeHover disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg flex items-center justify-center"
                >
                  {isMigrating ? <Loader2 size={18} className="animate-spin mr-2"/> : <Send size={18} className="mr-2"/>}
                  {isMigrating ? 'Creando cuentas y enviando correos...' : 'Migrar y Notificar Alumnos'}
                </button>
              </div>
            </div>
          )}

          <div className="bg-darkCard rounded-xl border border-white/10 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400 min-w-[800px]">
                <thead className="bg-white/5 text-gray-200 uppercase font-semibold text-xs">
                  <tr>
                    <th className="px-4 py-4">Nombre</th>
                    <th className="px-4 py-4">Email</th>
                    <th className="px-4 py-4 text-center">Modalidad Bróker</th>
                    <th className="px-4 py-4 text-center">ID Bróker</th>
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
                          : user.broker === 'libertex' 
                            ? <span className="text-brandOrange font-bold uppercase tracking-wider text-[10px] bg-brandOrange/10 border border-brandOrange/20 px-2 py-1 rounded">Libertex</span>
                            : <span className="text-gray-400 uppercase tracking-wider text-[10px] bg-gray-500/10 border border-gray-500/20 px-2 py-1 rounded">Independiente</span>
                        }
                      </td>

                      <td className="px-4 py-4 text-center">
                        {user.brokerAccountId && user.brokerAccountId.trim() !== '' 
                          ? <span className="text-[#ffcb99] font-mono text-xs font-bold tracking-wider">{user.brokerAccountId}</span>
                          : <span className="text-gray-600">-</span>
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
                    <tr><td colSpan="8" className="px-6 py-10 text-center text-gray-500">No hay usuarios disponibles.</td></tr>
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

              {/* 🎯 AÑADIMOS EL INPUT DE ORDEN DE VISUALIZACIÓN */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1"><label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">Duración</label><input type="text" required value={newModule.duration} onChange={e => setNewModule({...newModule, duration: e.target.value})} className="w-full bg-darkBg border border-white/10 rounded px-2 py-2 text-white focus:border-brandOrange outline-none text-sm" placeholder="ej. 45m" /></div>
                <div className="col-span-1"><label className="block text-[11px] uppercase tracking-wider text-gray-400 mb-1">Nivel</label><select value={newModule.level} onChange={e => setNewModule({...newModule, level: e.target.value})} className="w-full bg-darkBg border border-white/10 rounded px-2 py-2 text-white focus:border-brandOrange outline-none text-sm"><option>Principiante</option><option>Intermedio</option><option>Avanzado</option></select></div>
                <div className="col-span-1"><label className="block text-[11px] uppercase tracking-wider text-brandOrange font-bold mb-1">Orden Nº</label><input type="number" min="1" required value={newModule.order} onChange={e => setNewModule({...newModule, order: Number(e.target.value)})} className="w-full bg-darkBg border border-brandOrange/50 rounded px-2 py-2 text-white focus:border-brandOrange outline-none text-sm" placeholder="1" /></div>
              </div>
              
              <button type="submit" className="w-full bg-brandOrange hover:bg-brandOrangeHover text-white font-bold py-2.5 rounded mt-2 transition-colors shadow-[0_0_15px_rgba(255,90,0,0.3)]">
                {editingId ? 'Actualizar Módulo' : 'Guardar Módulo'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex space-x-2 sm:space-x-4 mb-6 border-b border-white/10 pb-4 overflow-x-auto">
              <button 
                onClick={() => setActiveCategoryAdmin('Clases Grabadas')} 
                className={`flex items-center px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${activeCategoryAdmin === 'Clases Grabadas' ? 'bg-brandOrange text-white shadow-[0_0_15px_rgba(255,90,0,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <MonitorPlay size={18} className="mr-2" /> Clases Grabadas
              </button>
              
              <button 
                onClick={() => setActiveCategoryAdmin('Videos Técnicos')} 
                className={`flex items-center px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${activeCategoryAdmin === 'Videos Técnicos' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Terminal size={18} className="mr-2" /> Videos Técnicos
              </button>
            </div>

            {filteredAdminModules.map(mod => (
              <div key={mod._id} className="bg-darkCard p-4 rounded-xl border border-white/10 flex justify-between items-center hover:border-brandOrange/30 transition-colors">
                <div className="flex items-start">
                  {/* 🎯 MOSTRAMOS EL NÚMERO DE ORDEN */}
                  <div className="bg-brandOrange text-white font-black text-sm w-8 h-8 rounded-lg flex items-center justify-center mr-4 shrink-0 mt-1 shadow-[0_0_10px_rgba(255,90,0,0.3)]">
                    {mod.order || 0}
                  </div>
                  <div>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded mb-1 inline-block ${mod.category === 'Videos Técnicos' ? 'bg-blue-500/20 text-blue-400' : 'bg-brandOrange/20 text-brandOrange'}`}>
                      {mod.category || 'Clases Grabadas'}
                    </span>
                    <h3 className="text-lg font-bold text-white mb-1">{mod.title}</h3>
                    <p className="text-sm text-gray-400">{mod.level} • {mod.duration}</p>
                  </div>
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
            
            {filteredAdminModules.length === 0 && (
              <div className="text-center text-gray-500 py-10 border border-dashed border-white/10 rounded-xl">
                No hay módulos en la categoría "{activeCategoryAdmin}".
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}