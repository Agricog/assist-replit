// Simple email service using Resend (much easier than SendGrid)
// For now, we'll just log the email content until you get a simple email service

interface WelcomeEmailParams {
  to: string;
  firstName: string;
  farmName: string;
  location: string;
}

export async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<boolean>;
export async function sendWelcomeEmail(to: string, firstName: string, tempPassword?: string): Promise<boolean>;
export async function sendWelcomeEmail(paramsOrTo: WelcomeEmailParams | string, firstName?: string, tempPassword?: string): Promise<boolean> {
  // Handle both parameter patterns
  if (typeof paramsOrTo === 'string') {
    // Password reset email
    const to = paramsOrTo;
    const name = firstName || 'User';
    
    if (tempPassword) {
      return sendPasswordResetEmail(to, name, tempPassword);
    } else {
      throw new Error('Temporary password required for password reset');
    }
  }
  
  // Original welcome email
  const params = paramsOrTo as WelcomeEmailParams;
  try {
    const { to, firstName, farmName, location } = params;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Agricog Assist</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); padding: 40px 30px; text-align: center; }
        .logo { color: white; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .tagline { color: rgba(255,255,255,0.9); font-size: 16px; }
        .content { padding: 40px 30px; }
        .welcome-text { font-size: 24px; color: #1f2937; margin-bottom: 20px; }
        .farm-info { background: #f8fafc; border-left: 4px solid #16a34a; padding: 20px; margin: 25px 0; border-radius: 4px; }
        .feature-list { margin: 30px 0; }
        .feature { display: flex; align-items: flex-start; margin-bottom: 15px; }
        .feature-icon { color: #16a34a; margin-right: 12px; margin-top: 2px; }
        .cta { background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 25px 0; font-weight: 600; }
        .footer { padding: 30px; text-align: center; background: #f8fafc; color: #6b7280; font-size: 14px; }
        .divider { height: 1px; background: #e5e7eb; margin: 30px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🌱 Agricog Assist</div>
            <div class="tagline">Your Smart Farm Assistant</div>
        </div>
        
        <div class="content">
            <h1 class="welcome-text">Welcome to Agricog Assist, ${firstName}! 🚜</h1>
            
            <p>Thank you for joining our community of forward-thinking farmers. Your ${farmName} in ${location} is now connected to the power of AI-driven agricultural intelligence.</p>
            
            <div class="farm-info">
                <strong>Your Farm Profile:</strong><br>
                <strong>Farm:</strong> ${farmName}<br>
                <strong>Location:</strong> ${location}<br>
                <strong>Manager:</strong> ${firstName}
            </div>
            
            <p>You now have access to our comprehensive agricultural platform with these powerful features:</p>
            
            <div class="feature-list">
                <div class="feature">
                    <span class="feature-icon">📈</span>
                    <div><strong>Market Intelligence AI:</strong> Get real-time commodity prices, market trends, and trading insights to maximize your profits.</div>
                </div>
                <div class="feature">
                    <span class="feature-icon">🤖</span>
                    <div><strong>Farm Assistant AI:</strong> Receive expert farming advice, crop guidance, and instant problem-solving support.</div>
                </div>
                <div class="feature">
                    <span class="feature-icon">🌤️</span>
                    <div><strong>5-Day Weather Forecasts:</strong> Plan your farming activities with detailed hourly weather data for ${location}.</div>
                </div>
                <div class="feature">
                    <span class="feature-icon">🚜</span>
                    <div><strong>Farm Data Management:</strong> Track your fields, crops, and machinery with full management capabilities.</div>
                </div>
                <div class="feature">
                    <span class="feature-icon">🔧</span>
                    <div><strong>Machinery Service Tracking:</strong> Stay on top of equipment maintenance and service schedules.</div>
                </div>
            </div>
            
            <a href="https://agricogassist.com" class="cta">Access Your Dashboard →</a>
            
            <div class="divider"></div>
            
            <p><strong>Quick Start Tips:</strong></p>
            <ul>
                <li>Check your personalized weather forecast for ${location}</li>
                <li>Ask the Market Intelligence AI about current crop prices</li>
                <li>Add your field information to track performance</li>
                <li>Get farming advice from the AI assistant</li>
            </ul>
            
            <p>If you have any questions or need help getting started, simply ask either of your AI assistants - they're available 24/7 to help ${farmName} succeed.</p>
            
            <p>Welcome to the future of farming!</p>
            
            <p>Best regards,<br>
            <strong>The Agricog Assist Team</strong></p>
        </div>
        
        <div class="footer">
            <p>This email was sent to ${to} because you signed up for Agricog Assist.</p>
            <p>© 2025 Agricog Assist - Your Smart Farm Assistant</p>
        </div>
    </div>
</body>
</html>
    `.trim();

    const emailText = `
Welcome to Agricog Assist, ${firstName}!

Thank you for joining our community of forward-thinking farmers. Your ${farmName} in ${location} is now connected to the power of AI-driven agricultural intelligence.

Your Farm Profile:
- Farm: ${farmName}
- Location: ${location}
- Manager: ${firstName}

You now have access to:
• Market Intelligence AI - Real-time commodity prices and market trends
• Farm Assistant AI - Expert farming advice and problem-solving
• 5-Day Weather Forecasts - Detailed weather data for ${location}
• Farm Data Management - Track fields, crops, and machinery
• Machinery Service Tracking - Equipment maintenance schedules

Access your dashboard at: https://agricogassist.com

Quick Start Tips:
- Check your personalized weather forecast for ${location}
- Ask the Market Intelligence AI about current crop prices
- Add your field information to track performance
- Get farming advice from the AI assistant

Welcome to the future of farming!

Best regards,
The Agricog Assist Team
    `.trim();

    // For now, log the email content (replace with simple email service later)
    console.log('\n=== WELCOME EMAIL ===');
    console.log(`To: ${to}`);
    console.log(`Subject: Welcome to Agricog Assist, ${firstName}! 🌱`);
    console.log('\nEmail Content:');
    console.log(emailText);
    console.log('\n=== END EMAIL ===\n');

    // Simulate successful send for now
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// Password reset email function
async function sendPasswordResetEmail(to: string, firstName: string, tempPassword: string): Promise<boolean> {
  try {
    const emailText = `
Hi ${firstName},

You requested a password reset for your Agricog Assist account.

Your temporary password is: ${tempPassword}

Please use this temporary password to log in, then update your password immediately for security.

Login at: https://agricogassist.com/signup

For security reasons, this temporary password will expire in 24 hours.

If you didn't request this password reset, please contact us immediately.

Best regards,
The Agricog Assist Team
    `.trim();

    // For now, log the email content (replace with simple email service later)
    console.log('\n=== PASSWORD RESET EMAIL ===');
    console.log(`To: ${to}`);
    console.log(`Subject: Password Reset for Agricog Assist`);
    console.log('\nEmail Content:');
    console.log(emailText);
    console.log('\n=== END EMAIL ===\n');

    // Simulate successful send for now
    return true;
  } catch (error) {
    console.error('Password reset email error:', error);
    return false;
  }
}