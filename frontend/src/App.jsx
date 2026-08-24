import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { UserCog } from 'lucide-react';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';

// Componente para el botón flotante de WhatsApp (Solo visible si NO está logueado)
function WhatsAppButton() {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  if (userInfo) return null;

  return (
    <a
      href="https://wa.me/+5492494475552?text=Hola,%20me%20quiero%20inscribir%20en%20la%20academia%20"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-3.5 rounded-full shadow-[0_4px_20px_rgba(34,197,94,0.4)] transition-all duration-300 flex items-center justify-center hover:scale-110"
      title="¡Contáctanos por WhatsApp!"
    >
      <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    </a>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token'); 
    navigate('/', { replace: true });
    window.location.reload(); 
  };

  return (
    <nav className="border-b border-white/10 bg-darkBg/80 backdrop-blur-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={userInfo ? (userInfo.role === 'admin' ? '/admin' : '/dashboard') : "/"} className="flex items-center space-x-2">
            <span className="text-2xl font-black italic tracking-tighter text-white">
              EL RINCÓN <span className="text-brandOrange text-sm uppercase tracking-widest font-bold">del trading</span>
            </span>
          </Link>
          
          <div className="flex space-x-3 items-center">
            {userInfo ? (
              <>
                {userInfo.role === 'admin' && (
                  <Link to="/admin" className="text-gray-300 hover:text-brandOrange px-3 py-2 text-sm font-medium transition-colors">Panel Admin</Link>
                )}
                
                {userInfo.role !== 'admin' && (
                  <Link to="/dashboard" className="text-gray-300 hover:text-brandOrange px-3 py-2 text-sm font-medium transition-colors">Mis Aulas</Link>
                )}

                {/* Enlace directo a Perfil / Seguridad */}
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 hover:text-white px-3 py-1.5 rounded-lg text-sm font-medium transition"
                  title="Mi Perfil y Seguridad"
                >
                  <UserCog size={16} className="text-brandOrange" />
                  <span className="hidden sm:inline">Perfil</span>
                </Link>

                <span className="text-gray-400 text-sm ml-2 mr-2 hidden md:block">| Hola, {userInfo.name}</span>
                
                <button onClick={logoutHandler} className="border border-white/20 hover:bg-white/10 text-white px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors">
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">Login</Link>
                <Link to="/register" className="bg-brandOrange hover:bg-brandOrangeHover text-white px-4 py-2 rounded-md text-sm font-bold transition-colors">
                  Únete ahora
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-darkBg text-white font-sans relative">
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        <WhatsAppButton />
      </div>
    </Router>
  );
}

export default App;