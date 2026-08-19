import axios from 'axios';

// Creamos una instancia de Axios con la URL base de tu backend en Render
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Asegúrate de tener esta variable en tu .env de React/Vite
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. REQUEST INTERCEPTOR: Inyecta el token automáticamente en cada petición si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // O donde guardes tu token (ej: Redux, Context)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. RESPONSE INTERCEPTOR: Maneja errores globales de la API
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, simplemente la devolvemos
    return response;
  },
  (error) => {
    const status = error.response ? error.response.status : null;
    const errorMessage = error.response?.data?.message || 'Error de conexión con el servidor';

    if (status === 401) {
      // El token expiró o es inválido
      console.warn('⚠️ Sesión expirada o no autorizada.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirigir al login si no estamos ya allí
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    } else if (status === 403) {
      // Cuenta no aprobada o sin permisos de admin
      console.warn('⛔ Acceso prohibido:', errorMessage);
    }

    // Devolvemos el error para que los componentes puedan mostrar alertas específicas si lo desean
    return Promise.reject(error);
  }
);

export default api;