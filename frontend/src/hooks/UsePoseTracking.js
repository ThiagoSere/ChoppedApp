import { useEffect, useRef, useCallback } from 'react';

const LANDMARKS = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

function calcAngle(a, b, c) {
  if (!a || !b || !c) return null;
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const mag = Math.sqrt(ab.x ** 2 + ab.y ** 2) * Math.sqrt(cb.x ** 2 + cb.y ** 2);
  if (!mag) return null;
  const cosine = Math.max(-1, Math.min(1, dot / mag));
  return Math.round(Math.acos(cosine) * (180 / Math.PI));
}

function calcAngles(landmarks) {
  if (!landmarks || landmarks.length < 29) return null;
  return {
    leftElbow: calcAngle(
      landmarks[LANDMARKS.LEFT_SHOULDER],
      landmarks[LANDMARKS.LEFT_ELBOW],
      landmarks[LANDMARKS.LEFT_WRIST]
    ),
    rightElbow: calcAngle(
      landmarks[LANDMARKS.RIGHT_SHOULDER],
      landmarks[LANDMARKS.RIGHT_ELBOW],
      landmarks[LANDMARKS.RIGHT_WRIST]
    ),
    leftKnee: calcAngle(
      landmarks[LANDMARKS.LEFT_HIP],
      landmarks[LANDMARKS.LEFT_KNEE],
      landmarks[LANDMARKS.LEFT_ANKLE]
    ),
    rightKnee: calcAngle(
      landmarks[LANDMARKS.RIGHT_HIP],
      landmarks[LANDMARKS.RIGHT_KNEE],
      landmarks[LANDMARKS.RIGHT_ANKLE]
    ),
  };
}

export function usePoseTracking({ enabled, onAngles, onReady, onError }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);

  const drawSkeleton = useCallback((landmarks, canvas) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!landmarks?.length) return;

    const w = canvas.width;
    const h = canvas.height;

    const connections = [
      [11, 13], [13, 15],
      [12, 14], [14, 16],
      [11, 12],
      [11, 23], [12, 24],
      [23, 24],
      [23, 25], [25, 27],
      [24, 26], [26, 28],
    ];

    ctx.strokeStyle = 'rgba(61, 139, 239, 0.75)';
    ctx.lineWidth = 2;

    connections.forEach(([a, b]) => {
      const p1 = landmarks[a];
      const p2 = landmarks[b];
      if (!p1 || !p2 || p1.visibility < 0.5 || p2.visibility < 0.5) return;
      ctx.beginPath();
      ctx.moveTo(p1.x * w, p1.y * h);
      ctx.lineTo(p2.x * w, p2.y * h);
      ctx.stroke();
    });

    Object.values(LANDMARKS).forEach((idx) => {
      const p = landmarks[idx];
      if (!p || p.visibility < 0.5) return;
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#3d8bef';
      ctx.fill();
    });
  }, []);

  const detect = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const detector = detectorRef.current;

    if (!video || !canvas || !detector || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detect);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    let result = null;
    try {
      result = detector.detectForVideo(video, performance.now());
    } catch {
      rafRef.current = requestAnimationFrame(detect);
      return;
    }

    if (result?.landmarks?.length) {
      const landmarks = result.landmarks[0];
      drawSkeleton(landmarks, canvas);
      onAngles?.(calcAngles(landmarks));
    } else {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    rafRef.current = requestAnimationFrame(detect);
  }, [drawSkeleton, onAngles]);

  useEffect(() => {
    if (!enabled) return undefined;

    let cancelled = false;

    async function init() {
      try {
        const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        const detector = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        });

        if (cancelled) {
          detector.close();
          return;
        }

        detectorRef.current = detector;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        onReady?.();
        rafRef.current = requestAnimationFrame(detect);
      } catch (e) {
        onError?.(e?.message || 'Error iniciando tracking');
      }
    }

    init();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (detectorRef.current) detectorRef.current.close();
      detectorRef.current = null;
      streamRef.current = null;
    };
  }, [enabled, detect, onReady, onError]);

  return { videoRef, canvasRef };
}
