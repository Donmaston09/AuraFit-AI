import { useEffect, useRef, useState } from "react";
import type { NormalizedLandmark, PoseLandmarker as PoseLandmarkerType } from "@mediapipe/tasks-vision";
import { type WorkoutExercise } from "@/lib/fitness";

type UsePoseWorkoutOptions = {
  exercise: WorkoutExercise;
};

type FormQuality = "good" | "warn" | "idle";
type CameraFacingMode = "user" | "environment";

type WorkoutSnapshot = {
  exercise: WorkoutExercise;
  reps: number;
  durationSeconds: number;
};

type PoseState = "up" | "down";

const MODEL_ASSET =
  import.meta.env.VITE_MEDIAPIPE_MODEL_ASSET_URL ??
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task";

const WASM_ROOT =
  import.meta.env.VITE_MEDIAPIPE_WASM_ROOT ??
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";

const importantConnections: Array<[number, number]> = [
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 12],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
];

function calculateAngle(a: NormalizedLandmark, b: NormalizedLandmark, c: NormalizedLandmark) {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let degrees = Math.abs((radians * 180) / Math.PI);

  if (degrees > 180) {
    degrees = 360 - degrees;
  }

  return degrees;
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function landmarkVisible(landmark?: NormalizedLandmark) {
  return Boolean(landmark && (landmark.visibility ?? 1) > 0.45);
}

function describeCameraError(cameraError: unknown) {
  if (cameraError instanceof DOMException) {
    if (cameraError.name === "NotAllowedError") {
      return "Camera access was denied. Allow camera permission in your browser and try again.";
    }

    if (cameraError.name === "NotFoundError" || cameraError.name === "OverconstrainedError") {
      return "The selected camera is unavailable on this device. Try switching cameras or closing other camera apps.";
    }

    if (cameraError.name === "NotReadableError") {
      return "The camera is busy in another app or browser tab. Close the other session and try again.";
    }
  }

  return cameraError instanceof Error
    ? cameraError.message
    : "Unable to access the camera.";
}

export function usePoseWorkout({ exercise }: UsePoseWorkoutOptions) {
  const [detectorReady, setDetectorReady] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<CameraFacingMode>("user");
  const [repCount, setRepCount] = useState(0);
  const [feedback, setFeedback] = useState("Press start to begin.");
  const [formQuality, setFormQuality] = useState<FormQuality>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Preparing TensorFlow.js and Mediapipe.");
  const [error, setError] = useState("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarkerType | null>(null);
  const tfModuleRef = useRef<typeof import("@tensorflow/tfjs") | null>(null);
  const visionModuleRef = useRef<typeof import("@mediapipe/tasks-vision") | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const repCountRef = useRef(0);
  const poseStateRef = useRef<PoseState>("up");
  const sessionStartedAtRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const stopStreamOnly = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function setupDetector() {
      try {
        const [tf, vision] = await Promise.all([
          import("@tensorflow/tfjs"),
          import("@mediapipe/tasks-vision"),
        ]);

        tfModuleRef.current = tf;
        visionModuleRef.current = vision;

        setStatusMessage("Warming up TensorFlow.js backend.");
        await tf.ready();
        await tf.setBackend("webgl").catch(() => tf.getBackend());

        setStatusMessage("Loading Mediapipe pose detector.");
        const filesetResolver = await vision.FilesetResolver.forVisionTasks(WASM_ROOT);
        const poseLandmarker = await vision.PoseLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: MODEL_ASSET,
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.55,
          minPosePresenceConfidence: 0.55,
          minTrackingConfidence: 0.55,
        });

        if (cancelled) {
          poseLandmarker.close();
          return;
        }

        poseLandmarkerRef.current = poseLandmarker;
        setDetectorReady(true);
        setStatusMessage(`Detector ready on ${tf.getBackend() || "browser"} backend.`);
      } catch (setupError) {
        setError(
          setupError instanceof Error
            ? setupError.message
            : "Unable to initialise the pose detector.",
        );
        setStatusMessage("Pose detector unavailable.");
      }
    }

    setupDetector();

    return () => {
      cancelled = true;
      stopMedia();
      poseLandmarkerRef.current?.close();
      poseLandmarkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    resetWorkout();
  }, [exercise]);

  const stopMedia = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    stopStreamOnly();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    ctx?.clearRect(0, 0, canvas?.width ?? 0, canvas?.height ?? 0);

    setIsActive(false);
  };

  const resetWorkout = () => {
    repCountRef.current = 0;
    poseStateRef.current = "up";
    setRepCount(0);
    setElapsedSeconds(0);
    setFeedback("Press start to begin.");
    setFormQuality("idle");
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    ctx?.clearRect(0, 0, canvas?.width ?? 0, canvas?.height ?? 0);
  };

  const analysePose = (landmarks: NormalizedLandmark[]) => {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    if (
      !landmarkVisible(leftShoulder) ||
      !landmarkVisible(rightShoulder) ||
      !landmarkVisible(leftHip) ||
      !landmarkVisible(rightHip)
    ) {
      setFeedback("Step fully into frame.");
      setFormQuality("idle");
      return;
    }

    if (exercise === "squats") {
      if (
        !landmarkVisible(leftKnee) ||
        !landmarkVisible(rightKnee) ||
        !landmarkVisible(leftAnkle) ||
        !landmarkVisible(rightAnkle)
      ) {
        setFeedback("Keep your lower body visible.");
        setFormQuality("warn");
        return;
      }

      const kneeAngle = average([
        calculateAngle(leftHip, leftKnee, leftAnkle),
        calculateAngle(rightHip, rightKnee, rightAnkle),
      ]);

      if (kneeAngle < 95) {
        poseStateRef.current = "down";
        setFeedback("Good depth. Drive upward.");
        setFormQuality("good");
      } else if (kneeAngle > 160 && poseStateRef.current === "down") {
        poseStateRef.current = "up";
        repCountRef.current += 1;
        setRepCount(repCountRef.current);
        setFeedback("Rep counted. Tall chest.");
        setFormQuality("good");
      } else {
        setFeedback("Go lower for full squat depth.");
        setFormQuality("warn");
      }

      return;
    }

    if (exercise === "pushups") {
      if (
        !landmarkVisible(leftElbow) ||
        !landmarkVisible(rightElbow) ||
        !landmarkVisible(leftWrist) ||
        !landmarkVisible(rightWrist) ||
        !landmarkVisible(leftKnee) ||
        !landmarkVisible(rightKnee)
      ) {
        setFeedback("Turn sideways and keep your full body visible.");
        setFormQuality("warn");
        return;
      }

      const elbowAngle = average([
        calculateAngle(leftShoulder, leftElbow, leftWrist),
        calculateAngle(rightShoulder, rightElbow, rightWrist),
      ]);
      const bodyLineAngle = average([
        calculateAngle(leftShoulder, leftHip, leftKnee),
        calculateAngle(rightShoulder, rightHip, rightKnee),
      ]);

      if (bodyLineAngle < 150) {
        setFeedback("Brace your core and keep a straighter body line.");
        setFormQuality("warn");
        return;
      }

      if (elbowAngle < 95) {
        poseStateRef.current = "down";
        setFeedback("Strong depth. Press up.");
        setFormQuality("good");
      } else if (elbowAngle > 155 && poseStateRef.current === "down") {
        poseStateRef.current = "up";
        repCountRef.current += 1;
        setRepCount(repCountRef.current);
        setFeedback("Rep counted. Neck neutral.");
        setFormQuality("good");
      } else {
        setFeedback("Lower until elbows bend to about 90 degrees.");
        setFormQuality("warn");
      }

      return;
    }

    if (
      !landmarkVisible(leftKnee) ||
      !landmarkVisible(rightKnee)
    ) {
      setFeedback("Keep your knees and hips visible.");
      setFormQuality("warn");
      return;
    }

    const hipAngle = average([
      calculateAngle(leftShoulder, leftHip, leftKnee),
      calculateAngle(rightShoulder, rightHip, rightKnee),
    ]);

    if (hipAngle < 82) {
      poseStateRef.current = "down";
      setFeedback("Nice curl. Control the way down.");
      setFormQuality("good");
    } else if (hipAngle > 118 && poseStateRef.current === "down") {
      poseStateRef.current = "up";
      repCountRef.current += 1;
      setRepCount(repCountRef.current);
      setFeedback("Rep counted. Keep it controlled.");
      setFormQuality("good");
    } else {
      setFeedback("Curl higher to finish the sit-up.");
      setFormQuality("warn");
    }
  };

  const drawPose = (landmarks: NormalizedLandmark[]) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    const DrawingUtils = visionModuleRef.current?.DrawingUtils;

    if (!ctx || !DrawingUtils) {
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const drawer = new DrawingUtils(ctx);

    drawer.drawConnectors(
      landmarks,
      importantConnections
        .filter(([start, end]) => landmarkVisible(landmarks[start]) && landmarkVisible(landmarks[end]))
        .map(([start, end]) => ({ start, end })),
      {
        color: "#2ee2ff",
        lineWidth: 3,
      },
    );

    landmarks.forEach((landmark) => {
      if (landmarkVisible(landmark)) {
        drawer.drawLandmarks([landmark], {
          color: "#9aff62",
          lineWidth: 1,
          radius: 4,
        });
      }
    });
  };

  const tick = () => {
    const video = videoRef.current;
    const poseLandmarker = poseLandmarkerRef.current;

    if (!video || !poseLandmarker || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      const result = poseLandmarker.detectForVideo(video, performance.now());
      const landmarks = result.landmarks[0];

      if (landmarks) {
        drawPose(landmarks);
        analysePose(landmarks);
      } else {
        const ctx = canvasRef.current?.getContext("2d");
        ctx?.clearRect(0, 0, canvasRef.current?.width ?? 0, canvasRef.current?.height ?? 0);
        setFeedback("No pose detected. Adjust your distance.");
        setFormQuality("idle");
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  };

  const startWorkout = async () => {
    if (!poseLandmarkerRef.current || isActive) {
      return;
    }

    try {
      setError("");
      resetWorkout();
      setStatusMessage(
        cameraFacingMode === "user"
          ? "Requesting front camera access."
          : "Requesting rear camera access.",
      );

      stopStreamOnly();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: cameraFacingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      const video = videoRef.current;

      if (!video) {
        throw new Error("Video element unavailable.");
      }

      video.srcObject = stream;
      await video.play();
      lastVideoTimeRef.current = -1;

      setIsActive(true);
      setFeedback("Tracking live form.");
      setFormQuality("good");
      setStatusMessage("Workout live. Pose estimation runs on-device.");
      sessionStartedAtRef.current = Date.now();

      timerRef.current = window.setInterval(() => {
        if (!sessionStartedAtRef.current) {
          return;
        }

        setElapsedSeconds(
          Math.floor((Date.now() - sessionStartedAtRef.current) / 1000),
        );
      }, 1000);

      rafRef.current = requestAnimationFrame(tick);
    } catch (cameraError) {
      setError(describeCameraError(cameraError));
      setStatusMessage("Camera access blocked.");
      stopMedia();
    }
  };

  const toggleCameraFacingMode = async () => {
    const nextFacingMode = cameraFacingMode === "user" ? "environment" : "user";
    setCameraFacingMode(nextFacingMode);

    if (!isActive || !poseLandmarkerRef.current) {
      setStatusMessage(
        nextFacingMode === "user"
          ? "Front camera selected. Start a workout when ready."
          : "Rear camera selected. Start a workout when ready.",
      );
      return;
    }

    const previousRaf = rafRef.current;
    if (previousRaf) {
      cancelAnimationFrame(previousRaf);
      rafRef.current = null;
    }

    try {
      setError("");
      setStatusMessage(
        nextFacingMode === "user"
          ? "Switching to the front camera."
          : "Switching to the rear camera.",
      );

      stopStreamOnly();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: nextFacingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        throw new Error("Video element unavailable.");
      }

      video.srcObject = stream;
      await video.play();
      lastVideoTimeRef.current = -1;
      setStatusMessage("Camera switched. Workout continues.");
      rafRef.current = requestAnimationFrame(tick);
    } catch (cameraError) {
      setCameraFacingMode((currentMode) =>
        currentMode === "user" ? "environment" : "user",
      );
      setError(describeCameraError(cameraError));
      setStatusMessage("Unable to switch cameras.");
      stopMedia();
    }
  };

  const stopWorkout = (): WorkoutSnapshot | null => {
    if (!sessionStartedAtRef.current) {
      stopMedia();
      return null;
    }

    const durationSeconds = Math.max(
      1,
      Math.floor((Date.now() - sessionStartedAtRef.current) / 1000),
    );
    const snapshot = {
      exercise,
      reps: repCountRef.current,
      durationSeconds,
    };

    setStatusMessage("Workout paused. Summary updated locally.");
    setFeedback(snapshot.reps > 0 ? "Block completed." : "No reps counted in this block.");
    sessionStartedAtRef.current = null;
    stopMedia();

    return snapshot;
  };

  return {
    canvasRef,
    videoRef,
    cameraFacingMode,
    detectorReady,
    isActive,
    feedback,
    formQuality,
    repCount,
    elapsedSeconds,
    statusMessage,
    error,
    startWorkout,
    stopWorkout,
    toggleCameraFacingMode,
    resetWorkout,
  };
}
