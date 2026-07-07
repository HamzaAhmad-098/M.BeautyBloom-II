// In routes/testRoutes.js or add to server.js
app.post('/api/test/send-email', async (req, res) => {
  try {
    console.log('🧪 Testing email with configuration:');
    console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Set ✅' : 'Missing ❌');
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'M Beauty Bloom <noreply@mbeautybloom.shop>',
      to: req.body.email || 'your-test-email@gmail.com', // Replace with your email
      subject: '🧪 Test Email from M Beauty Bloom',
      html: `
        <h1>Test Email</h1>
        <p>If you received this, your email configuration is working! ✅</p>
        <p><strong>Sent from:</strong> ${process.env.EMAIL_FROM}</p>
        <p><strong>Domain:</strong> mbeautybloom.shop</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('Email ID:', result.id);

    res.json({
      success: true,
      message: 'Email sent successfully!',
      emailId: result.id,
      from: process.env.EMAIL_FROM,
    });

  } catch (error) {
    console.error('❌ Email test failed:');
    console.error('Error message:', error.message);
    console.error('Full error:', error);

    res.status(500).json({
      success: false,
      error: error.message,
      details: error.toString(),
    });
  }
});