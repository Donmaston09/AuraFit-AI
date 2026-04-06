export type WorkoutExercise = "pushups" | "squats" | "situps";

export type Biometrics = {
  age: string;
  weightKg: string;
  heightCm: string;
};

export type CoachPayload = {
  provider: "openai" | "gemini";
  model: string;
  apiKey: string;
  goals: string;
  activityLevel: string;
  biometrics: Biometrics;
  workoutSummary: Record<WorkoutExercise, number>;
  notes: string;
};

export const defaultBiometrics: Biometrics = {
  age: "29",
  weightKg: "72",
  heightCm: "172",
};

export const goalOptions = [
  { value: "strength", label: "Strength" },
  { value: "weight-loss", label: "Weight loss" },
  { value: "mobility", label: "Mobility and consistency" },
];

export const workoutPlanByGoal: Record<string, { workout: string; nutrition: string; recovery: string }> = {
  strength: {
    workout: "Open with 2 rounds of squats and pushups, then finish with slow sit-ups for trunk control.",
    nutrition: "Anchor each meal around protein, a slow carb, and hydration before adding snacks.",
    recovery: "Keep the evening easy, stretch hip flexors, and protect sleep quality to support tissue repair.",
  },
  "weight-loss": {
    workout: "Alternate bodyweight circuits with short rest so the session stays brisk without sacrificing form.",
    nutrition: "Prioritize fiber, protein, and repeatable meals that make a calorie deficit easier to sustain.",
    recovery: "Aim for a consistent bedtime so hunger cues and training energy stay more stable.",
  },
  mobility: {
    workout: "Move through clean, controlled reps and pause in the hardest positions to build stability.",
    nutrition: "Use balanced meals and hydration to support recovery without overcomplicating the plan.",
    recovery: "Add light walking and a short breathing reset after training to lower tension before bed.",
  },
};

export const exerciseOptions: Record<WorkoutExercise, { label: string; setup: string; hint: string }> = {
  pushups: {
    label: "Pushups",
    setup: "Turn sideways to the camera so your shoulders, hips, and elbows are easy to read.",
    hint: "The counter watches elbow flexion and body alignment. Keep a straight line from shoulders through knees or ankles.",
  },
  squats: {
    label: "Squats",
    setup: "Stand far enough back that your full body stays visible from shoulders to ankles.",
    hint: "Reps count when you return to standing after reaching squat depth. The form check will ask for more depth if needed.",
  },
  situps: {
    label: "Sit-ups",
    setup: "Angle the camera from the side and keep your knees bent so hip flexion is easier to detect.",
    hint: "Reps count when you curl up and return with control. The tracker uses hip angle changes to estimate each sit-up.",
  },
};
