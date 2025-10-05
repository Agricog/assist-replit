import { useState, useEffect } from 'react';

interface Equipment {
  id: number;
  name: string;
  type: string;
  make?: string;
  model?: string;
  year?: number;
}

interface FuelLog {
  id: number;
  equipmentId?: number;
  equipmentName?: string;
  fuelType: string;
  litres: number;
  costPerLitre?: number;
  totalCost?: number;
  operation?: string;
  areaHectares?: number;
  litresPerHectare?: number;
  logDate: string;
  notes?: string;
}

interface FuelTank {
  id: number;
  tankName: string;
  fuelType: string;
  capacityLitres: number;
  currentLevelLitres: number;
  alertThresholdLitres?: number;
  lastFilled?: string;
}

interface FuelPrice {
  id: string;
  name: string;
  currentPrice: number | null;
  unit: string;
}

export default function FuelUsageTracker() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [fuelTanks, setFuelTanks] = useState<FuelTank[]>([]);
  const [fuelPrices, setFuelPrices] = useState<FuelPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [showTankForm, setShowTankForm] = useState(false);

  const [logForm, setLogForm] = useState({
    equipmentId: '',
    fuelType: 'red_diesel',
    litres: '',
    costPerLitre: '',
    operation: '',
    areaHectares: '',
    logDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [equipmentForm, setEquipmentForm] = useState({
    name: '',
    type: 'Tractor',
    make: '',
    model: '',
    year: '',
  });

  const [tankForm, setTankForm] = useState({
    tankName: '',
    fuelType: 'red_diesel',
    capacityLitres: '',
    currentLevelLitres: '',
    alertThresholdLitres: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Auto-fill cost per litre when fuel type changes
    if (logForm.fuelType) {
      const price = getFuelPrice(logForm.fuelType);
      if (price !== null) {
        setLogForm({ ...logForm, costPerLitre: (price / 100).toFixed(2) }); // Convert pence to pounds
      }
    }
  }, [logForm.fuelType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [equipmentRes, logsRes, tanksRes, pricesRes] = await Promise.all([
        fetch('/api/equipment', { credentials: 'include' }),
        fetch('/api/fuel-logs', { credentials: 'include' }),
        fetch('/api/fuel-tanks', { credentials: 'include' }),
        fetch('/api/input-prices', { credentials: 'include' }),
      ]);

      const equipmentData = await equipmentRes.json();
      const logsData = await logsRes.json();
      const tanksData = await tanksRes.json();
      const pricesData = await pricesRes.json();

      setEquipment(equipmentData);
      setFuelLogs(logsData);
      setFuelTanks(tanksData);
      setFuelPrices(pricesData.filter((p: FuelPrice) => p.id === 'red_diesel' || p.id === 'adblue'));
    } catch (error) {
      console.error('Error fetching fuel tracker data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFuelPrice = (fuelType: string): number | null => {
    const fuelId = fuelType === 'red_diesel' ? 'red_diesel' : 'adblue';
    const price = fuelPrices.find(p => p.id === fuelId);
    return price?.currentPrice || null;
  };

  const handleLogFuel = async () => {
    if (!logForm.fuelType || !logForm.litres || !logForm.logDate) return;

    const selectedEquipment = equipment.find(e => e.id === parseInt(logForm.equipmentId));

    try {
      const response = await fetch('/api/fuel-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          equipmentId: logForm.equipmentId || null,
          equipmentName: selectedEquipment?.name || null,
          fuelType: logForm.fuelType,
          litres: parseFloat(logForm.litres),
          costPerLitre: logForm.costPerLitre ? parseFloat(logForm.costPerLitre) : null,
          operation: logForm.operation || null,
          areaHectares: logForm.areaHectares ? parseFloat(logForm.areaHectares) : null,
          logDate: logForm.logDate,
          notes: logForm.notes || null,
        }),
      });

      if (response.ok) {
        await fetchData();
        setShowLogForm(false);
        setLogForm({
          equipmentId: '',
          fuelType: 'red_diesel',
          litres: '',
          costPerLitre: '',
          operation: '',
          areaHectares: '',
          logDate: new Date().toISOString().split('T')[0],
          notes: '',
        });
      }
    } catch (error) {
      console.error('Error logging fuel:', error);
    }
  };

  const handleAddEquipment = async () => {
    if (!equipmentForm.name || !equipmentForm.type) return;

    try {
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: equipmentForm.name,
          type: equipmentForm.type,
          make: equipmentForm.make || null,
          model: equipmentForm.model || null,
          year: equipmentForm.year ? parseInt(equipmentForm.year) : null,
        }),
      });

      if (response.ok) {
        await fetchData();
        setShowEquipmentForm(false);
        setEquipmentForm({ name: '', type: 'Tractor', make: '', model: '', year: '' });
      }
    } catch (error) {
      console.error('Error adding equipment:', error);
    }
  };

  const handleAddTank = async () => {
    if (!tankForm.tankName || !tankForm.fuelType || !tankForm.capacityLitres) return;

    try {
      const response = await fetch('/api/fuel-tanks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tankName: tankForm.tankName,
          fuelType: tankForm.fuelType,
          capacityLitres: parseFloat(tankForm.capacityLitres),
          currentLevelLitres: tankForm.currentLevelLitres ? parseFloat(tankForm.currentLevelLitres) : 0,
          alertThresholdLitres: tankForm.alertThresholdLitres ? parseFloat(tankForm.alertThresholdLitres) : null,
        }),
      });

      if (response.ok) {
        await fetchData();
        setShowTankForm(false);
        setTankForm({
          tankName: '',
          fuelType: 'red_diesel',
          capacityLitres: '',
          currentLevelLitres: '',
          alertThresholdLitres: '',
        });
      }
    } catch (error) {
      console.error('Error adding tank:', error);
    }
  };

  // Calculate stats
  const totalLitresThisMonth = fuelLogs
    .filter(log => new Date(log.logDate).getMonth() === new Date().getMonth())
    .reduce((sum, log) => sum + log.litres, 0);

  const totalCostThisMonth = fuelLogs
    .filter(log => new Date(log.logDate).getMonth() === new Date().getMonth())
    .reduce((sum, log) => sum + (log.totalCost || 0), 0);

  const averageLPerHa = fuelLogs
    .filter(log => log.litresPerHectare)
    .reduce((sum, log, _, arr) => sum + (log.litresPerHectare || 0) / arr.length, 0);

  const lowTanks = fuelTanks.filter(tank =>
    tank.alertThresholdLitres && tank.currentLevelLitres <= tank.alertThresholdLitres
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Loading fuel data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">⛽ Fuel Usage Tracker</h2>
        <p className="text-sm text-gray-600">Track diesel consumption, monitor costs, and optimize equipment efficiency</p>
      </div>

      {/* Low Tank Alerts */}
      {lowTanks.length > 0 && (
        <div className="mb-6">
          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
            <h3 className="font-bold text-red-800 mb-2">
              🚨 {lowTanks.length} TANK{lowTanks.length > 1 ? 'S' : ''} LOW!
            </h3>
            {lowTanks.map(tank => (
              <div key={tank.id} className="text-sm text-red-700">
                {tank.tankName}: {tank.currentLevelLitres}L / {tank.capacityLitres}L
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">This Month</div>
          <div className="text-2xl font-bold text-gray-800">{totalLitresThisMonth.toFixed(0)}L</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Cost This Month</div>
          <div className="text-2xl font-bold text-gray-800">£{totalCostThisMonth.toFixed(0)}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Avg L/ha</div>
          <div className="text-2xl font-bold text-gray-800">{averageLPerHa.toFixed(1)}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Equipment</div>
          <div className="text-2xl font-bold text-gray-800">{equipment.length}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 mb-6">
        <button
          onClick={() => setShowLogForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
        >
          📝 Log Fuel Usage
        </button>
        <button
          onClick={() => setShowEquipmentForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          🚜 Add Equipment
        </button>
        <button
          onClick={() => setShowTankForm(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-medium"
        >
          🛢️ Add Tank
        </button>
      </div>

      {/* Fuel Logs Table */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Fuel Usage</h3>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Equipment</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Operation</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Fuel</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">Litres</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">Area (ha)</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">L/ha</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fuelLogs.slice(0, 20).map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {new Date(log.logDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {log.equipmentName || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {log.operation || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {log.fuelType === 'red_diesel' ? '⛽ Red Diesel' : '💧 AdBlue'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-800">
                    {log.litres.toFixed(1)}L
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-800">
                    {log.areaHectares?.toFixed(1) || '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-800">
                    {log.litresPerHectare?.toFixed(1) || '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-800">
                    £{log.totalCost?.toFixed(2) || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Fuel Modal */}
      {showLogForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-md w-full my-8">
            <h3 className="text-xl font-bold mb-4">📝 Log Fuel Usage</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Equipment (optional)</label>
              <select
                value={logForm.equipmentId}
                onChange={(e) => setLogForm({ ...logForm, equipmentId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">-- None / General Use --</option>
                {equipment.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
              <select
                value={logForm.fuelType}
                onChange={(e) => setLogForm({ ...logForm, fuelType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="red_diesel">⛽ Red Diesel</option>
                <option value="adblue">💧 AdBlue</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Litres</label>
              <input
                type="number"
                step="0.1"
                value={logForm.litres}
                onChange={(e) => setLogForm({ ...logForm, litres: e.target.value })}
                placeholder="e.g. 150"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Cost per Litre (£)</label>
              <input
                type="number"
                step="0.01"
                value={logForm.costPerLitre}
                onChange={(e) => setLogForm({ ...logForm, costPerLitre: e.target.value })}
                placeholder="Auto-filled from Input Costs"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Operation</label>
              <select
                value={logForm.operation}
                onChange={(e) => setLogForm({ ...logForm, operation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">-- Select operation --</option>
                <option value="Ploughing">Ploughing</option>
                <option value="Drilling">Drilling</option>
                <option value="Spraying">Spraying</option>
                <option value="Fertilizing">Fertilizing</option>
                <option value="Harvesting">Harvesting</option>
                <option value="Transport">Transport</option>
                <option value="Baling">Baling</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Area (hectares)</label>
              <input
                type="number"
                step="0.1"
                value={logForm.areaHectares}
                onChange={(e) => setLogForm({ ...logForm, areaHectares: e.target.value })}
                placeholder="e.g. 25"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={logForm.logDate}
                onChange={(e) => setLogForm({ ...logForm, logDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {logForm.litres && logForm.areaHectares && (
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <div className="text-sm text-gray-600">Efficiency</div>
                <div className="text-xl font-bold text-blue-700">
                  {(parseFloat(logForm.litres) / parseFloat(logForm.areaHectares)).toFixed(1)} L/ha
                </div>
              </div>
            )}

            {logForm.litres && logForm.costPerLitre && (
              <div className="bg-green-50 rounded-lg p-3 mb-4">
                <div className="text-sm text-gray-600">Total Cost</div>
                <div className="text-xl font-bold text-green-700">
                  £{(parseFloat(logForm.litres) * parseFloat(logForm.costPerLitre)).toFixed(2)}
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowLogForm(false);
                  setLogForm({
                    equipmentId: '',
                    fuelType: 'red_diesel',
                    litres: '',
                    costPerLitre: '',
                    operation: '',
                    areaHectares: '',
                    logDate: new Date().toISOString().split('T')[0],
                    notes: '',
                  });
                }}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleLogFuel}
                disabled={!logForm.fuelType || !logForm.litres || !logForm.logDate}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Log Fuel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Equipment Modal */}
      {showEquipmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">🚜 Add Equipment</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={equipmentForm.name}
                onChange={(e) => setEquipmentForm({ ...equipmentForm, name: e.target.value })}
                placeholder="e.g. Tractor 1, Combine"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={equipmentForm.type}
                onChange={(e) => setEquipmentForm({ ...equipmentForm, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Tractor">Tractor</option>
                <option value="Combine">Combine</option>
                <option value="Sprayer">Sprayer</option>
                <option value="Loader">Loader</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Make (optional)</label>
              <input
                type="text"
                value={equipmentForm.make}
                onChange={(e) => setEquipmentForm({ ...equipmentForm, make: e.target.value })}
                placeholder="e.g. John Deere, Massey Ferguson"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Model (optional)</label>
              <input
                type="text"
                value={equipmentForm.model}
                onChange={(e) => setEquipmentForm({ ...equipmentForm, model: e.target.value })}
                placeholder="e.g. 6155R"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowEquipmentForm(false);
                  setEquipmentForm({ name: '', type: 'Tractor', make: '', model: '', year: '' });
                }}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEquipment}
                disabled={!equipmentForm.name || !equipmentForm.type}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Equipment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Tank Modal */}
      {showTankForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">🛢️ Add Fuel Tank</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tank Name</label>
              <input
                type="text"
                value={tankForm.tankName}
                onChange={(e) => setTankForm({ ...tankForm, tankName: e.target.value })}
                placeholder="e.g. Main Diesel Tank"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
              <select
                value={tankForm.fuelType}
                onChange={(e) => setTankForm({ ...tankForm, fuelType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="red_diesel">⛽ Red Diesel</option>
                <option value="adblue">💧 AdBlue</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Capacity (litres)</label>
              <input
                type="number"
                step="1"
                value={tankForm.capacityLitres}
                onChange={(e) => setTankForm({ ...tankForm, capacityLitres: e.target.value })}
                placeholder="e.g. 5000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Level (litres)</label>
              <input
                type="number"
                step="1"
                value={tankForm.currentLevelLitres}
                onChange={(e) => setTankForm({ ...tankForm, currentLevelLitres: e.target.value })}
                placeholder="e.g. 2500"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Alert Threshold (litres)</label>
              <input
                type="number"
                step="1"
                value={tankForm.alertThresholdLitres}
                onChange={(e) => setTankForm({ ...tankForm, alertThresholdLitres: e.target.value })}
                placeholder="e.g. 500"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">Alert when tank drops below this level</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowTankForm(false);
                  setTankForm({
                    tankName: '',
                    fuelType: 'red_diesel',
                    capacityLitres: '',
                    currentLevelLitres: '',
                    alertThresholdLitres: '',
                  });
                }}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTank}
                disabled={!tankForm.tankName || !tankForm.fuelType || !tankForm.capacityLitres}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Tank
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
