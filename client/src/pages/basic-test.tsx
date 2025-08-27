import { useState } from "react";

export default function BasicTest() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Basic React Test Page</h1>
      <p>If you can see this and interact with it, React is working.</p>
      
      <div style={{ marginBottom: "20px" }}>
        <button 
          onClick={() => setCount(count + 1)}
          style={{ 
            padding: "10px 20px", 
            backgroundColor: "#007acc", 
            color: "white", 
            border: "none", 
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Click Me (Count: {count})
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input 
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type something here..."
          style={{ 
            padding: "8px", 
            border: "1px solid #ccc", 
            borderRadius: "4px",
            width: "200px"
          }}
        />
        <p>You typed: {text}</p>
      </div>

      <div style={{ backgroundColor: "#f0f0f0", padding: "10px", borderRadius: "4px" }}>
        <p><strong>Test Status:</strong></p>
        <p>✓ React rendering: Working</p>
        <p>✓ State management: {count > 0 ? "Working" : "Not tested"}</p>
        <p>✓ Input handling: {text ? "Working" : "Not tested"}</p>
      </div>
    </div>
  );
}