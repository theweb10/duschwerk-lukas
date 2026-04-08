import { Line, Text } from '@react-three/drei';

// The ShowerModel group sits at world y = -h/2, with geometry spanning
// local -h/2 to +h/2, so the model occupies world y: -h (bottom) to 0 (top).
// All lines are rendered at z=0.25 (in front of the shower) to avoid
// depth-occlusion by the floor or wall geometry.
export default function MeasurementLines({ w, h }) {
  const gap  = 0.18;
  const tick = 0.045;
  const z    = 0.25; // in front of scene — never occluded

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
      <Line points={[[-w/2, widthY, z], [w/2, widthY, z]]} color="#AAAAAA" lineWidth={1} depthTest={false} />
      <Line points={[[-w/2, widthY-tick, z], [-w/2, widthY+tick, z]]} color="#AAAAAA" lineWidth={1} depthTest={false} />
      <Line points={[[w/2, widthY-tick, z], [w/2, widthY+tick, z]]} color="#AAAAAA" lineWidth={1} depthTest={false} />
      <Text position={[0, widthY - 0.10, z]} fontSize={0.065} color="#888888" anchorX="center" depthTest={false} renderOrder={999}>
        {`${Math.round(w * 1000)} mm`}
      </Text>

      {/* Height line */}
      <Line points={[[heightX, worldBottom, z], [heightX, worldTop, z]]} color="#AAAAAA" lineWidth={1} depthTest={false} />
      <Line points={[[heightX-tick, worldBottom, z], [heightX+tick, worldBottom, z]]} color="#AAAAAA" lineWidth={1} depthTest={false} />
      <Line points={[[heightX-tick, worldTop, z], [heightX+tick, worldTop, z]]} color="#AAAAAA" lineWidth={1} depthTest={false} />
      <Text
        position={[heightX - 0.13, worldCenterY, z]}
        fontSize={0.065}
        color="#888888"
        anchorX="center"
        rotation={[0, 0, Math.PI/2]}
        depthTest={false}
        renderOrder={999}
      >
        {`${Math.round(h * 1000)} mm`}
      </Text>
    </group>
  );
}
