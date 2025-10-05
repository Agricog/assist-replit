import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import SprayWindowOptimizer from '../components/SprayWindowOptimizer';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'market' | 'assistant' | 'spray'>('market');
  const [locationUpdated, setLocationUpdated] = useState<number>(Date.now());

  // Location state
  const [locationSearch, setLocationSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [savedLocation, setSavedLocation] = useState<{ lat: number; lon: number; name: string }>(() => {
    const saved = localStorage.getItem('farmLocation');
    return saved ? JSON.parse(saved) : { lat: 51.5074, lon: -0.1278, name: 'London' };
  });

  const fetchWeatherData = (lat: number, lon: number) => {
    fetch(`/api/weather?lat=${lat}&lon=${lon}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setWeather(data))
      .catch(console.error);

    fetch(`/api/weather/forecast?lat=${lat}&lon=${lon}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setForecast(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetch('/api/user', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then(data => {
        setUser(data);
        // If user has a location from signup, use it for weather
        if (data.location) {
          searchLocationForWeather(data.location);
        } else {
          fetchWeatherData(savedLocation.lat, savedLocation.lon);
        }
      })
      .catch(() => setLocation('/login'));
  }, [setLocation]);

  // Search and set weather location based on user's signup location
  const searchLocationForWeather = async (locationName: string) => {
    // Check if we already have this location saved
    if (savedLocation.name === locationName) {
      fetchWeatherData(savedLocation.lat, savedLocation.lon);
      return;
    }

    try {
      const response = await fetch(`/api/weather/search?q=${encodeURIComponent(locationName)}`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.length > 0) {
        const location = data[0];
        const newLocation = {
          lat: location.lat,
          lon: location.lon,
          name: location.name + (location.state ? `, ${location.state}` : '') + `, ${location.country}`,
        };
        setSavedLocation(newLocation);
        localStorage.setItem('farmLocation', JSON.stringify(newLocation));
        fetchWeatherData(newLocation.lat, newLocation.lon);
      } else {
        // Fallback to default if location not found
        fetchWeatherData(savedLocation.lat, savedLocation.lon);
      }
    } catch (error) {
      console.error('Error searching location:', error);
      fetchWeatherData(savedLocation.lat, savedLocation.lon);
    }
  };

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

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices?.[0]?.message?.content || 'Sorry, I could not get a response.';
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error('Market Intelligence error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error connecting to Market Intelligence. Please try again.' }]);
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

  const handleLocationSearch = async () => {
    if (!locationSearch.trim()) return;

    try {
      const response = await fetch(`/api/weather/search?q=${encodeURIComponent(locationSearch)}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to search location');
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Location search error:', error);
      alert('Error searching for location. Please try again.');
    }
  };

  const selectLocation = (location: any) => {
    const newLocation = {
      lat: location.lat,
      lon: location.lon,
      name: location.name + (location.state ? `, ${location.state}` : '') + `, ${location.country}`,
    };
    setSavedLocation(newLocation);
    localStorage.setItem('farmLocation', JSON.stringify(newLocation));
    fetchWeatherData(newLocation.lat, newLocation.lon);
    setShowLocationSearch(false);
    setLocationSearch('');
    setSearchResults([]);
    // Trigger spray optimizer refresh
    setLocationUpdated(Date.now());
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
            <h1 className="text-2xl font-bold text-green-800">
              {user.farm_name ? `${user.farm_name} Farm Dashboard` : 'Agricog Assist'}
            </h1>
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

      <div className="flex h-[calc(100vh-88px)]">
        {/* Left Sidebar Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('market')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                activeTab === 'market'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-2xl">📊</span>
              <span className="font-semibold">Market Intelligence</span>
            </button>
            <button
              onClick={() => setActiveTab('assistant')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                activeTab === 'assistant'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-2xl">🚜</span>
              <span className="font-semibold">Farm Assistant</span>
            </button>
            <button
              onClick={() => setActiveTab('spray')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                activeTab === 'spray'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-2xl">💧</span>
              <span className="font-semibold">Spray Optimizer</span>
            </button>
          </nav>
        </div>

        {/* Center Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'market' && (
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col h-full">
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
          )}

          {activeTab === 'assistant' && (
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col h-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">🚜</span>
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
          )}

          {activeTab === 'spray' && (
            <div className="bg-white rounded-xl shadow-lg p-6 h-full overflow-hidden">
              <SprayWindowOptimizer
                locationUpdated={locationUpdated}
                currentLocation={savedLocation}
              />
            </div>
          )}
        </div>

        {/* Right: Weather Sidebar */}
        <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <span className="mr-2">🌤️</span>
              Weather
            </h2>
            <div className="text-xs text-gray-600">{savedLocation.name}</div>
          </div>
          <button
            onClick={() => setShowLocationSearch(!showLocationSearch)}
            className="w-full mb-4 text-sm text-green-600 hover:text-green-700 px-3 py-2 rounded bg-green-50 hover:bg-green-100 transition"
          >
            📍 Change Location
          </button>

          {/* Location Search Modal */}
          {showLocationSearch && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
                  placeholder="Enter town/village name..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
                <button
                  onClick={handleLocationSearch}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Search
                </button>
                <button
                  onClick={() => {
                    setShowLocationSearch(false);
                    setSearchResults([]);
                    setLocationSearch('');
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-2">Select your location:</p>
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectLocation(result)}
                      className="w-full text-left px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition"
                    >
                      <div className="font-semibold">{result.name}</div>
                      <div className="text-sm text-gray-600">
                        {result.state && `${result.state}, `}{result.country}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {forecast ? (
            <div>
              {/* 5-Day Cards - Vertical Stack */}
              <div className="space-y-3">
                {getDailyForecasts().map((day, index) => (
                  <div key={index}>
                    <div
                      onClick={() => setSelectedDay(selectedDay === index ? null : index)}
                      className={`cursor-pointer p-3 rounded-lg border-2 transition ${
                        selectedDay === index
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                            alt={day.description}
                            className="w-12 h-12"
                          />
                          <div>
                            <div className="text-sm font-semibold text-gray-700">{day.date}</div>
                            <div className="text-xs text-gray-600 capitalize">{day.description}</div>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-800">{day.avgTemp}°C</div>
                      </div>
                    </div>

                    {/* 3-Hourly Details */}
                    {selectedDay === index && (
                      <div className="mt-3 p-3 bg-white rounded-lg border-t-2 border-green-500">
                        <div className="text-sm font-semibold text-gray-700 mb-2">3-Hour Intervals</div>
                        <div className="space-y-2">
                          {day.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-600 font-medium w-12">
                                  {new Date(item.dt * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <img
                                  src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                                  alt={item.weather[0].description}
                                  className="w-8 h-8"
                                />
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="font-bold text-gray-800">{Math.round(item.main.temp)}°C</span>
                                <span className="text-xs text-gray-500">💧{item.main.humidity}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Loading weather forecast...</div>
          )}
        </div>
      </div>
    </div>
  );
}
