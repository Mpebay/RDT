import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Shield, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4">
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
          DOMINA EL MERCADO CON <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brandOrange to-yellow-500">
            PRECISIÓN
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-10">
          Únete a la academia exclusiva donde la teoría se convierte en rentabilidad.
          Regístrate y espera la aprobación para acceder a nuestro contenido premium.
        </p>
        <Link to="/register" className="bg-brandOrange hover:bg-brandOrangeHover text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-[0_0_20px_rgba(255,90,0,0.4)] hover:shadow-[0_0_30px_rgba(255,90,0,0.6)]">
          Solicitar Acceso
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl w-full">
        <FeatureCard icon={<TrendingUp size={32}/>} title="Análisis Institucional" desc="Aprende a leer el mercado como los grandes fondos." />
        <FeatureCard icon={<Zap size={32}/>} title="Acceso Exclusivo" desc="Contenido reservado solo para miembros verificados." />
        <FeatureCard icon={<Shield size={32}/>} title="Gestión de Riesgo" desc="Protege tu capital con estrategias comprobadas." />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-darkCard p-6 rounded-2xl border border-white/5 hover:border-brandOrange/50 transition-colors">
      <div className="text-brandOrange mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{desc}</p>
    </div>
  );
}