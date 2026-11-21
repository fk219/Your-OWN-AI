const COLORS = {
  cs: 'var(--blue)',
  math: 'var(--violet)',
  food: 'var(--coral)',
  sports: 'var(--lime)'
};

export function VectorField({ vectors = [], selectedId, resultIds = [], onSelect }) {
  if (!vectors.length) {
    return <div className="field-empty">Loading the vector field…</div>;
  }

  const width = 600;
  const height = 420;
  const mapX = (x) => 300 + x * 245;
  const mapY = (y) => 210 - y * 175;
  const selected = vectors.find((vector) => vector.id === selectedId);

  return (
    <div className="field-wrap">
      <svg className="vector-field" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="2D projection of the 16D demo vectors">
        <defs>
          <pattern id="dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(20,20,20,0.12)" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#dot-grid)" />
        <line x1="55" y1="210" x2="545" y2="210" stroke="rgba(20,20,20,0.16)" strokeDasharray="3 5" />
        <line x1="300" y1="35" x2="300" y2="385" stroke="rgba(20,20,20,0.16)" strokeDasharray="3 5" />

        {vectors.map((vector, index) => {
          const angle = (index * 137.5 * Math.PI) / 180;
          const radius = 4 + (index % 4) * 2.2;
          const x = mapX(vector.x) + Math.cos(angle) * radius;
          const y = mapY(vector.y) + Math.sin(angle) * radius;
          const isSelected = vector.id === selectedId;
          const isResult = resultIds.includes(vector.id);
          return (
            <g key={vector.id} className={`field-point ${isSelected ? 'is-selected' : ''} ${isResult ? 'is-result' : ''}`} onClick={() => onSelect(vector)}>
              <title>{vector.label}</title>
              {isSelected && <circle cx={x} cy={y} r="12" fill="none" stroke="var(--ink)" strokeWidth="1.5" />}
              {isResult && <circle cx={x} cy={y} r="8" fill="none" stroke="var(--blue)" strokeWidth="1.2" />}
              <circle cx={x} cy={y} r={isSelected ? 5 : 3.6} fill={COLORS[vector.category] || 'var(--ink)'} />
            </g>
          );
        })}

        {selected && (
          <g>
            <text x={Math.min(460, Math.max(80, mapX(selected.x) + 12))} y={Math.max(22, mapY(selected.y) - 12)} className="field-label">
              {selected.category.toUpperCase()}
            </text>
          </g>
        )}
      </svg>
      <div className="field-legend">
        {Object.entries(COLORS).map(([category, color]) => (
          <span key={category}><i style={{ background: color }} /> {category}</span>
        ))}
        <span className="field-hint">click a point to query it</span>
      </div>
    </div>
  );
}
