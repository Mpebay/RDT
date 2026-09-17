require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User'); 
const axios = require('axios');

const emailsMigrar = [
  "manupebay@hotmail.com" // Pon aquí todos los correos que vayas a migrar
];

async function migrarYNotificar() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB...');

    // 🎯 TEXTO PLANO: Tu modelo User.js lo encriptará automáticamente
    const plainTempPassword = 'Rincon2026!'; 

    for (const email of emailsMigrar) {
      const nombreGenerico = email.split('@')[0];
      const nombreCapitalizado = nombreGenerico.charAt(0).toUpperCase() + nombreGenerico.slice(1);

      const existe = await User.findOne({ email });
      
      if (!existe) {
        // 1. Crear el usuario con DATOS DE RELLENO y la contraseña sin encriptar aquí
        await User.create({
          name: nombreCapitalizado,
          lastName: '-',             
          phone: '0000000000',       
          email: email,
          password: plainTempPassword, // 🎯 PASAMOS TEXTO PLANO
          isApproved: true,
          isPaid: true,
          role: 'user',
          broker: 'independent'      
        });
        console.log(`[BD] Usuario migrado con éxito: ${email}`);

        // 2. Plantilla del correo de migración
        const emailHtml = `
          <div style="background-color: #0b0b0f; color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px 0; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #13131a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
              
              <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="font-size: 24px; font-weight: 900; font-style: italic; margin: 0; letter-spacing: -1px; color: #ffffff;">
                  EL RINCÓN <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #ff5a00; font-style: normal; display: inline-block;">del trading</span>
                </h2>
              </div>

              <h1 style="font-size: 22px; font-weight: bold; color: #ffffff; margin-bottom: 20px; text-align: center;">
                ¡Bienvenido a la Nueva Plataforma! 🚀
              </h1>
              
              <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
                Hola <strong style="color: #ffffff;">Trader</strong>,
              </p>
              
              <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
                Hemos migrado nuestro sistema a un entorno mucho más exclusivo. Tu cuenta ya ha sido transferida exitosamente y tienes <strong>acceso total habilitado</strong>.
              </p>

              <div style="background-color: rgba(255,90,0,0.1); border: 1px solid rgba(255,90,0,0.3); border-radius: 10px; padding: 20px; margin-bottom: 30px;">
                <p style="color: #ffffff; font-size: 14px; margin: 0 0 10px 0; font-weight: bold;">TUS DATOS DE ACCESO PROVISORIOS:</p>
                <p style="color: #9ca3af; font-size: 15px; margin: 0 0 5px 0;"><strong>Usuario:</strong> ${email}</p>
                <p style="color: #9ca3af; font-size: 15px; margin: 0;"><strong>Contraseña temporal:</strong> ${plainTempPassword}</p>
              </div>

              <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                Haz clic en el botón de abajo para iniciar sesión. Por seguridad, el sistema te pedirá que completes tus datos reales (Nombre y Teléfono) y cambies esta contraseña en tu primer ingreso.
              </p>

              <div style="text-align: center; margin-bottom: 35px;">
                <a href="https://rdt-neon.vercel.app/login"
                   style="background-color: #ff5a00; color: #ffffff; padding: 14px 28px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 0 15px rgba(255,90,0,0.4);">
                  Iniciar Sesión
                </a>
              </div>

              <div style="border-top: 1px solid rgba(255, 255, 255, 0.05); margin-top: 30px; padding-top: 20px; text-align: center;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} El Rincón del Trading. Todos los derechos reservados.
                </p>
              </div>

            </div>
          </div>
        `;

        try {
          await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
              sender: { name: "El Rincón del Trading", email: process.env.SENDER_EMAIL },
              to: [{ email: email, name: nombreCapitalizado }],
              subject: 'Tus accesos a la nueva plataforma',
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
          console.log(`[EMAIL] Notificación enviada a: ${email}`);
        } catch (mailError) { console.error(`[ERROR EMAIL] ${email}`); }

        await new Promise(resolve => setTimeout(resolve, 1000));
      } else { console.log(`[OMITIDO] ${email} ya existe.`); }
    }

    console.log('¡Migración finalizada!');
    process.exit(0);
  } catch (error) { 
    console.error('Error general en el script de migración:', error);
    process.exit(1); 
  }
}

migrarYNotificar();