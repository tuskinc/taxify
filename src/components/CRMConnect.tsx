interface CRMConnectProps {
  onComplete: (data: unknown) => void;
  onError: (error: string) => void;
}

export default function CRMConnect({ onComplete, onError }: CRMConnectProps) {
  const connect = async (provider: string) => {
    try {
      const res = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, action: 'connect' })
      });
      const json = await res.json() as { error?: string; authUrl?: string };
      if (!res.ok) throw new Error(json.error ?? 'Connect failed');
      // In real flow, redirect to json.authUrl
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Connect failed');
    }
  };

  const fetchData = async (provider: string) => {
    try {
      const res = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, action: 'fetch' })
      });
      const json = await res.json() as { data: unknown; error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Fetch failed');
      onComplete(json.data);
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Fetch failed');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-24px bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-16px">Connect CRM/Accounting</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-16px">
        {['quickbooks','xero','zoho','hubspot','salesforce'].map(p => (
          <div key={p} className="card p-16px">
            <h3 className="font-medium capitalize">{p}</h3>
            <div className="btn-row mt-12px">
              <button className="btn btn-secondary" onClick={() => { void connect(p); }}>Connect</button>
              <button className="btn btn-primary" onClick={() => { void fetchData(p); }}>Fetch</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


