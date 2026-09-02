import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Shield, Zap, UserPlus, Clock, CheckCircle2, ChevronDown, Video, MessageCircle, Headphones, Activity, Check, Info } from 'lucide-react';
import vantageLogo from '../assets/logo_vantage.png';
import libertexLogo from '../assets/logo_libertex.png';

export default function Home() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  
  const [brokerChoice, setBrokerChoice] = useState('vantage');

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const plans = [
    {
      name: 'Plan Plata',
      priceReferral: 99,       
      priceIndependent: 199,   
      features: [
        'Estrategia grabada',
        'Trading en vivo',
        'Señales y alertas',
        'Clases de mentalidad'
      ]
    },
    {
      name: 'Plan Oro',
      priceReferral: 199,      
      priceIndependent: 349,   
      features: [
        'Todo lo incluido en Plan Plata',
        'Bono en broker (+$150 USD)',
        'Acompañamiento personalizado',
        'Profundidad de mercado',
        'Clases temáticas personalizadas',
        'Sorteos exclusivos'
      ]
    }
  ];

  const handlePurchase = (planName, price) => {
    const checkoutData = {
      plan: planName,
      broker: brokerChoice,
      price: price
    };
    localStorage.setItem('checkout_pending', JSON.stringify(checkoutData));
    navigate('/register');
  };

  // Función para hacer Scroll Suave a los planes
  const scrollToPlans = () => {
    const section = document.getElementById('planes');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 relative overflow-hidden py-16 text-white">
      
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
        
        {/* BOTÓN ACTUALIZADO: Hace scroll en lugar de redirigir */}
        <button 
          onClick={scrollToPlans}
          className="inline-block bg-brandOrange hover:bg-brandOrangeHover text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-[0_0_20px_rgba(255,90,0,0.4)] hover:shadow-[0_0_30px_rgba(255,90,0,0.6)]"
        >
          Solicitar Acceso
        </button>
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

      {/* SECCIÓN: EL FACTOR COMUNIDAD Y EN VIVO */}
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

      {/* --- SECCIÓN: PLANES Y MEMBRESÍAS --- */}
      {/* AGREGAMOS id="planes" y scroll-mt-24 para que el navbar no tape el título */}
      <div id="planes" className="mt-28 max-w-6xl w-full z-10 scroll-mt-24">
        <div className="mb-12">
          <div className="text-center mb-6">
            <h3 className="text-3xl font-bold mb-2">Elige tu modalidad de ingreso</h3>
            <p className="text-gray-400 text-sm">Podés obtener un descuento importante en tu inscripción si utilizás nuestros brókers asociados.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <button 
              onClick={() => setBrokerChoice('vantage')}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                brokerChoice === 'vantage' 
                ? 'border-brandOrange bg-brandOrange/10 shadow-[0_0_20px_rgba(255,90,0,0.2)]' 
                : 'border-white/10 bg-darkCard hover:border-white/30'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-lg">Broker Vantage</h4>
                {brokerChoice === 'vantage' && <Check className="text-brandOrange" size={20} />}
              </div>
              <span className="inline-block bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded mb-3">
                + Bono de 200 USD
              </span>
              <p className="text-sm text-gray-400">Inscripción a precio reducido + bono al fondear tu cuenta.</p>
            </button>

            <button 
              onClick={() => setBrokerChoice('libertex')}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                brokerChoice === 'libertex' 
                ? 'border-brandOrange bg-brandOrange/10 shadow-[0_0_20px_rgba(255,90,0,0.2)]' 
                : 'border-white/10 bg-darkCard hover:border-white/30'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-lg">Broker Libertex</h4>
                {brokerChoice === 'libertex' && <Check className="text-brandOrange" size={20} />}
              </div>
              <span className="inline-block bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-1 rounded mb-3">
                Sin Bono
              </span>
              <p className="text-sm text-gray-400">Inscripción a precio reducido operando con Libertex.</p>
            </button>

            <button 
              onClick={() => setBrokerChoice('independent')}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                brokerChoice === 'independent' 
                ? 'border-brandOrange bg-brandOrange/10 shadow-[0_0_20px_rgba(255,90,0,0.2)]' 
                : 'border-white/10 bg-darkCard hover:border-white/30'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-lg">Independiente</h4>
                {brokerChoice === 'independent' && <Check className="text-brandOrange" size={20} />}
              </div>
              <span className="inline-block bg-gray-500/20 text-gray-400 text-xs font-bold px-2 py-1 rounded mb-3">
                Tu propio broker
              </span>
              <p className="text-sm text-gray-400">Abonás el valor completo sin restricciones de bróker.</p>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {plans.map((plan, index) => {
            const currentPrice = brokerChoice === 'independent' ? plan.priceIndependent : plan.priceReferral;
            const isOro = index === 1;

            return (
              <div 
                key={index} 
                className={`bg-darkCard p-8 rounded-3xl border flex flex-col justify-between relative ${
                  isOro 
                  ? 'border-2 border-brandOrange shadow-[0_0_30px_rgba(255,90,0,0.2)] transform md:-translate-y-2' 
                  : 'border-white/10'
                }`}
              >
                {isOro && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brandOrange text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-md">
                    Más Popular / VIP
                  </div>
                )}

                <div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-black text-white">${currentPrice}</span>
                    <span className="text-gray-400 text-sm"> / pago único</span>
                  </div>

                  {brokerChoice !== 'independent' && (
                    <div className="flex items-center gap-2 mb-6 bg-green-500/10 text-green-400 p-3 rounded-lg text-sm border border-green-500/20">
                      <Info size={16} />
                      <span>Incluye descuento por bróker asociado</span>
                    </div>
                  )}

                  <ul className="space-y-3 mb-8 text-sm text-gray-300">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check size={16} className={isOro ? 'text-brandOrange' : 'text-gray-400'} /> 
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={() => handlePurchase(plan.name, currentPrice)}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-center transition-all ${
                    isOro
                    ? 'bg-brandOrange hover:bg-brandOrangeHover text-white shadow-[0_0_15px_rgba(255,90,0,0.4)]'
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  Comenzar con {plan.name}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-gray-400 text-center mt-8 text-sm">
          * Al elegir un plan, aceptas nuestros términos y condiciones. Por otros medios de pago, contáctanos directamente a través de WhatsApp.
        </p>
      </div>

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

      {/* Sección de Brókers / Aliados Estratégicos */}
      <div className="mt-28 max-w-3xl w-full z-10 text-center">
        <p className="text-sm uppercase tracking-widest text-gray-500 font-semibold mb-8">
          Brókers y Aliados Estratégicos Asociados
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-center">
          <a href="https://latam.vantagemarkets.com/es/" target="_blank" rel="noopener noreferrer" className="bg-darkCard/60 border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:border-brandOrange/40 transition-all duration-300 group">
            <div className="h-12 flex items-center justify-center mb-3">
              <img 
                src={vantageLogo}
                alt="Vantage Markets" 
                className="max-h-10 max-w-full object-contain filter brightness-95 group-hover:brightness-100 transition-all" 
              />
            </div>
            <span className="font-bold text-white text-base group-hover:text-brandOrange transition-colors">Vantage Markets</span>
          </a>

          <a href="https://libertex.org/es" target="_blank" rel="noopener noreferrer" className="bg-darkCard/60 border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:border-brandOrange/40 transition-all duration-300 group">
            <div className="h-12 flex items-center justify-center mb-3">
              <img 
                src={libertexLogo}
                alt="Libertex" 
                className="max-h-10 max-w-full object-contain filter brightness-95 group-hover:brightness-100 transition-all" 
              />
            </div>
            <span className="font-bold text-white text-base group-hover:text-brandOrange transition-colors">Libertex</span>
          </a>
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