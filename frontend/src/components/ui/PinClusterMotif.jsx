// Signature visual identity element for Hospital Marketplace: a schematic
// town-grid with clustered pins in facility-type colors — evokes "many kinds
// of care, discoverable on one map" without relying on stock photography.
export const PinClusterMotif = ({ className = '' }) => (
  <svg viewBox="0 0 480 380" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* town grid */}
    <g stroke="var(--color-line)" strokeWidth="1">
      {[40, 110, 180, 250, 320, 390, 460].map((x) => (
        <line key={`v${x}`} x1={x} y1="20" x2={x} y2="360" />
      ))}
      {[30, 95, 160, 225, 290, 355].map((y) => (
        <line key={`h${y}`} x1="10" y1={y} x2="470" y2={y} />
      ))}
    </g>

    {/* main road */}
    <path d="M10 290 C 140 250, 260 230, 470 140" stroke="var(--color-sand-500)" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" />

    {/* pins: each a facility type, color-coded */}
    {[
      { x: 120, y: 160, color: 'var(--color-teal-600)', r: 9 },
      { x: 205, y: 110, color: 'var(--color-sand-600)', r: 7 },
      { x: 165, y: 220, color: 'var(--color-teal-500)', r: 6 },
      { x: 300, y: 90, color: 'var(--color-teal-900)', r: 8 },
      { x: 340, y: 200, color: 'var(--color-sand-600)', r: 6 },
      { x: 380, y: 130, color: 'var(--color-teal-600)', r: 7 },
      { x: 250, y: 260, color: 'var(--color-teal-500)', r: 6 },
      { x: 90, y: 250, color: 'var(--color-sand-500)', r: 6 },
    ].map((p, i) => (
      <g key={i} transform={`translate(${p.x} ${p.y})`}>
        <circle r={p.r + 10} fill={p.color} opacity="0.12" />
        <path
          d={`M0 -${p.r * 1.8} C ${p.r} -${p.r * 1.8} ${p.r} 0 0 ${p.r * 1.4} C -${p.r} 0 -${p.r} -${p.r * 1.8} 0 -${p.r * 1.8} Z`}
          fill={p.color}
        />
        <circle r={p.r * 0.32} cy={-p.r * 0.9} fill="white" />
      </g>
    ))}

    {/* focal ring around Alwar center */}
    <circle cx="240" cy="170" r="150" stroke="var(--color-teal-600)" strokeWidth="1.5" strokeDasharray="1 8" opacity="0.5" />
  </svg>
);
