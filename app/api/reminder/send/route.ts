import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { email, frequency, time } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Try to get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let profileName = "Explorer Student";
    let streak = 4;
    let xp = 380;
    let targetTopic = "Electric Potential";
    let recallQuestion = "Why is the electric field inside a hollow conducting sphere zero, even though there is a potential?";

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        profileName = profile.full_name || profileName;
        streak = profile.streak || 0;
        xp = profile.xp || 0;
      }

      // Fetch weak topics from graph_nodes to dynamically customize the reminder
      const { data: weakNodes } = await supabase
        .from("graph_nodes")
        .select("label")
        .eq("user_id", user.id)
        .order("strength", { ascending: true })
        .limit(1);

      if (weakNodes && weakNodes.length > 0) {
        targetTopic = weakNodes[0].label;
      }

      if (targetTopic === "Electric Potential") {
        recallQuestion = "How does the work done in moving a test charge depend on the path between two points in an electrostatic field?";
      } else if (targetTopic.toLowerCase().includes("transcription")) {
        recallQuestion = "What is the key role of RNA Polymerase during DNA transcription, and where does it initiate?";
      } else if (targetTopic.toLowerCase().includes("coulomb")) {
        recallQuestion = "How does Coulomb's force between two charges change when a dielectric medium is introduced between them?";
      }
    } else {
      // Demo fallback - gravitation syllabus
      profileName = "Demo Student";
      streak = 2;
      xp = 180;
      targetTopic = "Weightlessness";
      recallQuestion = "Why does an astronaut feel weightless inside an orbiting space station? Does Earth's gravity still pull on them?";
    }

    const subject = `⏰ Spaced Recall Alert: '${targetTopic}' Memory Decay Warning!`;

    // Beautiful HTML study reminder email template
    const htmlEmail = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #e2e8f0;
              background-color: #040406;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 550px;
              margin: 30px auto;
              background-color: #0b0b0e;
              border: 1px solid rgba(255,255,255,0.05);
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 15px 35px rgba(0,0,0,0.7);
            }
            .top-bar {
              height: 4px;
              background: linear-gradient(90deg, #ec4899 0%, #8b5cf6 50%, #6366f1 100%);
            }
            .content {
              padding: 35px;
            }
            .logo {
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.25em;
              color: #8b5cf6;
              margin-bottom: 25px;
            }
            .greeting {
              font-size: 15px;
              font-weight: 600;
              color: #ffffff;
              margin-bottom: 10px;
            }
            .body-text {
              font-size: 13px;
              color: #94a3b8;
              line-height: 1.6;
              margin-bottom: 25px;
              font-weight: 300;
            }
            .challenge-box {
              background: #0d0d11;
              border-left: 3px solid #8b5cf6;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 25px;
            }
            .challenge-title {
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: #a78bfa;
              font-weight: 700;
              margin-bottom: 6px;
            }
            .challenge-question {
              font-size: 13px;
              font-weight: 500;
              color: #ffffff;
              line-height: 1.5;
            }
            .streak-badge {
              display: inline-flex;
              align-items: center;
              background: rgba(99, 102, 241, 0.1);
              border: 1px solid rgba(99, 102, 241, 0.2);
              border-radius: 12px;
              padding: 8px 12px;
              font-size: 11px;
              font-weight: 600;
              color: #818cf8;
              margin-bottom: 25px;
            }
            .actions {
              text-align: center;
              margin-top: 30px;
            }
            .btn {
              display: inline-block;
              background: #8b5cf6;
              color: #ffffff;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 10px;
              font-size: 12px;
              font-weight: 700;
              box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
            }
            .footer {
              text-align: center;
              padding: 25px;
              border-top: 1px solid rgba(255,255,255,0.03);
              font-size: 10px;
              color: #64748b;
              background-color: #070709;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="top-bar"></div>
            <div class="content">
              <div class="logo">⚡ AskMe AI Autopilot</div>
              <div class="greeting">Hi ${profileName},</div>
              
              <div class="streak-badge">
                🔥 Keep it up! Your current streak is at ${streak} days (${xp} XP accumulated)
              </div>

              <div class="body-text">
                Your spaced repetition autopilot has detected memory decay risk for the concept <strong style="color: #ffffff;">${targetTopic}</strong>. Active recall is essential to lock this knowledge into long-term memory.
              </div>

              <div class="challenge-box">
                <div class="challenge-title">Active Recall Challenge</div>
                <div class="challenge-question">${recallQuestion}</div>
              </div>

              <div class="body-text">
                Avoid memory loss and boost your calibration score by responding to this prompt in the reverse teacher interface.
              </div>

              <div class="actions">
                <a href="${request.headers.get("origin") || "http://localhost:3000"}/workspace" class="btn">Answer Recall Challenge</a>
              </div>
            </div>
            <div class="footer">
              You are receiving this because you scheduled study reminders.<br>
              Frequency: ${frequency || "daily"} at ${time || "09:00 AM"}.<br>
              &copy; 2026 AskMe AI Inc. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;

    // Log the simulated email transmit to the server console
    console.log(`\n==========================================`);
    console.log(`[SIMULATED EMAIL TRANSMIT]`);
    console.log(`TO: ${email}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`TOPIC: ${targetTopic}`);
    console.log(`SCHED: ${frequency || "daily"} at ${time || "09:00 AM"}`);
    console.log(`==========================================\n`);

    return NextResponse.json({
      success: true,
      message: `Study reminder simulated successfully to ${email}`,
      subject,
      html: htmlEmail,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Study reminder failed";
    console.error("Reminder API error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
