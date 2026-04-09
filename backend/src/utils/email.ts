import nodemailer from 'nodemailer';

// Create reusable Gmail transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_APP_PASSWORD?.replace(/\s/g, ''), // Ensure no spaces
  },
  tls: {
    rejectUnauthorized: false // Helps in some local development environments
  }
});

// Verify transporter on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email service failed to connect:', error.message);
    console.error('Check your SMTP_EMAIL and SMTP_APP_PASSWORD in .env');
  } else {
    console.log('✅ Email service connected and ready (Gmail SMTP)');
  }
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
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      @media only screen and (max-width: 600px) {
        .container { width: 100% !important; border-radius: 0 !important; }
        .content { padding: 20px !important; }
      }
    </style>
    <title>VISION Notification</title>
  </head>
  <body style="margin:0; padding:0; background-color:${BG_COLOR}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:${BG_COLOR};">
      <tr>
        <td align="center" style="padding: 10px;">
          <div class="container" style="max-width:600px; width: 100%; margin:0 auto; text-align: left;">
            <!-- Header -->
            <div style="text-align:center; padding: 40px 0 30px 0;">
              <h1 style="font-size:28px; font-weight:900; letter-spacing:0.25em; color:#ffffff; margin:0; text-transform: uppercase; font-style: italic;">VISION</h1>
              <p style="font-size:9px; letter-spacing:0.4em; color:${BRAND_COLOR}; text-transform:uppercase; font-weight:700; margin:6px 0 0 0;">Beyond the Visible</p>
            </div>

            <!-- Content Card -->
            <div class="content" style="background-color: #0f172a; border: 1px solid rgba(255,255,255,0.08); border-radius:32px; padding:40px; margin-bottom:20px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
              <h2 style="color:#fff; font-size:20px; font-weight:700; margin:0 0 15px 0;">${title}</h2>
              <div style="color:${TEXT_COLOR}; font-size:14px; line-height:1.6;">
                ${content}
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align:center; padding:15px 0;">
              <p style="color:${MUTED_COLOR}; font-size:11px; margin:0;">© ${new Date().getFullYear()} VISION — Beyond the Visible. All rights reserved.</p>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
}

// ─── Specific Email Senders ─────────────────────────────────────────

function generateItemListHtml(items: any[], currencySymbol: string): string {
  return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top:20px; border-top:1px solid rgba(255,255,255,0.05);">
      ${items.map(item => `
        <tr>
          <td style="padding:15px 0; border-bottom:1px solid rgba(255,255,255,0.05);">
            <p style="margin:0; color:#fff; font-size:13px; font-weight:700;">${item.name || 'Product Acquisition'}</p>
            <p style="margin:4px 0 0 0; color:${MUTED_COLOR}; font-size:10px; text-transform:uppercase; letter-spacing:0.05em;">Quantity: ${item.quantity}</p>
          </td>
          <td style="padding:15px 0; border-bottom:1px solid rgba(255,255,255,0.05); text-align:right; color:#fff; font-size:13px; font-weight:700;">
            ${currencySymbol}${Number(item.price).toFixed(2)}
          </td>
        </tr>
      `).join('')}
    </table>
  `;
}

export async function sendOrderConfirmationEmail(
  to: string,
  customerName: string,
  orderId: string,
  totalAmount: number,
  items: any[],
  paymentMethod: string,
  taxAmount: number = 0,
  shippingAmount: number = 0,
  currencySymbol: string = 'Rs.'
): Promise<void> {
  const content = `
    <p style="margin:0 0 20px 0;">
      Dear <strong>${customerName}</strong>,<br/>
      Thank you for your order. Your acquisition has been recorded successfully.
    </p>
    <div style="background:rgba(99,102,241,0.05); border:1px solid rgba(99,102,241,0.2); border-radius:12px; padding:20px; margin-bottom:20px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding:5px 0; color:${MUTED_COLOR}; font-size:10px; text-transform:uppercase; letter-spacing:0.1em;">Order ID</td>
          <td style="padding:5px 0; color:#fff; font-size:13px; text-align:right; font-weight:700;">#${orderId.slice(0, 8)}</td>
        </tr>
        <tr>
          <td style="padding:5px 0; color:${MUTED_COLOR}; font-size:10px; text-transform:uppercase; letter-spacing:0.1em;">Payment</td>
          <td style="padding:5px 0; color:#fff; font-size:13px; text-align:right; font-weight:700;">${paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : 'Cash on Delivery'}</td>
        </tr>
      </table>
      
      ${generateItemListHtml(items, currencySymbol)}

      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top:10px;">
        <tr>
          <td style="padding:4px 0; color:${MUTED_COLOR}; font-size:10px; text-transform:uppercase; letter-spacing:0.1em;">Order Tax</td>
          <td style="padding:4px 0; color:#fff; font-size:12px; text-align:right;">${currencySymbol}${Number(taxAmount).toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding:4px 0; color:${MUTED_COLOR}; font-size:10px; text-transform:uppercase; letter-spacing:0.1em;">Shipping</td>
          <td style="padding:4px 0; color:#fff; font-size:12px; text-align:right;">${currencySymbol}${Number(shippingAmount).toFixed(2)}</td>
        </tr>
      </table>

      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top:15px; border-top:2px solid ${BRAND_COLOR}; padding-top:15px;">
        <tr>
          <td style="color:${MUTED_COLOR}; font-size:10px; text-transform:uppercase; letter-spacing:0.1em; font-weight:700;">Total Amount</td>
          <td style="color:${BRAND_COLOR}; font-size:18px; text-align:right; font-weight:900;">${currencySymbol}${Number(totalAmount).toFixed(2)}</td>
        </tr>
      </table>
    </div>
    ${paymentMethod === 'BANK_TRANSFER' ? `
    <p style="color:${MUTED_COLOR}; font-size:12px; line-height:1.5; margin:0;">
      🔄 Your payment screenshot is awaiting admin verification. You will receive another update once confirmed.
    </p>` : `
    <p style="color:${MUTED_COLOR}; font-size:12px; line-height:1.5; margin:0;">
      📦 Your order is being prepared and will be shipped soon!
    </p>`}
  `;

  try {
    console.log(`📧 Attempting to send order confirmation to: ${to}...`);
    await transporter.sendMail({
      from: `"VISION Store" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: `VISION — Order Confirmation #${orderId.slice(0, 8)}`,
      html: baseTemplate('Order Confirmed ✨', content),
    });
    console.log(`✅ Order confirmation email sent to ${to}`);
  } catch (error: any) {
    console.error('❌ Failed to send order confirmation email:', error.message);
  }
}

export async function sendPaymentStatusEmail(
  to: string,
  customerName: string,
  orderId: string,
  status: 'VERIFIED' | 'FAILED' | 'APPROVED',
  totalAmount: number,
  taxAmount: number = 0,
  shippingAmount: number = 0,
  currencySymbol: string = 'Rs.'
): Promise<void> {
  const isApproved = status === 'APPROVED' || status === 'VERIFIED';
  const statusColor = isApproved ? '#22c55e' : '#ef4444';
  const statusText = status === 'APPROVED' ? 'Order Approved ✅' : (status === 'VERIFIED' ? 'Payment Verified ✅' : 'Payment Rejected ❌');
  
  let statusMessage = '';
  if (status === 'APPROVED') {
    statusMessage = 'Your order has been approved and is now being prepared for delivery. Our logistics team is handling your package with care.';
  } else if (status === 'VERIFIED') {
    statusMessage = 'Your bank transfer has been verified successfully. Your order is now being prepared for delivery and will be shipped shortly!';
  } else {
    statusMessage = 'Unfortunately, your payment verification could not be completed. Please contact our support team for assistance.';
  }

  const content = `
    <p style="margin:0 0 20px 0;">
      Dear <strong>${customerName}</strong>,
    </p>
    <div style="text-align:center; padding:20px; background-color:rgba(${isApproved ? '34,197,94' : '239,68,68'},0.1); border:1px solid rgba(${isApproved ? '34,197,94' : '239,68,68'},0.2); border-radius:12px; margin-bottom:20px;">
      <p style="font-size:18px; font-weight:900; color:${statusColor}; margin:0 0 5px 0;">${statusText}</p>
      <p style="font-size:11px; color:${MUTED_COLOR}; margin:0;">Order #${orderId.slice(0, 8)}</p>
      <div style="margin-top:10px; border-top:1px solid rgba(255,255,255,0.05); padding-top:10px;">
        <p style="font-size:10px; color:${MUTED_COLOR}; margin:0;">Tax: ${currencySymbol}${Number(taxAmount || 0).toFixed(2)} | Shipping: ${currencySymbol}${Number(shippingAmount || 0).toFixed(2)}</p>
        <p style="font-size:16px; font-weight:900; color:#fff; margin:5px 0 0 0;">Total: ${currencySymbol}${Number(totalAmount).toFixed(2)}</p>
      </div>
    </div>
    <p style="color:${MUTED_COLOR}; font-size:13px; line-height:1.6; margin:0;">
      ${statusMessage}
    </p>
    ${isApproved ? `
    <div style="margin-top:20px; padding:15px; border:1px dashed ${BRAND_COLOR}; border-radius:10px; text-align:center;">
      <p style="color:${BRAND_COLOR}; font-size:12px; font-weight:bold; margin:0; text-transform:uppercase;">📦 Status: Ready for Delivery</p>
    </div>` : ''}
  `;

  try {
    console.log(`📧 Attempting to send payment status update to: ${to}...`);
    await transporter.sendMail({
      from: `"VISION Store" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: `VISION — ${isApproved ? 'Order Update' : 'Payment Status'} for Order #${orderId.slice(0, 8)}`,
      html: baseTemplate(statusText, content),
    });
    console.log(`✅ Payment status email sent to ${to} (${status})`);
  } catch (error: any) {
    console.error('❌ Failed to send payment status email:', error.message);
  }
}

export async function sendAdminOrderNotificationEmail(
  orderId: string,
  totalAmount: number,
  customerName: string,
  customerEmail: string,
  paymentMethod: string,
  items: any[],
  taxAmount: number = 0,
  shippingAmount: number = 0,
  currencySymbol: string = 'Rs.'
): Promise<void> {
  const content = `
    <p style="margin:0 0 20px 0;">
      A new order has been placed on <strong>VISION</strong>.
    </p>
    <div style="background-color:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:20px; margin-bottom:20px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding:5px 0; color:${MUTED_COLOR}; font-size:10px; text-transform:uppercase; letter-spacing:0.1em;">Order ID</td>
          <td style="padding:5px 0; color:#fff; font-size:13px; text-align:right; font-weight:700;">#${orderId.slice(0, 8)}</td>
        </tr>
        <tr>
          <td style="padding:5px 0; color:${MUTED_COLOR}; font-size:10px; text-transform:uppercase; letter-spacing:0.1em;">Customer</td>
          <td style="padding:5px 0; color:#fff; font-size:13px; text-align:right; font-weight:700;">${customerName} (${customerEmail})</td>
        </tr>
        <tr>
          <td style="padding:5px 0; color:${MUTED_COLOR}; font-size:10px; text-transform:uppercase; letter-spacing:0.1em;">Payment</td>
          <td style="padding:5px 0; color:#fff; font-size:13px; text-align:right; font-weight:700;">${paymentMethod}</td>
        </tr>
      </table>

      ${generateItemListHtml(items, currencySymbol)}

      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top:10px;">
        <tr>
          <td style="padding:4px 0; color:${MUTED_COLOR}; font-size:10px; text-transform:uppercase; letter-spacing:0.1em;">Total Tax</td>
          <td style="padding:4px 0; color:#fff; font-size:12px; text-align:right;">${currencySymbol}${Number(taxAmount).toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding:4px 0; color:${MUTED_COLOR}; font-size:10px; text-transform:uppercase; letter-spacing:0.1em;">Shipping Amount</td>
          <td style="padding:4px 0; color:#fff; font-size:12px; text-align:right;">${currencySymbol}${Number(shippingAmount).toFixed(2)}</td>
        </tr>
      </table>

      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top:15px; border-top:2px solid ${BRAND_COLOR}; padding-top:15px;">
        <tr>
          <td style="color:${MUTED_COLOR}; font-size:10px; text-transform:uppercase; letter-spacing:0.1em; font-weight:700;">Total Amount</td>
          <td style="color:${BRAND_COLOR}; font-size:18px; text-align:right; font-weight:900;">${currencySymbol}${Number(totalAmount).toFixed(2)}</td>
        </tr>
      </table>
    </div>
    <div style="text-align:center;">
      <a href="http://localhost:3000/admin/orders" style="display:inline-block; padding:12px 20px; background-color:${BRAND_COLOR}; color:#fff; text-decoration:none; border-radius:10px; font-weight:bold; font-size:12px;">VIEW ORDER IN DASHBOARD</a>
    </div>
  `;

  try {
    console.log(`📧 Attempting to send admin notification for order ${orderId}...`);
    await transporter.sendMail({
      from: `"VISION System" <${process.env.SMTP_EMAIL}>`,
      to: process.env.SMTP_EMAIL, // Send to the store owner
      subject: `🚨 NEW ORDER: #${orderId.slice(0, 8)} - ${currencySymbol}${Number(totalAmount).toFixed(2)}`,
      html: baseTemplate('New Order Received 📦', content),
    });
    console.log(`✅ Admin notification sent for order ${orderId}`);
  } catch (error: any) {
    console.error('❌ Failed to send admin notification email:', error.message);
  }
}

export async function sendTestEmail(to: string): Promise<boolean> {
  try {
    console.log(`📧 Attempting to send test email to: ${to}...`);
    await transporter.sendMail({
      from: `"VISION System" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: 'VISION — SMTP Connection Test',
      text: 'SUCCESS: Your SMTP configuration is working correctly.',
      html: baseTemplate('Verification Success ✅', '<p>Congratulations! Your SMTP configuration is correctly authenticated and ready to send notifications.</p>')
    });
    console.log(`✅ Test email sent to ${to}`);
    return true;
  } catch (error: any) {
    console.error('❌ SMTP Test Failed:', error.message);
    return false;
  }
}
