import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, reason, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Simulated email dispatch
    console.log(`[CONTACT SYSTEM TRANSMISSION]`);
    console.log(`From: ${name} <${email}>`);
    console.log(`Reason: ${reason}`);
    console.log(`Message:\n${message}`);
    console.log(`-----------------------------------`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Failed to dispatch transmission" }, { status: 500 });
  }
}
