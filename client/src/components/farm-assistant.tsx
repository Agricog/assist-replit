export default function FarmAssistant() {
  return (
    <div className="flex-1 bg-card rounded-lg border border-border overflow-hidden flex flex-col">
      <div className="bg-primary/10 border-b border-border p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Agricog Farm Assistant</h3>
            <p className="text-sm text-muted-foreground">Your personalized agricultural guidance</p>
          </div>
        </div>
      </div>

      {/* FastBots Iframe */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="h-full w-full rounded-lg overflow-hidden border border-border">
          <iframe
            src="https://app.fastbots.ai/embed/cmcuvry22008boelv6guop4fa"
            title="Agricog Farm Assistant"
            className="w-full h-full border-0"
            style={{ minHeight: '500px' }}
            data-testid="farm-assistant-iframe"
            allow="microphone; camera"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      </div>
    </div>
  );
}
