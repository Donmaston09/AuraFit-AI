import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BedDouble,
  Camera,
  CheckCircle2,
  CircleDollarSign,
  Dumbbell,
  ExternalLink,
  LoaderCircle,
  Mail,
  RefreshCcw,
  Salad,
  ShieldAlert,
  Sparkles,
  TimerReset,
  University,
  UserRound,
  Waves,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { type CoachPayload, defaultBiometrics, exerciseOptions, goalOptions, type WorkoutExercise, workoutPlanByGoal } from "@/lib/fitness";
import { usePoseWorkout } from "@/hooks/usePoseWorkout";

type WorkoutSummary = Record<WorkoutExercise, number>;

type CoachResponse = {
  overview: string;
  complementaryExercises: Array<{ name: string; instructions: string }>;
  mealPlan: {
    title: string;
    items: string[];
  };
  sleepAdvice: string[];
  stressAdvice: string[];
  disclaimer: string;
};

const defaultSummary: WorkoutSummary = {
  pushups: 0,
  squats: 0,
  situps: 0,
};

const backdropMotion = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: "easeOut" as const },
};

function App() {
  const [selectedExercise, setSelectedExercise] = useState<WorkoutExercise>("squats");
  const [goal, setGoal] = useState(goalOptions[0].value);
  const [biometrics, setBiometrics] = useState(defaultBiometrics);
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [apiBaseUrl, setApiBaseUrl] = useState(
    import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000",
  );
  const [provider, setProvider] = useState<"openai" | "gemini">("openai");
  const [model, setModel] = useState("gpt-4.1-mini");
  const [apiKey, setApiKey] = useState("");
  const [notes, setNotes] = useState("");
  const [workoutSummary, setWorkoutSummary] = useState<WorkoutSummary>(defaultSummary);
  const [sessionHistory, setSessionHistory] = useState<
    Array<{ exercise: WorkoutExercise; reps: number; durationSeconds: number; completedAt: string }>
  >([]);
  const [coachResult, setCoachResult] = useState<CoachResponse | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState("");

  const {
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
  } = usePoseWorkout({ exercise: selectedExercise });

  const todaysPlan = useMemo(() => workoutPlanByGoal[goal], [goal]);
  const totalReps = useMemo(
    () => Object.values(workoutSummary).reduce((total, value) => total + value, 0),
    [workoutSummary],
  );

  const handleBiometricChange = (field: keyof typeof biometrics, value: string) => {
    setBiometrics((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleStartWorkout = async () => {
    setCoachError("");
    await startWorkout();
  };

  const handleStopWorkout = () => {
    const snapshot = stopWorkout();

    if (!snapshot || snapshot.reps === 0) {
      return;
    }

    setWorkoutSummary((current) => ({
      ...current,
      [snapshot.exercise]: current[snapshot.exercise] + snapshot.reps,
    }));

    setSessionHistory((current) => [
      {
        exercise: snapshot.exercise,
        reps: snapshot.reps,
        durationSeconds: snapshot.durationSeconds,
        completedAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
      ...current,
    ]);
  };

  const handleResetSession = () => {
    resetWorkout();
    setWorkoutSummary(defaultSummary);
    setSessionHistory([]);
    setCoachResult(null);
    setCoachError("");
  };

  const handleGenerateCoach = async () => {
    const age = Number(biometrics.age);
    const weightKg = Number(biometrics.weightKg);
    const heightCm = Number(biometrics.heightCm);
    const trimmedApiBaseUrl = apiBaseUrl.trim();
    const trimmedModel = model.trim();
    const trimmedApiKey = apiKey.trim();
    const trimmedNotes = notes.trim();

    if (!trimmedApiBaseUrl) {
      setCoachError("Add your backend URL before generating coaching advice.");
      return;
    }

    try {
      new URL(trimmedApiBaseUrl);
    } catch {
      setCoachError("Use a valid backend URL, for example https://your-api.onrender.com.");
      return;
    }

    if (!Number.isFinite(age) || age < 13 || age > 120) {
      setCoachError("Enter an age between 13 and 120.");
      return;
    }

    if (!Number.isFinite(weightKg) || weightKg < 20 || weightKg > 400) {
      setCoachError("Enter a weight between 20 kg and 400 kg.");
      return;
    }

    if (!Number.isFinite(heightCm) || heightCm < 90 || heightCm > 260) {
      setCoachError("Enter a height between 90 cm and 260 cm.");
      return;
    }

    if (!trimmedModel) {
      setCoachError("Choose a model before generating coaching advice.");
      return;
    }

    if (!trimmedApiKey) {
      setCoachError("Paste your API key for this session before continuing.");
      return;
    }

    if (trimmedNotes.length > 1200) {
      setCoachError("Coach notes must stay under 1200 characters.");
      return;
    }

    setCoachLoading(true);
    setCoachError("");

    const payload: CoachPayload = {
      provider,
      model: trimmedModel,
      apiKey: trimmedApiKey,
      goals: goal,
      activityLevel,
      biometrics: {
        age: String(age),
        weightKg: String(weightKg),
        heightCm: String(heightCm),
      },
      workoutSummary,
      notes: trimmedNotes,
    };

    try {
      const response = await fetch(`${trimmedApiBaseUrl.replace(/\/$/, "")}/api/coach/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.detail || "Unable to generate coaching advice.");
      }

      setCoachResult(body);
    } catch (requestError) {
      setCoachError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to reach the AI coaching service.",
      );
    } finally {
      setCoachLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(46,226,255,0.22),_transparent_22%),radial-gradient(circle_at_80%_20%,_rgba(87,255,158,0.12),_transparent_18%),linear-gradient(180deg,_#02070f_0%,_#07111f_45%,_#030712_100%)] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <motion.header
          {...backdropMotion}
          className="mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_0_60px_rgba(26,163,255,0.08)] backdrop-blur-xl"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                AuraFit AI
              </div>
              <div className="space-y-3">
                <h1 className="max-w-2xl font-serif text-4xl tracking-tight text-white sm:text-5xl">
                  Real-time personal training with on-device pose analysis and AI recovery coaching.
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  Camera processing stays in your browser. Only your workout summary and the inputs you choose are sent to your own LLM key for recommendations.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard label="Detector" value={detectorReady ? "Ready" : "Loading"} hint={statusMessage} />
              <MetricCard label="Session reps" value={String(totalReps)} hint="Across all exercises" />
              <MetricCard label="Coach mode" value={provider === "openai" ? "OpenAI" : "Gemini"} hint="BYOK only" />
            </div>
          </div>
        </motion.header>

        <main className="grid flex-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <motion.section {...backdropMotion}>
              <Card className="overflow-hidden border-white/10 bg-slate-950/55 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur">
                <CardHeader className="border-b border-white/10">
                  <CardTitle className="flex items-center gap-2 text-xl text-white">
                    <Camera className="h-5 w-5 text-cyan-300" />
                    Workout Mode
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-5 sm:p-6">
                  <div className="grid gap-4 md:grid-cols-[0.72fr_0.28fr]">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900">
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className={cn(
                          "h-full w-full object-cover",
                          cameraFacingMode === "user" ? "scale-x-[-1]" : "",
                        )}
                      />
                      <canvas
                        ref={canvasRef}
                        className={cn(
                          "pointer-events-none absolute inset-0 h-full w-full",
                          cameraFacingMode === "user" ? "scale-x-[-1]" : "",
                        )}
                      />
                      <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between gap-3">
                        <OverlayBadge
                          label="Form Check"
                          value={feedback}
                          accent={formQuality === "good" ? "green" : formQuality === "warn" ? "amber" : "cyan"}
                        />
                        <OverlayBadge
                          label="Live Reps"
                          value={String(repCount)}
                          accent="cyan"
                        />
                      </div>
                      <div className="pointer-events-none absolute inset-x-4 bottom-4 grid gap-3 sm:grid-cols-3">
                        <OverlayStat label="Exercise" value={exerciseOptions[selectedExercise].label} />
                        <OverlayStat label="Elapsed" value={`${elapsedSeconds}s`} />
                        <OverlayStat label="Status" value={isActive ? "Tracking" : "Idle"} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="exercise">Select exercise</Label>
                        <Select
                          disabled={isActive}
                          value={selectedExercise}
                          onValueChange={(value: WorkoutExercise) => {
                            setSelectedExercise(value);
                            resetWorkout();
                          }}
                        >
                          <SelectTrigger id="exercise" className="border-white/10 bg-white/5 text-white">
                            <SelectValue placeholder="Choose exercise" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(exerciseOptions).map(([value, option]) => (
                              <SelectItem key={value} value={value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label>Camera</Label>
                        <Button
                          onClick={toggleCameraFacingMode}
                          variant="secondary"
                          className="h-11 justify-between rounded-xl border border-white/10 bg-white/8 text-white hover:bg-white/12"
                        >
                          <span>{cameraFacingMode === "user" ? "Front camera" : "Rear camera"}</span>
                          <RefreshCcw className="h-4 w-4 text-cyan-300" />
                        </Button>
                        <p className="text-xs text-slate-400">
                          Swap between selfie and outward-facing cameras on phones without leaving the workout screen.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/8 p-4 text-sm text-slate-200">
                        <p className="font-medium text-cyan-100">
                          {exerciseOptions[selectedExercise].setup}
                        </p>
                        <p className="mt-2 text-slate-300">
                          {exerciseOptions[selectedExercise].hint}
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Button
                          onClick={handleStartWorkout}
                          disabled={isActive}
                          className="h-11 rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                        >
                          Start AI Workout
                        </Button>
                        <Button
                          onClick={handleStopWorkout}
                          disabled={!isActive}
                          variant="secondary"
                          className="h-11 rounded-xl border border-white/10 bg-white/8 text-white hover:bg-white/12"
                        >
                          Stop and Add to Summary
                        </Button>
                        <Button
                          onClick={resetWorkout}
                          variant="ghost"
                          className="h-11 rounded-xl border border-white/10 text-slate-200 hover:bg-white/8"
                        >
                          Reset Current Counter
                        </Button>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                        <div className="flex items-center gap-2 text-white">
                          <Activity className="h-4 w-4 text-emerald-300" />
                          Live tracking status
                        </div>
                        <p className="mt-2">{error || statusMessage}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            <motion.section
              {...backdropMotion}
              transition={{ ...backdropMotion.transition, delay: 0.08 }}
              className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]"
            >
              <Card className="border-white/10 bg-slate-950/55 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Dumbbell className="h-5 w-5 text-lime-300" />
                    Today's Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-2">
                    <Label htmlFor="goal">Primary goal</Label>
                    <Select value={goal} onValueChange={setGoal}>
                      <SelectTrigger id="goal" className="border-white/10 bg-white/5 text-white">
                        <SelectValue placeholder="Choose your goal" />
                      </SelectTrigger>
                      <SelectContent>
                        {goalOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-3">
                    <PlanTile icon={Dumbbell} title="Workout focus" body={todaysPlan.workout} />
                    <PlanTile icon={Salad} title="Nutrition focus" body={todaysPlan.nutrition} />
                    <PlanTile icon={BedDouble} title="Recovery focus" body={todaysPlan.recovery} />
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <TimerReset className="h-4 w-4 text-cyan-300" />
                      Workout summary
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {Object.entries(workoutSummary).map(([exercise, count]) => (
                        <div
                          key={exercise}
                          className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-center"
                        >
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                            {exerciseOptions[exercise as WorkoutExercise].label}
                          </p>
                          <p className="mt-2 text-3xl font-semibold text-white">{count}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-slate-950/55 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Sparkles className="h-5 w-5 text-cyan-300" />
                    Holistic Coach Inputs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <FieldInput
                      label="Age"
                      value={biometrics.age}
                      onChange={(value) => handleBiometricChange("age", value)}
                    />
                    <FieldInput
                      label="Weight (kg)"
                      value={biometrics.weightKg}
                      onChange={(value) => handleBiometricChange("weightKg", value)}
                    />
                    <FieldInput
                      label="Height (cm)"
                      value={biometrics.heightCm}
                      onChange={(value) => handleBiometricChange("heightCm", value)}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="grid gap-2">
                      <Label htmlFor="activity-level">Activity level</Label>
                      <Select value={activityLevel} onValueChange={setActivityLevel}>
                        <SelectTrigger id="activity-level" className="border-white/10 bg-white/5 text-white">
                          <SelectValue placeholder="Activity level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="provider">Provider</Label>
                      <Select
                        value={provider}
                        onValueChange={(value: "openai" | "gemini") => {
                          setProvider(value);
                          setModel(value === "openai" ? "gpt-4.1-mini" : "gemini-2.5-flash");
                        }}
                      >
                        <SelectTrigger id="provider" className="border-white/10 bg-white/5 text-white">
                          <SelectValue placeholder="Choose provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="gemini">Gemini</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <FieldInput label="Model" value={model} onChange={setModel} />
                  </div>

                  <FieldInput
                    label="API base URL"
                    value={apiBaseUrl}
                    onChange={setApiBaseUrl}
                    placeholder="http://127.0.0.1:8000"
                  />

                  <div className="grid gap-2">
                    <Label htmlFor="api-key">Bring your own API key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      value={apiKey}
                      onChange={(event) => setApiKey(event.target.value)}
                      className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                      placeholder="Paste your provider key for this session"
                    />
                    <p className="text-xs text-slate-400">
                      AuraFit does not store your key in the browser. It is forwarded to the stateless backend only for this request.
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="notes">Context for the coach</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      className="min-h-28 border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                      placeholder="Examples: desk job, training for fat loss, sore shoulders, sleeping 6 hours lately."
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      onClick={handleGenerateCoach}
                      disabled={coachLoading || totalReps === 0 || !apiKey}
                      className="h-11 rounded-xl bg-lime-300 text-slate-950 hover:bg-lime-200"
                    >
                      {coachLoading ? (
                        <>
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          Generating recommendations
                        </>
                      ) : (
                        "Generate AI Summary"
                      )}
                    </Button>
                    <Button
                      onClick={handleResetSession}
                      variant="ghost"
                      className="h-11 rounded-xl border border-white/10 text-slate-200 hover:bg-white/8"
                    >
                      Clear Day Session
                    </Button>
                  </div>

                  {coachError ? (
                    <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
                      {coachError}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </motion.section>
          </div>

          <div className="space-y-6">
            <motion.section
              {...backdropMotion}
              transition={{ ...backdropMotion.transition, delay: 0.12 }}
            >
              <Card className="border-white/10 bg-slate-950/55 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Waves className="h-5 w-5 text-cyan-300" />
                    Session Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sessionHistory.length === 0 ? (
                    <EmptyState text="Finish a workout block to build your daily timeline." />
                  ) : (
                    sessionHistory.map((item, index) => (
                      <div
                        key={`${item.exercise}-${item.completedAt}-${index}`}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-white">
                              {exerciseOptions[item.exercise].label}
                            </p>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                              {item.completedAt}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-semibold text-cyan-200">{item.reps}</p>
                            <p className="text-xs text-slate-400">{item.durationSeconds}s tracked</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.section>

            <motion.section
              {...backdropMotion}
              transition={{ ...backdropMotion.transition, delay: 0.18 }}
            >
              <Card className="border-white/10 bg-slate-950/55 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <CheckCircle2 className="h-5 w-5 text-lime-300" />
                    AI Coach Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AnimatePresence mode="wait">
                    {coachResult ? (
                      <motion.div
                        key="coach-ready"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -14 }}
                        className="space-y-5"
                      >
                        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/8 p-4 text-sm leading-6 text-slate-200">
                          {coachResult.overview}
                        </div>

                        <SummaryBlock
                          title="Complementary exercises"
                          items={coachResult.complementaryExercises.map(
                            (exercise) => `${exercise.name}: ${exercise.instructions}`,
                          )}
                        />
                        <SummaryBlock
                          title={coachResult.mealPlan.title}
                          items={coachResult.mealPlan.items}
                        />
                        <SummaryBlock title="Sleep hygiene" items={coachResult.sleepAdvice} />
                        <SummaryBlock title="Stress management" items={coachResult.stressAdvice} />

                        <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4 text-xs leading-5 text-amber-100">
                          {coachResult.disclaimer}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="coach-empty"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -14 }}
                      >
                        <EmptyState text="Your post-workout analysis will appear here with exercise suggestions, meal guidance, and recovery habits." />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.section>

            <motion.section
              {...backdropMotion}
              transition={{ ...backdropMotion.transition, delay: 0.24 }}
            >
              <Card className="border-white/10 bg-slate-950/55 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <UserRound className="h-5 w-5 text-cyan-300" />
                    Creator And Mission
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start gap-3">
                      <UserRound className="mt-0.5 h-5 w-5 shrink-0 text-cyan-200" />
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-white">Anthony Onoja</p>
                        <p className="flex items-center gap-2 text-sm text-slate-300">
                          <University className="h-4 w-4 text-lime-300" />
                          School of Health Sciences, University of Surrey
                        </p>
                        <a
                          href="mailto:donmaston09@gmail.com"
                          className="inline-flex items-center gap-2 text-sm text-cyan-200 transition hover:text-cyan-100"
                        >
                          <Mail className="h-4 w-4" />
                          donmaston09@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-lime-400/20 bg-lime-400/8 p-4">
                    <div className="flex items-start gap-3">
                      <CircleDollarSign className="mt-0.5 h-5 w-5 shrink-0 text-lime-300" />
                      <div className="space-y-3">
                        <p className="text-sm leading-6 text-slate-200">
                          Support my work: I am raising funds for internally displaced children across Middle Belt Nigeria as a result of the ongoing genocide to fund access to education and AI literacy.
                        </p>
                        <a
                          href="https://paypal.me/Onoja412"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-lime-300/30 bg-lime-300/15 px-4 py-2 text-sm font-medium text-lime-100 transition hover:bg-lime-300/25"
                        >
                          Support via PayPal
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.section>

            <motion.section
              {...backdropMotion}
              transition={{ ...backdropMotion.transition, delay: 0.24 }}
            >
              <Card className="border-amber-400/20 bg-amber-500/8 backdrop-blur">
                <CardContent className="flex gap-3 p-5">
                  <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
                  <p className="text-sm leading-6 text-amber-50">
                    AuraFit AI provides informational exercise, nutrition, sleep, and stress guidance generated by AI. It is not medical advice, does not diagnose conditions, and should not replace a qualified clinician, dietitian, physiotherapist, or trainer.
                  </p>
                </CardContent>
              </Card>
            </motion.section>
          </div>
        </main>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  );
}

function PlanTile({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Dumbbell;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-white">
        <Icon className="h-4 w-4 text-cyan-300" />
        {title}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
    </div>
  );
}

function OverlayBadge({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "cyan" | "green" | "amber";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 backdrop-blur-md",
        accent === "green" && "border-emerald-300/40 bg-emerald-400/20 text-emerald-50",
        accent === "amber" && "border-amber-300/40 bg-amber-400/18 text-amber-50",
        accent === "cyan" && "border-cyan-300/40 bg-slate-950/55 text-cyan-50",
      )}
    >
      <p className="text-[11px] uppercase tracking-[0.22em] opacity-80">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function OverlayStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 backdrop-blur">
      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const fieldId = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <div className="grid gap-2">
      <Label htmlFor={fieldId}>{label}</Label>
      <Input
        id={fieldId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
        placeholder={placeholder}
      />
    </div>
  );
}

function SummaryBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
        {title}
      </h3>
      <div className="mt-3 space-y-3">
        {items.map((item) => (
          <p key={item} className="text-sm leading-6 text-slate-200">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/4 p-5 text-sm leading-6 text-slate-400">
      {text}
    </div>
  );
}

export default App;
