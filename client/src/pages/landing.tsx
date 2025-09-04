import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const timestamp = Date.now();
  return (
    <div style={{ background: 'red', color: 'white', padding: '50px', textAlign: 'center' }}>
      <h1>NEW LANDING PAGE - TIMESTAMP: {timestamp}</h1>
      <p>If you see this, the file changes are working</p>
    </div>
  );
}
