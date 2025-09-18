import { useEffect, useRef, useState } from 'react';

interface PhotoCaptureProps {
  onComplete: (data: unknown) => void;
  onError: (error: string) => void;
}

export default function PhotoCapture({ onComplete, onError }: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const videoElement = videoRef.current;
    void (async () => {
      try {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoElement) {
          videoElement.srcObject = stream;
        }
      } catch {
        onError('Camera access denied');
      }
    })();
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => { t.stop(); });
      }
      if (videoElement) {
        videoElement.srcObject = null;
      }
    };
  }, [onError]);

  const capture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    setIsProcessing(true);
    try {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: dataUrl })
      });
      const json = await res.json() as { data: unknown; error?: string };
      if (!res.ok) throw new Error(json.error ?? 'OCR failed');
      onComplete(json.data);
    } catch (e) {
      onError(e instanceof Error ? e.message : 'OCR failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-24px bg-white rounded-lg shadow-md space-y-16px">
      <video ref={videoRef} autoPlay playsInline className="w-full rounded" />
      <canvas ref={canvasRef} className="hidden" />
      <div className="btn-row">
        <button className="btn btn-primary" disabled={isProcessing} onClick={() => { void capture(); }}>
          {isProcessing ? 'Processing…' : 'Capture & OCR'}
        </button>
      </div>
    </div>
  );
}


