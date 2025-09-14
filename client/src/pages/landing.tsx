import agricogLogo from "@assets/Agricog_1757875972471.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src={agricogLogo} alt="Agricog" className="h-32" />
              <span className="text-xl font-semibold text-gray-900">Assist</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-green-600 font-medium">Home</a>
              <a href="#features" className="text-gray-600 hover:text-green-600 font-medium">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-green-600 font-medium">Pricing</a>
              <a href="#contact" className="text-gray-600 hover:text-green-600 font-medium">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">
            Smart Farm Management<br />Made Simple
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Weather forecasts, AI assistance, and field management in one easy-to-use platform
          </p>
          <a 
            href="#form" 
            className="inline-block bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors"
            data-testid="button-start-trial"
          >
            Start 30-Day Free Trial
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light text-gray-900 mb-4">Everything You Need</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🌤️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">5-Day Weather Forecasts</h3>
              <p className="text-gray-600">Detailed hourly breakdowns for better planning</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Dual AI Assistance</h3>
              <p className="text-gray-600">General farm questions plus your farm's specific knowledge base</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🌾</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Field Management</h3>
              <p className="text-gray-600">Track what's planted where, yields, and notes</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Bespoke CRM System</h3>
              <p className="text-gray-600">Custom farm management solution built specifically for your operation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-light text-gray-900 mb-4">Simple Pricing</h2>
          <p className="text-xl text-gray-600 mb-12">One plan. All features included.</p>
          
          <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-sm mx-auto">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Complete Package</h3>
            <div className="mb-6">
              <span className="text-4xl font-light text-gray-900">£129</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="text-left text-gray-600 mb-8 space-y-2">
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                5-day weather forecasts
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                Dual AI assistance
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                Field management tools
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                No setup fees
              </li>
            </ul>
            <p className="text-sm text-gray-500 mb-6">30-day free trial, no credit card required</p>
            <a 
              href="#form" 
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-block"
              data-testid="button-pricing-cta"
            >
              Start Free Trial
            </a>
          </div>
        </div>
      </section>

      {/* SmartSuite Form */}
      <section id="form" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4" data-testid="section-form">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 text-center mb-6">
                Get Started Today
              </h2>
              
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
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 mb-2">Already have an account?</p>
                <a href="/login" className="text-green-600 hover:text-green-700 font-semibold" data-testid="link-login">
                  Sign in to your dashboard →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img src={agricogLogo} alt="Agricog" className="h-24" />
            <span className="text-lg font-semibold text-gray-900">Assist</span>
          </div>
          <p className="text-gray-600 mb-4">Smart farm management made simple</p>
          <p className="text-sm text-gray-500">
            Questions? Email us at{' '}
            <a href="mailto:hello@agricogassist.com" className="text-green-600 hover:text-green-700">
              hello@agricogassist.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}