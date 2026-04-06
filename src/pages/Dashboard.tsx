import { motion } from "framer-motion";
import {
  Briefcase,
  ChevronRight,
  Clock,
  HandCoins,
  Mail,
  Search,
  Send,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { siteConfig } from "@/lib/site";

const stats = [
  { label: "Applications Prepared", value: 12, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Interviews Lined Up", value: 3, icon: Clock, color: "text-indigo-600", bg: "bg-indigo-50" },
  { label: "Submission Packs", value: 9, icon: Send, color: "text-orange-600", bg: "bg-orange-50" },
  { label: "CV Confidence", value: "85%", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
];

const recentActivity = [
  { title: "Tailored CV prepared for Health Tech Analyst", company: "SureBridge Health", time: "2 hours ago", status: "Ready to submit" },
  { title: "Interview practice queued", company: "Interview Coach", time: "Today", status: "STAR questions" },
  { title: "Cover letter draft generated", company: "Application Pack", time: "Yesterday", status: "Edited" },
];

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Career Dashboard</h1>
          <p className="text-slate-500">
            Manage CV improvement, job discovery, application prep, and interview readiness in one place.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Search size={18} /> Find Jobs
          </Button>
          <Button className="gap-2 bg-slate-950 hover:bg-slate-800">
            Start from {siteConfig.startingPrice}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-500">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                  </div>
                  <div className={`rounded-xl p-3 ${stat.bg} ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="border-none shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="text-blue-600" size={20} />
              Profile Strength
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-600">Profile Completion</span>
                <span className="font-bold text-emerald-600">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="mb-1 text-sm font-medium text-slate-900">Rewrite Opportunity</p>
                <p className="mb-3 text-xs text-slate-500">
                  Turn role descriptions into stronger achievement-led bullet points before export.
                </p>
                <Button size="sm" variant="ghost" className="h-auto p-0 font-bold text-emerald-700 hover:text-emerald-800">
                  Improve CV →
                </Button>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="mb-1 text-sm font-medium text-slate-900">Application Queue</p>
                <p className="mb-3 text-xs text-slate-500">
                  3 roles are matched and waiting for a tailored cover letter before submission.
                </p>
                <Button size="sm" variant="ghost" className="h-auto p-0 font-bold text-emerald-700 hover:text-emerald-800">
                  Continue →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentActivity.map((activity) => (
                <div key={activity.title} className="group flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <Briefcase size={18} />
                  </div>
                  <div className="min-w-0 flex-1 border-b border-slate-50 pb-4">
                    <p className="truncate text-sm font-semibold text-slate-900">{activity.title}</p>
                    <p className="mb-1 text-xs text-slate-500">
                      {activity.company} • {activity.time}
                    </p>
                    <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      {activity.status}
                    </span>
                  </div>
                  <ChevronRight size={16} className="mt-1 text-slate-300" />
                </div>
              ))}
            </div>
            <Button variant="ghost" className="mt-4 w-full text-slate-500 hover:text-blue-600">
              View All History
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Product Workflow</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {[
              "Import a CV and clean up the language.",
              "Generate a fresh rewritten CV and cover letter.",
              "Search roles that match skills and ambitions.",
              "Prepare submissions and rehearse interviews.",
            ].map((item, index) => (
              <div key={item} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Step {index + 1}</p>
                <p className="mt-2 text-sm text-slate-700">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Creator & Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-slate-950 p-4 text-white">
              <p className="font-semibold">{siteConfig.creator}</p>
              <p className="mt-1 text-sm text-slate-300">{siteConfig.school}</p>
              <a
                href={`mailto:${siteConfig.email}`}
                className="mt-3 inline-flex items-center gap-2 text-sm text-amber-300 hover:text-amber-200"
              >
                <Mail size={14} />
                {siteConfig.email}
              </a>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <HandCoins size={16} className="text-amber-700" />
                Support my work
              </div>
              <p className="mt-2 leading-6">{siteConfig.supportLabel}</p>
              <a
                href={siteConfig.supportUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex font-semibold text-amber-700 underline-offset-4 hover:underline"
              >
                paypal.me/Onoja412
              </a>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Prototype auth note</p>
              <p className="mt-2">This legacy dashboard no longer exposes hardcoded login credentials.</p>
              <p className="mt-2">Use the auth page to register a local browser-only user before visiting protected routes.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
