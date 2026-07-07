import { Resend } from "resend";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Get base URL from environment
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://mbeautybloom.shop';
const STORE_NAME = 'M Beauty Bloom';

// ==================
// EMAIL TEMPLATES
// ==================
const templates = {
  emailVerification: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; background: #f9f9f9; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ec4899, #db2777); padding: 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px; }
        .button { 
          display: inline-block; 
          padding: 14px 35px; 
          background: #ec4899; 
          color: white !important; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0;
          font-weight: bold;
        }
        .button:hover { background: #db2777; }
        .link-box { 
          background: #f3f4f6; 
          padding: 15px; 
          border-radius: 5px; 
          margin: 20px 0;
          word-break: break-all;
          font-size: 13px;
          color: #6b7280;
        }
        .footer { 
          padding: 20px; 
          text-align: center; 
          background: #f9f9f9; 
          color: #666; 
          font-size: 12px; 
          border-top: 1px solid #e5e7eb;
        }
        .warning { 
          background: #fef3c7; 
          border-left: 4px solid #f59e0b; 
          padding: 12px; 
          margin: 15px 0;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✨ ${STORE_NAME}</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Verification</p>
        </div>
        <div class="content">
          <h2 style="color: #1f2937; margin-top: 0;">Hello ${data.name}! 👋</h2>
          <p style="color: #4b5563; font-size: 16px;">
            Thank you for registering with ${STORE_NAME}! We're excited to have you join our beauty community.
          </p>
          <p style="color: #4b5563; font-size: 16px;">
            Please verify your email address to complete your registration and start shopping for premium cosmetics.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <div class="link-box">${data.verificationUrl}</div>
          <div class="warning">
            <strong>⏰ Important:</strong> This verification link will expire in 24 hours for security reasons.
          </div>
          <p style="color: #9ca3af; font-size: 13px; margin-top: 25px;">
            If you didn't create an account with ${STORE_NAME}, please ignore this email.
          </p>
        </div>
        <div class="footer">
          <p style="margin: 5px 0;">
            <strong>${STORE_NAME}</strong>
          </p>
          <p style="margin: 5px 0;">Premium Cosmetics & Beauty Products</p>
          <p style="margin: 5px 0;">Urdu Bazaar Kasur, Pakistan 🇵🇰</p>
          <p style="margin: 15px 0 5px 0; color: #9ca3af;">
            © ${new Date().getFullYear()} ${STORE_NAME}. All rights reserved.
          </p>
          <p style="margin: 5px 0;">
            <a href="${FRONTEND_URL}" style="color: #ec4899; text-decoration: none;">Visit Our Store</a> | 
            <a href="${FRONTEND_URL}/contact" style="color: #ec4899; text-decoration: none;">Contact Support</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `,

  orderConfirmation: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px; }
        .container { max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { 
          background: linear-gradient(135deg, #7c3aed, #6d28d9); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .header h1 { margin: 0; font-size: 32px; }
        .content { padding: 30px; }
        .order-id {
          background: #f3f4f6;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          color: #7c3aed;
          margin: 20px 0;
        }
        .order-info {
          background: #faf5ff;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .order-info p {
          margin: 8px 0;
          color: #4b5563;
        }
        .button { 
          display: inline-block;
          background: #7c3aed; 
          color: white !important; 
          padding: 14px 35px; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0;
          font-weight: bold;
        }
        .button:hover { background: #6d28d9; }
        .footer { 
          padding: 20px; 
          text-align: center; 
          background: #f9f9f9; 
          color: #666; 
          font-size: 12px; 
          border-top: 1px solid #e5e7eb;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Order Confirmed!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">
            Thank you for your purchase
          </p>
        </div>
        <div class="content">
          <p style="color: #4b5563; font-size: 16px;">
            Hi <strong>${data.name}</strong>,
          </p>
          <p style="color: #4b5563; font-size: 16px;">
            Your order has been received and is being processed. We'll send you another update when your order ships!
          </p>
          
          <div class="order-id">
            Order #${data.orderId}
          </div>

          <div class="order-info">
            <p><strong>📦 Order Total:</strong> Rs. ${data.total.toLocaleString()}</p>
            <p><strong>💳 Payment Method:</strong> ${data.paymentMethod}</p>
            <p><strong>📍 Shipping Address:</strong></p>
            <p style="padding-left: 20px; color: #6b7280;">${data.shippingAddress}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${FRONTEND_URL}/track-order/${data.orderId}" class="button">Track Your Order</a>
          </div>

          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            Questions about your order? <a href="${FRONTEND_URL}/contact" style="color: #7c3aed;">Contact our support team</a>
          </p>
        </div>
        <div class="footer">
          <p style="margin: 5px 0;"><strong>${STORE_NAME}</strong></p>
          <p style="margin: 5px 0;">Premium Cosmetics & Beauty Products</p>
          <p style="margin: 15px 0 5px 0; color: #9ca3af;">
            © ${new Date().getFullYear()} ${STORE_NAME}. All rights reserved.
          </p>
          <p style="margin: 5px 0;">
            <a href="${FRONTEND_URL}/track-order" style="color: #7c3aed; text-decoration: none;">Track Order</a> | 
            <a href="${FRONTEND_URL}/contact" style="color: #7c3aed; text-decoration: none;">Support</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `,
};

// ==================
// SEND SINGLE EMAIL
// ==================
const sendEmail = async (options) => {
  try {
    console.log("📧 Attempting to send email...");
    console.log("To:", options.email);
    console.log("Subject:", options.subject);
    console.log("Template:", options.template);

    const html = templates[options.template]
      ? templates[options.template](options.data)
      : options.message;

    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM || `${STORE_NAME} <noreply@mbeautybloom.shop>`,
      to: options.email,
      subject: options.subject,
      html,
      attachments: options.attachments || [],
    });

    console.log("✅ Email sent successfully!");
    console.log("Email ID:", response.id);
    return response;
  } catch (error) {
    console.error("❌ Email sending failed:");
    console.error("Error:", error.message);
    console.error("Full error:", error);
    throw new Error(`Email could not be sent: ${error.message}`);
  }
};

export default sendEmail;
export { templates };