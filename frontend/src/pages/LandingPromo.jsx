import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, PlayCircle, Info, QrCode } from 'lucide-react';

// 🔗 PEGA AQUÍ EL LINK DE GOOGLE DRIVE DE TU VIDEO PROMOCIONAL
const PROMO_VIDEO_URL = "https://drive.google.com/file/d/1dFAwKekdXVTg8B_UMeQkj-w1mh67T9WU/view?usp=drive_link";

export default function LandingPromo() {
  const navigate = useNavigate();
  const [brokerChoice, setBrokerChoice] = useState('vantage');
  const [paymentMethod, setPaymentMethod] = useState('mercadopago');
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  // 🎯 EFECTO PARA DETECTAR SI EL USUARIO VIENE DESDE EL LOGIN CON EL LINK #planes
  useEffect(() => {
    if (window.location.hash === '#planes') {
      setTimeout(() => {
        document.getElementById('planes')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

  const USD_TO_ARS_RATE = 1545;
  const basePriceUsd = 97;
  const priceInArs = basePriceUsd * USD_TO_ARS_RATE;

  const planData = {
    name: 'Membresía Total Academia',
    features: [
      'Estrategia institucional grabada (SMC & Precio)',
      'Sesiones de Trading en vivo diarias',
      'Canal de señales y alertas exclusivas',
      'Clases intensivas de Psicología de Mercado',
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

  const getEmbedUrl = (url) => {
    if (!url || url.includes('TU_ID_DE_DRIVE_AQUI')) return '';
    if (url.includes('drive.google.com')) {
      const match = url.match(/\/d\/(.*?)\//);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-darkBg text-white pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-6">
            DOMINA EL MERCADO CON <br/>
            <span className="text-brandOrange">EL RINCÓN DEL TRADING</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Descubrí nuestro método comprobado para generar rentabilidad consistente. Mirá el video para entender cómo funciona la academia.
          </p>

          <div className="relative max-w-4xl mx-auto aspect-video bg-darkCard border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(255,90,0,0.15)] flex items-center justify-center">
            {isPlayingVideo ? (
              <div className="relative w-full h-full bg-black overflow-hidden">
                <iframe 
                  src={getEmbedUrl(PROMO_VIDEO_URL)} 
                  className="w-full h-full border-none outline-none absolute top-0 left-0 scale-[1.03] translate-y-[-10px]"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                ></iframe>

                {/* 🛡️ ESCUDO SUPERIOR: Oculta la barra de Drive */}
                <div className="absolute top-0 left-0 w-full h-14 bg-black/90 backdrop-blur-sm pointer-events-auto z-20 flex items-center px-6">
                  <span className="text-xs text-gray-400 font-medium tracking-wide">El Rincón del Trading - Video Oficial</span>
                </div>
                
                {/* 🛡️ ESCUDO ESQUINA DERECHA: Bloquea intentos de apertura extra */}
                <div className="absolute top-0 right-0 w-32 h-14 bg-black pointer-events-auto z-30" />
              </div>
            ) : (
              <div 
                onClick={() => setIsPlayingVideo(true)}
                className="absolute inset-0 group cursor-pointer flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors flex items-center justify-center z-10">
                  <PlayCircle size={80} className="text-brandOrange opacity-80 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop" alt="Intro Video" className="w-full h-full object-cover opacity-60" />
              </div>
            )}
          </div>
        </div>

        {/* 🎯 SE UNIFICÓ EL ID A "planes" PARA MANTENER LA CONSISTENCIA */}
        <div id="planes" className="max-w-4xl mx-auto scroll-mt-28">
          
          <div className="mb-8 bg-darkCard p-6 rounded-2xl border border-white/10 shadow-lg">
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

          <div className="mb-8 bg-darkCard p-6 rounded-2xl border border-white/10 shadow-lg">
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
                  <span className="text-gray-400 text-sm block mt-1">ARS (Pesos Argentinos) / único pago</span>
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

      </div>
    </div>
  );
}