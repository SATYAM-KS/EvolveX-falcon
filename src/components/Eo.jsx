import Spline from "@splinetool/react-spline";

export default function Eo() {
  return (
    <main
      style={{
        position: "relative",
        height: "85vh",
        overflow: "hidden",
      }}
    >
      <Spline
        style={{
          width: "100%",
          height: "100vh",
          position: "absolute",
          top: " -15%",
          left: " 0",
          zIndex: "0",
          objectFit: "contain",
        }}
        scene="/sign.splinecode"
      />
    </main>
  );
}
