import { APP_DESCRIPTION, APP_TITLE } from "@/lib/constants";
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = `${APP_TITLE} — Price vs Performance`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0a0a0c",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(50,215,75,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(50,215,75,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Pareto curve decoration */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 80,
          right: 80,
          height: 220,
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        {/* Simulated frontier dots */}
        {[
          { left: "5%", bottom: "10%", size: 14, dim: false },
          { left: "18%", bottom: "45%", size: 14, dim: false },
          { left: "36%", bottom: "72%", size: 14, dim: false },
          { left: "60%", bottom: "88%", size: 14, dim: false },
          { left: "85%", bottom: "94%", size: 14, dim: false },
          { left: "25%", bottom: "18%", size: 10, dim: true },
          { left: "45%", bottom: "35%", size: 10, dim: true },
          { left: "70%", bottom: "60%", size: 10, dim: true },
          { left: "12%", bottom: "70%", size: 10, dim: true },
        ].map((dot, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: dot.left,
              bottom: dot.bottom,
              width: dot.size,
              height: dot.size,
              borderRadius: "50%",
              backgroundColor: dot.dim ? "rgba(161,161,166,0.4)" : "#32D74B",
              boxShadow: dot.dim ? "none" : "0 0 12px rgba(50,215,75,0.6)",
            }}
          />
        ))}
      </div>

      {/* Green accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: "#32D74B",
        }}
      />

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: "rgba(50,215,75,0.15)",
              border: "1.5px solid rgba(50,215,75,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 5 26 C 8 20, 14 11, 27 6"
                stroke="#32D74B"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <circle cx="6.5" cy="23" r="2.4" fill="#32D74B" />
              <circle cx="14" cy="13.5" r="2.4" fill="#32D74B" />
              <circle cx="24.5" cy="7.5" r="2.4" fill="#32D74B" />
              <circle cx="20" cy="21" r="1.7" fill="#a1a1a6" opacity="0.5" />
              <circle cx="11" cy="24" r="1.7" fill="#a1a1a6" opacity="0.5" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 18,
              color: "#32D74B",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            frontier-intelligence
          </span>
        </div>

        <h1
          style={{
            fontSize: 68,
            fontWeight: 700,
            color: "#f5f5f7",
            margin: 0,
            textAlign: "center",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          {APP_TITLE}
        </h1>

        <p
          style={{
            fontSize: 26,
            color: "#a1a1a6",
            margin: 0,
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          {APP_DESCRIPTION}
        </p>

        <div
          style={{
            display: "flex",
            gap: 20,
            marginTop: 16,
          }}
        >
          {["Arena ELO", "OpenRouter Pricing", "Pareto Optimal"].map((tag) => (
            <div
              key={tag}
              style={{
                padding: "8px 20px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.12)",
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "#a1a1a6",
                fontSize: 15,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    </div>,
    { ...size }
  );
}
