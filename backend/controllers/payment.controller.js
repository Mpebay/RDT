const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const User = require('../models/User');
const axios = require('axios');
const { welcomeEmailTemplate, pendingBrokerEmailTemplate } = require('../utils/emailTemplates'); 

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// 💱 CONFIGURACIÓN DE PRECIOS Y TASA DE CAMBIO
const PRICE_USD = 97;
const USD_TO_ARS_RATE = 1545; // Puedes actualizar este valor según la cotización actual

exports.createPreference = async (req, res) => {
  try {
    const { email, name, userId } = req.body;

    // Calculamos el equivalente en Pesos Argentinos para Mercado Pago
    const priceInArs = PRICE_USD * USD_TO_ARS_RATE;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: 'Academia-Completa',
            title: 'Membresía Total - El Rincón del Trading',
            quantity: 1,
            unit_price: Number(priceInArs),
            currency_id: 'ARS' // Forzamos la moneda en pesos argentinos
          }
        ],
        payer: { email, name: name || 'Trader' },
        back_urls: {
          success: `${frontendUrl}/login?payment=success`,
          failure: `${frontendUrl}/dashboard?payment=failure`,
          pending: `${frontendUrl}/dashboard?payment=pending`,
        },
        auto_return: 'approved',
        external_reference: userId ? userId.toString() : email,
        notification_url: `${backendUrl}/api/payments/webhook`,
      }
    });

    res.json({ init_point: result.init_point });
  } catch (error) {
    console.error('Error creando preferencia:', error);
    res.status(500).json({ message: error.message || 'Error al procesar el pago' });
  }
};

exports.receiveWebhook = async (req, res) => {
  try {
    const paymentId = req.query.id || req.body.data?.id;

    if (req.query.type === 'payment' || req.body.type === 'payment') {
      const payment = new Payment(client);
      const paymentInfo = await payment.get({ id: paymentId });

      if (paymentInfo.status === 'approved') {
        const externalReference = paymentInfo.external_reference;
        const payerEmail = paymentInfo.payer?.email;

        let user = null;
        if (externalReference && externalReference.length === 24) {
          user = await User.findById(externalReference);
        }
        if (!user && payerEmail) {
          user = await User.findOne({ email: payerEmail });
        }

        if (user && !user.isPaid) {
          user.isPaid = true;
          user.plan = 'Acceso Total';

          let emailHtml = '';
          let emailSubject = '';
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

          if (!user.broker || user.broker === 'independent') {
            user.isApproved = true;
            emailHtml = welcomeEmailTemplate(user.name, 'Acceso Total', '#ff5a00', frontendUrl);
            emailSubject = '¡Pago Aprobado y Acceso Habilitado! - El Rincón del Trading';
          } else {
            user.isApproved = false;
            emailHtml = pendingBrokerEmailTemplate(user.name, user.broker, frontendUrl);
            emailSubject = 'Pago Recibido. Acción requerida ⏳ - El Rincón del Trading';
          }

          await user.save();

          if (typeof welcomeEmailTemplate === 'function' && typeof pendingBrokerEmailTemplate === 'function') {
            await axios.post(
              'https://api.brevo.com/v3/smtp/email',
              {
                sender: { name: "El Rincón del Trading", email: process.env.SENDER_EMAIL },
                to: [{ email: user.email, name: user.name || 'Trader' }],
                subject: emailSubject,
                htmlContent: emailHtml,
              },
              {
                headers: {
                  'api-key': process.env.BREVO_API_KEY,
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                }
              }
            ).catch(err => console.error('Error Brevo:', err.response?.data || err.message));
          }
        }
      }
    }
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error en Webhook:', error);
    res.status(500).json({ message: 'Error procesando webhook' });
  }
};