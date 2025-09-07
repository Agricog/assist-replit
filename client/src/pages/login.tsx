import React, { useState } from 'react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/login-traditional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.username,
          password: data.password
        })
      });
      
      if (response.ok) {
        console.log('✅ Login successful, redirecting to dashboard...');
        // Redirect to dashboard after successful login
        window.location.href = '/dashboard';
      } else {
        const errorText = await response.text();
        setError(errorText || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '48px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', color: '#166534', marginBottom: '16px' }}>Welcome Back</h1>
        <p style={{ fontSize: '18px', color: '#15803d', maxWidth: '32rem', margin: '0 auto' }}>
          Sign in to access your Agricog Assist dashboard
        </p>
      </div>

      <div style={{ maxWidth: '28rem', margin: '0 auto', background: 'white', borderRadius: '8px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🌾</div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#166534' }}>Sign In to Your Account</h2>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p style={{ color: '#15803d' }}>Signing you in...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Username
              </label>
              <input
                name="username"
                type="text"
                required
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                placeholder="Enter your username"
                data-testid="input-username"
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                placeholder="Enter your password"
                data-testid="input-password"
              />
            </div>

            <button
              type="submit"
              style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '16px 24px', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s' }}
              onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#059669'}
              onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#10b981'}
              data-testid="button-login"
            >
              Sign In to Dashboard
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <a href="/forgot-password" style={{ color: '#10b981', fontSize: '14px', textDecoration: 'none' }} data-testid="link-forgot-password">
                Forgot your password? Reset it here
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}