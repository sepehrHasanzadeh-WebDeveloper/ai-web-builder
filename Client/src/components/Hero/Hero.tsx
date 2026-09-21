import LaserFlow from "../LaserFlow";
export default function Hero() {
  return (
    <div style={{ width: "1080px", height: "1080px", position: "relative" }}>
      <LaserFlow
        color="#4F46E5"
        wispDensity={1}
        flowSpeed={0.35}
        verticalSizing={2}
        horizontalSizing={0.5}
        fogIntensity={0.45}
        fogScale={0.3}
        wispSpeed={15}
        wispIntensity={5}
        flowStrength={0.25}
        decay={1.1}
        horizontalBeamOffset={0}
        verticalBeamOffset={-0.5}
      />
    </div>
  );
}
