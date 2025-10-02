import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
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

    // Get current weather (using London coordinates as default)
    fetch('/api/weather?lat=51.5074&lon=-0.1278', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setWeather(data))
      .catch(console.error);

    // Get 5-day forecast
    fetch('/api/weather/forecast?lat=51.5074&lon=-0.1278', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setForecast(data))
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

  // Group forecast by day
  const getDailyForecasts = () => {
    if (!forecast?.list) return [];

    const days: any = {};
    forecast.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
      if (!days[date]) {
        days[date] = [];
      }
      days[date].push(item);
    });

    return Object.entries(days).slice(0, 5).map(([date, items]: [string, any]) => ({
      date,
      items,
      avgTemp: Math.round(items.reduce((sum: number, i: any) => sum + i.main.temp, 0) / items.length),
      icon: items[Math.floor(items.length / 2)].weather[0].icon,
      description: items[Math.floor(items.length / 2)].weather[0].description,
    }));
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
        {/* Weather Forecast */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🌤️</span>
            5-Day Weather Forecast
            {weather && <span className="text-sm font-normal text-gray-600 ml-4">{weather.name}</span>}
          </h2>

          {forecast ? (
            <div>
              {/* 5-Day Cards */}
              <div className="grid grid-cols-5 gap-4 mb-6">
                {getDailyForecasts().map((day, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedDay(selectedDay === index ? null : index)}
                    className={`cursor-pointer p-4 rounded-lg border-2 transition ${
                      selectedDay === index
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-700 mb-2">{day.date}</div>
                      <img
                        src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                        alt={day.description}
                        className="w-16 h-16 mx-auto"
                      />
                      <div className="text-2xl font-bold text-gray-800">{day.avgTemp}°C</div>
                      <div className="text-xs text-gray-600 capitalize">{day.description}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 3-Hourly Details */}
              {selectedDay !== null && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    3-Hourly Forecast for {getDailyForecasts()[selectedDay].date}
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {getDailyForecasts()[selectedDay].items.map((item: any, idx: number) => (
                      <div key={idx} className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="text-sm font-semibold text-gray-700 mb-1">
                          {new Date(item.dt * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <img
                          src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                          alt={item.weather[0].description}
                          className="w-12 h-12 mx-auto"
                        />
                        <div className="text-xl font-bold text-gray-800 text-center">{Math.round(item.main.temp)}°C</div>
                        <div className="text-xs text-gray-600 text-center capitalize">{item.weather[0].description}</div>
                        <div className="text-xs text-gray-500 text-center mt-1">
                          💧 {item.main.humidity}% | 💨 {Math.round(item.wind.speed)} m/s
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">Loading weather forecast...</div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Market Intelligence Chat */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col h-[600px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="mr-2">📊</span>
                Market Intelligence
              </h2>
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="text-sm text-gray-500 hover:text-red-600 transition px-3 py-1 rounded hover:bg-red-50"
                  title="Clear chat"
                >
                  🗑️ Clear
                </button>
              )}
            </div>

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
