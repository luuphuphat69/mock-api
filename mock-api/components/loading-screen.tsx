'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import Image from 'next/image'

export function LoadingScreen({ isVisible }: { isVisible: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const maskRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isVisible || !maskRef.current) return

    gsap.to(maskRef.current, {
      '--fill-percent': '100%',
      duration: 2,
      ease: 'power1.inOut',
      onComplete: () => {
        // Animation complete
      },
    })
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-background flex items-center justify-center z-50"
    >
      <div className="relative w-24 h-24">
        <div
          ref={maskRef}
          className="w-full h-full"
          style={{
            '--fill-percent': '0%',
            backgroundImage: 'url("/icon.png")',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            WebkitMaskImage: `linear-gradient(to top, white 0%, white var(--fill-percent), transparent var(--fill-percent), transparent 100%)`,
            maskImage: `linear-gradient(to top, white 0%, white var(--fill-percent), transparent var(--fill-percent), transparent 100%)`,
          } as React.CSSProperties}
        />
      </div>
    </div>
  )
}