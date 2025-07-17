"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Banner() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative h-[60vh] overflow-hidden">
      {/* Background Image with Parallax */}
      <div
        className="absolute inset-0 w-full h-[120%]"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      >
        <Image
          src="/banner.jpg"
          alt="Ideas Banner Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4"
        style={{
          transform: `translateY(${scrollY * 0.2}px)`,
        }}
      >
        <h1 className="text-5xl md:text-6xl font-bold mb-4">Ideas</h1>
        <p className="text-xl md:text-2xl font-light">
          Where all our great things begin
        </p>
      </div>

      {/* Angled Bottom Edge */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-12 md:h-20"
        >
          <path d="M0,120 L1200,120 L1200,20 L0,80 Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
