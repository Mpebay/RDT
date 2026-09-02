const REFERRAL_LINKS = {
  vantage: "https://vigco.co/la-com-inv/9HsBqvVz",
  libertex: "https://go.libertex-affiliates.com/visit/?bta=64770&nci=22634"
};

const baseHtml = (title, content, footerUrl, footerText = "Acceder a la Plataforma") => `
  <div style="background-color: #0b0b0f; color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px 0; margin: 0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #13131a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="font-size: 24px; font-weight: 900; font-style: italic; margin: 0; letter-spacing: -1px; color: #ffffff;">
          EL RINCÓN <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #ff5a00; font-style: normal; display: inline-block;">del trading</span>
        </h2>
      </div>
      <h1 style="font-size: 22px; font-weight: bold; color: #ffffff; margin-bottom: 20px; text-align: center;">
        ${title}
      </h1>
      ${content}
      ${footerUrl ? `
      <div style="text-align: center; margin-bottom: 35px; margin-top: 25px;">
        <a href="${footerUrl}" style="background-color: #ff5a00; color: #ffffff; padding: 14px 28px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 0 15px rgba(255,90,0,0.4);">
          ${footerText}
        </a>
      </div>` : ''}
      <div style="border-top: 1px solid rgba(255, 255, 255, 0.05); margin-top: 30px; padding-top: 20px; text-align: center;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} El Rincón del Trading. Todos los derechos reservados.</p>
      </div>
    </div>
  </div>
`;

exports.welcomeEmailTemplate = (name, plan, color, frontendUrl) => {
  const content = `
    <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">Hola <strong style="color: #ffffff;">${name || 'Trader'}</strong>,</p>
    <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">Hemos recibido tu pago correctamente. Tu membresía ya se encuentra activa:</p>
    <div style="text-align: center; margin-bottom: 25px;">
      <span style="background-color: ${color}20; color: ${color}; border: 1px solid ${color}50; padding: 8px 20px; border-radius: 9999px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">Plan ${plan}</span>
    </div>`;
  return baseHtml('¡Pago Exitoso y Cuenta Aprobada! 🚀', content, `${frontendUrl}/login`);
};

exports.approvalEmailTemplate = (name, plan, color, frontendUrl) => {
  const content = `
    <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">Hola <strong style="color: #ffffff;">${name || 'Trader'}</strong>,</p>
    <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">Tu solicitud de acceso ha sido aprobada por el administrador. Tu nivel de membresía asignado es:</p>
    <div style="text-align: center; margin-bottom: 25px;">
      <span style="background-color: ${color}20; color: ${color}; border: 1px solid ${color}50; padding: 8px 20px; border-radius: 9999px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">Plan ${plan || 'Plata'}</span>
    </div>`;
  return baseHtml('¡Cuenta Aprobada con Éxito! 🚀', content, `${frontendUrl}/login`);
};

exports.pendingBrokerEmailTemplate = (name, brokerName, frontendUrl) => {
  const brokerCapitalized = brokerName.charAt(0).toUpperCase() + brokerName.slice(1);
  const brokerLink = REFERRAL_LINKS[brokerName] || frontendUrl;

  const content = `
    <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">Hola <strong style="color: #ffffff;">${name || 'Trader'}</strong>,</p>
    <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">Hemos recibido tu pago de inscripción correctamente a través de Mercado Pago. ¡Bienvenido a este primer paso!</p>
    <div style="background-color: #ff5a0015; border-left: 4px solid #ff5a00; padding: 15px; margin-bottom: 25px;">
      <p style="color: #ffffff; font-size: 14px; margin: 0; line-height: 1.5;">
        <strong>Paso final requerido:</strong> Como elegiste la modalidad con descuento, tu acceso a la academia se activará una vez que crees y fondees tu cuenta en el bróker <strong>${brokerCapitalized}</strong>.
      </p>
    </div>
    <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">Haz clic en el botón de abajo para crear tu cuenta en el bróker asociado.</p>
  `;
  // El botón los llevará a crear la cuenta del broker
  return baseHtml('¡Pago Recibido! Paso final ⏳', content, brokerLink, `Crear cuenta en ${brokerCapitalized}`);
};

exports.resetPasswordTemplate = (resetUrl) => {
  const content = `
    <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">Has solicitado restablecer tu contraseña. Haz clic en el botón de abajo para continuar.</p>
  `;
  return baseHtml('Recuperación de Contraseña', content, resetUrl, "Restablecer Contraseña");
};