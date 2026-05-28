import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60; // Allow up to 60s for processing

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2MB

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only image files (PNG, JPG, WEBP, GIF) are supported" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "Image size is too large. Upload an image under 2 MB." },
        { status: 413 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Upload image to Supabase Storage in "avatars" bucket
    // Path: user_id/timestamp-filename
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `${user.id}/${Date.now()}-${cleanFileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    // Resiliently update profile database table (try column, fallback to cognitive_profile)
    let updateResult;
    try {
      updateResult = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id)
        .select()
        .single();
    } catch {
      // In case libraries throw
    }

    // Fallback if avatar_url column does not exist
    if (!updateResult || (updateResult.error && (
      updateResult.error.message?.includes("avatar_url") || 
      updateResult.error.code === "PGRST102" || 
      updateResult.error.message?.includes("column")
    ))) {
      // Fetch current profile cognitive profile details
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("cognitive_profile")
        .eq("id", user.id)
        .single();

      const currentCog = currentProfile?.cognitive_profile || {};
      
      updateResult = await supabase
        .from("profiles")
        .update({
          cognitive_profile: {
            ...currentCog,
            avatar_url: publicUrl,
          }
        })
        .eq("id", user.id)
        .select()
        .single();
    }

    if (updateResult.error) {
      console.error("Database profile update error:", updateResult.error);
      return NextResponse.json(
        { error: `Database update failed: ${updateResult.error.message}` },
        { status: 500 }
      );
    }

    // Update Auth user metadata
    await supabase.auth.updateUser({
      data: { avatar_url: publicUrl }
    });

    return NextResponse.json({
      success: true,
      avatar_url: publicUrl,
    });
  } catch (error: unknown) {
    console.error("Avatar upload endpoint error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
