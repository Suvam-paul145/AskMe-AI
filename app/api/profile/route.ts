import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface DBQuizAttempt {
  score: number;
  weak_topics: string[] | null;
  created_at: string;
}

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

    let { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error && error.code === "PGRST116") {
      // Profile doesn't exist, create it!
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Student",
        })
        .select()
        .single();
      
      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      profile = newProfile;
      error = null;
    } else if (error) {
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
      (a: DBQuizAttempt) => a.weak_topics || []
    );
    const uniqueWeakTopics = [...new Set(allWeakTopics)];

    // Resilient resolution of avatarUrl
    const avatarUrl = profile?.avatar_url || profile?.cognitive_profile?.avatar_url || user.user_metadata?.avatar_url || "";

    return NextResponse.json({
      profile: {
        ...profile,
        avatar_url: avatarUrl,
        streak,
        email: user.email,
      },
      recentAttempts: attempts || [],
      weakTopics: uniqueWeakTopics,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch profile";
    return NextResponse.json(
      { error: message },
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
      "avatar_url",
    ];

    const updates: Record<string, unknown> = {};
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

    // Try updating the database. Resiliently fallback if avatar_url column does not exist
    let updateResult;
    try {
      updateResult = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();
    } catch {
      // In case libraries throw rather than returning error
    }

    // Fallback if column does not exist (postgrest error message or error code check)
    if (!updateResult || (updateResult.error && (
      updateResult.error.message?.includes("avatar_url") || 
      updateResult.error.code === "PGRST102" || 
      updateResult.error.message?.includes("column")
    ))) {
      const avatarUrl = updates.avatar_url as string;
      delete updates.avatar_url;

      // Fetch current profile to get current cognitive_profile JSON
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("cognitive_profile")
        .eq("id", user.id)
        .single();

      const currentCog = currentProfile?.cognitive_profile || {};
      updates.cognitive_profile = {
        ...currentCog,
        avatar_url: avatarUrl,
      };

      updateResult = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();
    }

    if (updateResult.error) {
      return NextResponse.json({ error: updateResult.error.message }, { status: 500 });
    }

    // Also update auth user metadata for consistency
    if (body.avatar_url !== undefined) {
      await supabase.auth.updateUser({
        data: { avatar_url: body.avatar_url }
      });
    }
    if (body.full_name !== undefined) {
      await supabase.auth.updateUser({
        data: { full_name: body.full_name }
      });
    }

    // Ensure avatar_url is attached to the returned profile
    const avatarUrl = updateResult.data.avatar_url || updateResult.data.cognitive_profile?.avatar_url || body.avatar_url || "";

    return NextResponse.json({
      profile: {
        ...updateResult.data,
        avatar_url: avatarUrl
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update profile";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
