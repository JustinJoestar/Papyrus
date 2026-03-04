'use client'

import dynamic from 'next/dynamic'

const BeamsCanvas = dynamic(
  () => import('@/components/ui/ethereal-beams-hero').then((m) => m.Beams),
  { ssr: false },
)

export function BeamsBackground() {
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
      />
    </div>
  )
}
