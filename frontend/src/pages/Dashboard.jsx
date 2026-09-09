import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clock, PlayCircle, Lock, AlertCircle, ShoppingCart, ExternalLink, QrCode, Copy, Check } from 'lucide-react';
import api from '../api/axios';

const REFERRAL_LINKS = {
  vantage: "https://latam.vantagemarkets.com/es/?affid=TU_LINK_VANTAGE"
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
  const [copied, setCopied] = useState(false); // Estado para el aviso de copiado

  useEffect(() => {
    if (!userInfo) return;
    const checkApprovalStatus = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        if (data.isApproved !== userInfo.isApproved || data.isPaid !== userInfo.isPaid || data.paymentMethod !== userInfo.paymentMethod) {
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
    if (userInfo?.isApproved || userInfo?.role === 'admin') {
      const fetchModules = async () => {
        try {
          const { data } = await api.get('/courses/modules');
          setModules(data);
        } catch (error) { console.error("Error cargando módulos", error); }
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
    } catch (error) {
      alert("Error al cambiar el método de pago");
    } finally {
      setUpdatingMethod(false);
    }
  };

  // Función para copiar la wallet al portapapeles
  const handleCopyWallet = () => {
    navigator.clipboard.writeText(BINANCE_WALLET_TRC20);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // El aviso se oculta a los 2 segundos
  };

  if (!userInfo) {
    return <div className="flex justify-center items-center h-[calc(100vh-64px)] text-gray-400">Inicia sesión para acceder.</div>;
  }

  if (!userInfo.isApproved && userInfo.role !== 'admin') {
    
    if (!userInfo.isPaid) {
      
      // --- VISTA CRYPTO / USDT ---
      if (userInfo.paymentMethod === 'crypto') {
        const wpText = `Hola, ya transferí los 97 USDT para la Academia. Mi email es ${userInfo.email}. Adjunto el comprobante.`;
        return (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center py-10">
            <div className="bg-darkCard p-8 rounded-2xl border border-white/10 max-w-lg w-full relative shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#F3BA2F]"></div>
              
              <div className="w-16 h-16 bg-[#F3BA2F]/10 border border-[#F3BA2F]/30 text-[#F3BA2F] rounded-full flex items-center justify-center mx-auto mb-6 mt-4">
                <QrCode size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-3">Pago con 97 USDT (Crypto)</h2>
              <p className="text-gray-400 mb-6 text-sm">
                Transfiere exactamente <strong>97 USDT</strong> a nuestra red TRC20 para activar tu cuenta.
              </p>

              <div className="bg-black/50 border border-white/10 rounded-xl p-5 mb-6 text-left">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Red / Network</p>
                <p className="text-white font-bold mb-4">Tron (TRC20)</p>
                
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Dirección de Wallet</p>
                
                {/* CAJA CON LA WALLET Y EL BOTÓN DE COPIA */}
                <div className="bg-white/5 p-3 rounded-lg flex items-center justify-between border border-white/10 mb-4 gap-2">
                  <span className="text-xs text-brandOrange font-mono break-all select-all">{BINANCE_WALLET_TRC20}</span>
                  <button
                    onClick={handleCopyWallet}
                    className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all flex items-center justify-center shrink-0 relative"
                    title="Copiar dirección"
                  >
                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  </button>
                </div>
                {copied && <p className="text-[11px] text-green-400 text-right mb-2 font-medium">¡Dirección copiada al portapapeles!</p>}

                <div className="bg-white p-4 rounded-xl w-36 h-36 mx-auto flex flex-col items-center justify-center text-black shadow-md mt-4">
                  <span className="text-xs font-bold text-center">ESCANEAR QR</span>
                </div>
              </div>

              <a 
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(wpText)}`}
                target="_blank" rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(34,197,94,0.3)] flex items-center justify-center mx-auto w-full transition-all mb-4"
              >
                Ya transferí (Enviar comprobante por WhatsApp)
              </a>

              <div className="border-t border-white/10 pt-4 mt-4">
                <p className="text-xs text-gray-400 mb-2">¿Prefieres abonar en pesos argentinos?</p>
                <button
                  onClick={() => handleSwitchPaymentMethod('mercadopago')}
                  disabled={updatingMethod}
                  className="text-xs text-[#009EE3] hover:underline font-semibold"
                >
                  {updatingMethod ? 'Actualizando...' : '🔄 Cambiar a Mercado Pago (ARS)'}
                </button>
              </div>
            </div>
          </div>
        );
      }

      // --- VISTA MERCADO PAGO (ARS) ---
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center">
          <div className="bg-darkCard p-8 rounded-2xl border border-white/10 max-w-lg w-full relative shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#009EE3]"></div>
            
            <div className="w-16 h-16 bg-[#009EE3]/10 border border-[#009EE3]/30 text-[#009EE3] rounded-full flex items-center justify-center mx-auto mb-6 mt-4">
              <ShoppingCart size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-3">Completar pago</h2>
            <p className="text-gray-400 mb-6 text-sm">
              Haz clic en el botón para abonar en Pesos Argentinos (ARS) mediante Mercado Pago.
            </p>

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

            {paymentStatus === 'failure' && (
              <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-xs">
                El pago anterior fue cancelado o rechazado.
              </div>
            )}

            <div className="border-t border-white/10 pt-4">
              <p className="text-xs text-gray-400 mb-2">¿Prefieres abonar en criptomonedas?</p>
              <button
                onClick={() => handleSwitchPaymentMethod('crypto')}
                disabled={updatingMethod}
                className="text-xs text-[#F3BA2F] hover:underline font-semibold"
              >
                {updatingMethod ? 'Actualizando...' : '🔄 Cambiar a USDT (Binance / Crypto con QR)'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (userInfo.isPaid && userInfo.broker === 'vantage') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center">
          <div className="bg-darkCard p-8 rounded-2xl border border-white/10 max-w-lg w-full relative shadow-2xl">
            <h2 className="text-2xl font-bold mb-3">¡Pago Recibido!</h2>
            <p className="text-gray-400 mb-6">Para habilitar tu acceso con el bono de $200 USD, crea tu cuenta en <strong>Vantage</strong> con nuestro link de referido.</p>
            <a href={REFERRAL_LINKS.vantage} target="_blank" rel="noopener noreferrer" className="bg-brandOrange text-white px-6 py-3 rounded-xl font-bold w-full flex justify-center items-center shadow-lg">
              Crear cuenta en Vantage <ExternalLink size={18} className="ml-2"/>
            </a>
          </div>
        </div>
      );
    }

    return <div className="text-center mt-20 text-gray-400">Procesando acceso...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-white mb-6">Aulas Exclusivas</h1>
      {modules.length === 0 ? (
        <p className="text-gray-400 text-center py-10">Aún no hay módulos disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <ModuleCard key={mod._id} data={mod} />
          ))}
        </div>
      )}
    </div>
  );
}

function ModuleCard({ data }) {
  return (
    <a href={data.videoUrl} target="_blank" rel="noreferrer" className="block bg-darkCard rounded-xl border border-white/10 overflow-hidden hover:border-brandOrange/50 transition-all group hover:shadow-[0_0_20px_rgba(255,90,0,0.15)] cursor-pointer">
      <div className="h-48 bg-black flex items-center justify-center text-brandOrange group-hover:scale-105 transition-transform duration-500 relative">
        <PlayCircle size={48} className="z-10 group-hover:scale-110 transition-transform" />
        <div className="absolute inset-0 bg-brandOrange/5 group-hover:bg-brandOrange/10 transition-colors"></div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-bold text-brandOrange bg-brandOrange/10 border border-brandOrange/20 px-2.5 py-1 rounded-full uppercase tracking-wider">{data.level}</span>
          <span className="text-xs text-gray-400">{data.duration} min.</span>
        </div>
        <h3 className="text-lg font-bold mb-2 text-white group-hover:text-brandOrange transition-colors">{data.title}</h3>
        <p className="text-sm text-gray-400 line-clamp-2">{data.description}</p>
      </div>
    </a>
  );
}