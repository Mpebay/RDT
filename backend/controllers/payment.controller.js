const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const User = require('../models/User');
const axios = require('axios');
// Importamos nuestras plantillas de correos
const { welcomeEmailTemplate, pendingBrokerEmailTemplate } = require('../utils/emailTemplates'); 

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

const PLAN_PRICES = {
  Plata: 99,
  Oro: 199
};

exports.createPreference = async (req, res) => {
  try {
    const { plan, email, name, userId, price } = req.body;

    const safePlan = ['Plata', 'Oro'].includes(plan) ? plan : 'Plata';
    const finalPrice = price || PLAN_PRICES[safePlan] || 99;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: safePlan,
            title: `Plan ${safePlan} - El Rincón del Trading`,
            quantity: 1,
            unit_price: Number(finalPrice),
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
        const itemPurchased = paymentInfo.additional_info?.items?.[0]?.id || paymentInfo.description;

        let user = null;
        if (externalReference && externalReference.length === 24) {
          user = await User.findById(externalReference);
        }
        if (!user && payerEmail) {
          user = await User.findOne({ email: payerEmail });
        }

        // Si encontramos al usuario y aún no figura como pagado
        if (user && !user.isPaid) {
          let assignedPlan = 'Plata';
          if (itemPurchased && itemPurchased.includes('Oro')) assignedPlan = 'Oro';

          // 1. Lo marcamos como pagado
          user.isPaid = true;
          user.plan = assignedPlan;

          let emailHtml = '';
          let emailSubject = '';
          const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

          // 2. RAMIFICACIÓN LÓGICA (Independiente vs Broker)
          if (!user.broker || user.broker === 'independent') {
            // A. Independiente: Se aprueba automáticamente
            user.isApproved = true;
            let planBadgeColor = user.plan === 'Oro' ? '#eab308' : '#94a3b8';
            emailHtml = welcomeEmailTemplate(user.name, user.plan, planBadgeColor, frontendUrl);
            emailSubject = '¡Pago Aprobado y Acceso Habilitado! - El Rincón del Trading';
          } else {
            // B. Bróker: Queda pendiente de aprobación manual
            user.isApproved = false;
            emailHtml = pendingBrokerEmailTemplate(user.name, user.broker, frontendUrl);
            emailSubject = 'Pago Recibido. Acción requerida ⏳ - El Rincón del Trading';
          }

          // Guardamos los cambios en MongoDB
          await user.save();

          // 3. Enviamos el correo correspondiente
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