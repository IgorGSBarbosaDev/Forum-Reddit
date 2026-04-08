import { useEffect, useState } from "react";

import { getHealth } from "./lib/api";

export function App() {
  const [status, setStatus] = useState<string>("loading");
  const [service, setService] = useState<string>("-");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getHealth();
        setStatus(data.status);
        setService(data.service);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    }

    void load();
  }, []);

  return (
    <main className="app">
      <h1>Forum Reddit Web</h1>
      <p>This app is running as part of the monorepo.</p>
      <div className="card">
        <h2>Backend health</h2>
        {error ? <p className="error">{error}</p> : <p>Status: {status} ({service})</p>}
      </div>
    </main>
  );
}
