import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  GraduationCap,
  HandCoins,
  Mail,
  Search,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

const workflow = [
  "Upload an existing CV or paste the current draft.",
  "Polish the wording and generate a stronger rewritten CV.",
  "Create a cover letter and shortlist matching job opportunities.",
  "Prepare applications and practise for interviews before recruiter calls.",
];

const features = [
  {
    icon: FileText,
    title: "Smart CV Builder",
    description:
      "Improve rough CVs with clearer writing, better structure, and stronger achievement-led language.",
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: Search,
    title: "Job Search Assistant",
    description:
      "Search for suitable roles by skill, location, and ambition instead of relying on generic searches.",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: Send,
    title: "Application Pack",
    description:
      "Prepare tailored CV and cover letter combinations for each role before submission.",
    color: "bg-amber-100 text-amber-700",
  },
  {
    icon: GraduationCap,
    title: "Interview Prep",
    description:
      "Practise common questions, behavioural answers, and communication frameworks.",
    color: "bg-sky-100 text-sky-700",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.15),_transparent_30%),linear-gradient(180deg,_#fffdf7_0%,_#ffffff_42%,_#f8fafc_100%)]">
      <nav className="container mx-auto flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-emerald-500 font-bold text-white">
            C
          </div>
          <span className="text-xl font-bold text-slate-900">{siteConfig.productName}</span>
        </div>

        <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#features" className="transition-colors hover:text-slate-950">
            Features
          </a>
          <a href="#how-it-works" className="transition-colors hover:text-slate-950">
            How it works
          </a>
          <a href="#creator" className="transition-colors hover:text-slate-950">
            Creator
          </a>
          <Button asChild className="bg-slate-950 hover:bg-slate-800">
            <Link to="/auth">Start for {siteConfig.startingPrice}</Link>
          </Button>
        </div>
      </nav>

      <section className="container mx-auto flex flex-col items-center gap-12 px-6 py-16 lg:flex-row lg:py-24">
        <div className="flex-1 text-center lg:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-5xl font-bold leading-tight text-slate-900 lg:text-7xl"
          >
            An AI workflow for
            {" "}
            <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-600 bg-clip-text text-transparent">
              CV rewriting, job search, applications, and interviews.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mb-8 max-w-2xl text-lg text-slate-600 lg:mx-0"
          >
            {siteConfig.mission} The concept is simple: job seekers pay from {siteConfig.startingPrice},
            submit their CV, and get practical help moving from a rough draft to a stronger
            application journey.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start"
          >
            <Button asChild size="lg" className="h-14 rounded-full bg-slate-950 px-8 text-lg hover:bg-slate-800">
              <Link to="/dashboard" className="flex items-center gap-2">
                Register or login <ArrowRight size={20} />
              </Link>
            </Button>
            <div className="rounded-full border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
              Starting idea: {siteConfig.startingPrice} to get started
            </div>
          </motion.div>

          <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-600">
            {[
              "CV polish and rewrite",
              "Cover letter drafting",
              "Job discovery workflow",
              "Interview preparation",
            ].map((item) => (
              <div
                key={item}
                className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 shadow-sm ring-1 ring-slate-200"
              >
                <CheckCircle2 size={16} className="text-emerald-600" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative z-10 overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-2xl backdrop-blur"
          >
            <div className="grid gap-4">
              <div className="rounded-3xl bg-slate-950 p-6 text-white">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm uppercase tracking-[0.22em] text-amber-300">Product Vision</p>
                  <Sparkles size={18} className="text-amber-300" />
                </div>
                <p className="text-2xl font-semibold leading-snug">
                  Help job seekers go from a raw CV to stronger applications and better interview confidence.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { label: "CV status", value: "Polished" },
                  { label: "Cover letter", value: "Generated" },
                  { label: "Job shortlist", value: "Matched" },
                  { label: "Interview prep", value: "Ready" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className="text-xl font-semibold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="absolute -right-6 -top-6 -z-10 h-32 w-32 rounded-full bg-amber-100 blur-2xl"></div>
          <div className="absolute -bottom-6 -left-6 -z-10 h-32 w-32 rounded-full bg-emerald-100 blur-2xl"></div>
        </div>
      </section>

      <section id="features" className="bg-white/80 py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-900">
            Everything needed to move a candidate forward
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-slate-600">
            The app now presents a more coherent product direction around rewriting CVs, generating
            cover letters, surfacing jobs, preparing applications, and supporting interviews.
          </p>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                whileHover={{ y: -8 }}
                className="rounded-2xl border border-slate-100 bg-white p-8 text-left shadow-sm"
              >
                <div
                  className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}
                >
                  <feature.icon size={24} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24">
        <div className="container mx-auto grid gap-10 px-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="mb-6 text-3xl font-bold text-slate-900">How it works</h2>
            <div className="space-y-4">
              {workflow.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <p className="pt-2 text-slate-700">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-xl">
              <p className="text-sm uppercase tracking-[0.25em] text-amber-300">Pricing direction</p>
              <h3 className="mt-3 text-3xl font-bold">From {siteConfig.startingPrice} to get started</h3>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                This frontend positions the service as an affordable first-touch experience for job seekers
                who need better documents, stronger applications, and more confidence.
              </p>
            </div>

            <div id="creator" className="rounded-[2rem] border border-amber-200 bg-amber-50 p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Creator</p>
              <h3 className="mt-3 text-2xl font-bold text-slate-900">{siteConfig.creator}</h3>
              <p className="mt-2 text-slate-700">{siteConfig.school}</p>
              <a
                href={`mailto:${siteConfig.email}`}
                className="mt-4 inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800"
              >
                <Mail size={16} />
                {siteConfig.email}
              </a>

              <div className="mt-6 rounded-2xl bg-white p-5">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <HandCoins size={18} className="text-amber-700" />
                  Support my work
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{siteConfig.supportLabel}</p>
                <a
                  href={siteConfig.supportUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex font-semibold text-amber-700 underline-offset-4 hover:underline"
                >
                  paypal.me/Onoja412
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-950 py-14 text-white">
        <div className="container mx-auto flex flex-col gap-4 px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-2xl font-bold">{siteConfig.productName}</p>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">{siteConfig.mission}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-white text-slate-950 hover:bg-slate-100">
              <Link to="/dashboard">Open the dashboard</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
              <a href={siteConfig.supportUrl} target="_blank" rel="noreferrer">
                Support the fundraiser
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
