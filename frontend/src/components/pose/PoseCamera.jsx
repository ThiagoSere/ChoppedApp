export default function PoseCamera({ videoRef, canvasRef, loading }) {
  return (
    <div className="pose-camera-wrap">
      <video ref={videoRef} playsInline muted className="pose-video" />
      <canvas ref={canvasRef} className="pose-canvas" />

      {loading && (
        <div className="pose-loading-overlay">
          <div className="pose-loader" />
          <span>Cargando modelo...</span>
        </div>
      )}

      <div className="pose-live-badge">EN VIVO</div>
    </div>
  );
}
