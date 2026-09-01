import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, PlayCircle, Info } from 'lucide-react';

export default function LandingPromo() {
  const navigate = useNavigate();
  // Estado para manejar la elección del usuario sobre el broker
  // Opciones: 'vantage', 'libertex', 'independent'
  const [brokerChoice, setBrokerChoice] = useState('vantage');

  const plans = [
    {
      name: 'Plan Plata',
      priceReferral: 15000, // Precio con broker
      priceIndependent: 35000, // Precio sin broker
      features: [
        'Acceso al aula virtual Plata',
        'Material en video y PDF',
        'Soporte por comunidad (Discord/Telegram)',
        'Estrategias básicas de Trading'
      ]
    },
    {
      name: 'Plan Oro',
      priceReferral: 25000,
      priceIndependent: 50000,
      features: [
        'Acceso a TODO el contenido (Plata + Oro)',
        'Sesiones en vivo 1 a 1',
        'Indicadores personalizados',
        'Grupo VIP de señales',
        'Análisis de mercado semanal'
      ]
    }
  ];

  // Función para manejar el clic en comprar
  const handlePurchase = (planName, price) => {
    // Guardamos la elección temporalmente para usarla en el Register
    const checkoutData = {
      plan: planName,
      broker: brokerChoice,
      price: price
    };
    localStorage.setItem('checkout_pending', JSON.stringify(checkoutData));
    
    // Redirigimos al registro
    navigate('/register'); 
  };

  return (
    <div className="min-h-screen bg-darkBg text-white pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabecera y Video */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-6">
            DOMINA EL MERCADO CON <br/>
            <span className="text-brandOrange">EL RINCÓN DEL TRADING</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Descubrí nuestro método comprobado para generar rentabilidad consistente. Mirá el video para entender cómo funciona la academia.
          </p>
          
          {/* Contenedor del Video (Podés reemplazar la imagen con tu <video> o <iframe> real) */}
          <div className="relative max-w-4xl mx-auto aspect-video bg-darkCard border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(255,90,0,0.15)] flex items-center justify-center group cursor-pointer">
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors flex items-center justify-center z-10">
              <PlayCircle size={80} className="text-brandOrange opacity-80 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop" alt="Intro Video" className="w-full h-full object-cover opacity-60" />
          </div>
        </div>

        {/* Sección de Selección de Modalidad */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Elige tu modalidad de ingreso</h2>
            <p className="text-gray-400">Podés obtener un descuento importante en tu inscripción si utilizás nuestros brokers asociados.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Opción Vantage */}
            <button 
              onClick={() => setBrokerChoice('vantage')}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                brokerChoice === 'vantage' 
                ? 'border-brandOrange bg-brandOrange/10 shadow-[0_0_20px_rgba(255,90,0,0.2)]' 
                : 'border-white/10 bg-darkCard hover:border-white/30'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">Broker Vantage</h3>
                {brokerChoice === 'vantage' && <Check className="text-brandOrange" size={20} />}
              </div>
              <span className="inline-block bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded mb-3">
                + Bono de 200 USD
              </span>
              <p className="text-sm text-gray-400">Inscripción a precio reducido + bono al fondear tu cuenta.</p>
            </button>

            {/* Opción Libertex */}
            <button 
              onClick={() => setBrokerChoice('libertex')}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                brokerChoice === 'libertex' 
                ? 'border-brandOrange bg-brandOrange/10 shadow-[0_0_20px_rgba(255,90,0,0.2)]' 
                : 'border-white/10 bg-darkCard hover:border-white/30'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">Broker Libertex</h3>
                {brokerChoice === 'libertex' && <Check className="text-brandOrange" size={20} />}
              </div>
              <span className="inline-block bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-1 rounded mb-3">
                Sin Bono
              </span>
              <p className="text-sm text-gray-400">Inscripción a precio reducido operando con Libertex.</p>
            </button>

            {/* Opción Independiente */}
            <button 
              onClick={() => setBrokerChoice('independent')}
              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                brokerChoice === 'independent' 
                ? 'border-brandOrange bg-brandOrange/10 shadow-[0_0_20px_rgba(255,90,0,0.2)]' 
                : 'border-white/10 bg-darkCard hover:border-white/30'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">Independiente</h3>
                {brokerChoice === 'independent' && <Check className="text-brandOrange" size={20} />}
              </div>
              <span className="inline-block bg-gray-500/20 text-gray-400 text-xs font-bold px-2 py-1 rounded mb-3">
                Tu propio broker
              </span>
              <p className="text-sm text-gray-400">Abonás el valor completo sin restricciones de broker.</p>
            </button>
          </div>
        </div>

        {/* Tarjetas de Planes */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => {
            const currentPrice = brokerChoice === 'independent' ? plan.priceIndependent : plan.priceReferral;
            const isOro = index === 1;

            return (
              <div key={index} className={`bg-darkCard rounded-3xl p-8 border ${isOro ? 'border-brandOrange relative' : 'border-white/10'}`}>
                {isOro && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brandOrange text-white px-4 py-1 rounded-full text-sm font-bold tracking-wider">
                    MÁS ELEGIDO
                  </div>
                )}
                
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                
                <div className="mb-6">
                  <span className="text-4xl font-black">${currentPrice.toLocaleString('es-AR')}</span>
                  <span className="text-gray-400"> / pago único</span>
                </div>

                {brokerChoice !== 'independent' && (
                  <div className="flex items-center gap-2 mb-6 bg-green-500/10 text-green-400 p-3 rounded-lg text-sm">
                    <Info size={16} />
                    <span>Incluye descuento por broker asociado</span>
                  </div>
                )}

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="text-brandOrange mr-3 shrink-0" size={20} />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handlePurchase(plan.name, currentPrice)}
                  className={`w-full py-4 rounded-xl font-bold transition-all ${
                    isOro 
                    ? 'bg-brandOrange hover:bg-brandOrangeHover text-white shadow-[0_0_15px_rgba(255,90,0,0.4)]' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  Comenzar con {plan.name}
                </button>
              </div>
            );
          })}
        </div>
        
      </div>
    </div>
  );
}