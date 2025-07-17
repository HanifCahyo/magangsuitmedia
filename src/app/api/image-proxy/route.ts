/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server";

// Handler OPTIONS untuk preflight CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET(request: NextRequest) {
  let imageUrl: string | null = null;

  try {
    const { searchParams } = new URL(request.url);
    imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return new NextResponse("Image URL is required", { status: 400 });
    }

    // Pastikan hanya memproksi URL gambar valid (opsional tapi disarankan)
    if (
      !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|avif|svg)(\?.*)?$/.test(imageUrl)
    ) {
      return new NextResponse("Invalid image URL format", { status: 400 });
    }

    // Paksa pakai HTTPS untuk assets.suitdev.com
    if (imageUrl.startsWith("http://assets.suitdev.com")) {
      imageUrl = imageUrl.replace("http://", "https://");
    }

    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    };

    // Tambahkan Referer jika dari assets.suitdev.com
    if (imageUrl.includes("assets.suitdev.com")) {
      headers["Referer"] = "https://assets.suitdev.com";
    }

    const response = await fetch(imageUrl, {
      headers,
      referrerPolicy: "no-referrer",
      cache: "no-store",
    });

    if (!response.ok) {
      return new NextResponse(null, { status: response.status });
    }

    const contentType = response.headers.get("Content-Type") || "image/jpeg";

    if (!contentType.startsWith("image/")) {
      return new NextResponse(null, { status: 415 }); // Unsupported Media Type
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error: unknown) {
    const message =
      typeof error === "object" && error !== null && "message" in error
        ? (error as any).message
        : typeof error === "string"
        ? error
        : "Unknown error";

    console.error("Image Proxy Error:", message);
    return new NextResponse(`Internal Server Error: ${message}`, {
      status: 500,
    });
  }
}
