import React, { useState, useEffect } from 'react';

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(true);

  useEffect(() => {
    // Skip payment verification for now - allow direct access to signup
    setPaymentVerified(true);
    setCheckingPayment(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const timestamp = new Date().toISOString();
    console.log(`🚀 [${timestamp}] Signup form submitted - START`);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    if (data.password !== data.confirmPassword) {
      console.log('❌ Password mismatch error');
      setError('Passwords do not match');
      return;
    }
    
    console.log(`🚀 [${timestamp}] ✅ Form validation passed, making API call to /api/register...`);
    setLoading(true);
    setError('');
    
    try {
      console.log(`🚀 [${timestamp}] 🌐 Making API call to /api/register with data:`, {
        firstName: data.firstName,
        lastName: data.lastName,
        farmName: data.farmName,
        email: data.email,
        username: data.username,
        location: data.location,
        passwordLength: String(data.password || '').length
      });
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          farmName: data.farmName,
          email: data.email,
          username: data.username,
          location: data.location,
          password: data.password
        })
      });
      
      console.log(`🚀 [${timestamp}] API response status:`, response.status);
      if (response.ok) {
        const userData = await response.json();
        console.log(`🚀 [${timestamp}] ✅ Registration successful for user:`, userData.username);
        
        // Send Slack notification about new signup
        try {
          await fetch('/api/notify-signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firstName: data.firstName,
              lastName: data.lastName,
              farmName: data.farmName,
              email: data.email,
              username: data.username,
              location: data.location
            })
          });
        } catch (notifyError) {
          console.log('Notification failed but signup succeeded');
        }
        
        // Show success message
        console.log('✅ Signup successful');
        setSuccess(true);
        
        // Wait a moment, then test authentication before redirecting
        setTimeout(async () => {
          try {
            console.log('Testing authentication before redirect...');
            const testResponse = await fetch('/api/user', {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            if (testResponse.ok) {
              const userData = await testResponse.json();
              console.log('✅ Authentication confirmed for:', userData.username);
              console.log('Redirecting to dashboard...');
              window.location.href = '/dashboard';
            } else {
              console.log('❌ Authentication failed, status:', testResponse.status);
              // Try logging in again with the same credentials
              const reLoginResponse = await fetch('/api/login-traditional', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ username: data.username, password: data.password }),
              });
              
              if (reLoginResponse.ok) {
                console.log('✅ Re-login successful, redirecting to dashboard');
                setTimeout(() => {
                  window.location.href = '/dashboard';
                }, 500);
              } else {
                console.log('❌ Re-login failed');
                setError('Login failed after signup. Please try logging in manually.');
                setSuccess(false);
              }
            }
          } catch (error) {
            console.error('Error testing authentication:', error);
            setError('Authentication check failed. Please try logging in manually.');
            setSuccess(false);
          }
        }, 1000);
      } else {
        console.log(`🚀 [${timestamp}] ❌ Registration failed with status:`, response.status);
        const errorText = await response.text();
        console.log(`🚀 [${timestamp}] Error response:`, errorText);
        setError(errorText || 'Account creation failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking payment status
  if (checkingPayment) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p style={{ color: '#15803d' }}>Verifying your payment...</p>
        </div>
      </div>
    );
  }

  // Redirect to payment if no payment verification
  if (!paymentVerified) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '48px 16px' }}>
        <div style={{ maxWidth: '28rem', margin: '0 auto', background: 'white', borderRadius: '8px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', color: '#dc2626' }}>🔒</div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#dc2626', marginBottom: '8px' }}>Payment Required</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            You need to complete payment before accessing the signup form.
          </p>
          <a 
            href="/payment" 
            style={{ display: 'inline-block', backgroundColor: '#10b981', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}
            data-testid="link-payment"
          >
            Complete Payment (£0.01)
          </a>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '48px 16px' }}>
        <div style={{ maxWidth: '28rem', margin: '0 auto', background: 'white', borderRadius: '8px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#166534', marginBottom: '8px' }}>Account Created!</h2>
          <p style={{ color: '#15803d', marginBottom: '16px' }}>Welcome to Agricog Assist. You can now sign in to your dashboard.</p>
          <a href="/login" style={{ display: 'inline-block', backgroundColor: '#10b981', color: 'white', padding: '12px 32px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>Sign In Now</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '48px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', color: '#166534', marginBottom: '16px' }}>Create Your Account</h1>
        <p style={{ fontSize: '18px', color: '#15803d', maxWidth: '32rem', margin: '0 auto' }}>
          Welcome to Agricog Assist! Create your secure account to access your personalized agricultural intelligence dashboard.
        </p>
      </div>

      <div style={{ maxWidth: '28rem', margin: '0 auto', background: 'white', borderRadius: '8px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🌾</div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#166534' }}>Join Agricog Assist</h2>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '4px solid #10b981', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ color: '#15803d', marginTop: '8px' }}>Creating your account...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>First Name</label>
              <input type="text" name="firstName" required style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Last Name</label>
              <input type="text" name="lastName" required style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Farm Name</label>
              <input type="text" name="farmName" required placeholder="e.g., Green Valley Farm, Oak Ridge Farm" style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }} />
              <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Enter your farm name for personalized dashboard experience</p>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Email Address</label>
              <input type="email" name="email" required style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Username</label>
              <input type="text" name="username" required style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Farm Location</label>
              <input type="text" name="location" required placeholder="e.g., London, Manchester, Birmingham" style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }} />
              <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Enter your city or farm location for accurate weather forecasts</p>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Password</label>
              <input type="password" name="password" required minLength={6} style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Confirm Password</label>
              <input type="password" name="confirmPassword" required style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }} />
            </div>
            
            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                {error}
              </div>
            )}
            
            <button type="submit" style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '12px 32px', borderRadius: '8px', fontWeight: '600', fontSize: '16px', border: 'none', cursor: 'pointer' }}>
              Create Account
            </button>
          </form>
        )}
        
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ color: '#15803d' }}>
            Already have an account? 
            <a href="/login" style={{ color: '#10b981', fontWeight: '600', textDecoration: 'none', marginLeft: '4px' }}>Sign in here</a>
          </p>
          <p style={{ color: '#15803d', marginTop: '8px' }}>
            Forgot your password? 
            <a href="/forgot-password" style={{ color: '#10b981', fontWeight: '600', textDecoration: 'none', marginLeft: '4px' }}>Reset it here</a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}