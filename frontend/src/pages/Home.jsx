import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Shield, Zap, UserPlus, Clock, CheckCircle2, ChevronDown, Users, Video, MessageCircle, Headphones, Activity } from 'lucide-react';
import vantageLogo from '../assets/logo_vantage.png';
import libertexLogo from '../assets/logo_libertex.png';

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 relative overflow-hidden py-16">
      
      {/* Glow de fondo cenital */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-brandOrange/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Hero Section */}
      <div className="text-center max-w-4xl z-10">
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
          DOMINA EL MERCADO CON <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brandOrange to-yellow-500">
            PRECISIÓN
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Únete a la academia exclusiva donde la teoría se convierte en rentabilidad. 
          Regístrate y espera la aprobación para acceder a nuestro contenido premium.
        </p>
        <Link 
          to="/register" 
          className="inline-block bg-brandOrange hover:bg-brandOrangeHover text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-[0_0_20px_rgba(255,90,0,0.4)] hover:shadow-[0_0_30px_rgba(255,90,0,0.6)]"
        >
          Solicitar Acceso
        </Link>
      </div>

      {/* Barra de Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-5xl w-full z-10 border-y border-white/5 py-8 bg-darkCard/40 backdrop-blur-sm rounded-2xl px-6">
        <MetricItem number="+500" label="Traders Activos" />
        <MetricItem number="99%" label="Análisis Institucional" />
        <MetricItem number="24/7" label="Comunidad Privada" />
        <MetricItem number="100%" label="Estrategias Verificadas" />
      </div>

      {/* Características Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl w-full z-10">
        <FeatureCard 
          icon={<TrendingUp size={32}/>} 
          title="Análisis Institucional" 
          desc="Aprende a leer el mercado como los grandes fondos de inversión." 
        />
        <FeatureCard 
          icon={<Zap size={32}/>} 
          title="Acceso Exclusivo" 
          desc="Contenido reservado únicamente para miembros verificados y aprobados." 
        />
        <FeatureCard 
          icon={<Shield size={32}/>} 
          title="Gestión de Riesgo" 
          desc="Protege tu capital con metodologías profesionales comprobadas." 
        />
      </div>

      {/* --- NUEVA SECCIÓN: EL FACTOR COMUNIDAD Y EN VIVO --- */}
      <div className="mt-28 max-w-5xl w-full z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-brandOrange text-sm font-bold uppercase tracking-widest bg-brandOrange/10 px-4 py-1.5 rounded-full border border-brandOrange/20">
            Acompañamiento Real
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-4 mb-4">Nunca operes a solas</h2>
          <p className="text-gray-400">
            El trading en solitario genera dudas y frustración. Por eso formamos un ecosistema conectado a través de WhatsApp con diferentes grupos especializados para cada momento de tu formación.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CommunityCard 
            icon={<Activity className="text-brandOrange" size={28} />}
            title="Señales y Alertas"
            desc="Canales de WhatsApp dedicados con proyecciones y oportunidades detectadas en tiempo real."
          />
          <CommunityCard 
            icon={<Video className="text-brandOrange" size={28} />}
            title="Clases en Vivo"
            desc="Recepción directa de los links de acceso a las transmisiones diarias."
          />
          <CommunityCard 
            icon={<Headphones className="text-brandOrange" size={28} />}
            title="Psicotrading"
            desc="Acompañamiento mental especializado para aprender a dominar las emociones y la presión."
          />
          <CommunityCard 
            icon={<MessageCircle className="text-brandOrange" size={28} />}
            title="Comunidad & Networking"
            desc="Un espacio dinámico para debatir análisis, compartir experiencias y crecer junto a otros traders."
          />
        </div>
      </div>
      {/* -------------------------------------------------- */}


      {/* Sección Cómo Funciona */}
      <div className="mt-28 max-w-4xl w-full z-10 text-center">
        <h2 className="text-3xl font-bold mb-4">¿Cómo funciona el acceso?</h2>
        <p className="text-gray-400 mb-12">Mantenemos un entorno controlado y seguro para todos nuestros estudiantes.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <StepCard 
            step="01" 
            icon={<UserPlus className="text-brandOrange" size={24} />}
            title="Regístrate" 
            desc="Crea tu cuenta con tu correo electrónico y contraseña de forma segura." 
          />
          <StepCard 
            step="02" 
            icon={<Clock className="text-brandOrange" size={24} />}
            title="Espera Aprobación" 
            desc="Nuestro equipo revisa cada perfil para mantener la exclusividad de la academia." 
          />
          <StepCard 
            step="03" 
            icon={<CheckCircle2 className="text-brandOrange" size={24} />}
            title="Acceso Total" 
            desc="Una vez aprobado, desbloquea todo el contenido premium y módulos de estudio." 
          />
        </div>
      </div>
      {/* Sección de Brókers / Aliados Estratégicos con Logos Locales */}
      <div className="mt-28 max-w-3xl w-full z-10 text-center">
        <p className="text-sm uppercase tracking-widest text-gray-500 font-semibold mb-8">
          Brókers y Aliados Estratégicos Asociados
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-center">
          
          {/* Bróker 1 */}
          <div className="bg-darkCard/60 border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:border-brandOrange/40 transition-all duration-300 group">
            <div className="h-12 flex items-center justify-center mb-3">
              <img 
                src={vantageLogo}
                alt="Vantage Markets" 
                className="max-h-10 max-w-full object-contain filter brightness-95 group-hover:brightness-100 transition-all" 
              />
            </div>
            <span className="font-bold text-white text-base group-hover:text-brandOrange transition-colors">Vantage Markets</span>
          </div>

          {/* Bróker 2 */}
          <div className="bg-darkCard/60 border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:border-brandOrange/40 transition-all duration-300 group">
            <div className="h-12 flex items-center justify-center mb-3">
              <img 
                src={libertexLogo}
                alt="Libertex" 
                className="max-h-10 max-w-full object-contain filter brightness-95 group-hover:brightness-100 transition-all" 
              />
            </div>
            <span className="font-bold text-white text-base group-hover:text-brandOrange transition-colors">Libertex</span>
          </div>

        </div>
      </div>

      {/* Preguntas Frecuentes (FAQ) */}
      <div className="mt-28 max-w-3xl w-full z-10">
        <h2 className="text-3xl font-bold mb-4 text-center">Preguntas Frecuentes</h2>
        <p className="text-gray-400 mb-10 text-center">Resolvemos tus dudas antes de dar el siguiente paso.</p>

        <div className="space-y-4">
          <FaqItem 
            question="¿Cuánto tiempo tarda la aprobación de la cuenta?" 
            answer="Generalmente el proceso de revisión toma menos de 24 horas hábiles. Te notificaremos en cuanto tu acceso esté habilitado."
            isOpen={openFaq === 0}
            onClick={() => toggleFaq(0)}
          />
          <FaqItem 
            question="¿Necesito experiencia previa en trading?" 
            answer="Tenemos contenido diseñado tanto para principiantes que quieren aprender desde cero como para traders avanzados buscando refinar su operativa institucional."
            isOpen={openFaq === 1}
            onClick={() => toggleFaq(1)}
          />
          <FaqItem 
            question="¿Qué incluye el acceso a la plataforma y comunidad?" 
            answer="Tendrás acceso completo a los módulos de estudio privados, análisis institucionales, sesiones en vivo y los grupos exclusivos de WhatsApp para acompañamiento constante."
            isOpen={openFaq === 2}
            onClick={() => toggleFaq(2)}
          />
        </div>
      </div>

    </div>
  );
}

function MetricItem({ number, label }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-black text-brandOrange mb-1">{number}</div>
      <div className="text-sm text-gray-400 font-medium">{label}</div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-darkCard p-6 rounded-2xl border border-white/5 hover:border-brandOrange/50 transition-colors shadow-lg">
      <div className="text-brandOrange mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function CommunityCard({ icon, title, desc }) {
  return (
    <div className="bg-darkCard p-6 rounded-2xl border border-white/5 hover:border-brandOrange/40 transition-all duration-300 flex flex-col justify-between group">
      <div>
        <div className="p-3 bg-brandOrange/10 w-fit rounded-xl mb-4 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h3 className="text-lg font-bold mb-2 text-white">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function StepCard({ step, icon, title, desc }) {
  return (
    <div className="bg-darkCard p-6 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between">
      <div className="absolute top-4 right-4 text-4xl font-black text-white/5 select-none">{step}</div>
      <div>
        <div className="mb-4">{icon}</div>
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function FaqItem({ question, answer, isOpen, onClick }) {
  return (
    <div className="bg-darkCard border border-white/5 rounded-xl overflow-hidden transition-all">
      <button 
        onClick={onClick}
        className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
      >
        <span className="font-semibold text-white">{question}</span>
        <ChevronDown className={`text-brandOrange transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} size={20} />
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-sm text-gray-400 border-t border-white/5 pt-3 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}