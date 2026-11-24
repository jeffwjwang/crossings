export default function AdminPage() {
  return (
    <main style={{ maxWidth: 640, margin: '48px auto', background: '#fffaf0', padding: 24, borderRadius: 16 }}>
      <h1>Schedule</h1>
      <p>by Vervia. This admin page is a placeholder. The calendar, uploads, and stats are not built yet.</p>
      <p>Publishing will be a POST to /api/admin/puzzles with the bearer token from ADMIN_API_TOKEN.</p>
    </main>
  );
}
