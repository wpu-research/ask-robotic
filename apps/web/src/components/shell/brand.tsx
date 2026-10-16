import Link from 'next/link'
import { useId } from 'react'

/** Macademia fındık logosu (Akademi/public/index.html ile aynı çizim). `id` her örnekte benzersiz kırpma yolu için. */
export function NutLogo({ size = 48 }: { size?: number }) {
  const clip = `nut-${useId().replace(/:/g, '')}`
  return (
    <svg className="nut" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs><clipPath id={clip}><polygon points="32,34 30,26 35,21 30,15 34,7 70,4 70,46 60,43 53,38 47,43 41,36" /></clipPath></defs>
      <circle cx="32" cy="35" r="25" className="nut-shell" />
      <circle cx="24" cy="25" r="5" fill="#ffffff" opacity=".18" />
      <g clipPath={`url(#${clip})`}>
        <circle cx="32" cy="35" r="25" className="nut-shell-dark" />
        <circle cx="32" cy="35" r="20" className="nut-kernel" />
        <circle cx="38" cy="28" r="6" className="nut-kernel-dark" opacity=".55" />
      </g>
      <polyline points="32,34 30,26 35,21 30,15 33,10" className="nut-crack" />
      <polyline points="32,34 41,36 47,43 53,38 57,41" className="nut-crack" />
      <path d="M27 13 C19 1, 8 0, 2 5 C7 12, 17 17, 27 13 Z" className="nut-leaf" />
      <path d="M27 13 Q15 8 4 5" className="nut-leaf-rib" />
    </svg>
  )
}

/** Kelime markası: "Macademia" (M vurgulu) + "X". */
export function Wordmark() {
  return <span className="logo-word"><span className="m">M</span>academia<span className="x">X</span></span>
}

export function Brand({ label }: { label: string }) {
  return (
    <Link href="/" className="logo" aria-label={label}>
      <NutLogo />
      <Wordmark />
    </Link>
  )
}
