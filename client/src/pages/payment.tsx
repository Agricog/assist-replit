import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Check for Stripe key inside component instead of at module level
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const PaymentForm = ({ clientSecret, amount }: { clientSecret: string; amount: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/signup?payment=success`,
      },
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || 'Payment failed');
      } else {
        setMessage('An unexpected error occurred');
      }
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
      <PaymentElement />
      
      <button 
        disabled={isLoading || !stripe || !elements}
        style={{
          width: '100%',
          backgroundColor: isLoading ? '#9ca3af' : '#10b981',
          color: 'white',
          padding: '16px 24px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          marginTop: '24px',
          transition: 'background-color 0.2s'
        }}
        data-testid="button-pay"
      >
        {isLoading ? 'Processing...' : `Pay £${(amount / 100).toFixed(2)} & Access Agricog Assist`}
      </button>
      
      {message && (
        <div style={{ color: '#dc2626', marginTop: '16px', textAlign: 'center', fontSize: '14px' }}>
          {message}
        </div>
      )}
    </form>
  );
};

export default function PaymentPage() {
  // Check for Stripe key when component mounts
  if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p>Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY</p>
        </div>
      </div>
    );
  }
  const [clientSecret, setClientSecret] = useState('');
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Create PaymentIntent when page loads
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}), // Backend fetches price from Stripe product
    })
    .then(async (res) => {
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Payment setup failed');
      }
      return res.json();
    })
    .then((data) => {
      console.log('Payment data received:', data);
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        // Extract amount from the client secret response
        setAmount(data.amount || 0);
      } else {
        setError(data.message || 'Failed to initialize payment');
      }
      setLoading(false);
    })
    .catch((error) => {
      console.error('Payment setup error:', error);
      setError(error.message || 'Network error. Please refresh and try again.');
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p style={{ color: '#15803d' }}>Setting up your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '48px 16px' }}>
        <div style={{ maxWidth: '28rem', margin: '0 auto', background: 'white', borderRadius: '8px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', color: '#dc2626' }}>❌</div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#dc2626', marginBottom: '8px' }}>Payment Setup Failed</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ backgroundColor: '#10b981', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
            data-testid="button-retry"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '48px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '700', color: '#166534', marginBottom: '16px' }}>
          Welcome to Agricog Assist
        </h1>
        <p style={{ fontSize: '18px', color: '#15803d', maxWidth: '40rem', margin: '0 auto', lineHeight: '1.6' }}>
          Join thousands of farmers already using AI-powered agricultural intelligence. 
          Get instant access to market insights, crop guidance, and farming analytics.
        </p>
      </div>

      <div style={{ maxWidth: '28rem', margin: '0 auto', background: 'white', borderRadius: '8px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🌾</div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#166534', marginBottom: '8px' }}>
            Unlock Your Dashboard
          </h2>
          <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '8px', border: '2px solid #10b981' }}>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#166534', margin: 0 }}>£{(amount / 100).toFixed(2)}</p>
            <p style={{ fontSize: '14px', color: '#15803d', margin: '4px 0 0 0' }}>One-time payment • Instant access</p>
          </div>
        </div>

        <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: '0 0 12px 0' }}>
            ✨ What You Get:
          </h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b7280', fontSize: '14px' }}>
            <li style={{ marginBottom: '4px' }}>🤖 Dual AI assistants (Market + Farm guidance)</li>
            <li style={{ marginBottom: '4px' }}>🌤️ Real-time weather forecasting</li>
            <li style={{ marginBottom: '4px' }}>📊 Farm data management tools</li>
            <li style={{ marginBottom: '4px' }}>💬 24/7 agricultural support</li>
          </ul>
        </div>

        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
          <PaymentForm clientSecret={clientSecret} amount={amount} />
        </Elements>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#9ca3af' }}>
          <p>🔒 Secure payment powered by Stripe</p>
        </div>
      </div>
    </div>
  );
}