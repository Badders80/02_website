import { NextRequest, NextResponse } from "next/server";
import { getLiveInventory } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 });
    }

    const data = await getLiveInventory(slug);
    if (!data) {
      return NextResponse.json(
        { error: `Horse slug ${slug} not found in inventory` },
        { status: 404 }
      );
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (err: any) {
    console.error(`[API Inventory] Error fetching live inventory:`, err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch live inventory" },
      { status: 500 }
    );
  }
}