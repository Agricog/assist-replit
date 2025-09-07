import React, { useState } from 'react';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        setSuccess(true);
      } else {
        const errorText = await response.text();
        setError(errorText || 'Failed to send password reset email');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '48px 16px' }}>
        <div style={{ maxWidth: '28rem', margin: '0 auto', background: 'white', borderRadius: '8px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#166534', marginBottom: '8px' }}>Check Your Email!</h2>
          <p style={{ color: '#15803d', marginBottom: '16px' }}>We've sent password reset instructions to your email address.</p>
          <a href="/signup" style={{ display: 'inline-block', backgroundColor: '#10b981', color: 'white', padding: '12px 32px', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}>Back to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '48px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', color: '#166534', marginBottom: '16px' }}>Reset Password</h1>
        <p style={{ fontSize: '18px', color: '#15803d', maxWidth: '32rem', margin: '0 auto' }}>
          Enter your email address and we'll send you instructions to reset your password.
        </p>
      </div>

      <div style={{ maxWidth: '28rem', margin: '0 auto', background: 'white', borderRadius: '8px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🔑</div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#166534' }}>Forgot Password?</h2>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '4px solid #10b981', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <p style={{ color: '#15803d', marginTop: '8px' }}>Sending reset email...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Email Address</label>
              <input type="email" name="email" required style={{ width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }} />
            </div>
            
            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                {error}
              </div>
            )}
            
            <button type="submit" style={{ width: '100%', backgroundColor: '#10b981', color: 'white', padding: '12px 32px', borderRadius: '8px', fontWeight: '600', fontSize: '16px', border: 'none', cursor: 'pointer', marginBottom: '16px' }}>
              Send Reset Instructions
            </button>
            
            <div style={{ textAlign: 'center' }}>
              <a href="/signup" style={{ color: '#10b981', fontWeight: '600', textDecoration: 'none' }}>Back to Login</a>
            </div>
          </form>
        )}

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}