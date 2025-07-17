export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // Jika src adalah path lokal (dimulai dengan '/'), kembalikan langsung
  if (src.startsWith("/")) {
    return src;
  }

  // Jika src adalah assets.suitdev.com, kembalikan langsung (bypass proxy) dan tambahkan parameter width & quality
  if (src.includes("assets.suitdev.com")) {
    // Pastikan menggunakan HTTPS
    const url = src.replace("http://", "https://");
    // Tambahkan parameter agar Next/Image tidak error
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}w=${width}&q=${quality || 75}`;
  }

  // Jika src adalah URL eksternal lain, gunakan proxy
  const encodedSrc = encodeURIComponent(src);
  return `/api/image-proxy?url=${encodedSrc}&w=${width}&q=${quality || 75}`;
}
