import type { ApiResponse, ApiPost, Post } from "@/types/api";

const API_BASE_URL = "https://suitmedia-backend.suitdev.com/api";

export interface FetchPostsParams {
  page?: number;
  size?: number;
  sort?: "published_at" | "-published_at";
}

export async function fetchPosts({
  page = 1,
  size = 10,
  sort = "-published_at",
}: FetchPostsParams = {}): Promise<ApiResponse> {
  // Build URL with proper query parameters
  const params = new URLSearchParams();

  // Add pagination parameters
  params.append("page[number]", page.toString());
  params.append("page[size]", size.toString());

  // Add append parameters for images
  params.append("append[]", "small_image");
  params.append("append[]", "medium_image");

  // Add sort parameter
  params.append("sort", sort);

  const url = `${API_BASE_URL}/ideas?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      // Add cache control for better performance
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${
          errorData.message || "Unknown error"
        }`
      );
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
}

// Alternative fetch function with better error handling
export async function fetchPostsWithRetry(
  { page = 1, size = 10, sort = "-published_at" }: FetchPostsParams = {},
  retries = 3
): Promise<ApiResponse> {
  const params = new URLSearchParams();
  params.append("page[number]", page.toString());
  params.append("page[size]", size.toString());
  params.append("append[]", "small_image");
  params.append("append[]", "medium_image");
  params.append("sort", sort);

  const url = `${API_BASE_URL}/ideas?${params.toString()}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 60 },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // If it's a client error (4xx), don't retry
        if (response.status >= 400 && response.status < 500) {
          throw new Error(
            `Client error: ${response.status} - ${
              errorData.message || "Bad request"
            }`
          );
        }

        // If it's a server error (5xx) and we have retries left, continue
        if (attempt === retries) {
          throw new Error(
            `Server error: ${response.status} - ${
              errorData.message || "Server error"
            }`
          );
        }

        // Wait before retrying (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
        continue;
      }

      const data: ApiResponse = await response.json();
      return data;
    } catch (error) {
      if (attempt === retries) {
        console.error("Error fetching posts after retries:", error);
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }

  throw new Error("Failed to fetch posts after all retries");
}

// Transform API data to component format
export function transformApiPost(apiPost: ApiPost): Post {
  const getImageUrl = (
    imageArray: Array<{ url: string }> | undefined,
    defaultPlaceholder: string
  ): string => {
    let url =
      Array.isArray(imageArray) && imageArray.length > 0 && imageArray[0].url
        ? imageArray[0].url
        : defaultPlaceholder;
    // Jika URL berasal dari domain yang bermasalah, paksa menggunakan HTTP
    // Ini penting karena server assets.suitdev.com tidak mendukung HTTPS
    if (
      url.startsWith("https://assets.suitdev.com") ||
      url.startsWith("https://suitmedia.static-assets.id")
    ) {
      url = url.replace("https://", "http://");
    }
    return url;
  };

  return {
    id: apiPost.id,
    slug: apiPost.slug,
    title: apiPost.title,
    content: apiPost.content,
    publishedAt: new Date(apiPost.published_at),
    small_image: apiPost.small_image[0]?.url ?? "", // <-- ambil url saja
    mediumImage: apiPost.medium_image[0]?.url ?? "",
  };
}

// Test function to check API connectivity
export async function testApiConnection(): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/ideas?page[number]=1&page[size]=1`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}
