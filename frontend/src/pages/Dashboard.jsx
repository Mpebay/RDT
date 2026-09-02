import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clock, PlayCircle, Lock, AlertCircle, ShoppingCart, ExternalLink, CheckCircle } from 'lucide-react';
import api from '../api/axios';

// ⚠️ ACUÉRDATE DE REEMPLAZAR ESTOS LINKS POR LOS TUYOS
const REFERRAL_LINKS = {
  vantage: "https://vigco.co/la-com-inv/9HsBqvVz",
  libertex: "https://go.libertex-affiliates.com/visit/?bta=64770&nci=22634"
};

export default function Dashboard() {
  const [userInfo, setUserInfo] = useState(JSON.parse(localStorage.getItem('userInfo')));
  const [modules, setModules] = useState([]);
  const [searchParams] = useSearchParams();
  const paymentStatus = searchParams.get('payment');
  const [loadingPayment, setLoadingPayment] = useState(false);

  useEffect(() => {
    if (!userInfo) return;

    const checkApprovalStatus = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        if (data.isApproved !== userInfo.isApproved || data.isPaid !== userInfo.isPaid) {
          const updatedUser = { ...data, token: userInfo.token };
          localStorage.setItem('userInfo', JSON.stringify(updatedUser));
          setUserInfo(updatedUser);
        }
      } catch (error) { console.error("Error sincronizando perfil", error); }
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

  const handleRetryPayment = async () => {
    try {
      setLoadingPayment(true);
      const safePrice = userInfo.checkoutPrice || (userInfo.plan === 'Oro' ? 199 : 99);
      const paymentRes = await api.post('/payments/create-preference', {
        plan: userInfo.plan || 'Plata',
        email: userInfo.email,
        name: userInfo.name,
        userId: userInfo._id,
        price: safePrice
      });
      if (paymentRes.data.init_point) {
        window.location.href = paymentRes.data.init_point;
      }
    } catch (error) {
      alert("Error al iniciar el pago. Intenta de nuevo.");
      setLoadingPayment(false);
    }
  };

  if (!userInfo) {
    return <div className="flex justify-center items-center h-[calc(100vh-64px)] text-gray-400">Inicia sesión para acceder.</div>;
  }

  // --- LÓGICA DE RUTEO VISUAL PARA USUARIOS NO APROBADOS ---
  if (!userInfo.isApproved && userInfo.role !== 'admin') {
    
    // CASO 1: EL USUARIO AÚN NO PAGÓ EN MERCADO PAGO
    if (!userInfo.isPaid) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center">
          <div className="bg-darkCard p-8 rounded-2xl border border-white/10 max-w-lg w-full relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-brandOrange animate-pulse"></div>
            
            {paymentStatus === 'failure' && (
              <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg flex items-center text-sm">
                <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                El pago fue cancelado o rechazado.
              </div>
            )}

            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 mt-4">
              <ShoppingCart size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-3">Falta completar el pago</h2>
            <p className="text-gray-400 mb-6">
              Hola <span className="text-white font-semibold">{userInfo.name}</span>, tu cuenta está creada pero detectamos que no se completó el pago de la inscripción.
            </p>
            
            <div className="mb-6 border-t border-white/10 pt-6">
              <button 
                onClick={handleRetryPayment}
                disabled={loadingPayment}
                className="bg-brandOrange hover:bg-brandOrangeHover text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(255,90,0,0.3)] flex items-center justify-center mx-auto w-full"
              >
                {loadingPayment ? 'Redirigiendo...' : 'Ir a Mercado Pago'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // CASO 2: EL USUARIO YA PAGÓ, PERO ELIGIÓ UN BROKER Y DEBE FONDEARLO
    if (userInfo.isPaid && userInfo.broker && userInfo.broker !== 'independent') {
      const brokerCapitalized = userInfo.broker.charAt(0).toUpperCase() + userInfo.broker.slice(1);
      const brokerLink = REFERRAL_LINKS[userInfo.broker] || "#";

      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center">
          <div className="bg-darkCard p-8 rounded-2xl border border-white/10 max-w-lg w-full relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-brandOrange"></div>
            
            <div className="flex items-center justify-center space-x-4 mb-6 mt-2">
              <div className="flex flex-col items-center text-green-500">
                <CheckCircle size={32} className="mb-1" />
                <span className="text-xs font-bold">Paso 1: Pago</span>
              </div>
              <div className="w-12 h-0.5 bg-white/20"></div>
              <div className="flex flex-col items-center text-brandOrange">
                <Clock size={32} className="mb-1 animate-pulse" />
                <span className="text-xs font-bold">Paso 2: Broker</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-3">¡Casi listo, {userInfo.name}!</h2>
            <p className="text-gray-400 mb-6">
              Hemos recibido tu pago correctamente. Para activar tu acceso con descuento, debes crear y fondear tu cuenta en <strong>{brokerCapitalized}</strong>.
            </p>
            
            <div className="mb-6 bg-brandOrange/10 border border-brandOrange/20 p-4 rounded-xl">
              <a 
                href={brokerLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-brandOrange hover:bg-brandOrangeHover text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(255,90,0,0.3)] flex items-center justify-center w-full"
              >
                Crear cuenta en {brokerCapitalized} <ExternalLink size={18} className="ml-2" />
              </a>
              <p className="text-xs text-brandOrange/80 mt-3 text-center">
                Una vez fondeada la cuenta, el administrador habilitará tu acceso a las aulas.
              </p>
            </div>

            <div className="bg-white/5 p-4 rounded-lg text-sm text-gray-400 flex items-center justify-center space-x-2">
              <Lock size={16} />
              <span>Verificando fondeo...</span>
            </div>
          </div>
        </div>
      );
    }

    // CASO 3: CASO GENÉRICO DE ESPERA (Por si acaso)
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center">
        <div className="bg-darkCard p-8 rounded-2xl border border-white/10 max-w-lg w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brandOrange to-yellow-500 animate-pulse"></div>
          <div className="w-16 h-16 bg-brandOrange/10 border border-brandOrange/30 text-brandOrange rounded-full flex items-center justify-center mx-auto mb-6 mt-4">
            <Clock size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-3">Procesando acceso...</h2>
          <p className="text-gray-400 mb-6">
            Hola <span className="text-white font-semibold">{userInfo.name}</span>, tu cuenta se habilitará en breve. 
          </p>
          <div className="bg-white/5 p-4 rounded-lg text-sm text-gray-400 flex items-center justify-center space-x-2">
            <Lock size={16} />
            <span>Actualizando estado...</span>
          </div>
        </div>
      </div>
    );
  }

  // --- PANTALLA PRINCIPAL: USUARIO APROBADO ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold text-white">Aulas & Módulos Exclusivos</h1>
        <p className="text-gray-400 mt-1">Selecciona un módulo para comenzar tu formación.</p>
      </div>

      {modules.length === 0 ? (
        <p className="text-gray-400 text-center py-10">Aún no hay módulos disponibles. El administrador pronto subirá contenido.</p>
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