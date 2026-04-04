import { Line, Text } from '@react-three/drei';

// The ShowerModel group sits at world y = -h/2, with geometry spanning
// local -h/2 to +h/2, so the model occupies world y: -h (bottom) to 0 (top).
export default function MeasurementLines({ w, h }) {
  const gap  = 0.18;
  const tick = 0.045;

  const worldBottom  = -h;
  const worldTop     = 0;
  const worldCenterY = -h / 2;

  // Width line: just below model bottom
  const widthY  = worldBottom - gap;
  // Height line: left of model
  const heightX = -w / 2 - gap;

  return (
    <group>
      {/* Width line */}
      <Line points={[[-w/2, widthY, 0], [w/2, widthY, 0]]} color="#AAAAAA" lineWidth={1} />
      <Line points={[[-w/2, widthY-tick, 0], [-w/2, widthY+tick, 0]]} color="#AAAAAA" lineWidth={1} />
      <Line points={[[w/2, widthY-tick, 0], [w/2, widthY+tick, 0]]} color="#AAAAAA" lineWidth={1} />
      <Text position={[0, widthY - 0.1, 0]} fontSize={0.065} color="#888888" anchorX="center">
        {`${Math.round(w * 1000)} mm`}
      </Text>

      {/* Height line */}
      <Line points={[[heightX, worldBottom, 0], [heightX, worldTop, 0]]} color="#AAAAAA" lineWidth={1} />
      <Line points={[[heightX-tick, worldBottom, 0], [heightX+tick, worldBottom, 0]]} color="#AAAAAA" lineWidth={1} />
      <Line points={[[heightX-tick, worldTop, 0], [heightX+tick, worldTop, 0]]} color="#AAAAAA" lineWidth={1} />
      <Text
        position={[heightX - 0.13, worldCenterY, 0]}
        fontSize={0.065}
        color="#888888"
        anchorX="center"
        rotation={[0, 0, Math.PI/2]}
      >
        {`${Math.round(h * 1000)} mm`}
      </Text>
    </group>
  );
}
