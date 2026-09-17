import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Clock, PlayCircle, Lock, AlertCircle, ShoppingCart, ExternalLink, QrCode, Copy, Check, ChevronLeft, MonitorPlay, Terminal, UserCog } from 'lucide-react';
import api from '../api/axios';
import qrImage from '../assets/QR.png';

// 🔗 TUS LINKS DE REFERIDOS
const REFERRAL_LINKS = { 
  vantage: "https://latam.vantagemarkets.com/es/?affid=TU_LINK_VANTAGE",
  libertex: "https://libertex.org/?affid=TU_LINK_LIBERTEX"
};
const BINANCE_WALLET_TRC20 = "TM9JArvFEZMkPNdosYGSmXMJap1XUb8qU"; 
const WHATSAPP_NUMBER = "5492494475552";

export default function Dashboard() {
  const [userInfo, setUserInfo] = useState(JSON.parse(localStorage.getItem('userInfo')));
  const [modules, setModules] = useState([]);
  const [searchParams] = useSearchParams();
  const paymentStatus = searchParams.get('payment');
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [updatingMethod, setUpdatingMethod] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [activeModule, setActiveModule] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Clases Grabadas');

  const [brokerIdInput, setBrokerIdInput] = useState('');
  const [submittingBroker, setSubmittingBroker] = useState(false);
  const [brokerError, setBrokerError] = useState('');
  
  const navigate = useNavigate(); // 🎯 NECESARIO PARA REDIRIGIR AL PERFIL

  useEffect(() => {
    if (!userInfo) return;
    const checkApprovalStatus = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        if (data.isApproved !== userInfo.isApproved || data.isPaid !== userInfo.isPaid || data.paymentMethod !== userInfo.paymentMethod || data.brokerAccountId !== userInfo.brokerAccountId || data.phone !== userInfo.phone) {
          const updatedUser = { ...data, token: userInfo.token };
          localStorage.setItem('userInfo', JSON.stringify(updatedUser));
          setUserInfo(updatedUser);
        }
      } catch (error) { console.error("Error sincronizando", error); }
    };
    let interval;
    if (!userInfo.isApproved && userInfo.role !== 'admin') {
      interval = setInterval(checkApprovalStatus, 8000);
    }
    return () => clearInterval(interval);
  }, [userInfo]);

  useEffect(() => {
    // 🎯 SOLO CARGA LOS MÓDULOS SI ESTÁ APROBADO Y SUS DATOS SON REALES
    if ((userInfo?.isApproved || userInfo?.role === 'admin') && userInfo?.phone !== '0000000000' && userInfo?.lastName !== '-') {
      const fetchModules = async () => {
        try { const { data } = await api.get('/courses/modules'); setModules(data); } 
        catch (error) { console.error("Error cargando módulos", error); }
      };
      fetchModules();
    }
  }, [userInfo]);

  const handleSwitchPaymentMethod = async (newMethod) => {
    try {
      setUpdatingMethod(true);
      const { data } = await api.put('/auth/payment-method', { paymentMethod: newMethod });
      const updatedUser = { ...userInfo, paymentMethod: data.paymentMethod };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUserInfo(updatedUser);
    } catch (error) { alert("Error al cambiar el método de pago"); } 
    finally { setUpdatingMethod(false); }
  };

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(BINANCE_WALLET_TRC20);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitBroker = async (e) => {
    e.preventDefault();
    setBrokerError('');
    if (!brokerIdInput.trim()) { setBrokerError('Por favor ingresa tu ID de cuenta'); return; }
    
    try {
      setSubmittingBroker(true);
      const { data } = await api.put('/auth/broker-id', { brokerAccountId: brokerIdInput });
      const updatedUser = { ...userInfo, brokerAccountId: data.brokerAccountId };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUserInfo(updatedUser);
    } catch(err) {
      setBrokerError(err.response?.data?.message || 'Error al enviar el ID');
    } finally {
      setSubmittingBroker(false);
    }
  };

  if (!userInfo) return <div className="flex justify-center items-center h-[calc(100vh-64px)] text-gray-400">Inicia sesión para acceder.</div>;

  // ========================================================
  // ⛔ ZONA DE BLOQUEO 1: USUARIOS MIGRADOS (Aprobados pero sin datos)
  // ========================================================
  if (userInfo.isApproved && userInfo.role !== 'admin' && (!userInfo.phone || userInfo.phone === '0000000000' || userInfo.lastName === '-')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center py-10 relative z-10">
        <div className="bg-darkCard p-8 md:p-10 rounded-3xl border-2 border-brandOrange max-w-xl w-full relative shadow-[0_0_50px_rgba(255,90,0,0.15)]">
          <div className="w-20 h-20 bg-brandOrange/10 border border-brandOrange/30 text-brandOrange rounded-full flex items-center justify-center mx-auto mb-6"><UserCog size={40} /></div>
          <h2 className="text-3xl font-black mb-3 text-white">¡Actualiza tu información!</h2>
          <p className="text-gray-400 mb-8 text-sm md:text-base">
            Como fuiste migrado a la nueva plataforma, necesitamos que completes tus datos reales (Nombre, Apellido, Teléfono) y cambies tu contraseña temporal por seguridad antes de ingresar a las aulas.
          </p>
          
          <button 
            onClick={() => navigate('/profile')}
            className="bg-brandOrange hover:bg-brandOrangeHover text-white px-6 py-3.5 rounded-xl font-bold w-full shadow-[0_0_15px_rgba(255,90,0,0.3)] transition-all"
          >
            Ir a Mi Perfil a completar datos
          </button>
        </div>
      </div>
    );
  }

  // ========================================================
  // ⛔ ZONA DE BLOQUEO 2: USUARIOS NUEVOS NO APROBADOS
  // ========================================================
  if (!userInfo.isApproved && userInfo.role !== 'admin') {
    
    // 1️⃣ PANTALLAS DE PAGO (Si aún no han pagado)
    if (!userInfo.isPaid) {
      if (userInfo.paymentMethod === 'crypto') {
        const wpText = `Hola, ya transferí los 97 USDT para la Academia. Mi email es ${userInfo.email}. Adjunto el comprobante.`;
        return (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center py-10 relative z-10">
            <div className="bg-darkCard p-8 rounded-2xl border border-white/10 max-w-lg w-full relative shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#F3BA2F]"></div>
              <div className="w-16 h-16 bg-[#F3BA2F]/10 border border-[#F3BA2F]/30 text-[#F3BA2F] rounded-full flex items-center justify-center mx-auto mb-6 mt-4"><QrCode size={32} /></div>
              <h2 className="text-2xl font-bold mb-3">Pago con 97 USDT (Crypto)</h2>
              <p className="text-gray-400 mb-6 text-sm">Transfiere exactamente <strong>97 USDT</strong> a nuestra red TRC20 para activar tu cuenta.</p>
              <div className="bg-black/50 border border-white/10 rounded-xl p-5 mb-6 text-left">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Red / Network</p>
                <p className="text-white font-bold mb-4">Tron (TRC20)</p>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Dirección de Wallet</p>
                <div className="bg-white/5 p-3 rounded-lg flex items-center justify-between border border-white/10 mb-4 gap-2">
                  <span className="text-xs text-brandOrange font-mono break-all select-all">{BINANCE_WALLET_TRC20}</span>
                  <button onClick={handleCopyWallet} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all flex items-center justify-center shrink-0 relative" title="Copiar dirección">
                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  </button>
                </div>
                {copied && <p className="text-[11px] text-green-400 text-right mb-2 font-medium">¡Dirección copiada al portapapeles!</p>}
                <div className="bg-white p-4 rounded-xl w-36 h-36 mx-auto flex flex-col items-center justify-center text-black shadow-md mt-4">
                  <img src={qrImage} alt="QR Code" className="w-full h-full object-contain" />
                </div>
              </div>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(wpText)}`} target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center justify-center mx-auto w-full transition-all mb-4">
                Ya transferí (Enviar comprobante por WhatsApp)
              </a>
              <div className="border-t border-white/10 pt-4 mt-4">
                <p className="text-xs text-gray-400 mb-2">¿Prefieres abonar en pesos argentinos?</p>
                <button onClick={() => handleSwitchPaymentMethod('mercadopago')} disabled={updatingMethod} className="text-xs text-[#009EE3] hover:underline font-semibold">
                  {updatingMethod ? 'Actualizando...' : '🔄 Cambiar a Mercado Pago (ARS)'}
                </button>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center relative z-10">
          <div className="bg-darkCard p-8 rounded-2xl border border-white/10 max-w-lg w-full relative shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#009EE3]"></div>
            <div className="w-16 h-16 bg-[#009EE3]/10 border border-[#009EE3]/30 text-[#009EE3] rounded-full flex items-center justify-center mx-auto mb-6 mt-4"><ShoppingCart size={32} /></div>
            <h2 className="text-2xl font-bold mb-3">Completar pago</h2>
            <p className="text-gray-400 mb-6 text-sm">Haz clic en el botón para abonar en Pesos Argentinos (ARS) mediante Mercado Pago.</p>
            <button 
              onClick={async () => {
                setLoadingPayment(true);
                try {
                  const paymentRes = await api.post('/payments/create-preference', { email: userInfo.email, userId: userInfo._id });
                  window.location.href = paymentRes.data.init_point;
                } catch(e) { setLoadingPayment(false); alert("Error al iniciar el pago."); }
              }}
              disabled={loadingPayment}
              className="bg-[#009EE3] hover:bg-[#007dba] text-white px-6 py-3 rounded-xl font-bold w-full mb-6 shadow-md transition-all"
            >
              {loadingPayment ? 'Redirigiendo...' : 'Pagar con Mercado Pago'}
            </button>
            {paymentStatus === 'failure' && (<div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-xs">El pago anterior fue cancelado o rechazado.</div>)}
            <div className="border-t border-white/10 pt-4">
              <p className="text-xs text-gray-400 mb-2">¿Prefieres abonar en criptomonedas?</p>
              <button onClick={() => handleSwitchPaymentMethod('crypto')} disabled={updatingMethod} className="text-xs text-[#F3BA2F] hover:underline font-semibold">
                {updatingMethod ? 'Actualizando...' : '🔄 Cambiar a USDT (Binance / Crypto con QR)'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 2️⃣ PANTALLA DE BRÓKER (Si ya pagaron pero eligieron Vantage o Libertex y no enviaron su ID)
    if (userInfo.isPaid) {
      if ((userInfo.broker === 'vantage' || userInfo.broker === 'libertex') && !userInfo.brokerAccountId) {
        
        const brokerName = userInfo.broker === 'vantage' ? 'Vantage Markets' : 'Libertex';
        const brokerLink = REFERRAL_LINKS[userInfo.broker];

        return (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center py-10 relative z-10">
            <div className="bg-darkCard p-8 md:p-10 rounded-3xl border-2 border-brandOrange max-w-xl w-full relative shadow-[0_0_50px_rgba(255,90,0,0.15)]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brandOrange text-white text-xs font-bold uppercase tracking-wider px-6 py-1.5 rounded-full shadow-md">
                Paso Final
              </div>
              <h2 className="text-3xl font-black mb-3 mt-4 text-white">¡Bienvenido a la Academia!</h2>
              <p className="text-gray-400 mb-8 text-sm md:text-base">
                Hemos recibido tu pago correctamente. Para desbloquear las aulas, es requisito crear y fondear tu cuenta en <strong>{brokerName}</strong> utilizando nuestro enlace oficial.
              </p>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
                <div className="flex items-start gap-3 mb-5">
                  <div className="bg-brandOrange/20 text-brandOrange w-7 h-7 rounded-full flex items-center justify-center font-bold shrink-0 text-sm">1</div>
                  <p className="text-sm text-gray-300">Crea tu cuenta en {brokerName} desde el siguiente botón oficial.</p>
                </div>
                <div className="flex items-start gap-3 mb-6">
                  <div className="bg-brandOrange/20 text-brandOrange w-7 h-7 rounded-full flex items-center justify-center font-bold shrink-0 text-sm">2</div>
                  <p className="text-sm text-gray-300">Realiza tu primer fondeo en la cuenta que acabas de crear.</p>
                </div>
                
                <a href={brokerLink} target="_blank" rel="noopener noreferrer" className="bg-white hover:bg-gray-200 text-black px-6 py-3.5 rounded-xl font-bold w-full flex justify-center items-center shadow-lg transition-all">
                  Crear cuenta en {brokerName} <ExternalLink size={18} className="ml-2"/>
                </a>
              </div>

              <form onSubmit={handleSubmitBroker} className="text-left bg-black/30 p-6 rounded-2xl border border-white/5">
                <label className="block text-sm font-bold text-gray-300 mb-2">Una vez fondeada, ingresa el ID de tu cuenta:</label>
                <input
                  type="text"
                  placeholder="Ej: 12345678"
                  value={brokerIdInput}
                  onChange={(e) => setBrokerIdInput(e.target.value)}
                  className="w-full bg-darkBg border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-brandOrange mb-2 transition-colors"
                  required
                />
                {brokerError && <p className="text-red-400 text-xs mb-3 font-medium">{brokerError}</p>}
                
                <button
                  type="submit"
                  disabled={submittingBroker}
                  className="bg-brandOrange hover:bg-brandOrangeHover text-white px-6 py-3.5 rounded-xl font-bold w-full shadow-[0_0_15px_rgba(255,90,0,0.3)] transition-all disabled:opacity-50 mt-3"
                >
                  {submittingBroker ? 'Enviando...' : 'Ya fondeé y envié mi ID'}
                </button>
              </form>
            </div>
          </div>
        );
      }

      // 3️⃣ PANTALLA "EN REVISIÓN" (Si ya mandaron el ID o son Independientes)
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center relative z-10">
          <div className="bg-darkCard p-10 rounded-3xl border border-white/10 max-w-md w-full relative shadow-2xl">
            <div className="w-20 h-20 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6"><Clock size={40} /></div>
            <h2 className="text-2xl font-bold mb-3 text-white">Cuenta en Revisión</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {userInfo.brokerAccountId
                ? `Estamos verificando tu fondeo en la cuenta (${userInfo.brokerAccountId}). Una vez validado, se desbloquearán automáticamente las aulas.`
                : 'Estamos verificando tu pago. En breve habilitaremos tu acceso a la academia.'}
            </p>
            <p className="text-xs text-gray-500 font-medium">Este proceso puede demorar algunas horas.<br/>Te notificaremos por correo electrónico.</p>
          </div>
        </div>
      );
    }
  }
  // ========================================================
  // ✅ FIN DE ZONA DE BLOQUEO (Lo de abajo solo lo ven aprobados y migrados)
  // ========================================================

  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      const match = url.match(/\/d\/(.*?)\//);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    return url;
  };
  
  if (activeModule) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative z-10">
        <button 
          onClick={() => setActiveModule(null)} 
          className="flex items-center text-gray-400 hover:text-brandOrange mb-6 transition-colors font-medium"
        >
          <ChevronLeft size={20} className="mr-1" /> Volver a las aulas
        </button>

        <div className="bg-darkCard rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="aspect-video w-full bg-black relative overflow-hidden">
            <iframe 
              src={getEmbedUrl(activeModule.videoUrl)} 
              className="w-full h-full border-none outline-none absolute top-0 left-0 scale-[1.03] translate-y-[-10px]"
              allow="autoplay; fullscreen"
              allowFullScreen
            ></iframe>
            <div className="absolute top-0 left-0 w-full h-14 bg-black/90 backdrop-blur-sm pointer-events-auto z-20 flex items-center px-6">
              <span className="text-xs text-gray-400 font-medium tracking-wide">El Rincón del Trading - {activeModule.category || 'Clase Exclusiva'}</span>
            </div>
            <div className="absolute top-0 right-0 w-32 h-14 bg-black pointer-events-auto z-30" />
          </div>
          
          <div className="p-8">
            <div className="flex items-center gap-3 mb-3">
              <span className={`border px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${activeModule.category === 'Videos Técnicos' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-brandOrange/10 border-brandOrange/30 text-brandOrange'}`}>
                {activeModule.level}
              </span>
              <span className="text-gray-400 text-sm flex items-center"><Clock size={16} className="mr-1"/> {activeModule.duration} min.</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">{activeModule.title}</h1>
            <p className="text-gray-300 leading-relaxed text-lg">{activeModule.description}</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredModules = modules
    .filter(mod => (mod.category || 'Clases Grabadas') === activeCategory)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
      <h1 className="text-3xl font-bold text-white mb-8">Aulas Exclusivas</h1>
      
      <div className="flex space-x-2 sm:space-x-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
        <button 
          onClick={() => setActiveCategory('Clases Grabadas')} 
          className={`flex items-center px-5 py-2.5 rounded-lg font-bold transition-all whitespace-nowrap ${activeCategory === 'Clases Grabadas' ? 'bg-brandOrange text-white shadow-[0_0_15px_rgba(255,90,0,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <MonitorPlay size={20} className="mr-2" /> Clases Grabadas
        </button>
        
        <button 
          onClick={() => setActiveCategory('Videos Técnicos')} 
          className={`flex items-center px-5 py-2.5 rounded-lg font-bold transition-all whitespace-nowrap ${activeCategory === 'Videos Técnicos' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          <Terminal size={20} className="mr-2" /> Videos Técnicos
        </button>
      </div>

      {filteredModules.length === 0 ? (
        <div className="text-center py-16 bg-darkCard border border-white/5 rounded-2xl">
          <p className="text-gray-400 text-lg">Aún no hay contenido disponible en esta sección.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((mod) => (
            <div 
              key={mod._id} 
              onClick={() => setActiveModule(mod)}
              className="block bg-darkCard rounded-xl border border-white/10 overflow-hidden hover:border-brandOrange/50 transition-all group hover:shadow-[0_0_20px_rgba(255,90,0,0.15)] cursor-pointer"
            >
              <div className="h-48 bg-black flex items-center justify-center text-brandOrange group-hover:scale-105 transition-transform duration-500 relative">
                <PlayCircle size={48} className="z-10 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-brandOrange/5 group-hover:bg-brandOrange/10 transition-colors"></div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${mod.category === 'Videos Técnicos' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'bg-brandOrange/10 border border-brandOrange/20 text-brandOrange'}`}>
                    {mod.level}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center"><Clock size={14} className="mr-1"/> {mod.duration} min.</span>
                </div>
                <h3 className="text-lg font-bold mb-2 text-white group-hover:text-brandOrange transition-colors">{mod.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-2">{mod.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}