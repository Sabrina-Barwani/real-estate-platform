export default function HorizonMotif({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 260"
      fill="none"
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 220 L90 220 L150 140 L210 190 L270 100 L330 175 L400 60 L470 160 L520 130 L580 200 L650 90 L720 170 L790 110 L860 195 L930 150 L1000 40 L1070 165 L1140 120 L1200 180"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1400"
        strokeDasharray="1400"
        className="animate-draw-line"
      />
    </svg>
  );
}
