export const dynamic = "force-static";

import { NextResponse } from "next/server";

const BASE_URL = "https://animalpitch.goatcounter.com/api/v0";
const API_KEY = "235z6reqoudvbjzjdy7xbixxc6rhwjnxdbz6g1n814mwz1nutw";

function getTodayEnd(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function GET() {
  const start = "2020-01-01";
  const end = getTodayEnd();

  const params = new URLSearchParams({ start, end });

  const headers = {
    Authorization: `Bearer ${API_KEY}`,
  };

  try {
    const [totalRes, hitsRes] = await Promise.all([
      fetch(`${BASE_URL}/stats/total?${params.toString()}`, {
        headers,
        cache: "no-store",
      }),
      fetch(`${BASE_URL}/stats/hits?${params.toString()}`, {
        headers,
        cache: "no-store",
      }),
    ]);

    if (!totalRes.ok) {
      const text = await totalRes.text();
      return NextResponse.json(
        { error: `GoatCounter /stats/total error ${totalRes.status}: ${text}` },
        { status: 502 }
      );
    }

    if (!hitsRes.ok) {
      const text = await hitsRes.text();
      return NextResponse.json(
        { error: `GoatCounter /stats/hits error ${hitsRes.status}: ${text}` },
        { status: 502 }
      );
    }

    const [total, hits] = await Promise.all([totalRes.json(), hitsRes.json()]);

    return NextResponse.json({
      total,
      hits,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
