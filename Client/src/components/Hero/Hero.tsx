import LaserFlow from "../LaserFlow";
export default function Hero() {
  return (
    <div style={{ width: "100%", height: "80vh", position: "relative", backgroundColor: "#F8FAFC" }}>
      <LaserFlow
        color="#4F46E5"
        wispDensity={1}
        flowSpeed={0.35}
        verticalSizing={2}
        horizontalSizing={1}
        fogIntensity={0.45}
        fogScale={0.3}
        wispSpeed={15}
        wispIntensity={5}
        flowStrength={0.25}
        decay={1.1}
        horizontalBeamOffset={0}
        verticalBeamOffset={-0.5}
        backgroundColor="#F8FAFC"
        style={{ position: "absolute", width: "100%", height: "100%" }}
      />
    </div>
  );
}
