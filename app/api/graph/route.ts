import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET — fetch memory graph nodes and links
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [nodesResult, linksResult] = await Promise.all([
      supabase
        .from("graph_nodes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("graph_links")
        .select("*")
        .eq("user_id", user.id),
    ]);

    return NextResponse.json({
      nodes: (nodesResult.data || []).map((n: any) => ({
        id: n.id,
        label: n.label,
        strength: n.strength,
        status: n.status,
        x: n.x,
        y: n.y,
      })),
      links: (linksResult.data || []).map((l: any) => ({
        source: l.source_node,
        target: l.target_node,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch graph" },
      { status: 500 }
    );
  }
}

// PATCH — update a graph node's strength
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
    const { nodeId, delta } = body;

    if (!nodeId || delta === undefined) {
      return NextResponse.json(
        { error: "nodeId and delta are required" },
        { status: 400 }
      );
    }

    // Fetch current node
    const { data: node } = await supabase
      .from("graph_nodes")
      .select("*")
      .eq("id", nodeId)
      .eq("user_id", user.id)
      .single();

    if (!node) {
      return NextResponse.json(
        { error: "Node not found" },
        { status: 404 }
      );
    }

    const newStrength = Math.max(0, Math.min(100, node.strength + delta));
    let status = "learning";
    if (newStrength >= 85) status = "mastered";
    else if (newStrength >= 60) status = "learning";
    else if (newStrength >= 35) status = "weak";
    else status = "forgotten";

    const { data: updated, error } = await supabase
      .from("graph_nodes")
      .update({ strength: newStrength, status })
      .eq("id", nodeId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ node: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update graph" },
      { status: 500 }
    );
  }
}
