export default function DashboardMinimal() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Agricog Assist - Test Mode</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Simple Test Panel 1 */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Panel 1</h2>
            <p className="text-muted-foreground mb-4">If you can read this, React is working.</p>
            <button 
              className="bg-accent text-accent-foreground px-4 py-2 rounded hover:bg-accent/90"
              onClick={() => alert('Button clicked!')}
            >
              Test Button
            </button>
          </div>

          {/* Simple Test Panel 2 */}
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Panel 2</h2>
            <p className="text-muted-foreground mb-4">Basic functionality test.</p>
            <input 
              type="text" 
              placeholder="Type something..."
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* FastBots iframe */}
          <div className="bg-card border rounded-lg p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Farm Assistant (Working)</h2>
            <iframe
              src="https://www.fastbots.ai/embed/cm6n6gvpq00018g0o70d1lfey"
              width="100%"
              height="400"
              frameBorder="0"
              className="rounded border"
              title="Farm Assistant"
            />
          </div>
        </div>
      </div>
    </div>
  );
}