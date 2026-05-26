import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET — fetch user profile
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also fetch quiz attempt stats
    const { data: attempts } = await supabase
      .from("quiz_attempts")
      .select("score, weak_topics, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Calculate streak
    const today = new Date().toISOString().split("T")[0];
    let streak = 0;
    if (profile?.last_active_date === today) {
      streak = profile.streak || 0;
    } else {
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0];
      if (profile?.last_active_date === yesterday) {
        streak = (profile.streak || 0) + 1;
        // Update streak
        await supabase
          .from("profiles")
          .update({ streak, last_active_date: today })
          .eq("id", user.id);
      } else {
        streak = 1;
        await supabase
          .from("profiles")
          .update({ streak: 1, last_active_date: today })
          .eq("id", user.id);
      }
    }

    // Collect all weak topics across attempts
    const allWeakTopics = (attempts || []).flatMap(
      (a: any) => a.weak_topics || []
    );
    const uniqueWeakTopics = [...new Set(allWeakTopics)];

    return NextResponse.json({
      profile: {
        ...profile,
        streak,
        email: user.email,
      },
      recentAttempts: attempts || [],
      weakTopics: uniqueWeakTopics,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PATCH — update profile settings
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const allowedFields = [
      "full_name",
      "grade",
      "exam_goal",
      "study_pace",
      "ai_personality",
      "cognitive_profile",
    ];

    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
