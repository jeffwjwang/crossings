export default function HomePage() {
  return (
    <main style={{ maxWidth: 640, margin: '48px auto', background: '#fffaf0', padding: 24, borderRadius: 16 }}>
      <h1 style={{ marginBottom: 0 }}>Crossings</h1>
      <p style={{ marginTop: 4, color: '#6b4e12' }}>by Vervia</p>
      <p>This folder is a local API skeleton. It is not deployed and it has no secrets.</p>
      <ul>
        <li>GET /api/v1/health</li>
        <li>GET /api/v1/puzzles/daily — sample ids, no keys</li>
        <li>GET /api/v1/puzzles/[id] — public puzzle JSON, key is null</li>
        <li>POST /api/admin/puzzles — requires ADMIN_API_TOKEN, does not store anything</li>
      </ul>
    </main>
  );
}
