"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ background: "#050A18", color: "#F1F5F9", fontFamily: "Inter, sans-serif", padding: 24 }}>
        <h1 style={{ color: "#EF4444" }}>Application error</h1>
        <pre style={{ background: "#0B1224", padding: 16, overflow: "auto", border: "1px solid #1E2D4D" }}>
          {error.message}
        </pre>
        <button
          type="button"
          onClick={reset}
          style={{ background: "#00D4FF", color: "#050A18", padding: "8px 16px", marginTop: 16, cursor: "pointer" }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
