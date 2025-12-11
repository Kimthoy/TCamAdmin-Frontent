export default function SparklineModern({
  data = [],
  stroke = "#10b981",
  height = 40,
  strokeWidth = 3,
}) {
  if (!data.length) return null;

  const width = 200; // virtual width used to scale
  const max = Math.max(...data);
  const min = Math.min(...data);

  // Scale points to SVG coordinates
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / (max - min || 1)) * height;
    return `${x},${y}`;
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-10" // full width, fixed height
      preserveAspectRatio="none"
    >
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.join(" ")}
      />
    </svg>
  );
}
