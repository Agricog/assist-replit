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

        {/* SmartSuite Embedded Form */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-semibold text-green-800 text-center mb-6">
              Get Started with Your Agricultural Intelligence Platform
            </h2>
            
            {/* SmartSuite Form Embed */}
            <div className="w-full" style={{ minHeight: '600px' }}>
              <iframe 
                src="https://app.smartsuite.com/form/sba974gi/HRmqVuQoG6?header=false"
                width="100%"
                height="700"
                frameBorder="0"
                className="rounded-lg"
                title="Agricog Assist Registration Form"
              />
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
