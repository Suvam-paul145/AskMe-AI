import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET — fetch all planner items
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: items, error } = await supabase
      .from("planner_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: items || [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch planner items";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// POST — add a new planner item
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, date, duration, isUrgent } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const { data: item, error } = await supabase
      .from("planner_items")
      .insert({
        user_id: user.id,
        title,
        date: date || new Date().toISOString().split("T")[0],
        duration: duration || 20,
        is_urgent: isUrgent || false,
        completed: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create planner item";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// PATCH — toggle completion or update a planner item
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
    const { id, completed } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const { data: item, error } = await supabase
      .from("planner_items")
      .update({ completed })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Grant XP for completing items
    if (completed) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("xp")
        .eq("id", user.id)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({ xp: (profile.xp || 0) + 15 })
          .eq("id", user.id);
      }
    }

    return NextResponse.json({ item });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update planner item";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
