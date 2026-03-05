'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const BeamsCanvas = dynamic(
  () => import('@/components/ui/ethereal-beams-hero').then((m) => m.Beams),
  { ssr: false },
)

export function BeamsBackground() {
  const [isLight, setIsLight] = useState(false)

  useEffect(() => {
    const check = () =>
      setIsLight(document.documentElement.getAttribute('data-theme') === 'light')

    check()

    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  if (isLight) return null

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <BeamsCanvas
        beamWidth={2.5}
        beamHeight={18}
        beamNumber={15}
        lightColor="#ffffff"
        speed={2.5}
        noiseIntensity={2}
        scale={0.15}
        rotation={43}
        backgroundColor="#000000"
      />
    </div>
  )
}
