import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check authentication
    fetch('/api/user', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then(data => setUser(data))
      .catch(() => setLocation('/login'));

    // Get weather (using London coordinates as default)
    fetch('/api/weather?lat=51.5074&lon=-0.1278', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setWeather(data))
      .catch(console.error);
  }, [setLocation]);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    setLocation('/');
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat/market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      const assistantMessage = data.choices?.[0]?.message?.content || 'Sorry, I could not get a response.';
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error getting response. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🌾</span>
            <h1 className="text-2xl font-bold text-green-800">Agricog Assist</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user.username}!</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Weather Widget */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🌤️</span>
            Weather
          </h2>
          {weather ? (
            <div className="flex items-center space-x-6">
              <div className="text-5xl">{Math.round(weather.main?.temp)}°C</div>
              <div>
                <div className="text-xl font-semibold text-gray-700">{weather.name}</div>
                <div className="text-gray-600 capitalize">{weather.weather?.[0]?.description}</div>
                <div className="text-sm text-gray-500">
                  Humidity: {weather.main?.humidity}% | Wind: {weather.wind?.speed} m/s
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Loading weather...</div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Market Intelligence Chat */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col h-[600px]">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📊</span>
              Market Intelligence
            </h2>

            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-gray-500 text-center mt-8">
                  Ask me about crop prices, market trends, or farming economics!
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-green-100 ml-8'
                        : 'bg-gray-100 mr-8'
                    }`}
                  >
                    <div className="font-semibold text-sm mb-1">
                      {msg.role === 'user' ? 'You' : 'AI Assistant'}
                    </div>
                    <div className="text-gray-800">{msg.content}</div>
                  </div>
                ))
              )}
              {loading && (
                <div className="text-gray-500 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about market trends..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>

          {/* Farm Assistant (Fastbots) */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col h-[600px]">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🤖</span>
              Farm Assistant
            </h2>

            <div className="flex-1">
              <iframe
                style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
                src="https://app.fastbots.ai/embed/cmcuvry22008boelv6guop4fa"
                title="Farm Assistant Chatbot"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
