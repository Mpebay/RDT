const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const User = require('../models/User');
const axios = require('axios');

// Inicializar cliente de Mercado Pago con el Access Token del archivo .env
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// Precios de los planes (puedes ajustarlos a tu moneda local, ej. ARS o USD)
const PLAN_PRICES = {
  Bronce: 49,
  Plata: 99,
  Oro: 199
};

exports.createPreference = async (req, res) => {
  try {
    const { plan, email, name } = req.body;

    if (!['Bronce', 'Plata', 'Oro'].includes(plan)) {
      return res.status(400).json({ message: 'Plan seleccionado no válido' });
    }

    const price = PLAN_PRICES[plan];

    // Tomamos las URLs reales desde las variables de entorno configuradas en Render
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: plan,
            title: `Plan ${plan} - El Rincón del Trading`,
            quantity: 1,
            unit_price: Number(price),
          }
        ],
        payer: {
          email: email,
          name: name || 'Trader'
        },
        back_urls: {
          success: `${frontendUrl}/login?payment=success`,
          failure: `${frontendUrl}/?payment=failure`,
          pending: `${frontendUrl}/?payment=pending`,
        },
        auto_return: 'approved',
        // ¡Ahora sí habilitamos el Webhook de Render para que procese el pago solo!
        notification_url: `${backendUrl}/api/payments/webhook`,
      }
    });

    res.json({ init_point: result.init_point });
  } catch (error) {
    console.error('Error creando preferencia de MP:', error);
    res.status(500).json({ message: error.message || 'Error al procesar el pago con Mercado Pago' });
  }
};

// 2. Webhook para recibir la notificación de pago aprobado de forma automática
exports.receiveWebhook = async (req, res) => {
  try {
    const paymentId = req.query.id || req.body.data?.id;

    if (req.query.type === 'payment' || req.body.type === 'payment') {
      const payment = new Payment(client);
      const paymentInfo = await payment.get({ id: paymentId });

      if (paymentInfo.status === 'approved') {
        const payerEmail = paymentInfo.payer?.email || paymentInfo.additional_info?.payer?.email;
        const externalReference = paymentInfo.external_reference; // O identificar por items
        const itemPurchased = paymentInfo.additional_info?.items?.[0]?.id || paymentInfo.description;

        // Buscamos al usuario en la base de datos
        let user = null;
        if (payerEmail) {
          user = await User.findOne({ email: payerEmail });
        }

        if (user && !user.isApproved) {
          // Determinamos el plan según el ítem comprado o buscamos en el título
          let assignedPlan = 'Bronce';
          if (itemPurchased.includes('Plata')) assignedPlan = 'Plata';
          if (itemPurchased.includes('Oro')) assignedPlan = 'Oro';

          user.isApproved = true;
          user.plan = assignedPlan;
          await user.save();

          // Definir color del badge para el correo
          let planBadgeColor = '#cd7f32';
          if (user.plan === 'Oro') planBadgeColor = '#eab308';
          if (user.plan === 'Plata') planBadgeColor = '#94a3b8';

          // Estructura del correo HTML de bienvenida automatizado
          const emailHtml = `
            <div style="background-color: #0b0b0f; color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px 0; margin: 0;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #13131a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                
                <div style="text-align: center; margin-bottom: 30px;">
                  <h2 style="font-size: 24px; font-weight: 900; font-style: italic; margin: 0; letter-spacing: -1px; color: #ffffff;">
                    EL RINCÓN <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #ff5a00; font-style: normal; display: inline-block;">del trading</span>
                  </h2>
                </div>

                <h1 style="font-size: 22px; font-weight: bold; color: #ffffff; margin-bottom: 20px; text-align: center;">
                  ¡Pago Exitoso y Cuenta Aprobada! 🚀
                </h1>
                
                <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
                  Hola <strong style="color: #ffffff;">${user.name || 'Trader'}</strong>,
                </p>
                
                <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
                  Hemos recibido tu pago correctamente a través de Mercado Pago. Tu membresía ya se encuentra activa:
                </p>

                <div style="text-align: center; margin-bottom: 25px;">
                  <span style="background-color: ${planBadgeColor}20; color: ${planBadgeColor}; border: 1px solid ${planBadgeColor}50; padding: 8px 20px; border-radius: 9999px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
                    Plan ${user.plan}
                  </span>
                </div>

                <div style="text-align: center; margin-bottom: 35px;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
                     style="background-color: #ff5a00; color: #ffffff; padding: 14px 28px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 0 15px rgba(255,90,0,0.4);">
                    Acceder a la Plataforma
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

          // Envío de correo mediante Brevo API
          await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
              sender: { name: "El Rincón del Trading", email: process.env.SENDER_EMAIL },
              to: [{ email: user.email, name: user.name || 'Trader' }],
              subject: '¡Pago Aprobado y Acceso Habilitado! - El Rincón del Trading',
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
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error en Webhook de Mercado Pago:', error);
    res.status(500).json({ message: 'Error procesando webhook' });
  }
};