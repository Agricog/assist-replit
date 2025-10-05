import { useState, useEffect } from 'react';

interface SubsidyScheme {
  id: number;
  name: string;
  description: string;
  schemeType: string;
  typicalAmountMin: number;
  typicalAmountMax: number;
  deadlineMonth: number;
  deadlineDay: number;
  eligibilitySummary: string;
  applicationUrl: string;
  isActive: boolean;
}

interface UserApplication {
  id: number;
  schemeId?: number;
  schemeName: string;
  status: string;
  estimatedAnnualPayment?: number;
  actualAnnualPayment?: number;
  applicationDate?: string;
  approvalDate?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export default function SubsidyTracker() {
  const [schemes, setSchemes] = useState<SubsidyScheme[]>([]);
  const [applications, setApplications] = useState<UserApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSchemeModal, setShowSchemeModal] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<SubsidyScheme | null>(null);

  const [appForm, setAppForm] = useState({
    schemeId: '',
    schemeName: '',
    status: 'planning',
    estimatedAnnualPayment: '',
    actualAnnualPayment: '',
    applicationDate: '',
    approvalDate: '',
    startDate: '',
    endDate: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schemesRes, appsRes] = await Promise.all([
        fetch('/api/subsidy-schemes', { credentials: 'include' }),
        fetch('/api/user-applications', { credentials: 'include' }),
      ]);

      const schemesData = await schemesRes.json();
      const appsData = await appsRes.json();

      setSchemes(schemesData);
      setApplications(appsData);
    } catch (error) {
      console.error('Error fetching subsidy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddApplication = async () => {
    if (!appForm.schemeName || !appForm.status) return;

    try {
      const response = await fetch('/api/user-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          schemeId: appForm.schemeId || null,
          schemeName: appForm.schemeName,
          status: appForm.status,
          estimatedAnnualPayment: appForm.estimatedAnnualPayment ? parseFloat(appForm.estimatedAnnualPayment) : null,
          actualAnnualPayment: appForm.actualAnnualPayment ? parseFloat(appForm.actualAnnualPayment) : null,
          applicationDate: appForm.applicationDate || null,
          approvalDate: appForm.approvalDate || null,
          startDate: appForm.startDate || null,
          endDate: appForm.endDate || null,
          notes: appForm.notes || null,
        }),
      });

      if (response.ok) {
        await fetchData();
        setShowAddModal(false);
        setAppForm({
          schemeId: '',
          schemeName: '',
          status: 'planning',
          estimatedAnnualPayment: '',
          actualAnnualPayment: '',
          applicationDate: '',
          approvalDate: '',
          startDate: '',
          endDate: '',
          notes: '',
        });
      }
    } catch (error) {
      console.error('Error adding application:', error);
    }
  };

  // Calculate deadline alerts
  const getDeadlineStatus = (month: number, day: number) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const deadlineDate = new Date(currentYear, month - 1, day);

    // If deadline has passed this year, use next year
    if (deadlineDate < now) {
      deadlineDate.setFullYear(currentYear + 1);
    }

    const daysUntil = Math.floor((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) return { status: 'passed', daysUntil, color: 'gray' };
    if (daysUntil <= 7) return { status: 'urgent', daysUntil, color: 'red' };
    if (daysUntil <= 30) return { status: 'soon', daysUntil, color: 'amber' };
    return { status: 'normal', daysUntil, color: 'green' };
  };

  const urgentDeadlines = schemes.filter(s => {
    const status = getDeadlineStatus(s.deadlineMonth, s.deadlineDay);
    return status.status === 'urgent' || status.status === 'soon';
  });

  const totalEstimatedIncome = applications
    .filter(a => a.status === 'approved' || a.status === 'receiving_payments')
    .reduce((sum, a) => sum + (a.actualAnnualPayment || a.estimatedAnnualPayment || 0), 0);

  const activeApplications = applications.filter(a =>
    a.status === 'submitted' || a.status === 'approved' || a.status === 'receiving_payments'
  );

  const deadlinesThisMonth = schemes.filter(s => {
    const now = new Date();
    return s.deadlineMonth === now.getMonth() + 1;
  });

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { text: string; color: string } } = {
      planning: { text: '📝 Planning', color: 'bg-gray-100 text-gray-700' },
      submitted: { text: '📤 Submitted', color: 'bg-blue-100 text-blue-700' },
      approved: { text: '✅ Approved', color: 'bg-green-100 text-green-700' },
      receiving_payments: { text: '💰 Receiving', color: 'bg-green-100 text-green-700' },
      rejected: { text: '❌ Rejected', color: 'bg-red-100 text-red-700' },
      expired: { text: '⏰ Expired', color: 'bg-gray-100 text-gray-700' },
    };

    const badge = badges[status] || badges.planning;
    return <span className={`px-2 py-1 rounded text-xs font-semibold ${badge.color}`}>{badge.text}</span>;
  };

  const formatDeadline = (month: number, day: number) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${monthNames[month - 1]}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Loading subsidy data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">🎯 Subsidy & Grant Tracker</h2>
        <p className="text-sm text-gray-600">Never miss a deadline. Maximize your subsidy income.</p>
      </div>

      {/* Urgent Deadline Alerts */}
      {urgentDeadlines.length > 0 && (
        <div className="mb-6">
          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
            <h3 className="font-bold text-red-800 mb-2">
              ⚠️ {urgentDeadlines.length} UPCOMING DEADLINE{urgentDeadlines.length > 1 ? 'S' : ''}!
            </h3>
            {urgentDeadlines.map(scheme => {
              const deadline = getDeadlineStatus(scheme.deadlineMonth, scheme.deadlineDay);
              return (
                <div key={scheme.id} className="text-sm text-red-700 mb-1">
                  <span className="font-semibold">{scheme.name}</span> - {formatDeadline(scheme.deadlineMonth, scheme.deadlineDay)} ({deadline.daysUntil} days)
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Active Applications</div>
          <div className="text-2xl font-bold text-gray-800">{activeApplications.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Annual Income</div>
          <div className="text-2xl font-bold text-green-600">£{totalEstimatedIncome.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Deadlines This Month</div>
          <div className="text-2xl font-bold text-gray-800">{deadlinesThisMonth.length}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 mb-6">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
        >
          ➕ Add Application
        </button>
        <button
          onClick={() => setShowSchemeModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          📚 Browse Schemes
        </button>
      </div>

      {/* My Applications */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">My Applications</h3>
        {applications.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">No applications yet. Click "Add Application" to get started!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Scheme</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700">Annual Payment</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Dates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applications.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{app.schemeName}</div>
                      {app.notes && <div className="text-xs text-gray-500 mt-1">{app.notes}</div>}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-semibold text-gray-800">
                        £{(app.actualAnnualPayment || app.estimatedAnnualPayment || 0).toLocaleString()}
                      </div>
                      {app.actualAnnualPayment && app.estimatedAnnualPayment && app.actualAnnualPayment !== app.estimatedAnnualPayment && (
                        <div className="text-xs text-gray-500">est: £{app.estimatedAnnualPayment.toLocaleString()}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {app.startDate && app.endDate ? (
                        <div>
                          {new Date(app.startDate).toLocaleDateString()} - {new Date(app.endDate).toLocaleDateString()}
                        </div>
                      ) : (
                        <div>—</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-md w-full my-8">
            <h3 className="text-xl font-bold mb-4">➕ Add Application</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Scheme</label>
              <select
                value={appForm.schemeId}
                onChange={(e) => {
                  const scheme = schemes.find(s => s.id === parseInt(e.target.value));
                  setAppForm({
                    ...appForm,
                    schemeId: e.target.value,
                    schemeName: scheme?.name || '',
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">-- Select from directory or enter custom --</option>
                {schemes.map(scheme => (
                  <option key={scheme.id} value={scheme.id}>{scheme.name}</option>
                ))}
              </select>
            </div>

            {!appForm.schemeId && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Or enter scheme name</label>
                <input
                  type="text"
                  value={appForm.schemeName}
                  onChange={(e) => setAppForm({ ...appForm, schemeName: e.target.value })}
                  placeholder="e.g. Custom Grant Scheme"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={appForm.status}
                onChange={(e) => setAppForm({ ...appForm, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="planning">📝 Planning</option>
                <option value="submitted">📤 Submitted</option>
                <option value="approved">✅ Approved</option>
                <option value="receiving_payments">💰 Receiving Payments</option>
                <option value="rejected">❌ Rejected</option>
                <option value="expired">⏰ Expired</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Annual Payment (£)</label>
              <input
                type="number"
                step="0.01"
                value={appForm.estimatedAnnualPayment}
                onChange={(e) => setAppForm({ ...appForm, estimatedAnnualPayment: e.target.value })}
                placeholder="e.g. 5000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Application Date</label>
              <input
                type="date"
                value={appForm.applicationDate}
                onChange={(e) => setAppForm({ ...appForm, applicationDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={appForm.notes}
                onChange={(e) => setAppForm({ ...appForm, notes: e.target.value })}
                placeholder="e.g. Applied for 3 actions: improved grassland, hedgerows, low input"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAppForm({
                    schemeId: '',
                    schemeName: '',
                    status: 'planning',
                    estimatedAnnualPayment: '',
                    actualAnnualPayment: '',
                    applicationDate: '',
                    approvalDate: '',
                    startDate: '',
                    endDate: '',
                    notes: '',
                  });
                }}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddApplication}
                disabled={!appForm.schemeName || !appForm.status}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Browse Schemes Modal */}
      {showSchemeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">📚 UK Subsidy & Grant Schemes</h3>
              <button
                onClick={() => setShowSchemeModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {schemes.map(scheme => {
                const deadline = getDeadlineStatus(scheme.deadlineMonth, scheme.deadlineDay);
                return (
                  <div key={scheme.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 text-lg">{scheme.name}</h4>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold mr-2">
                            {scheme.schemeType}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            deadline.color === 'red' ? 'bg-red-100 text-red-700' :
                            deadline.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            Deadline: {formatDeadline(scheme.deadlineMonth, scheme.deadlineDay)} ({deadline.daysUntil} days)
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm text-gray-600">Typical Payment</div>
                        <div className="font-bold text-green-600">
                          £{scheme.typicalAmountMin.toLocaleString()} - £{scheme.typicalAmountMax.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-2">{scheme.description}</p>
                    <p className="text-xs text-gray-600 mb-3">
                      <strong>Eligibility:</strong> {scheme.eligibilitySummary}
                    </p>

                    <div className="flex space-x-2">
                      <a
                        href={scheme.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        📄 View Details →
                      </a>
                      <button
                        onClick={() => {
                          setAppForm({
                            ...appForm,
                            schemeId: scheme.id.toString(),
                            schemeName: scheme.name,
                          });
                          setShowSchemeModal(false);
                          setShowAddModal(true);
                        }}
                        className="text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        ➕ Track This
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
