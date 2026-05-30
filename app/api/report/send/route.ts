import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Try to get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let profileName = "Explorer Student";
    let archetype = "The Intuitive Analyst";
    let xp = 380;
    let streak = 4;
    let masteredCount = 2;
    let learningCount = 3;
    let weakCount = 3;
    let weakTopicsList = ["Electric Potential", "Translation", "Gauss's Law"];
    let studyHours = "4.2 hrs";
    let completedQuizzesCount = 3;

    if (user) {
      // Fetch real Supabase profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        profileName = profile.full_name || profileName;
        xp = profile.xp || 0;
        streak = profile.streak || 0;
        const cog = profile.cognitive_profile || {};
        archetype = cog.archetype || archetype;
      }

      // Fetch real Supabase graph nodes
      const { data: nodes } = await supabase
        .from("graph_nodes")
        .select("*")
        .eq("user_id", user.id);

      if (nodes && nodes.length > 0) {
        masteredCount = nodes.filter(n => n.strength >= 85).length;
        learningCount = nodes.filter(n => n.strength >= 60 && n.strength < 85).length;
        weakCount = nodes.filter(n => n.strength < 60).length;
        weakTopicsList = nodes.filter(n => n.strength < 60).slice(0, 3).map(n => n.label);
      }

      // Fetch real Supabase quiz attempts
      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", user.id);

      if (attempts) {
        completedQuizzesCount = attempts.length;
        studyHours = `${(attempts.length * 0.4 + 1.2).toFixed(1)} hrs`;
      }
    } else {
      // Demo fallback stats (NCERT Physics Gravitation)
      profileName = "Demo Student";
      archetype = "The Cram Strategist";
      xp = 180;
      streak = 2;
      masteredCount = 2; // Universal Law, Escape Velocity
      learningCount = 3; // Kepler's Laws, Potential Energy, Geostationary & Polar
      weakCount = 3; // Acceleration due to Gravity, Satellite Dynamics, Weightlessness
      weakTopicsList = ["Satellite Dynamics", "Weightlessness", "Acceleration due to Gravity"];
      studyHours = "2.8 hrs";
      completedQuizzesCount = 2;
    }

    const weakTopicsJoined = weakTopicsList.length > 0 ? weakTopicsList.join(", ") : "None! Outstanding job.";

    // Generate highly styled, modern, premium HTML email body
    const htmlEmail = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              color: #f1f5f9;
              background-color: #040406;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #0b0b0e;
              border: 1px solid rgba(255,255,255,0.05);
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 0 20px 40px rgba(0,0,0,0.8);
            }
            .header {
              background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
              padding: 40px 30px;
              text-align: center;
              position: relative;
            }
            .header h1 {
              margin: 0;
              font-size: 26px;
              font-weight: 800;
              letter-spacing: -0.025em;
              color: #ffffff;
            }
            .header p {
              margin: 8px 0 0 0;
              font-size: 13px;
              color: rgba(255, 255, 255, 0.8);
              font-weight: 300;
            }
            .content {
              padding: 30px;
            }
            .greeting {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 20px;
              color: #ffffff;
            }
            .archetype-box {
              background: rgba(139, 92, 246, 0.08);
              border: 1px solid rgba(139, 92, 246, 0.2);
              border-radius: 16px;
              padding: 20px;
              margin-bottom: 25px;
              text-align: center;
            }
            .archetype-title {
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.15em;
              color: #a78bfa;
              font-weight: 700;
            }
            .archetype-value {
              font-size: 20px;
              font-weight: 800;
              color: #ffffff;
              margin-top: 4px;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 25px;
            }
            .stat-card {
              background: #0e0e13;
              border: 1px solid rgba(255,255,255,0.03);
              border-radius: 14px;
              padding: 15px;
            }
            .stat-label {
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              color: #94a3b8;
            }
            .stat-value {
              font-size: 18px;
              font-weight: 700;
              color: #ffffff;
              margin-top: 3px;
            }
            .section-title {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.12em;
              color: #94a3b8;
              border-bottom: 1px solid rgba(255,255,255,0.05);
              padding-bottom: 8px;
              margin-bottom: 15px;
              font-weight: 700;
            }
            .topic-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 12px 0;
              border-bottom: 1px solid rgba(255,255,255,0.02);
            }
            .topic-name {
              font-size: 13px;
              font-weight: 500;
              color: #e2e8f0;
            }
            .topic-status {
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              padding: 3px 8px;
              border-radius: 9999px;
            }
            .status-mastered {
              background: rgba(16, 185, 129, 0.1);
              color: #34d399;
              border: 1px solid rgba(16, 185, 129, 0.2);
            }
            .status-learning {
              background: rgba(59, 130, 246, 0.1);
              color: #60a5fa;
              border: 1px solid rgba(59, 130, 246, 0.2);
            }
            .status-weak {
              background: rgba(239, 68, 68, 0.1);
              color: #f87171;
              border: 1px solid rgba(239, 68, 68, 0.2);
            }
            .cta-container {
              text-align: center;
              margin-top: 30px;
            }
            .cta-button {
              display: inline-block;
              background-color: #8b5cf6;
              color: #ffffff;
              text-decoration: none;
              padding: 14px 28px;
              border-radius: 12px;
              font-size: 13px;
              font-weight: 700;
              box-shadow: 0 8px 16px rgba(139, 92, 246, 0.3);
            }
            .footer {
              text-align: center;
              padding: 30px;
              border-t: 1px solid rgba(255,255,255,0.05);
              font-size: 11px;
              color: #64748b;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>AskMe AI Weekly Progress</h1>
              <p>Cognitive evolution report & retention mapping</p>
            </div>
            <div class="content">
              <div class="greeting">Hi ${profileName},</div>
              <p style="font-size: 13px; color: #94a3b8; font-weight: 300; line-height: 1.6; margin-bottom: 25px;">
                Your cognitive observatory has compiled your academic activity statistics for the past week. Study metrics have been calibrated against your active recall and spacing intensity decay curves.
              </p>

              <div class="archetype-box">
                <div class="archetype-title">Your Current Archetype</div>
                <div class="archetype-value">🧠 ${archetype}</div>
              </div>

              <div class="section-title">Weekly Metrics</div>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-label">Total XP Accumulation</div>
                  <div class="stat-value" style="color: #a78bfa;">${xp} XP</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Active Study Streak</div>
                  <div class="stat-value" style="color: #60a5fa;">🔥 ${streak} Days</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Planner Sessions Completed</div>
                  <div class="stat-value">${completedQuizzesCount} sessions</div>
                </div>
                <div class="stat-card">
                  <div class="stat-label">Calculated Study Time</div>
                  <div class="stat-value">${studyHours}</div>
                </div>
              </div>

              <div class="section-title">Syllabus Masteries Status</div>
              <div class="topic-row">
                <span class="topic-name">Mastered Concepts (&ge;85% retention)</span>
                <span class="topic-status status-mastered">${masteredCount} Concepts</span>
              </div>
              <div class="topic-row">
                <span class="topic-name">Active Learning (60% - 85% retention)</span>
                <span class="topic-status status-learning">${learningCount} Concepts</span>
              </div>
              <div class="topic-row">
                <span class="topic-name">Weak &amp; Decaying (&lt;60% retention)</span>
                <span class="topic-status status-weak">${weakCount} Concepts</span>
              </div>

              <div class="section-title" style="margin-top: 25px;">Autopilot Action Plan</div>
              <p style="font-size: 12px; color: #cbd5e1; line-height: 1.6; font-weight: 400;">
                <strong>Alert:</strong> Memory decay has occurred on the following concepts: <span style="color: #f87171;">${weakTopicsJoined}</span>. We highly recommend completing a 15-minute Reverse Teacher (RTM) active recall check on these topics today to restore cognitive strength and boost your score.
              </p>

              <div class="cta-container">
                <a href="${request.headers.get("origin") || "http://localhost:3000"}/workspace" class="cta-button">Launch Cognitive Workspace</a>
              </div>
            </div>
            <div class="footer">
              This report was automatically compiled by the AskMe AI Spaced Repetition engine.<br>
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
    console.log(`SUBJECT: AskMe AI Weekly Progress Report: ${archetype}`);
    console.log(`XP: ${xp} | STREAK: ${streak} | STRG: ${masteredCount} Mastered / ${weakCount} Weak`);
    console.log(`==========================================\n`);

    return NextResponse.json({
      success: true,
      message: `Weekly growth report compiled and simulated sent to ${email}`,
      subject: `📊 AskMe AI Weekly Progress Report: ${archetype} Study Journey`,
      html: htmlEmail,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Report compilation failed";
    console.error("Report API error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
