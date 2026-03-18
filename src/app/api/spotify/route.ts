import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { fetchUserProfile } from "@/lib/spotify";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const profile = await fetchUserProfile(session.accessToken);
    return NextResponse.json(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error("Spotify API error:", message);
    const status = message.includes('token expired') ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
