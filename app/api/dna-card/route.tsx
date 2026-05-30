import { ImageResponse } from "next/og";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    const archetype = searchParams.get("archetype") || "Cognitive Learner";
    const conceptual = searchParams.get("conceptual") || "50";
    const retention = searchParams.get("retention") || "50";
    const analytical = searchParams.get("analytical") || "50";
    const consistency = searchParams.get("consistency") || "50";
    const discipline = searchParams.get("discipline") || "50";
    const adaptability = searchParams.get("adaptability") || "50";
    const calibration = searchParams.get("calibration") || "50";
    const efficiency = searchParams.get("efficiency") || "50";

    const metrics = [
      { label: "Conceptual Depth", val: conceptual },
      { label: "Memory Retention", val: retention },
      { label: "Analytical Speed", val: analytical },
      { label: "Consistency Rate", val: consistency },
      { label: "Discipline Index", val: discipline },
      { label: "Adaptability Index", val: adaptability },
      { label: "Calibration Level", val: calibration },
      { label: "Cognitive Efficiency", val: efficiency }
    ];

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, #030712 0%, #0f0728 50%, #1c0a3a 100%)",
            padding: "50px",
            fontFamily: "sans-serif",
            color: "white"
          }}
        >
          {/* Top Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ height: "28px", width: "28px", borderRadius: "8px", background: "#8b5cf6", marginRight: "10px" }} />
              <span style={{ fontSize: "20px", fontWeight: "bold" }}>AskMe AI</span>
            </div>
            <span style={{ fontSize: "11px", fontWeight: "bold", color: "#a78bfa", letterSpacing: "2px", textTransform: "uppercase" }}>
              Cognitive Learning OS
            </span>
          </div>

          {/* Body */}
          <div style={{ display: "flex", flexDirection: "column", marginTop: "30px" }}>
            <span style={{ fontSize: "12px", color: "#a78bfa", letterSpacing: "1px", textTransform: "uppercase", fontWeight: "600" }}>
              My Study Archetype
            </span>
            <span style={{ fontSize: "40px", fontWeight: "extrabold", marginTop: "5px", color: "#ffffff", display: "flex" }}>
              🧬 {archetype}
            </span>
            <span style={{ fontSize: "14px", color: "#9ca3af", marginTop: "10px", maxWidth: "600px", fontWeight: "300" }}>
              This cognitive signature maps 8 dimensions of recall speed, calibration precision, and decay thresholds.
            </span>
          </div>

          {/* Metrics Grid */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", width: "100%", marginTop: "30px", gap: "20px" }}>
            {metrics.map((m) => (
              <div key={m.label} style={{ display: "flex", flexDirection: "column", width: "220px", padding: "12px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "bold", color: "#e5e7eb" }}>
                  <span>{m.label}</span>
                  <span style={{ color: "#a78bfa" }}>{m.val}%</span>
                </div>
                <div style={{ width: "100%", height: "4px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "2px", marginTop: "8px", overflow: "hidden", display: "flex" }}>
                  <div style={{ width: `${m.val}%`, height: "100%", background: "#8b5cf6" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "25px", marginTop: "30px" }}>
            <span style={{ fontSize: "11px", color: "#9ca3af" }}>Calibrated dynamically on study sessions</span>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "#8b5cf6" }}>askme-ai-chi.vercel.app</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630
      }
    );
  } catch (err) {
    console.error("DNA card image generation error:", err);
    return new Response("Failed to generate DNA card image", { status: 500 });
  }
}
