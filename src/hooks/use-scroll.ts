"use client"

import { useState, useEffect } from "react"

export function useScroll() {
  const [scrollY, setScrollY] = useState(0)
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up")
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    let lastScrollY = window.scrollY

    const updateScrollDirection = () => {
      const currentScrollY = window.scrollY
      const direction = currentScrollY > lastScrollY ? "down" : "up"

      if (direction !== scrollDirection && Math.abs(currentScrollY - lastScrollY) > 10) {
        setScrollDirection(direction)
      }

      setScrollY(currentScrollY)
      setIsScrolled(currentScrollY > 50)
      lastScrollY = currentScrollY > 0 ? currentScrollY : 0
    }

    window.addEventListener("scroll", updateScrollDirection, { passive: true })
    return () => window.removeEventListener("scroll", updateScrollDirection)
  }, [scrollDirection])

  return { scrollY, scrollDirection, isScrolled }
}
