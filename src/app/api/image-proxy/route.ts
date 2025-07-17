import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  let imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("Image URL is required", { status: 400 });
  }

  // Prefer HTTPS for assets.suitdev.com
  if (imageUrl.startsWith("http://assets.suitdev.com")) {
    imageUrl = imageUrl.replace("http://", "https://");
  }

  // Add Referer header for assets.suitdev.com
  const headers: Record<string, string> = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
    Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
  };
  if (imageUrl.includes("assets.suitdev.com")) {
    headers["Referer"] = "https://assets.suitdev.com/";
  }

  try {
    const response = await fetch(imageUrl, {
      referrerPolicy: "no-referrer",
      headers,
      cache: "no-store", // Tambahan penting
    });

    if (!response.ok) {
      // Fallback: If 403 and assets.suitdev.com, redirect to direct image URL
      if (response.status === 403 && imageUrl.includes("assets.suitdev.com")) {
        console.warn(
          `Proxy 403 for ${imageUrl}, redirecting to direct image URL.`
        );
        return NextResponse.redirect(imageUrl, 302);
      }
      console.error(
        `Image proxy error [${response.status}]: ${imageUrl}`,
        await response.text()
      );

      return new NextResponse(
        `Failed to fetch image from source: ${response.status} ${response.statusText}`,
        {
          status: 500,
        }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("Content-Type");
    return new NextResponse(Buffer.from(arrayBuffer), {
      status: 200,

      headers: {
        "Content-Type": contentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: unknown) {
    let errorMessage = "Unknown error";
    if (typeof error === "object" && error !== null && "message" in error) {
      errorMessage = (error as { message?: string }).message || errorMessage;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    console.error("Error in image proxy fetch operation:", errorMessage);
    return new NextResponse(`Internal Server Error: ${errorMessage}`, {
      status: 500,
    });
  }
}
