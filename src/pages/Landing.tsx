import { Link } from 'wouter';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-4xl">🌾</span>
          <h1 className="text-2xl font-bold text-green-800">Agricog Assist</h1>
        </div>
        <div className="space-x-4">
          <Link href="/login">
            <a className="text-green-700 hover:text-green-900 font-medium">Login</a>
          </Link>
          <Link href="/signup">
            <a className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
              Get Started
            </a>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-6xl font-bold text-green-900 mb-6">
          Smart Farming Intelligence
        </h2>
        <p className="text-xl text-green-700 mb-12 max-w-3xl mx-auto">
          Get real-time market insights, weather forecasts, and AI-powered farming assistance
          to make better decisions for your farm.
        </p>

        <div className="flex justify-center space-x-4 mb-20">
          <Link href="/signup">
            <a className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition shadow-lg">
              Start Free Trial
            </a>
          </Link>
          <Link href="/login">
            <a className="bg-white text-green-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition shadow-lg border-2 border-green-600">
              Sign In
            </a>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-green-800 mb-2">Market Intelligence</h3>
            <p className="text-gray-600">
              AI-powered insights on crop prices, market trends, and economic forecasts
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-5xl mb-4">🌤️</div>
            <h3 className="text-xl font-bold text-green-800 mb-2">Weather Forecasts</h3>
            <p className="text-gray-600">
              Real-time weather data and forecasts tailored to your farm location
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-green-800 mb-2">Farm Assistant</h3>
            <p className="text-gray-600">
              24/7 AI assistant to answer your farming questions and provide guidance
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-green-900 mb-6">Get in Touch</h3>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <iframe
              src="https://app.smartsuite.com/form/sba974gi/HRmqVuQoG6?header=false"
              width="100%"
              height="600px"
              style={{ border: 'none' }}
              title="Contact Form"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-green-700">
        <p>&copy; 2025 Agricog Assist. All rights reserved.</p>
      </footer>
    </div>
  );
}
