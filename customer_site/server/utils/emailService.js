const nodemailer = require('nodemailer');

// Keep track of order IDs that have already sent email notifications to prevent duplicate emails
const sentOrderEmails = new Set();
const sentCustomerEmails = new Set();

/**
 * Generates rich HTML content for Admin Order Alert
 */
const generateAdminOrderHtml = (order) => {
  const orderId = order.orderId || order._id || 'N/A';
  const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const paymentMethod = order.paymentMethod || 'COD';
  const orderStatus = order.orderStatus || 'Pending';

  const address = order.shippingAddress || {};
  const customerName = address.fullName || address.name || 'Customer';
  const customerPhone = address.phone || address.mobile || 'N/A';
  const customerEmail = address.email || (typeof order.user === 'object' ? order.user?.email : '') || 'N/A';
  const customerStreet = address.street || address.address || '';
  const customerCity = address.city || '';
  const customerPincode = address.pincode || address.zip || '';

  const fullAddress = [customerStreet, customerCity, customerPincode].filter(Boolean).join(', ') || 'Address not specified';

  const items = order.orderItems || [];
  const itemsHtml = items.map((item) => {
    const itemName = item.name || item.title || 'Product Item';
    const qty = item.qty || item.quantity || 1;
    const price = Number(item.price || 0);
    const itemTotal = price * qty;
    const size = item.size ? ` (Size: ${item.size})` : '';
    const imgUrl = item.image || item.imageUrl || '';

    return `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px; text-align: center;">
          ${imgUrl ? `<img src="${imgUrl}" alt="${itemName}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />` : `<div style="width:50px;height:50px;background:#f0f0f0;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#999;font-size:10px;">No Image</div>`}
        </td>
        <td style="padding: 12px; font-weight: 500; color: #333;">
          ${itemName}<span style="color: #666; font-size: 13px;">${size}</span>
        </td>
        <td style="padding: 12px; text-align: center; color: #555;">${qty}</td>
        <td style="padding: 12px; text-align: right; color: #555;">₹${price.toLocaleString('en-IN')}</td>
        <td style="padding: 12px; text-align: right; font-weight: 600; color: #111;">₹${itemTotal.toLocaleString('en-IN')}</td>
      </tr>
    `;
  }).join('');

  const itemsPrice = Number(order.itemsPrice || items.reduce((acc, i) => acc + (Number(i.price || 0) * (i.qty || 1)), 0));
  const shippingPrice = Number(order.shippingPrice || 0);
  const taxPrice = Number(order.taxPrice || 0);
  const totalPrice = Number(order.totalPrice || (itemsPrice + shippingPrice + taxPrice));

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Order Alert - ${orderId}</title>
    </head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f5f7; margin: 0; padding: 20px;">
      <div style="max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #111827 0%, #1f2937 100%); padding: 25px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; color: #d4af37;">SAHA MEN'S STORE</h1>
          <p style="margin: 8px 0 0 0; font-size: 15px; color: #e5e7eb;">🎉 New Order Received!</p>
        </div>

        <!-- Banner Alert -->
        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px 20px; margin: 20px 20px 0 20px; border-radius: 4px;">
          <strong style="color: #065f46; font-size: 15px;">Order ID: ${orderId}</strong>
          <span style="float: right; color: #047857; font-size: 13px;">Placed at: ${createdAt}</span>
        </div>

        <div style="padding: 20px;">
          <!-- Customer Details & Shipping Info -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tr>
              <td style="width: 50%; vertical-align: top; padding-right: 10px;">
                <div style="background: #f9fafb; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb; height: 100%;">
                  <h3 style="margin-top: 0; margin-bottom: 10px; font-size: 14px; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">👤 Customer Info</h3>
                  <p style="margin: 4px 0; color: #1f2937; font-weight: 600;">${customerName}</p>
                  <p style="margin: 4px 0; color: #4b5563; font-size: 13px;">📞 Phone: <strong>${customerPhone}</strong></p>
                  <p style="margin: 4px 0; color: #4b5563; font-size: 13px;">✉️ Email: <strong>${customerEmail}</strong></p>
                </div>
              </td>
              <td style="width: 50%; vertical-align: top; padding-left: 10px;">
                <div style="background: #f9fafb; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb; height: 100%;">
                  <h3 style="margin-top: 0; margin-bottom: 10px; font-size: 14px; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">📍 Delivery Address</h3>
                  <p style="margin: 4px 0; color: #4b5563; font-size: 13px; line-height: 1.4;">${fullAddress}</p>
                </div>
              </td>
            </tr>
          </table>

          <!-- Order Summary Table -->
          <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 15px; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
            🛒 Purchased Items
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <thead>
              <tr style="background-color: #f3f4f6; color: #4b5563; text-align: left;">
                <th style="padding: 10px; text-align: center;">Item</th>
                <th style="padding: 10px;">Product Name</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Pricing Totals -->
          <div style="background: #f9fafb; padding: 15px 20px; border-radius: 6px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
            <table style="width: 100%; font-size: 14px; color: #4b5563;">
              <tr>
                <td style="padding: 4px 0;">Items Subtotal:</td>
                <td style="padding: 4px 0; text-align: right;">₹${itemsPrice.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;">Shipping Fee:</td>
                <td style="padding: 4px 0; text-align: right;">${shippingPrice > 0 ? `₹${shippingPrice.toLocaleString('en-IN')}` : '<span style="color:#10b981;font-weight:600;">FREE</span>'}</td>
              </tr>
              ${taxPrice > 0 ? `
              <tr>
                <td style="padding: 4px 0;">Tax:</td>
                <td style="padding: 4px 0; text-align: right;">₹${taxPrice.toLocaleString('en-IN')}</td>
              </tr>` : ''}
              <tr style="border-top: 1px solid #e5e7eb; font-size: 16px; font-weight: 700; color: #111827;">
                <td style="padding: 10px 0 4px 0;">Total Amount:</td>
                <td style="padding: 10px 0 4px 0; text-align: right; color: #d4af37;">₹${totalPrice.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-size: 13px;">Payment Method:</td>
                <td style="padding: 4px 0; text-align: right; font-size: 13px; font-weight: 600; color: #1f2937;">${paymentMethod}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-size: 13px;">Order Status:</td>
                <td style="padding: 4px 0; text-align: right; font-size: 13px; font-weight: 600; color: #2563eb;">${orderStatus}</td>
              </tr>
            </table>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0;">This email was sent automatically by SAHA Men's Store backend service.</p>
        </div>

      </div>
    </body>
    </html>
  `;
};

/**
 * Generates rich HTML content for Customer Order Confirmation Email
 */
const generateCustomerOrderHtml = (order) => {
  const orderId = order.orderId || order._id || 'N/A';
  const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const paymentMethod = order.paymentMethod || 'COD';

  const address = order.shippingAddress || {};
  const customerName = address.fullName || address.name || 'Valued Customer';
  const customerStreet = address.street || address.address || '';
  const customerCity = address.city || '';
  const customerPincode = address.pincode || address.zip || '';

  const fullAddress = [customerStreet, customerCity, customerPincode].filter(Boolean).join(', ') || 'Address specified during checkout';

  const items = order.orderItems || [];
  const itemsHtml = items.map((item) => {
    const itemName = item.name || item.title || 'Product Item';
    const qty = item.qty || item.quantity || 1;
    const price = Number(item.price || 0);
    const itemTotal = price * qty;
    const size = item.size ? ` (Size: ${item.size})` : '';
    const imgUrl = item.image || item.imageUrl || '';

    return `
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 12px; text-align: center;">
          ${imgUrl ? `<img src="${imgUrl}" alt="${itemName}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;" />` : `<div style="width:50px;height:50px;background:#f3f4f6;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:10px;">Item</div>`}
        </td>
        <td style="padding: 12px; font-weight: 600; color: #1f2937;">
          ${itemName}<span style="color: #6b7280; font-size: 13px; font-weight: normal;">${size}</span>
        </td>
        <td style="padding: 12px; text-align: center; color: #4b5563;">${qty}</td>
        <td style="padding: 12px; text-align: right; font-weight: 600; color: #111827;">₹${itemTotal.toLocaleString('en-IN')}</td>
      </tr>
    `;
  }).join('');

  const itemsPrice = Number(order.itemsPrice || items.reduce((acc, i) => acc + (Number(i.price || 0) * (i.qty || 1)), 0));
  const shippingPrice = Number(order.shippingPrice || 0);
  const taxPrice = Number(order.taxPrice || 0);
  const totalPrice = Number(order.totalPrice || (itemsPrice + shippingPrice + taxPrice));

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - ${orderId}</title>
    </head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #d4af37; letter-spacing: 1.5px;">SAHA MEN'S STORE</h1>
          <p style="margin: 6px 0 0 0; font-size: 14px; color: #cbd5e1; font-weight: 400;">3D Luxury Apparel & Designer Collection</p>
        </div>

        <!-- Hero Status Banner -->
        <div style="background-color: #f0fdf4; border-bottom: 1px solid #bbf7d0; padding: 20px; text-align: center;">
          <div style="font-size: 28px; margin-bottom: 4px;">🎉</div>
          <h2 style="margin: 0; color: #166534; font-size: 18px; font-weight: 700;">Order Placed Successfully!</h2>
          <p style="margin: 6px 0 0 0; color: #15803d; font-size: 13px;">Thank you for shopping with us, <strong>${customerName}</strong>!</p>
        </div>

        <div style="padding: 24px;">

          <!-- Order Summary Card -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px 18px; margin-bottom: 20px;">
            <table style="width: 100%; font-size: 13px; color: #475569;">
              <tr>
                <td style="padding: 4px 0;">Order Reference:</td>
                <td style="padding: 4px 0; text-align: right; font-weight: 700; color: #0f172a; font-family: monospace;">${orderId}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;">Order Date:</td>
                <td style="padding: 4px 0; text-align: right; color: #334155;">${createdAt}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;">Payment Method:</td>
                <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #0f172a;">${paymentMethod}</td>
              </tr>
            </table>
          </div>

          <!-- Items Table -->
          <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 15px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
            🛍️ Items in Your Order
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <thead>
              <tr style="background-color: #f1f5f9; color: #475569; text-align: left;">
                <th style="padding: 10px; text-align: center; width: 60px;">Item</th>
                <th style="padding: 10px;">Product</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Total Calculation -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px 18px; margin-bottom: 24px;">
            <table style="width: 100%; font-size: 14px; color: #475569;">
              <tr>
                <td style="padding: 4px 0;">Subtotal:</td>
                <td style="padding: 4px 0; text-align: right;">₹${itemsPrice.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;">Delivery Charge:</td>
                <td style="padding: 4px 0; text-align: right;">${shippingPrice > 0 ? `₹${shippingPrice.toLocaleString('en-IN')}` : '<span style="color:#16a34a;font-weight:700;">FREE</span>'}</td>
              </tr>
              <tr style="border-top: 1px solid #e2e8f0; font-size: 16px; font-weight: 800; color: #0f172a;">
                <td style="padding: 12px 0 4px 0;">Total Amount Paid:</td>
                <td style="padding: 12px 0 4px 0; text-align: right; color: #b45309;">₹${totalPrice.toLocaleString('en-IN')}</td>
              </tr>
            </table>
          </div>

          <!-- Shipping Address -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px 18px; margin-bottom: 24px;">
            <h4 style="margin-top: 0; margin-bottom: 6px; font-size: 13px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">📍 Shipping To:</h4>
            <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.5;">
              <strong>${customerName}</strong><br/>
              ${fullAddress}
            </p>
          </div>

          <!-- Track Order CTA Button -->
          <div style="text-align: center; margin: 25px 0 10px 0;">
            <a href="${process.env.CLIENT_URL || 'https://customersite-psi.vercel.app'}/my-orders" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: #d4af37; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
              📦 Track Your Order Status
            </a>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 18px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0 0 4px 0; font-weight: 600; color: #334155;">SAHA MEN'S STORE</p>
          <p style="margin: 0;">If you have any questions, reply to this email or contact support.</p>
        </div>

      </div>
    </body>
    </html>
  `;
};

/**
 * Helper to create Nodemailer Transporter tailored for Gmail or custom SMTP
 */
const createTransporter = (emailUser, emailPass, emailHost, emailPort) => {
  const cleanPass = (emailPass || '').replace(/\s+/g, '');
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: cleanPass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Diagnostic helper to verify SMTP credentials
 */
const testEmailConnection = async () => {
  const user = process.env.EMAIL_USER || 'myakalanagarjun09@gmail.com';
  const pass = (process.env.EMAIL_PASS || 'lgmlszhtstffduqg').replace(/\s+/g, '');
  try {
    const transporter = createTransporter(user, pass);
    await transporter.verify();
    return { success: true, user, message: 'SMTP connection verified successfully' };
  } catch (error) {
    return { success: false, user, error: error.message, code: error.code };
  }
};

/**
 * Diagnostic helper to send a test email
 */
const sendTestDiagnosticEmail = async (targetEmail) => {
  const user = process.env.EMAIL_USER || 'myakalanagarjun09@gmail.com';
  const pass = (process.env.EMAIL_PASS || 'lgmlszhtstffduqg').replace(/\s+/g, '');
  const to = targetEmail || user;
  try {
    const transporter = createTransporter(user, pass);
    const info = await transporter.sendMail({
      from: `"SAHA Men's Store" <${user}>`,
      to,
      subject: `🧪 Test Email from SAHA Men's Store - ${new Date().toLocaleTimeString('en-IN')}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; background: #0f172a; color: #ffffff; border-radius: 10px; max-width: 500px;">
          <h2 style="color: #d4af37; margin-top: 0;">SAHA MEN'S STORE - Email Test</h2>
          <p>This is a diagnostic test email verifying that your Gmail App Password configuration is working properly.</p>
          <hr style="border: none; border-top: 1px solid #334155; margin: 15px 0;" />
          <p><strong>Configured Sender:</strong> ${user}</p>
          <p><strong>Recipient:</strong> ${to}</p>
          <p><strong>Sent At:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
          <p style="color: #10b981; font-weight: bold; margin-top: 15px;">✅ Status: All systems operational!</p>
        </div>
      `
    });
    return { success: true, messageId: info.messageId, to };
  } catch (error) {
    return { success: false, error: error.message, code: error.code };
  }
};

/**
 * Sends order notification email to the store owner / admin AND order confirmation email to the customer
 */
const sendOrderNotificationEmail = async (order) => {
  if (!order) return;

  const orderKey = String(order._id || order.orderId || '');
  const recipientEmail = process.env.NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || 'myakalanagarjun09@gmail.com';
  const emailUser = process.env.EMAIL_USER || 'myakalanagarjun09@gmail.com';
  const defaultPass = 'lgmlszhtstffduqg';
  const rawPass = process.env.EMAIL_PASS || defaultPass;
  const emailPass = rawPass ? rawPass.replace(/\s+/g, '') : defaultPass;
  const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const emailPort = Number(process.env.EMAIL_PORT || 587);
  const orderId = order.orderId || order._id || 'N/A';

  const isConfigured = emailPass && emailPass !== 'your_gmail_app_password' && emailPass !== 'nagarjun yadav';

  console.log(`[Email Service] 📨 Initiating emails for Order ${orderId}...`);

  // 1. Send Admin Alert Email
  if (orderKey && !sentOrderEmails.has(orderKey)) {
    if (!isConfigured) {
      console.log('\n======================================================');
      console.log(`[ORDER EMAIL NOTIFICATION - ACTION REQUIRED]`);
      console.log(`Notification Target Email: ${recipientEmail}`);
      console.log(`New Order ID: ${orderId}`);
      console.log(`Customer: ${order.shippingAddress?.fullName || 'Customer'}`);
      console.log(`Total: ₹${order.totalPrice || 0} (${order.paymentMethod || 'COD'})`);
      console.log(`\n⚠️  Gmail requires a 16-character Google App Password.`);
      console.log('======================================================\n');
    } else {
      try {
        const transporter = createTransporter(emailUser, emailPass, emailHost, emailPort);
        const mailOptions = {
          from: `"SAHA Men's Store Orders" <${emailUser}>`,
          to: recipientEmail,
          subject: `🚨 NEW ORDER RECEIVED: ${orderId} - ₹${order.totalPrice || 0}`,
          html: generateAdminOrderHtml(order)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email Service] ✅ Admin order alert sent to ${recipientEmail}. Message ID: ${info.messageId}`);
        sentOrderEmails.add(orderKey);
      } catch (error) {
        console.error(`[Email Service Error] ❌ Failed to send admin alert for Order ${orderId}:`, error.message);
        if (error.code === 'EAUTH' || error.message.includes('Invalid login') || error.message.includes('534-5.7.9')) {
          console.error(`--> GMAIL AUTH ERROR: Google rejected the login attempt.`);
        }
      }
    }
  }

  // 2. Send Customer Confirmation Email
  const customerEmail = order.shippingAddress?.email || order.userEmail || order.email || (typeof order.user === 'object' ? order.user?.email : null) || recipientEmail;
  if (customerEmail && typeof customerEmail === 'string' && customerEmail.includes('@')) {
    const customerKey = `${orderKey}_cust_${customerEmail}`;
    if (!sentCustomerEmails.has(customerKey)) {
      if (isConfigured) {
        try {
          const transporter = createTransporter(emailUser, emailPass, emailHost, emailPort);
          const mailOptions = {
            from: `"SAHA Men's Store" <${emailUser}>`,
            to: customerEmail,
            subject: `🎉 Order Placed Successfully! Order #${orderId}`,
            html: generateCustomerOrderHtml(order)
          };

          const info = await transporter.sendMail(mailOptions);
          console.log(`[Email Service] ✅ Customer confirmation email sent to ${customerEmail}. Message ID: ${info.messageId}`);
          sentCustomerEmails.add(customerKey);
        } catch (error) {
          console.error(`[Email Service Error] ❌ Failed to send customer confirmation to ${customerEmail}:`, error.message);
        }
      } else {
        console.log(`[Email Service] Customer confirmation email queued for ${customerEmail} (Awaiting valid EMAIL_PASS)`);
      }
    }
  }
};

module.exports = {
  sendOrderNotificationEmail,
  testEmailConnection,
  sendTestDiagnosticEmail
};


