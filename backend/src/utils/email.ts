import nodemailer from 'nodemailer';

// Create reusable Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_APP_PASSWORD,
  },
});

// Verify transporter on startup (non-blocking)
transporter.verify().then(() => {
  console.log('✅ Email service connected (Gmail SMTP)');
}).catch((err) => {
  console.warn('⚠️ Email service not available:', err.message);
});

// ─── Email Templates ────────────────────────────────────────────────

const BRAND_COLOR = '#6366f1';
const BG_COLOR = '#020617';
const TEXT_COLOR = '#f8fafc';
const MUTED_COLOR = '#94a3b8';

function baseTemplate(title: string, content: string): string {
  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="margin:0; padding:0; background-color:${BG_COLOR}; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="max-width:600px; margin:0 auto; padding:40px 20px;">
      <!-- Header -->
      <div style="text-align:center; margin-bottom:40px;">
        <h1 style="font-size:28px; font-weight:900; letter-spacing:0.2em; color:#ffffff; margin:0;">VISION</h1>
        <p style="font-size:9px; letter-spacing:0.3em; color:${BRAND_COLOR}; text-transform:uppercase; font-weight:700; margin:4px 0 0 0;">Beyond the Visible</p>
      </div>

      <!-- Content Card -->
      <div style="background: rgba(15,23,42,0.9); border: 1px solid rgba(255,255,255,0.1); border-radius:24px; padding:40px; margin-bottom:30px;">
        <h2 style="color:#fff; font-size:22px; font-weight:700; margin:0 0 20px 0;">${title}</h2>
        ${content}
      </div>

      <!-- Footer -->
      <div style="text-align:center; padding:20px 0;">
        <p style="color:${MUTED_COLOR}; font-size:12px; margin:0;">© ${new Date().getFullYear()} VISION — Beyond the Visible. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>`;
}

// ─── Specific Email Senders ─────────────────────────────────────────

export async function sendOrderConfirmationEmail(
  to: string,
  customerName: string,
  orderId: string,
  totalAmount: number,
  itemCount: number,
  paymentMethod: string
): Promise<void> {
  const content = `
    <p style="color:${TEXT_COLOR}; font-size:15px; line-height:1.6; margin:0 0 24px 0;">
      Dear <strong>${customerName}</strong>,<br/>
      Thank you for your order. Your acquisition has been recorded successfully.
    </p>
    <div style="background:rgba(99,102,241,0.1); border:1px solid rgba(99,102,241,0.2); border-radius:16px; padding:20px; margin-bottom:24px;">
      <table style="width:100%; border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0; color:${MUTED_COLOR}; font-size:11px; text-transform:uppercase; letter-spacing:0.1em;">Order ID</td>
          <td style="padding:8px 0; color:#fff; font-size:14px; text-align:right; font-weight:700;">${orderId.slice(0, 8)}...</td>
        </tr>
        <tr>
          <td style="padding:8px 0; color:${MUTED_COLOR}; font-size:11px; text-transform:uppercase; letter-spacing:0.1em;">Items</td>
          <td style="padding:8px 0; color:#fff; font-size:14px; text-align:right; font-weight:700;">${itemCount} piece(s)</td>
        </tr>
        <tr>
          <td style="padding:8px 0; color:${MUTED_COLOR}; font-size:11px; text-transform:uppercase; letter-spacing:0.1em;">Total</td>
          <td style="padding:8px 0; color:${BRAND_COLOR}; font-size:18px; text-align:right; font-weight:900;">$${totalAmount.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0; color:${MUTED_COLOR}; font-size:11px; text-transform:uppercase; letter-spacing:0.1em;">Payment</td>
          <td style="padding:8px 0; color:#fff; font-size:14px; text-align:right; font-weight:700;">${paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer (Under Review)' : 'Cash on Delivery'}</td>
        </tr>
      </table>
    </div>
    ${paymentMethod === 'BANK_TRANSFER' ? `
    <p style="color:${MUTED_COLOR}; font-size:13px; line-height:1.6; margin:0;">
      🔄 Your payment screenshot has been received and is awaiting admin verification. You will receive another email once your payment has been reviewed.
    </p>` : `
    <p style="color:${MUTED_COLOR}; font-size:13px; line-height:1.6; margin:0;">
      📦 Your order is being prepared and will be shipped soon!
    </p>`}
  `;

  try {
    await transporter.sendMail({
      from: `"VISION Store" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: `VISION — Order Confirmation #${orderId.slice(0, 8)}`,
      html: baseTemplate('Order Confirmed ✨', content),
    });
    console.log(`📧 Order confirmation email sent to ${to}`);
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
  }
}

export async function sendPaymentStatusEmail(
  to: string,
  customerName: string,
  orderId: string,
  status: 'VERIFIED' | 'FAILED',
  totalAmount: number
): Promise<void> {
  const isVerified = status === 'VERIFIED';
  const statusColor = isVerified ? '#22c55e' : '#ef4444';
  const statusText = isVerified ? 'Payment Verified ✅' : 'Payment Rejected ❌';
  const statusMessage = isVerified
    ? 'Your bank transfer has been verified successfully. Your order is now being processed and will be shipped soon!'
    : 'Unfortunately, your bank transfer could not be verified. Please contact our support team for assistance or place a new order.';

  const content = `
    <p style="color:${TEXT_COLOR}; font-size:15px; line-height:1.6; margin:0 0 24px 0;">
      Dear <strong>${customerName}</strong>,
    </p>
    <div style="text-align:center; padding:24px; background:rgba(${isVerified ? '34,197,94' : '239,68,68'},0.1); border:1px solid rgba(${isVerified ? '34,197,94' : '239,68,68'},0.2); border-radius:16px; margin-bottom:24px;">
      <p style="font-size:20px; font-weight:900; color:${statusColor}; margin:0 0 8px 0;">${statusText}</p>
      <p style="font-size:12px; color:${MUTED_COLOR}; margin:0;">Order #${orderId.slice(0, 8)} — $${totalAmount.toFixed(2)}</p>
    </div>
    <p style="color:${MUTED_COLOR}; font-size:14px; line-height:1.6; margin:0;">
      ${statusMessage}
    </p>
  `;

  try {
    await transporter.sendMail({
      from: `"VISION Store" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: `VISION — Payment ${isVerified ? 'Verified' : 'Update'} for Order #${orderId.slice(0, 8)}`,
      html: baseTemplate(statusText, content),
    });
    console.log(`📧 Payment status email sent to ${to} (${status})`);
  } catch (error) {
    console.error('Failed to send payment status email:', error);
  }
}

export async function sendAdminOrderNotificationEmail(
  orderId: string,
  totalAmount: number,
  customerName: string,
  customerEmail: string,
  paymentMethod: string
): Promise<void> {
  const content = `
    <p style="color:${TEXT_COLOR}; font-size:15px; line-height:1.6; margin:0 0 24px 0;">
      A new order has been placed on <strong>VISION</strong>.
    </p>
    <div style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:16px; padding:20px; margin-bottom:24px;">
      <table style="width:100%; border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0; color:${MUTED_COLOR}; font-size:11px; text-transform:uppercase; letter-spacing:0.1em;">Order ID</td>
          <td style="padding:8px 0; color:#fff; font-size:14px; text-align:right; font-weight:700;">#${orderId.slice(0, 8)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0; color:${MUTED_COLOR}; font-size:11px; text-transform:uppercase; letter-spacing:0.1em;">Customer</td>
          <td style="padding:8px 0; color:#fff; font-size:14px; text-align:right; font-weight:700;">${customerName}</td>
        </tr>
        <tr>
          <td style="padding:8px 0; color:${MUTED_COLOR}; font-size:11px; text-transform:uppercase; letter-spacing:0.1em;">Email</td>
          <td style="padding:8px 0; color:#fff; font-size:14px; text-align:right; font-weight:700;">${customerEmail}</td>
        </tr>
        <tr>
          <td style="padding:8px 0; color:${MUTED_COLOR}; font-size:11px; text-transform:uppercase; letter-spacing:0.1em;">Amount</td>
          <td style="padding:8px 0; color:${BRAND_COLOR}; font-size:18px; text-align:right; font-weight:900;">$${totalAmount.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0; color:${MUTED_COLOR}; font-size:11px; text-transform:uppercase; letter-spacing:0.1em;">Payment</td>
          <td style="padding:8px 0; color:#fff; font-size:14px; text-align:right; font-weight:700;">${paymentMethod}</td>
        </tr>
      </table>
    </div>
    <div style="text-align:center;">
      <a href="https://vision-vsn.vercel.app/admin/orders" style="display:inline-block; padding:12px 24px; background:${BRAND_COLOR}; color:#fff; text-decoration:none; border-radius:12px; font-weight:bold; font-size:14px;">VIEW ORDER IN DASHBOARD</a>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"VISION System" <${process.env.SMTP_EMAIL}>`,
      to: process.env.SMTP_EMAIL, // Send to the store owner
      subject: `🚨 NEW ORDER: #${orderId.slice(0, 8)} - $${totalAmount.toFixed(2)}`,
      html: baseTemplate('New Order Received 📦', content),
    });
    console.log(`📧 Admin notification sent for order ${orderId}`);
  } catch (error) {
    console.error('Failed to send admin notification email:', error);
  }
}
