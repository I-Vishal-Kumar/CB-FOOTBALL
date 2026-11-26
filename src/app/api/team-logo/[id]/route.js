import { NextResponse } from "next/server";

// Proxy for sportapi.ai team logos — the API requires the key in a header,
// so we can't use logo URLs directly in <img> tags on the client.
export async function GET(request, { params }) {
    const { id } = params;
    if (!id || !/^\d+$/.test(id)) {
        return new NextResponse(null, { status: 400 });
    }

    const API_KEY = process.env.SPORTAPI_KEY;
    if (!API_KEY) {
        return new NextResponse(null, { status: 503 });
    }

    try {
        const upstream = await fetch(`https://sportapi.ai/api/teams/${id}/logo`, {
            headers: { "X-Api-Key": API_KEY },
            next: { revalidate: 86400 }, // logos don't change often
        });

        if (!upstream.ok) {
            return new NextResponse(null, { status: upstream.status });
        }

        const contentType = upstream.headers.get("content-type") || "image/png";
        const buffer = await upstream.arrayBuffer();

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=86400",
            },
        });
    } catch {
        return new NextResponse(null, { status: 502 });
    }
}
