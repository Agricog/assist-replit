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

        {/* Key Value Propositions */}
        <div className="mb-16 grid md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-2xl mb-3">⚡</div>
            <h3 className="font-semibold text-green-800 mb-2">Instant Insights</h3>
            <p className="text-sm text-green-600">AI-powered analysis in real-time</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-2xl mb-3">🎯</div>
            <h3 className="font-semibold text-green-800 mb-2">Precision Agriculture</h3>
            <p className="text-sm text-green-600">Data-driven farming decisions</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-2xl mb-3">💰</div>
            <h3 className="font-semibold text-green-800 mb-2">Maximize Profits</h3>
            <p className="text-sm text-green-600">Optimize costs and yields</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-2xl mb-3">🌍</div>
            <h3 className="font-semibold text-green-800 mb-2">Sustainable Farming</h3>
            <p className="text-sm text-green-600">Eco-friendly practices</p>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mb-16 bg-green-800 rounded-xl p-8 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Trusted by Modern Farmers</h2>
            <p className="text-green-100 max-w-2xl mx-auto">
              Join thousands of farmers who have already transformed their operations with Agricog Assist
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">15,000+</div>
              <p className="text-green-100">Active Farmers</p>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">2.5M+</div>
              <p className="text-green-100">Acres Managed</p>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">35%</div>
              <p className="text-green-100">Average Yield Increase</p>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">$2,400</div>
              <p className="text-green-100">Avg. Annual Savings</p>
            </div>
          </div>
        </div>

        {/* SmartSuite Embedded Form */}
        <div id="form" className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden mb-16" data-testid="section-form">
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
            
            {/* Login link for existing users */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Already have an account?</p>
              <a href="/login" className="text-green-600 hover:text-green-700 font-semibold" data-testid="link-login">
                Sign in to your dashboard →
              </a>
            </div>
          </div>
        </div>

        {/* Comprehensive Features Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-green-800 mb-4">Complete Agricultural Intelligence Suite</h2>
            <p className="text-lg text-green-700 max-w-3xl mx-auto">
              Everything you need to manage your farm efficiently, from crop planning to market analysis
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-4xl mb-6 text-center">🌾</div>
              <h3 className="text-xl font-semibold text-green-800 mb-4">Farm Intelligence</h3>
              <p className="text-green-600 mb-4">AI-powered insights for your crops, livestock, and farm operations</p>
              <ul className="space-y-2 text-sm text-green-600">
                <li>• Crop health monitoring and disease detection</li>
                <li>• Soil analysis and nutrient recommendations</li>
                <li>• Livestock tracking and health alerts</li>
                <li>• Equipment maintenance scheduling</li>
                <li>• Yield prediction and optimization</li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-4xl mb-6 text-center">📊</div>
              <h3 className="text-xl font-semibold text-green-800 mb-4">Market Analysis</h3>
              <p className="text-green-600 mb-4">Real-time commodity prices and market trend analysis</p>
              <ul className="space-y-2 text-sm text-green-600">
                <li>• Live commodity price tracking</li>
                <li>• Market trend forecasting</li>
                <li>• Supply chain optimization</li>
                <li>• Contract and futures analysis</li>
                <li>• Buyer-seller marketplace access</li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-4xl mb-6 text-center">🌤️</div>
              <h3 className="text-xl font-semibold text-green-800 mb-4">Weather Insights</h3>
              <p className="text-green-600 mb-4">Detailed forecasts and alerts for optimal farming decisions</p>
              <ul className="space-y-2 text-sm text-green-600">
                <li>• Hyperlocal weather forecasting</li>
                <li>• Severe weather alerts and warnings</li>
                <li>• Planting and harvesting recommendations</li>
                <li>• Irrigation scheduling optimization</li>
                <li>• Climate trend analysis</li>
              </ul>
            </div>
          </div>

          {/* Additional Feature Categories */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-4xl mb-6 text-center">📱</div>
              <h3 className="text-xl font-semibold text-green-800 mb-4">Digital Farm Management</h3>
              <p className="text-green-600 mb-4">Comprehensive tools to digitize and streamline your operations</p>
              <ul className="space-y-2 text-sm text-green-600">
                <li>• Field mapping and GPS integration</li>
                <li>• Task scheduling and workforce management</li>
                <li>• Inventory and supply tracking</li>
                <li>• Financial planning and budgeting</li>
                <li>• Compliance and record keeping</li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-4xl mb-6 text-center">🤝</div>
              <h3 className="text-xl font-semibold text-green-800 mb-4">Expert Network</h3>
              <p className="text-green-600 mb-4">Connect with agricultural experts and fellow farmers</p>
              <ul className="space-y-2 text-sm text-green-600">
                <li>• 24/7 expert consultation chat</li>
                <li>• Peer farmer community forums</li>
                <li>• Local extension service integration</li>
                <li>• Best practices knowledge base</li>
                <li>• Video tutorials and training</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Why Choose Agricog Assist */}
        <div className="mb-16 bg-white rounded-xl p-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-green-800 mb-4">Why Choose Agricog Assist?</h2>
            <p className="text-lg text-green-700 max-w-2xl mx-auto">
              We combine cutting-edge technology with deep agricultural expertise
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">🚀</div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">Advanced AI Technology</h3>
                  <p className="text-green-600">Machine learning algorithms trained on millions of data points from successful farms worldwide</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="text-2xl">🎓</div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">Agricultural Expertise</h3>
                  <p className="text-green-600">Built by agronomists, farmers, and agricultural engineers with decades of field experience</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="text-2xl">🔒</div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">Secure & Private</h3>
                  <p className="text-green-600">Enterprise-grade security with full data ownership and privacy protection</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">📞</div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">24/7 Support</h3>
                  <p className="text-green-600">Round-the-clock technical support and agricultural consultation services</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="text-2xl">💡</div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">Continuous Innovation</h3>
                  <p className="text-green-600">Regular updates with new features based on user feedback and industry trends</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="text-2xl">🌱</div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">Sustainability Focus</h3>
                  <p className="text-green-600">Promote environmentally responsible farming practices and carbon footprint reduction</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Testimonials */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-green-800 mb-4">What Our Farmers Say</h2>
            <p className="text-lg text-green-700 max-w-2xl mx-auto">
              Real stories from farmers who have transformed their operations with Agricog Assist
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-yellow-500 text-xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-green-600 mb-4 italic">
                "Agricog Assist helped me increase my corn yield by 40% last season. The soil analysis and weather predictions were spot-on. I can't imagine farming without it now."
              </p>
              <div className="border-t pt-4">
                <div className="font-semibold text-green-800">Sarah Johnson</div>
                <div className="text-sm text-green-600">Corn & Soybean Farmer, Iowa</div>
                <div className="text-sm text-green-600">1,200 acres</div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-yellow-500 text-xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-green-600 mb-4 italic">
                "The market analysis feature saved me thousands. I sold my wheat at the perfect time based on their price predictions. ROI was immediate."
              </p>
              <div className="border-t pt-4">
                <div className="font-semibold text-green-800">Mike Rodriguez</div>
                <div className="text-sm text-green-600">Wheat & Cattle Rancher, Kansas</div>
                <div className="text-sm text-green-600">3,500 acres</div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-yellow-500 text-xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-green-600 mb-4 italic">
                "As a young farmer, Agricog Assist gave me the confidence to make data-driven decisions. The expert chat feature is like having a mentor available 24/7."
              </p>
              <div className="border-t pt-4">
                <div className="font-semibold text-green-800">David Chen</div>
                <div className="text-sm text-green-600">Organic Vegetable Farm, California</div>
                <div className="text-sm text-green-600">150 acres</div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-yellow-500 text-xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-green-600 mb-4 italic">
                "The livestock monitoring alerts caught a disease outbreak early, saving me from massive losses. The platform pays for itself many times over."
              </p>
              <div className="border-t pt-4">
                <div className="font-semibold text-green-800">Amanda Thompson</div>
                <div className="text-sm text-green-600">Dairy Farm, Wisconsin</div>
                <div className="text-sm text-green-600">500 head</div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-yellow-500 text-xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-green-600 mb-4 italic">
                "Finally, a platform that understands agriculture. The interface is intuitive, and the insights are practical and actionable. Highly recommended!"
              </p>
              <div className="border-t pt-4">
                <div className="font-semibold text-green-800">Robert Wilson</div>
                <div className="text-sm text-green-600">Mixed Crop Farm, Nebraska</div>
                <div className="text-sm text-green-600">2,800 acres</div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-yellow-500 text-xl mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-green-600 mb-4 italic">
                "The sustainability recommendations helped me reduce input costs by 25% while maintaining yields. Great for both profit and the planet."
              </p>
              <div className="border-t pt-4">
                <div className="font-semibold text-green-800">Lisa Martinez</div>
                <div className="text-sm text-green-600">Sustainable Farm, Oregon</div>
                <div className="text-sm text-green-600">800 acres</div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Plans */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-green-800 mb-4">Choose Your Plan</h2>
            <p className="text-lg text-green-700 max-w-2xl mx-auto">
              Flexible pricing designed to grow with your farming operation
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md border-2 border-transparent">
              <h3 className="text-xl font-semibold text-green-800 mb-2">Starter</h3>
              <div className="text-3xl font-bold text-green-800 mb-4">$49<span className="text-lg font-normal">/month</span></div>
              <p className="text-green-600 mb-6">Perfect for small farms up to 500 acres</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-green-600"><span className="text-green-500 mr-2">✓</span> Basic weather forecasting</li>
                <li className="flex items-center text-green-600"><span className="text-green-500 mr-2">✓</span> Market price alerts</li>
                <li className="flex items-center text-green-600"><span className="text-green-500 mr-2">✓</span> Crop planning tools</li>
                <li className="flex items-center text-green-600"><span className="text-green-500 mr-2">✓</span> Email support</li>
              </ul>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold" data-testid="button-starter-plan">
                Start Free Trial
              </button>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md border-2 border-green-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold text-green-800 mb-2">Professional</h3>
              <div className="text-3xl font-bold text-green-800 mb-4">$149<span className="text-lg font-normal">/month</span></div>
              <p className="text-green-600 mb-6">Ideal for medium to large farms up to 5,000 acres</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-green-600"><span className="text-green-500 mr-2">✓</span> All Starter features</li>
                <li className="flex items-center text-green-600"><span className="text-green-500 mr-2">✓</span> Advanced AI analytics</li>
                <li className="flex items-center text-green-600"><span className="text-green-500 mr-2">✓</span> Expert chat support</li>
                <li className="flex items-center text-green-600"><span className="text-green-500 mr-2">✓</span> Livestock monitoring</li>
                <li className="flex items-center text-green-600"><span className="text-green-500 mr-2">✓</span> Equipment integration</li>
              </ul>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold" data-testid="button-professional-plan">
                Start Free Trial
              </button>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md border-2 border-transparent">
              <h3 className="text-xl font-semibold text-green-800 mb-2">Enterprise</h3>
              <div className="text-3xl font-bold text-green-800 mb-4">Custom</div>
              <p className="text-green-600 mb-6">For large operations and agribusiness</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-green-600"><span className="text-green-500 mr-2">✓</span> All Professional features</li>
                <li className="flex items-center text-green-600"><span className="text-green-500 mr-2">✓</span> Custom integrations</li>
                <li className="flex items-center text-green-600"><span className="text-green-500 mr-2">✓</span> Dedicated support team</li>
                <li className="flex items-center text-green-600"><span className="text-green-500 mr-2">✓</span> Multi-farm management</li>
                <li className="flex items-center text-green-600"><span className="text-green-500 mr-2">✓</span> API access</li>
              </ul>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold" data-testid="button-enterprise-plan">
                Contact Sales
              </button>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-green-800 rounded-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Farm?</h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of successful farmers using Agricog Assist to maximize their yields, reduce costs, and make smarter farming decisions.
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <a href="#form" className="inline-block bg-white text-green-800 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors" data-testid="button-get-started">
              Get Started Today
            </a>
            <a href="/login" className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-800 transition-colors" data-testid="button-sign-in">
              Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}