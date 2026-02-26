export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h2
        style={{ marginBottom: "16px", fontSize: "24px", fontWeight: "bold" }}
      >
        404 - Page Not Found
      </h2>
      <p style={{ marginBottom: "24px", color: "#6b7280" }}>
        The page you are looking for does not exist.
      </p>
      <a
        href="/"
        style={{
          padding: "10px 20px",
          backgroundColor: "#f97316",
          color: "white",
          border: "none",
          borderRadius: "6px",
          textDecoration: "none",
          fontSize: "14px",
        }}
      >
        Go Home
      </a>
    </div>
  );
}
