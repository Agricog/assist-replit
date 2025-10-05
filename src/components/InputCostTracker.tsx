import { useState, useEffect } from 'react';

interface InputPrice {
  id: string;
  name: string;
  category: 'fertilizer' | 'seed' | 'fuel' | 'chemical';
  unit: string;
  currentPrice: number | null;
  lastUpdated: string | null;
  weekChange: number | null;
  monthChange: number | null;
  trend: 'UP' | 'DOWN' | 'STABLE' | null;
}

interface PriceAlert {
  id: number;
  inputId: string;
  inputName: string;
  targetPrice: number;
  quantity: number;
  unit: string;
  alertType: 'BELOW' | 'ABOVE';
  isActive: boolean;
  triggered: boolean;
}

interface Purchase {
  id: number;
  inputId: string;
  inputName: string;
  quantity: number;
  pricePerUnit: number;
  totalCost: number;
  supplier: string;
  purchaseDate: string;
  notes: string;
}

export default function InputCostTracker() {
  const [inputs, setInputs] = useState<InputPrice[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [showAddPurchase, setShowAddPurchase] = useState(false);
  const [showUpdatePrice, setShowUpdatePrice] = useState(false);
  const [selectedInput, setSelectedInput] = useState<InputPrice | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [alertForm, setAlertForm] = useState({
    targetPrice: '',
    quantity: '',
    alertType: 'BELOW' as 'BELOW' | 'ABOVE',
  });
  const [purchaseForm, setPurchaseForm] = useState({
    quantity: '',
    pricePerUnit: '',
    supplier: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inputsRes, alertsRes, purchasesRes] = await Promise.all([
        fetch('/api/input-prices', { credentials: 'include' }),
        fetch('/api/price-alerts', { credentials: 'include' }),
        fetch('/api/purchases', { credentials: 'include' }),
      ]);

      const inputsData = await inputsRes.json();
      const alertsData = await alertsRes.json();
      const purchasesData = await purchasesRes.json();

      setInputs(inputsData);
      setAlerts(alertsData);
      setPurchases(purchasesData);
    } catch (error) {
      console.error('Error fetching input cost data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrice = async () => {
    if (!selectedInput || !newPrice) return;

    try {
      const response = await fetch('/api/input-prices/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          inputId: selectedInput.id,
          price: parseFloat(newPrice),
        }),
      });

      if (response.ok) {
        await fetchData();
        setShowUpdatePrice(false);
        setSelectedInput(null);
        setNewPrice('');
      }
    } catch (error) {
      console.error('Error updating price:', error);
    }
  };

  const handleCreateAlert = async () => {
    if (!selectedInput || !alertForm.targetPrice || !alertForm.quantity) return;

    try {
      const response = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          inputId: selectedInput.id,
          inputName: selectedInput.name,
          targetPrice: parseFloat(alertForm.targetPrice),
          quantity: parseFloat(alertForm.quantity),
          unit: selectedInput.unit,
          alertType: alertForm.alertType,
        }),
      });

      if (response.ok) {
        await fetchData();
        setShowAddAlert(false);
        setSelectedInput(null);
        setAlertForm({ targetPrice: '', quantity: '', alertType: 'BELOW' });
      }
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  };

  const handleLogPurchase = async () => {
    if (!selectedInput || !purchaseForm.quantity || !purchaseForm.pricePerUnit) return;

    const totalCost = parseFloat(purchaseForm.quantity) * parseFloat(purchaseForm.pricePerUnit);

    try {
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          inputId: selectedInput.id,
          inputName: selectedInput.name,
          quantity: parseFloat(purchaseForm.quantity),
          pricePerUnit: parseFloat(purchaseForm.pricePerUnit),
          totalCost,
          supplier: purchaseForm.supplier,
          purchaseDate: purchaseForm.purchaseDate,
          notes: purchaseForm.notes,
        }),
      });

      if (response.ok) {
        await fetchData();
        setShowAddPurchase(false);
        setSelectedInput(null);
        setPurchaseForm({
          quantity: '',
          pricePerUnit: '',
          supplier: '',
          purchaseDate: new Date().toISOString().split('T')[0],
          notes: '',
        });
      }
    } catch (error) {
      console.error('Error logging purchase:', error);
    }
  };

  const handleRefreshPrices = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/input-prices/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        // Wait a few seconds then refresh data
        setTimeout(() => {
          fetchData();
          setRefreshing(false);
        }, 3000);
      } else {
        setRefreshing(false);
      }
    } catch (error) {
      console.error('Error refreshing prices:', error);
      setRefreshing(false);
    }
  };

  const getTrendIcon = (trend: string | null) => {
    switch (trend) {
      case 'UP': return '↑↑';
      case 'DOWN': return '↓↓';
      case 'STABLE': return '→';
      default: return '—';
    }
  };

  const getTrendColor = (trend: string | null) => {
    switch (trend) {
      case 'UP': return 'text-red-600';
      case 'DOWN': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatPrice = (price: number | null, unit: string) => {
    if (price === null) return 'N/A';
    if (unit === 'pence/L') return `${price.toFixed(1)}p/L`;
    return `£${price.toFixed(0)}/${unit}`;
  };

  const formatChange = (change: number | null) => {
    if (change === null) return '—';
    const sign = change > 0 ? '+' : '';
    return `${sign}£${change.toFixed(0)}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fertilizer': return '🌱';
      case 'seed': return '🌾';
      case 'fuel': return '⛽';
      case 'chemical': return '🧪';
      default: return '📦';
    }
  };

  const triggeredAlerts = alerts.filter(a => a.triggered && a.isActive);
  const activeAlerts = alerts.filter(a => a.isActive);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Loading input prices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">💰 Input Cost Tracker</h2>
          <p className="text-sm text-gray-600">Track prices, set alerts, and time your purchases to save thousands</p>
        </div>
        <button
          onClick={handleRefreshPrices}
          disabled={refreshing}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {refreshing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Updating...</span>
            </>
          ) : (
            <>
              <span>🔄</span>
              <span>Refresh Prices</span>
            </>
          )}
        </button>
      </div>

      {/* Active Price Alerts */}
      {triggeredAlerts.length > 0 && (
        <div className="mb-6">
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-green-800 flex items-center">
                🔔 {triggeredAlerts.length} PRICE ALERT{triggeredAlerts.length > 1 ? 'S' : ''} TRIGGERED!
              </h3>
            </div>
            <div className="space-y-3">
              {triggeredAlerts.map((alert) => {
                const input = inputs.find(i => i.id === alert.inputId);
                const currentPrice = input?.currentPrice || 0;
                const savings = Math.abs((alert.targetPrice - currentPrice) * alert.quantity);

                return (
                  <div key={alert.id} className="bg-white rounded-lg p-4 border border-green-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-bold text-gray-800 mb-1">
                          🎯 {alert.inputName} {alert.alertType === 'BELOW' ? 'dropped to' : 'rose to'} {formatPrice(currentPrice, alert.unit)}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Your target: {formatPrice(alert.targetPrice, alert.unit)}
                        </div>
                        <div className="text-sm font-semibold text-green-700">
                          Potential saving: £{savings.toFixed(0)} on {alert.quantity} {alert.unit}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium">
                          BUY NOW
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Active Alerts</div>
          <div className="text-2xl font-bold text-gray-800">{activeAlerts.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Purchases This Year</div>
          <div className="text-2xl font-bold text-gray-800">{purchases.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Total Spent</div>
          <div className="text-2xl font-bold text-gray-800">
            £{purchases.reduce((sum, p) => sum + p.totalCost, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 mb-6">
        <button
          onClick={() => {
            setSelectedInput(null);
            setNewPrice('');
            setShowUpdatePrice(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          📝 Update Price
        </button>
        <button
          onClick={() => {
            setSelectedInput(null);
            setAlertForm({ targetPrice: '', quantity: '', alertType: 'BELOW' });
            setShowAddAlert(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
        >
          🔔 Set Alert
        </button>
        <button
          onClick={() => {
            setSelectedInput(null);
            setPurchaseForm({
              quantity: '',
              pricePerUnit: '',
              supplier: '',
              purchaseDate: new Date().toISOString().split('T')[0],
              notes: '',
            });
            setShowAddPurchase(true);
          }}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-medium"
        >
          📦 Log Purchase
        </button>
      </div>

      {/* Input Price Dashboard */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Input Price Dashboard</h3>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Input</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">Current Price</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">vs Last Week</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">vs Last Month</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700">Trend</th>
                <th className="text-center px-4 py-3 text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inputs.map((input) => (
                <tr key={input.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{getCategoryIcon(input.category)}</span>
                      <div>
                        <div className="font-medium text-gray-800">{input.name}</div>
                        <div className="text-xs text-gray-500">
                          {input.lastUpdated ? `Updated ${new Date(input.lastUpdated).toLocaleDateString()}` : 'No data'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-gray-800">
                      {formatPrice(input.currentPrice, input.unit)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={input.weekChange && input.weekChange < 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatChange(input.weekChange)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={input.monthChange && input.monthChange < 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatChange(input.monthChange)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xl font-bold ${getTrendColor(input.trend)}`}>
                      {getTrendIcon(input.trend)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => {
                        setSelectedInput(input);
                        setAlertForm({ targetPrice: '', quantity: '', alertType: 'BELOW' });
                        setShowAddAlert(true);
                      }}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      Set Alert
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Purchases */}
      {purchases.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Purchases</h3>
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
            {purchases.slice(0, 5).map((purchase) => (
              <div key={purchase.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">
                      {purchase.quantity} {purchase.inputName} @ £{purchase.pricePerUnit}/{purchase.inputName.includes('Diesel') ? 'L' : 't'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(purchase.purchaseDate).toLocaleDateString()} • {purchase.supplier}
                    </div>
                    {purchase.notes && (
                      <div className="text-xs text-gray-500 mt-1">{purchase.notes}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800">£{purchase.totalCost.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">🔔 Set Price Alert</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Input
              </label>
              <select
                value={selectedInput?.id || ''}
                onChange={(e) => {
                  const input = inputs.find(i => i.id === e.target.value);
                  setSelectedInput(input || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">-- Select an input --</option>
                {inputs.map(input => (
                  <option key={input.id} value={input.id}>
                    {getCategoryIcon(input.category)} {input.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedInput && (
              <>
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="text-sm text-gray-600 mb-1">Current Price</div>
                  <div className="text-xl font-bold text-gray-800">
                    {formatPrice(selectedInput.currentPrice, selectedInput.unit)}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alert Type
                  </label>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setAlertForm({ ...alertForm, alertType: 'BELOW' })}
                      className={`flex-1 px-4 py-2 rounded-lg border ${
                        alertForm.alertType === 'BELOW'
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      📉 Alert if BELOW
                    </button>
                    <button
                      onClick={() => setAlertForm({ ...alertForm, alertType: 'ABOVE' })}
                      className={`flex-1 px-4 py-2 rounded-lg border ${
                        alertForm.alertType === 'ABOVE'
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      📈 Alert if ABOVE
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Price ({selectedInput.unit === 'pence/L' ? 'pence/L' : '£/' + selectedInput.unit})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={alertForm.targetPrice}
                    onChange={(e) => setAlertForm({ ...alertForm, targetPrice: e.target.value })}
                    placeholder={selectedInput.unit === 'pence/L' ? 'e.g. 60.0' : 'e.g. 300'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity ({selectedInput.unit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={alertForm.quantity}
                    onChange={(e) => setAlertForm({ ...alertForm, quantity: e.target.value })}
                    placeholder="e.g. 100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used to calculate potential savings
                  </p>
                </div>

                {alertForm.targetPrice && alertForm.quantity && selectedInput.currentPrice && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <div className="text-sm text-gray-600 mb-1">Potential Savings</div>
                    <div className="text-xl font-bold text-blue-700">
                      £{Math.abs(
                        (parseFloat(alertForm.targetPrice) - selectedInput.currentPrice) *
                        parseFloat(alertForm.quantity)
                      ).toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      if price {alertForm.alertType === 'BELOW' ? 'drops' : 'rises'} to target
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowAddAlert(false);
                  setSelectedInput(null);
                  setAlertForm({ targetPrice: '', quantity: '', alertType: 'BELOW' });
                }}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAlert}
                disabled={!selectedInput || !alertForm.targetPrice || !alertForm.quantity}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Create Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-md w-full my-8">
            <h3 className="text-xl font-bold mb-4">📦 Log Purchase</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Input
              </label>
              <select
                value={selectedInput?.id || ''}
                onChange={(e) => {
                  const input = inputs.find(i => i.id === e.target.value);
                  setSelectedInput(input || null);
                  if (input?.currentPrice) {
                    setPurchaseForm({ ...purchaseForm, pricePerUnit: input.currentPrice.toString() });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">-- Select an input --</option>
                {inputs.map(input => (
                  <option key={input.id} value={input.id}>
                    {getCategoryIcon(input.category)} {input.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedInput && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity ({selectedInput.unit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={purchaseForm.quantity}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })}
                    placeholder="e.g. 100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Unit ({selectedInput.unit === 'pence/L' ? 'pence/L' : '£/' + selectedInput.unit})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={purchaseForm.pricePerUnit}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, pricePerUnit: e.target.value })}
                    placeholder={selectedInput.unit === 'pence/L' ? 'e.g. 65.5' : 'e.g. 350'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {purchaseForm.quantity && purchaseForm.pricePerUnit && (
                  <div className="bg-purple-50 rounded-lg p-3 mb-4">
                    <div className="text-sm text-gray-600 mb-1">Total Cost</div>
                    <div className="text-2xl font-bold text-purple-700">
                      £{(parseFloat(purchaseForm.quantity) * parseFloat(purchaseForm.pricePerUnit)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier
                  </label>
                  <input
                    type="text"
                    value={purchaseForm.supplier}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, supplier: e.target.value })}
                    placeholder="e.g. Yara UK, AgriSupplies Ltd"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={purchaseForm.purchaseDate}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, purchaseDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={purchaseForm.notes}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, notes: e.target.value })}
                    placeholder="e.g. Bought at discount, spring delivery"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowAddPurchase(false);
                  setSelectedInput(null);
                  setPurchaseForm({
                    quantity: '',
                    pricePerUnit: '',
                    supplier: '',
                    purchaseDate: new Date().toISOString().split('T')[0],
                    notes: '',
                  });
                }}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleLogPurchase}
                disabled={!selectedInput || !purchaseForm.quantity || !purchaseForm.pricePerUnit}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Log Purchase
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpdatePrice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">📝 Update Price</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Input
              </label>
              <select
                value={selectedInput?.id || ''}
                onChange={(e) => {
                  const input = inputs.find(i => i.id === e.target.value);
                  setSelectedInput(input || null);
                  setNewPrice('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select an input --</option>
                {inputs.map(input => (
                  <option key={input.id} value={input.id}>
                    {getCategoryIcon(input.category)} {input.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedInput && (
              <>
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="text-sm text-gray-600 mb-1">Current Price</div>
                  <div className="text-xl font-bold text-gray-800">
                    {formatPrice(selectedInput.currentPrice, selectedInput.unit)}
                  </div>
                  {selectedInput.lastUpdated && (
                    <div className="text-xs text-gray-500 mt-1">
                      Last updated {new Date(selectedInput.lastUpdated).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Price ({selectedInput.unit === 'pence/L' ? 'pence/L' : '£/' + selectedInput.unit})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder={selectedInput.unit === 'pence/L' ? 'e.g. 65.5' : 'e.g. 350'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowUpdatePrice(false);
                  setSelectedInput(null);
                  setNewPrice('');
                }}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePrice}
                disabled={!selectedInput || !newPrice || parseFloat(newPrice) <= 0}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Update Price
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
