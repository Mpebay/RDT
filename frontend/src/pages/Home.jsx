import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Shield, Zap, UserPlus, Clock, CheckCircle2, ChevronDown, Video, MessageCircle, Headphones, Activity, Check, Info, QrCode } from 'lucide-react';
import vantageLogo from '../assets/logo_vantage.png';
import Footer from '../components/Footer';
import libertexLogo from '../assets/logo_libertex.png';

export default function Home() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('mercadopago');
  const [brokerChoice, setBrokerChoice] = useState('vantage');

  // 🎯 EFECTO PARA DETECTAR SI EL USUARIO VIENE DESDE EL LOGIN CON EL LINK #planes
  useEffect(() => {
    if (window.location.hash === '#planes') {
      setTimeout(() => {
        document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' });
      }, 100); // Pequeño retraso para asegurar que la página cargó completa
    }
  }, []);

  const USD_TO_ARS_RATE = 1545; // Misma tasa de referencia para mostrar al usuario
  const basePriceUsd = 97;
  const priceInArs = basePriceUsd * USD_TO_ARS_RATE;

  const toggleFaq = (index) => setOpenFaq(openFaq === index ? null : index);

  const planData = {
    name: 'Membresía Total Academia',
    features: [
      'Estrategia institucional grabada zonas de aceleracion',
      'Sesiones de Trading en vivo diarias',
      'Canal de señales y alertas exclusivas',
      'Clases intensivas de Psicología de Mercado (opcional c/costo extra)',
      'Acompañamiento personalizado en comunidad VIP',
      'Acceso a todos los futuros módulos sin costo extra'
    ]
  };

  const handlePurchase = () => {
    const finalPriceToStore = paymentMethod === 'mercadopago' ? priceInArs : basePriceUsd;
    const checkoutData = {
      plan: planData.name,
      broker: brokerChoice,
      price: finalPriceToStore,
      paymentMethod: paymentMethod
    };
    localStorage.setItem('checkout_pending', JSON.stringify(checkoutData));
    navigate('/register');
  };

  const scrollToPlans = () => {
    document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    /* 🎯 AQUÍ AGREGAMOS EL FRAGMENTO DE REACT (<>) PARA ENVOLVER TODO */
    <>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 relative overflow-hidden py-16 text-white">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-brandOrange/10 blur-[140px] pointer-events-none rounded-full" />

        <div className="text-center max-w-4xl z-10">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
            DOMINA EL MERCADO CON <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brandOrange to-yellow-500">PRECISIÓN</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Únete a la academia exclusiva donde la teoría se convierte en rentabilidad. 
            Regístrate y accede a todo el conocimiento institucional.
          </p>
          <button onClick={scrollToPlans} className="inline-block bg-brandOrange hover:bg-brandOrangeHover text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-[0_0_20px_rgba(255,90,0,0.4)] hover:shadow-[0_0_30px_rgba(255,90,0,0.6)]">
            Solicitar Acceso
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-20 max-w-5xl w-full z-10 border-y border-white/5 py-8 bg-darkCard/40 backdrop-blur-sm rounded-2xl px-6">
          <MetricItem number="99%" label="Análisis Institucional" />
          <MetricItem number="24/7" label="Comunidad Privada" />
          <MetricItem number="100%" label="Estrategia Verificada" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl w-full z-10">
          <FeatureCard icon={<TrendingUp size={32}/>} title="Análisis Institucional" desc="Aprende a leer el mercado como los grandes fondos de inversión." />
          <FeatureCard icon={<Zap size={32}/>} title="Acceso Exclusivo" desc="Contenido reservado únicamente para miembros verificados." />
          <FeatureCard icon={<Shield size={32}/>} title="Gestión de Riesgo" desc="Protege tu capital con metodologías profesionales comprobadas." />
        </div>
        
        {/* 🎯 NUEVA SECCIÓN DE BRÓKERS RESTAURADA */}
        <div className="mt-28 max-w-4xl w-full z-10 text-center">
          <h2 className="text-3xl font-bold mb-4">Brókers Asociados</h2>
          <p className="text-gray-400 mb-12">Opera con las mismas condiciones que nosotros y accede a beneficios exclusivos.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            
            {/* Tarjeta VANTAGE */}
            <a 
              href="https://vigco.co/la-com-inv/9HsBqvVz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-darkCard p-8 rounded-2xl border border-white/5 hover:border-brandOrange/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(255,90,0,0.15)] flex flex-col items-center justify-center group cursor-pointer"
            >
              <div className="h-16 mb-4 flex items-center justify-center w-full bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
                <img src={vantageLogo} alt="Vantage Logo" className="max-h-10 object-contain group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Vantage Markets</h3>
              <p className="text-sm text-gray-400">Bono operable de $200 USD</p>
            </a>

            {/* Tarjeta LIBERTEX */}
            <a 
              href="https://go.libertex-affiliates.com/visit/?bta=64770&nci=22634" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-darkCard p-8 rounded-2xl border border-white/5 hover:border-brandOrange/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(255,90,0,0.15)] flex flex-col items-center justify-center group cursor-pointer"
            >
              <div className="h-16 mb-4 flex items-center justify-center w-full bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
                {/* NOTA: Asegúrate de guardar el logo de libertex como logo_libertex.png en assets */}
                <img src={libertexLogo} alt="Libertex Logo" className="max-h-10 object-contain group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Libertex</h3>
              <p className="text-sm text-gray-400">Ideal para iniciar en el mercado</p>
            </a>

          </div>
        </div>
        {/* FIN SECCIÓN BRÓKERS */}

        <div id="planes" className="mt-28 max-w-4xl w-full z-10 scroll-mt-24">
          
          <div className="text-center mb-12">
            <span className="text-brandOrange text-sm font-bold uppercase tracking-widest bg-brandOrange/10 px-4 py-1.5 rounded-full border border-brandOrange/25">
              Acceso Inmediato
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-4 mb-2">Inscripción a la Academia</h2>
            <p className="text-gray-400">Todo el contenido y la comunidad profesional en un pase único.</p>
          </div>

          <div className="mb-10 bg-darkCard p-6 rounded-2xl border border-white/10 shadow-lg">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 text-center">Paso 1: Selecciona tu medio de pago</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setPaymentMethod('mercadopago')}
                className={`p-4 rounded-xl border-2 flex items-center justify-center space-x-3 transition-all ${paymentMethod === 'mercadopago' ? 'border-[#009EE3] bg-[#009EE3]/10 text-white' : 'border-white/10 bg-darkBg text-gray-400 hover:border-white/30'}`}
              >
                <span className="font-bold">Mercado Pago (Pesos Argentinos - ARS)</span>
              </button>
              <button
                onClick={() => setPaymentMethod('crypto')}
                className={`p-4 rounded-xl border-2 flex items-center justify-center space-x-3 transition-all ${paymentMethod === 'crypto' ? 'border-[#F3BA2F] bg-[#F3BA2F]/10 text-white' : 'border-white/10 bg-darkBg text-gray-400 hover:border-white/30'}`}
              >
                <QrCode size={20} className="text-[#F3BA2F]" />
                <span className="font-bold">USDT (Binance / Crypto - QR)</span>
              </button>
            </div>
          </div>

          <div className="mb-10 bg-darkCard p-6 rounded-2xl border border-white/10 shadow-lg">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 text-center">Paso 2: Elige tu modalidad con el bróker</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setBrokerChoice('vantage')}
                className={`p-5 rounded-xl border-2 text-left transition-all ${brokerChoice === 'vantage' ? 'border-brandOrange bg-brandOrange/10 shadow-[0_0_15px_rgba(255,90,0,0.2)]' : 'border-white/10 bg-darkBg hover:border-white/30'}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white">Vantage (Con Referido)</span>
                  {brokerChoice === 'vantage' && <Check className="text-brandOrange" size={18} />}
                </div>
                <p className="text-xs text-green-400 font-semibold mb-2">✨ Incluye bono operable de $200 USD al fondear</p>
                <p className="text-xs text-gray-400">Asócitate con nuestro link oficial.</p>
              </button>

              <button
                onClick={() => setBrokerChoice('independent')}
                className={`p-5 rounded-xl border-2 text-left transition-all ${brokerChoice === 'independent' ? 'border-brandOrange bg-brandOrange/10 shadow-[0_0_15px_rgba(255,90,0,0.2)]' : 'border-white/10 bg-darkBg hover:border-white/30'}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white">Independiente (Tu propio bróker)</span>
                  {brokerChoice === 'independent' && <Check className="text-brandOrange" size={18} />}
                </div>
                <p className="text-xs text-gray-400 mt-1">Opera con tu bróker actual sin bonos asociados.</p>
              </button>
            </div>
          </div>

          <div className="bg-darkCard p-8 md:p-10 rounded-3xl border-2 border-brandOrange shadow-[0_0_40px_rgba(255,90,0,0.25)] relative text-center">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brandOrange text-white text-xs font-bold uppercase tracking-wider px-6 py-1.5 rounded-full shadow-md">
              Pase Total Academia
            </div>

            <div className="mb-6 mt-4">
              {paymentMethod === 'mercadopago' ? (
                <div>
                  <span className="text-4xl md:text-5xl font-black text-white">$ {priceInArs.toLocaleString('es-AR')}</span>
                  <span className="text-gray-400 text-sm block mt-1">ARS (Pesos Argentinos) / único pago <br />=<br />97 USDT</span>
                </div>
              ) : (
                <div>
                  <span className="text-5xl md:text-6xl font-black text-white">97 USDT</span>
                  <span className="text-gray-400 text-sm block mt-1">Crypto (Red TRC20) / único pago</span>
                </div>
              )}
            </div>

            {brokerChoice === 'vantage' && (
              <div className="inline-flex items-center gap-2 mb-6 bg-green-500/10 text-green-400 px-4 py-2 rounded-xl text-sm border border-green-500/30">
                <Info size={16} />
                <span>Modalidad Vantage seleccionada: Accedes al bono operable de $200 USD.</span>
              </div>
            )}

            <ul className="space-y-4 mb-8 text-left max-w-xl mx-auto text-sm md:text-base text-gray-300">
              {planData.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check size={20} className="text-brandOrange shrink-0" /> 
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={handlePurchase}
              className="w-full max-w-md py-4 px-8 rounded-full font-extrabold text-lg bg-brandOrange hover:bg-brandOrangeHover text-white transition-all shadow-[0_0_20px_rgba(255,90,0,0.5)]"
            >
              {paymentMethod === 'crypto' ? 'Registrarse y pagar con USDT (QR)' : 'Registrarse y pagar con Mercado Pago'}
            </button>
          </div>

        </div>

        <div className="mt-28 max-w-4xl w-full z-10 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Cómo funciona el acceso?</h2>
          <p className="text-gray-400 mb-12">Mantenemos un entorno controlado y seguro para todos nuestros estudiantes.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <StepCard step="01" icon={<UserPlus className="text-brandOrange" size={24} />} title="Regístrate" desc="Crea tu cuenta con tus datos reales de forma segura." />
            <StepCard step="02" icon={<Clock className="text-brandOrange" size={24} />} title="Realiza el Pago" desc="Abona mediante Mercado Pago en pesos o transfiere USDT a nuestra wallet." />
            <StepCard step="03" icon={<CheckCircle2 className="text-brandOrange" size={24} />} title="Acceso Total" desc="Desbloquea de inmediato las aulas y el contenido institucional." />
          </div>
        </div>
      </div>
      
      {/* 🎯 EL FOOTER AHORA ESTÁ DENTRO DEL FRAGMENTO DE REACT */}
      <div className="w-full mt-24">
        <Footer />
      </div>
    </>
  );
}

function MetricItem({ number, label }) { return ( <div className="text-center"><div className="text-3xl md:text-4xl font-black text-brandOrange mb-1">{number}</div><div className="text-sm text-gray-400 font-medium">{label}</div></div> ); }
function FeatureCard({ icon, title, desc }) { return ( <div className="bg-darkCard p-6 rounded-2xl border border-white/5 hover:border-brandOrange/50 transition-colors shadow-lg"><div className="text-brandOrange mb-4">{icon}</div><h3 className="text-xl font-bold mb-2">{title}</h3><p className="text-gray-400 text-sm leading-relaxed">{desc}</p></div> ); }
function StepCard({ step, icon, title, desc }) { return ( <div className="bg-darkCard p-6 rounded-2xl border border-white/5 relative overflow-hidden flex flex-col justify-between"><div className="absolute top-4 right-4 text-4xl font-black text-white/5 select-none">{step}</div><div><div className="mb-4">{icon}</div><h3 className="text-lg font-bold mb-2">{title}</h3><p className="text-gray-400 text-sm leading-relaxed">{desc}</p></div></div> ); }