/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    loader: "custom", // Menentukan bahwa kita menggunakan custom loader
    loaderFile: "src/components/image-loader.ts", // Path ke file custom loader Anda
    remotePatterns: [
      {
        protocol: "https",
        hostname: "suitmedia-backend.suitdevs.com",
        port: "",
        pathname: "/**",
      },
      // Izinkan HTTP dan HTTPS untuk domain aset
      {
        protocol: "http",
        hostname: "assets.suitdev.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "assets.suitdev.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "suitmedia.static-assets.id",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "suitmedia.static-assets.id",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**", // Atau whitelist spesifik
      },
      {
        protocol: "https",
        hostname: "assets.suitdev.com",
      },
    ],
    domains: ["assets.suitdev.com"],
  },
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: "https://suitmedia-backend.suitdev.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;
