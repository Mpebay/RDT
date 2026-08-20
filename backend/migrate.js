require('dotenv').config(); // Carga las variables de tu archivo .env
const mongoose = require('mongoose');
const User = require('./models/User'); // Asegúrate de que la ruta a tu modelo sea correcta
const bcrypt = require('bcrypt');
const axios = require('axios');

// Tu lista de correos a migrar
const emailsMigrar = [
  "manupebay@hotmail.com"
];

async function migrarYNotificar() {
  try {
    // Conexión a tu base de datos
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB...');

    // Contraseña temporal genérica ya hasheada
    const tempPasswordHash = await bcrypt.hash('Temporal123*', 10);

    for (const email of emailsMigrar) {
      // Extraemos un nombre base del correo (ej: "juan" de "juan@gmail.com")
      const nombreGenerico = email.split('@')[0];
      const nombreCapitalizado = nombreGenerico.charAt(0).toUpperCase() + nombreGenerico.slice(1);

      // Verificamos si el usuario ya existe para no duplicarlo
      const existe = await User.findOne({ email });
      
      if (!existe) {
        // 1. Crear el usuario en la base de datos (aprobado por defecto)
        await User.create({
          name: nombreCapitalizado,
          email: email,
          password: tempPasswordHash,
          isApproved: true, 
          role: 'user'
        });
        console.log(`[BD] Usuario migrado con éxito: ${email}`);

        // 2. Plantilla del correo de migración
        const emailHtml = `
          <div style="background-color: #0b0b0f; color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px 0; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #13131a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
              
              <!-- Logo / Header -->
              <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="font-size: 24px; font-weight: 900; font-style: italic; margin: 0; letter-spacing: -1px; color: #ffffff;">
                  EL RINCÓN <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #ff5a00; font-style: normal; display: inline-block;">del trading</span>
                </h2>
              </div>

              <!-- Mensaje Principal -->
              <h1 style="font-size: 22px; font-weight: bold; color: #ffffff; margin-bottom: 20px; text-align: center;">
                ¡Actualizamos la Plataforma! 🚀
              </h1>
              
              <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
                Hola <strong style="color: #ffffff;">${nombreCapitalizado}</strong>,
              </p>
              
              <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
                Hemos migrado nuestro sistema a un entorno mucho más rápido, seguro y exclusivo en <strong>El Rincón del Trading</strong>. Tu cuenta ya ha sido transferida y aprobada automáticamente.
              </p>

              <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                Para ingresar por primera vez, haz clic en el botón de abajo con este correo para generar tu nueva clave de acceso personal.


              <!-- Botón de Acción -->
              <div style="text-align: center; margin-bottom: 35px;">
                <a href="${process.env.FRONTEND_URL || 'https://rdt-neon.vercel.app/forgot-password'}" 
                   style="background-color: #ff5a00; color: #ffffff; padding: 14px 28px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 0 15px rgba(255,90,0,0.4);">
                  Acceder a la Plataforma
                </a>
              </div>

              <!-- Footer -->
              <div style="border-top: 1px solid rgba(255, 255, 255, 0.05); margin-top: 30px; padding-top: 20px; text-align: center;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} El Rincón del Trading. Todos los derechos reservados.
                </p>
              </div>

            </div>
          </div>
        `;

        // 3. Petición HTTP a la API de Brevo para enviar el correo
        try {
          await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
              sender: { 
                name: "El Rincón del Trading", 
                email: process.env.SENDER_EMAIL 
              },
              to: [{ email: email, name: nombreCapitalizado }],
              subject: '¡Actualizamos la plataforma! - Activa tu acceso',
              htmlContent: emailHtml,
            },
            {
              headers: {
                'api-key': process.env.BREVO_API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            }
          );
          console.log(`[EMAIL] Notificación enviada con éxito a: ${email}`);
        } catch (mailError) {
          console.error(`[ERROR EMAIL] No se pudo enviar a ${email}:`, mailError.response?.data || mailError.message);
        }

        // Pausa de 1 segundo entre envíos para respetar límites de la API de Brevo
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log(`[OMITIDO] El usuario ${email} ya existe en la base de datos.`);
      }
    }

    console.log('¡Proceso de migración masiva y correos finalizado!');
    process.exit(0);
  } catch (error) {
    console.error('Error general en el script de migración:', error);
    process.exit(1);
  }
}

migrarYNotificar();