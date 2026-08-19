import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';

// Extraemos la navegación a un componente para poder usar useNavigate
function Navbar() {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  return (
    <nav className="border-b border-white/10 bg-darkBg/80 backdrop-blur-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-black italic tracking-tighter">
              EL RINCÓN <span className="text-brandOrange text-sm uppercase tracking-widest font-bold">del trading</span>
            </span>
          </Link>
          <div className="flex space-x-4 items-center">
            {userInfo ? (
              <>
                {userInfo.role === 'admin' && (
                  <Link to="/admin" className="text-gray-300 hover:text-brandOrange px-3 py-2 text-sm font-medium transition-colors">Panel Admin</Link>
                )}
                <span className="text-gray-400 text-sm mr-4 hidden md:block">Hola, {userInfo.name}</span>
                <button onClick={logoutHandler} className="border border-white/20 hover:bg-white/10 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
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
      <div className="min-h-screen bg-darkBg text-white font-sans">
        <Navbar />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;