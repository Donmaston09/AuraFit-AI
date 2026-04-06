import { useState } from "react";
import {
  Bookmark,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  GraduationCap,
  HandCoins,
  Lightbulb,
  MessageSquare,
  Play,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { siteConfig } from "@/lib/site";

const sections = [
  {
    title: "Common Questions",
    description: "The most frequent questions asked in graduate and early-career interviews.",
    questions: [
      {
        id: 1,
        q: "Tell me about yourself.",
        tips: "Keep it focused on present direction, relevant experience, and why this role fits your next step.",
        answer: "Begin with your current background, highlight a relevant achievement or project, and close with why you are interested in the role.",
      },
      {
        id: 2,
        q: "What is your greatest weakness?",
        tips: "Choose a real but manageable weakness and show the action you are taking to improve it.",
        answer: "Describe a professional weakness honestly, explain how you recognised it, and show what has changed in your approach.",
      },
      {
        id: 3,
        q: "Where do you see yourself in 5 years?",
        tips: "Align your ambition with growth, contribution, and learning inside a realistic path.",
        answer: "Speak about deepening your expertise, taking on more responsibility, and contributing meaningfully to a strong team.",
      },
    ],
  },
  {
    title: "Behavioral Questions",
    description: "Questions about previous experiences using a clear STAR structure.",
    questions: [
      {
        id: 4,
        q: "Describe a time you dealt with a difficult team member.",
        tips: "Use Situation, Task, Action, Result and keep the tone professional rather than emotional.",
        answer: "Focus on how you listened, clarified the issue, took action, and helped the team move toward a workable resolution.",
      },
    ],
  },
];

export default function InterviewPrep() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [completed, setCompleted] = useState<number[]>([]);

  const toggleComplete = (id: number) => {
    setCompleted((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const totalQuestions = sections.reduce((acc, section) => acc + section.questions.length, 0);
  const progressPercent = Math.round((completed.length / totalQuestions) * 100);

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <div className="relative mb-8 h-48 overflow-hidden rounded-3xl bg-[linear-gradient(135deg,_#0f172a,_#14532d_45%,_#f59e0b)]">
        <div className="absolute inset-0 flex items-center p-8">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-white">Interview Mastery</h1>
            <p className="text-slate-200">
              Practice questions, stronger answers, and better delivery before recruiter conversations.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">
                <GraduationCap className="text-blue-600" size={24} />
                Learning Path
              </CardTitle>
              <Badge variant="outline" className="border-blue-100 bg-blue-50 text-blue-600">
                {progressPercent}% Completed
              </Badge>
            </div>
            <Progress value={progressPercent} className="mt-2 h-1.5" />
          </CardHeader>
          <CardContent className="space-y-8">
            {sections.map((section) => (
              <div key={section.title} className="space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900">{section.title}</h3>
                  <p className="text-sm text-slate-500">{section.description}</p>
                </div>

                <div className="grid gap-3">
                  {section.questions.map((question) => (
                    <div
                      key={question.id}
                      className={`rounded-xl border transition-all duration-200 ${
                        expandedId === question.id ? "border-blue-200 bg-blue-50/30" : "border-slate-100 bg-white"
                      }`}
                    >
                      <button
                        onClick={() => setExpandedId(expandedId === question.id ? null : question.id)}
                        className="flex w-full items-center justify-between p-4 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleComplete(question.id);
                            }}
                            className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                              completed.includes(question.id)
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {completed.includes(question.id) && <CheckCircle2 size={12} />}
                          </div>
                          <span
                            className={`font-medium ${
                              completed.includes(question.id) ? "text-slate-400 line-through" : "text-slate-700"
                            }`}
                          >
                            {question.q}
                          </span>
                        </div>
                        {expandedId === question.id ? (
                          <ChevronUp size={18} className="text-slate-400" />
                        ) : (
                          <ChevronDown size={18} className="text-slate-400" />
                        )}
                      </button>

                      {expandedId === question.id && (
                        <div className="space-y-4 px-4 pb-4">
                          <div className="rounded-lg border border-slate-100 bg-white p-3">
                            <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600">
                              <Lightbulb size={14} /> Expert Tip
                            </div>
                            <p className="text-sm text-slate-600">{question.tips}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Model Answer</p>
                            <p className="text-sm leading-relaxed text-slate-600">{question.answer}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="gap-2 text-xs">
                              <Play size={14} /> Record Practice
                            </Button>
                            <Button size="sm" variant="outline" className="gap-2 text-xs">
                              <Bookmark size={14} /> Save for Later
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none bg-blue-600 text-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <Video size={24} />
              </div>
              <h3 className="text-xl font-bold">Mock Interview</h3>
              <p className="text-sm text-blue-100">
                Practice with an AI interviewer and get instant feedback on your response structure and confidence.
              </p>
              <Button className="w-full bg-white font-bold text-blue-600 hover:bg-slate-50">
                Start Session
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none bg-amber-50 shadow-sm">
            <CardContent className="space-y-3 p-6 text-sm text-slate-700">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <HandCoins size={16} className="text-amber-700" />
                Support my work
              </div>
              <p>{siteConfig.supportLabel}</p>
              <a
                href={siteConfig.supportUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex font-semibold text-amber-700 underline-offset-4 hover:underline"
              >
                paypal.me/Onoja412
              </a>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-widest text-slate-400">Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: FileText, label: "STAR Method Guide" },
                { icon: MessageSquare, label: "Body Language Tips" },
                { icon: GraduationCap, label: "Salary Negotiation" },
              ].map((resource) => (
                <button
                  key={resource.label}
                  className="group flex w-full items-center justify-between rounded-xl p-3 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-slate-100 p-2 text-slate-500 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
                      <resource.icon size={18} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{resource.label}</span>
                  </div>
                  <ChevronDown size={14} className="-rotate-90 text-slate-300" />
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
