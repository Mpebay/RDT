import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, AlertCircle } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const location = useLocation();

  // Función inteligente para hacer scroll a los planes
  const handleScrollToPlans = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      // Si está en otra página (ej. Login), lo mandamos al Home con el hash
      navigate('/#planes');
    } else {
      // Si ya está en el Home, hace scroll suave al instante
      document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-darkBg border-t border-white/5 pt-16 pb-8 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* 1. Marca y Descargo */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-black italic tracking-tighter text-white mb-4">
              EL RINCÓN <span className="text-brandOrange text-sm uppercase tracking-widest not-italic block mt-1">del trading</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md">
              Formando traders rentables con análisis institucional, gestión de riesgo estricta y psicología de mercado.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-start gap-3 max-w-md">
              <AlertCircle size={18} className="text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-gray-500 leading-tight">
                <strong>Aviso de Riesgo:</strong> El trading en mercados financieros implica un alto nivel de riesgo y puede no ser adecuado para todos los inversores. El contenido de esta academia es estrictamente educativo y no constituye asesoramiento financiero.
              </p>
            </div>
          </div>

          {/* 2. Enlaces Rápidos */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-4">Plataforma</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/login" className="text-gray-400 hover:text-brandOrange text-sm transition-colors">Iniciar Sesión</Link>
              </li>
              <li>
                {/* 🎯 BOTÓN CON SCROLL INTELIGENTE */}
                <a href="/#planes" onClick={handleScrollToPlans} className="text-gray-400 hover:text-brandOrange text-sm transition-colors cursor-pointer">
                  Registrarse
                </a>
              </li>
            </ul>
          </div>

          {/* 3. Redes y Contacto */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-4">Comunidad</h3>
            <div className="flex space-x-4 mb-6">
              
              {/* INSTAGRAM (SVG Directo) */}
              <a href="https://www.instagram.com/juancruz_orsingher?stkn=cHRwcmdnY2l5MGtj" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-2.5 rounded-lg text-gray-400 hover:bg-brandOrange hover:text-white transition-all flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>

              {/* YOUTUBE (SVG Directo) */}
              <a href="https://www.youtube.com/@RincondelTradingOK" target="_blank" rel="noopener noreferrer" className="bg-white/5 p-2.5 rounded-lg text-gray-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2C5.12 19.5 12 19.5 12 19.5s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                </svg>
              </a>
              
            </div>
            
            <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-3">Soporte</h3>
            <a href="mailto:academyrincondeltrading@gmail.com" className="text-gray-400 hover:text-brandOrange text-sm flex items-center transition-colors">
              <Mail size={16} className="mr-2" /> academyrincondeltrading@gmail.com
            </a>
          </div>

        </div>

        {/* Línea divisoria y Copyright */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            &copy; {currentYear} El Rincón del Trading. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}