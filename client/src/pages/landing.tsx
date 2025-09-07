export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-green-800 mb-6">
            Agricog Assist
          </h1>
          <p className="text-xl text-green-700 mb-8 max-w-3xl mx-auto">
            Your intelligent agricultural companion. Get personalized farm guidance, 
            market intelligence, and weather insights to optimize your farming success.
          </p>
        </div>

        {/* Call to Action - Industry Standard */}
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-8 text-center">
            <h2 className="text-3xl font-bold text-green-800 mb-4">
              Get Instant Access
            </h2>
            <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200 mb-6">
              <div className="text-4xl font-bold text-green-800 mb-2">£1</div>
              <p className="text-green-600 mb-4">One-time payment • Lifetime access</p>
            </div>
            
            <p className="text-gray-600 mb-8 text-lg">
              Join thousands of farmers already using AI-powered agricultural intelligence. 
              Get instant access to your personalized dashboard.
            </p>
            
            <a 
              href="/payment"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors duration-200 shadow-lg"
              data-testid="button-get-access"
            >
              🚀 Get Access Now - £1
            </a>
            
            <div className="mt-6 text-sm text-gray-500">
              <p>✅ Secure payment • ✅ Instant access • ✅ 24/7 support</p>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 mb-2">Already have an account?</p>
              <a href="/login" className="text-green-600 hover:text-green-700 font-semibold" data-testid="link-login">
                Sign in to your dashboard →
              </a>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl mb-4">🌾</div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">Farm Intelligence</h3>
            <p className="text-green-600">AI-powered insights for your crops, livestock, and farm operations</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">Market Analysis</h3>
            <p className="text-green-600">Real-time commodity prices and market trend analysis</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl mb-4">🌤️</div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">Weather Insights</h3>
            <p className="text-green-600">Detailed forecasts and alerts for optimal farming decisions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
