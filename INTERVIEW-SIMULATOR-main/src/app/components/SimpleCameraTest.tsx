import { useEffect, useRef, useState } from "react";

export default function SimpleCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState("Click button to start");
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    setStatus("Requesting permission...");
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      setStream(mediaStream);
      setStatus("Stream obtained, connecting to video...");
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        setStatus("✅ Camera working!");
      }
    } catch (err: any) {
      setStatus("❌ Error: " + err.message);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setStatus("Camera stopped");
    }
  };

  return (
    <div style={{ padding: "20px", background: "black", minHeight: "100vh" }}>
      <h2 style={{ color: "white", marginBottom: "10px" }}>Simple Camera Test</h2>
      <p style={{ color: "#888", marginBottom: "20px" }}>{status}</p>
      
      <button 
        onClick={stream ? stopCamera : startCamera}
        style={{
          padding: "10px 20px",
          background: stream ? "red" : "green",
          color: "white",
          border: "none",
          borderRadius: "8px",
          marginBottom: "20px",
          cursor: "pointer"
        }}
      >
        {stream ? "Stop Camera" : "Start Camera"}
      </button>
      
      <div style={{ 
        width: "640px", 
        height: "480px", 
        background: "#222",
        borderRadius: "12px",
        overflow: "hidden",
        border: "3px solid #444"
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scaleX(-1)"
          }}
        />
      </div>
    </div>
  );
}