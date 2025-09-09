import React from "react";

export default function DashboardTestMinimal() {
  console.log('🧪 TEST: Minimal dashboard loaded successfully!');
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🧪 TEST: Minimal Dashboard</h1>
      <p>This is a minimal dashboard to test if React is loading properly.</p>
      <p>If you can see this text, React is working!</p>
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', backgroundColor: '#f0f0f0' }}>
        <strong>Status:</strong> React app is loading successfully ✅
      </div>
    </div>
  );
}