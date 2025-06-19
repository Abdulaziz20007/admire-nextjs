import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

export default function AdminTest() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      style={{
        padding: "2rem",
        textAlign: "center",
        minHeight: "100vh",
        background: "var(--background)",
        color: "var(--text-primary)",
      }}
    >
      <h1>Admin Test Page</h1>
      <p>This is a simple test page to check if the admin routing works.</p>
      <p>Current theme: {theme}</p>
      <button
        onClick={toggleTheme}
        style={{ padding: "0.5rem 1rem", margin: "1rem" }}
      >
        Toggle Theme
      </button>
    </div>
  );
}
