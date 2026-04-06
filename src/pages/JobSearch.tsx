import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  Filter,
  MapPin,
  Search,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/lib/site";

const jobs = [
  { id: 1, title: "Junior Frontend Engineer", company: "PixelPerfect Labs", location: "Remote / New York", salary: "$70k - $95k", type: "Full-time", posted: "2h ago", match: 98, tags: ["React", "Tailwind", "TypeScript"], logo: "P" },
  { id: 2, title: "UX Research Intern", company: "FlowState UX", location: "Hybrid / San Francisco", salary: "$40/hr", type: "Internship", posted: "5h ago", match: 92, tags: ["Figma", "User Testing", "UI"], logo: "F" },
  { id: 3, title: "Associate Product Manager", company: "BuildBuddy", location: "Austin, TX", salary: "$85k - $110k", type: "Full-time", posted: "1d ago", match: 85, tags: ["Product Strategy", "Agile", "SQL"], logo: "B" },
  { id: 4, title: "Software Engineer I", company: "CloudScale", location: "Seattle, WA", salary: "$120k - $140k", type: "Full-time", posted: "3d ago", match: 78, tags: ["Golang", "AWS", "Docker"], logo: "C" },
];

export default function JobSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [applying, setApplying] = useState<number | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);

  const filteredJobs = jobs.filter((job) => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) {
      return true;
    }

    return [job.title, job.company, job.location, ...job.tags].join(" ").toLowerCase().includes(term);
  });

  const handleApply = (id: number) => {
    setApplying(id);
    setTimeout(() => {
      setApplying(null);
      setAppliedJobs((prev) => [...prev, id]);
      toast.success("Application submitted successfully!", {
        description: "The demo prepared a matching CV and cover letter package for this role.",
      });
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Recommended Jobs</h1>
        <p className="text-slate-500">
          Search roles, shortlist matches, and prepare application packs from a simple starting fee of {siteConfig.startingPrice}.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Search by title, skill, location, or company..."
              className="h-12 bg-white pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-12 gap-2 px-6">
            <Filter size={18} /> Filters
          </Button>
          <Button className="h-12 bg-slate-950 px-8 hover:bg-slate-800">Search</Button>
        </div>
      </div>

      <Card className="border-none bg-slate-950 text-white shadow-sm">
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-amber-300">Application workflow</p>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              This demo reflects your idea: polish the candidate CV, generate a stronger version, create a cover letter, identify relevant jobs, and prepare submissions before interview support.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold">
            Entry price: {siteConfig.startingPrice}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredJobs.map((job, i) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="group border-none shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col gap-6 md:flex-row">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl font-bold text-blue-600">
                    {job.logo}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                          {job.title}
                        </h3>
                        <p className="font-medium text-slate-600">{job.company}</p>
                      </div>
                      <Badge variant="secondary" className="gap-1 border-emerald-100 bg-emerald-50 px-2 py-1 text-emerald-700 hover:bg-emerald-50">
                        <Zap size={12} fill="currentColor" /> {job.match}% Match
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={16} /> {job.location}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Briefcase size={16} /> {job.type}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign size={16} /> {job.salary}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={16} /> {job.posted}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      {job.tags.map((tag) => (
                        <span key={tag} className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex min-w-[140px] flex-col justify-between gap-3">
                    <Button variant="ghost" className="group/btn justify-between text-slate-500 hover:bg-blue-50 hover:text-blue-600">
                      View Details
                      <ArrowUpRight size={16} className="transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
                    </Button>

                    <Button
                      disabled={appliedJobs.includes(job.id) || applying === job.id}
                      onClick={() => handleApply(job.id)}
                      className={`w-full ${
                        appliedJobs.includes(job.id)
                          ? "border border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-50"
                          : "bg-slate-950 hover:bg-slate-800"
                      }`}
                    >
                      <AnimatePresence mode="wait">
                        {applying === job.id ? (
                          <motion.div key="applying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            Applying...
                          </motion.div>
                        ) : appliedJobs.includes(job.id) ? (
                          <motion.div key="applied" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                            <CheckCircle2 size={16} /> Applied
                          </motion.div>
                        ) : (
                          "Easy Apply"
                        )}
                      </AnimatePresence>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredJobs.length === 0 && (
          <Card className="border-dashed shadow-none">
            <CardContent className="p-10 text-center text-slate-500">
              No jobs matched that search yet. Try a role title, company, location, or skill keyword.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
