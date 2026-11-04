/** Stroke-style maple leaf, matched to Lucide's 24px grid and stroke conventions. */
export default function MapleLeaf({ className = "", strokeWidth = 1.6, filled = false }: { className?: string; strokeWidth?: number; filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <path d="M12 2.5l-1.6 3.2-1.9-.9.6 4.6-2.7-2.6-.7 1.7-2.6-.5.9 3-1.4.7 4.6 3.7-.6 1.8 4.6-.6V22h1.6v-4.4l4.6.6-.6-1.8 4.6-3.7-1.4-.7.9-3-2.6.5-.7-1.7-2.7 2.6.6-4.6-1.9.9z" />
    </svg>
  );
}
