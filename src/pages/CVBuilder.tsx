import { ChangeEvent, useState } from "react";
import {
  Download,
  Eye,
  FileText,
  History,
  Upload,
  Mail,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/lib/site";

export default function CVBuilder() {
  const [cvData, setCvData] = useState({
    name: "Alex Johnson",
    role: "Health Technology Project Officer",
    email: "alex.j@example.com",
    phone: "+44 7700 900123",
    summary:
      "Motivated early-career professional with experience supporting digital projects, coordinating stakeholders, and translating complex information into clear actions. Keen to contribute to health innovation teams with structured problem-solving and strong communication.",
    experience: [
      {
        id: 1,
        company: "HealthBridge CIC",
        role: "Project Assistant",
        period: "2023 - Present",
        description:
          "Supported service delivery, coordinated stakeholder updates, and helped prepare reports for programme improvement.",
      },
      {
        id: 2,
        company: "Surrey Student Innovation Hub",
        role: "Research Intern",
        period: "2022 - 2023",
        description:
          "Researched digital health trends, summarised findings, and contributed to presentation materials for decision makers.",
      },
    ],
    skills: [
      "Stakeholder Communication",
      "Research",
      "Report Writing",
      "Project Coordination",
      "Digital Health",
    ],
  });
  const [skillInput, setSkillInput] = useState("");
  const [companyName, setCompanyName] = useState("BrightPath Health");
  const [jobTitle, setJobTitle] = useState("Project Coordinator");
  const [uploadedCvName, setUploadedCvName] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState(
    "Dear Hiring Manager,\n\nI am excited to apply for this opportunity because it combines people-centred problem solving with practical delivery. My background includes supporting projects, synthesising information, and communicating clearly with different stakeholders.\n\nI would welcome the chance to bring that energy to your team and contribute from day one.\n\nKind regards,\nAlex Johnson",
  );

  const handleSave = () => {
    toast.success("Draft saved locally in the demo.", {
      description: "Next step: connect this screen to your backend or AI workflow.",
    });
  };

  const handleCvUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const lowerName = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some((extension) => lowerName.endsWith(extension));

    if (!isAllowed) {
      toast.error("Unsupported file type.", {
        description: "Upload a PDF, DOC, or DOCX file.",
      });
      event.target.value = "";
      return;
    }

    setUploadedCvName(file.name);
    toast.success("CV uploaded to the demo intake.", {
      description: "Next step: send the file to Gemini or your parsing backend.",
    });
  };

  const handleDownload = () => {
    toast.info("PDF export is mocked in this frontend demo.", {
      description: "The preview is ready; add a real PDF generator when backend services are connected.",
    });
  };

  const handleSummaryRewrite = () => {
    setCvData((current) => ({
      ...current,
      summary:
        "Outcome-focused professional with experience in digital health support, stakeholder coordination, research synthesis, and clear written communication. Known for turning rough information into structured outputs, supporting delivery teams, and preparing polished materials that strengthen applications and project decisions.",
    }));
    toast.success("Professional summary rewritten.");
  };

  const handleCoverLetterGenerate = () => {
    setCoverLetter(
      `Dear Hiring Manager,\n\nI am writing to express my interest in the ${jobTitle} role at ${companyName}. My experience in project support, research, and stakeholder communication has prepared me to contribute effectively in a fast-moving team.\n\nI bring a practical approach to organising information, supporting delivery, and communicating clearly with colleagues and external partners. I am especially motivated by roles where thoughtful coordination improves outcomes for people and organisations.\n\nThank you for your time and consideration. I would value the opportunity to discuss how I can contribute to ${companyName}.\n\nKind regards,\n${cvData.name}`,
    );
    toast.success("Cover letter draft generated.");
  };

  const addExperience = () => {
    setCvData((current) => ({
      ...current,
      experience: [
        ...current.experience,
        { id: Date.now(), company: "", role: "", period: "", description: "" },
      ],
    }));
  };

  const updateExperience = (
    id: number,
    field: "company" | "role" | "period" | "description",
    value: string,
  ) => {
    setCvData((current) => ({
      ...current,
      experience: current.experience.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const removeExperience = (id: number) => {
    setCvData((current) => ({
      ...current,
      experience: current.experience.filter((item) => item.id !== id),
    }));
  };

  const addSkill = () => {
    const nextSkill = skillInput.trim();
    if (!nextSkill) {
      return;
    }

    setCvData((current) => ({
      ...current,
      skills: [...current.skills, nextSkill],
    }));
    setSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    setCvData((current) => ({
      ...current,
      skills: current.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-140px)] max-w-7xl flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">CV & Cover Letter Builder</h1>
          <p className="text-sm text-slate-500">
            Polish a candidate CV, rewrite it for impact, and generate role-specific application material.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <History size={18} /> History
          </Button>
          <Button variant="outline" onClick={handleSave} className="gap-2">
            <Save size={18} /> Save Draft
          </Button>
          <Button onClick={handleDownload} className="gap-2 bg-slate-950 hover:bg-slate-800">
            <Download size={18} /> Download PDF
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-6">
        <div className="flex-1 space-y-6 overflow-y-auto pr-2">
          <Tabs defaultValue="cv" className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger value="cv" className="gap-2">
                <FileText size={16} /> CV Builder
              </TabsTrigger>
              <TabsTrigger value="letter" className="gap-2">
                <Mail size={16} /> Cover Letter
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cv" className="space-y-6 pb-8">
              <Card className="border-none shadow-sm">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900">Upload Existing CV</h3>
                      <p className="text-sm text-slate-500">
                        Upload a candidate CV in PDF, DOC, or DOCX format to begin immediately.
                      </p>
                    </div>
                    <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Gemini-ready intake
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-sm text-slate-600 transition-colors hover:border-slate-500 hover:bg-slate-100">
                    <Upload size={18} />
                    <span>Choose CV file</span>
                    <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={handleCvUpload} />
                  </label>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">Current uploaded file</p>
                    <p className="mt-1">{uploadedCvName ?? "No CV uploaded yet."}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardContent className="space-y-4 p-6">
                  <h3 className="font-bold text-slate-900">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Full Name</label>
                      <Input value={cvData.name} onChange={(e) => setCvData({ ...cvData, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Role</label>
                      <Input value={cvData.role} onChange={(e) => setCvData({ ...cvData, role: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Email</label>
                      <Input value={cvData.email} onChange={(e) => setCvData({ ...cvData, email: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Phone</label>
                      <Input value={cvData.phone} onChange={(e) => setCvData({ ...cvData, phone: e.target.value })} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Professional Summary</h3>
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-blue-600" onClick={handleSummaryRewrite}>
                      <Sparkles size={14} /> AI Rewrite
                    </Button>
                  </div>
                  <Textarea
                    rows={5}
                    value={cvData.summary}
                    onChange={(e) => setCvData({ ...cvData, summary: e.target.value })}
                    placeholder="Briefly describe the candidate's profile and strongest achievements..."
                  />
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Experience</h3>
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-blue-600" onClick={addExperience}>
                      <Plus size={14} /> Add Work
                    </Button>
                  </div>
                  {cvData.experience.map((exp) => (
                    <div key={exp.id} className="group relative rounded-lg border border-slate-100 bg-slate-50 p-4">
                      <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-500"
                          onClick={() => removeExperience(exp.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                      <div className="mb-4 grid grid-cols-2 gap-4">
                        <Input className="bg-white" placeholder="Company Name" value={exp.company} onChange={(e) => updateExperience(exp.id, "company", e.target.value)} />
                        <Input className="bg-white" placeholder="Period" value={exp.period} onChange={(e) => updateExperience(exp.id, "period", e.target.value)} />
                      </div>
                      <Input className="mb-4 bg-white" placeholder="Job Title" value={exp.role} onChange={(e) => updateExperience(exp.id, "role", e.target.value)} />
                      <Textarea className="bg-white" placeholder="Key responsibilities and achievements..." value={exp.description} onChange={(e) => updateExperience(exp.id, "description", e.target.value)} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Core Skills</h3>
                    <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Match-ready keywords
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Add a skill" />
                    <Button type="button" onClick={addSkill} className="bg-slate-950 hover:bg-slate-800">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cvData.skills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-200"
                      >
                        {skill} ×
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Gemini Automation Plan</h3>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      Backend hookup required
                    </span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {[
                      "Extract CV text from uploaded PDF or DOCX.",
                      "Send structured prompt to Gemini to rewrite the CV.",
                      "Generate a tailored cover letter for selected roles.",
                      "Search the internet for relevant jobs and prepare applications.",
                    ].map((item) => (
                      <div key={item} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                        {item}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-slate-500">
                    The UI is now ready for this flow. Real job search and automatic submission need a secure backend,
                    Gemini API key management, scraping/search compliance, and application-site integrations.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="letter">
              <Card className="border-none shadow-sm">
                <CardContent className="space-y-4 p-6">
                  <h3 className="font-bold text-slate-900">Cover Letter Details</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">Company Name</label>
                    <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="E.g. Google" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">Job Title</label>
                    <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="E.g. Project Coordinator" />
                  </div>
                  <Button type="button" variant="outline" className="gap-2" onClick={handleCoverLetterGenerate}>
                    <Sparkles size={16} />
                    Generate Draft
                  </Button>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">Letter Body</label>
                    <Textarea rows={12} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Write your cover letter here..." />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="hidden w-[400px] shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl lg:flex">
          <div className="flex h-12 items-center justify-between bg-slate-900 px-4">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              <Eye size={14} /> Live Preview
            </span>
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/50"></div>
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50"></div>
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50"></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white p-8">
            <div className="mx-auto max-w-[800px] origin-top scale-[0.85]">
              <div className="mb-8 border-b-2 border-slate-900 pb-6 text-center">
                <h1 className="text-3xl font-bold uppercase tracking-tight text-slate-900">{cvData.name}</h1>
                <p className="mt-1 text-sm font-bold uppercase tracking-widest text-blue-600">{cvData.role}</p>
                <div className="mt-4 flex justify-center gap-4 text-xs text-slate-500">
                  <span>{cvData.email}</span>
                  <span>•</span>
                  <span>{cvData.phone}</span>
                </div>
              </div>

              <div className="space-y-6">
                <section>
                  <h2 className="mb-3 border-b border-slate-200 pb-1 text-sm font-bold uppercase text-slate-900">
                    Professional Summary
                  </h2>
                  <p className="text-sm leading-relaxed text-slate-600">{cvData.summary}</p>
                </section>

                <section>
                  <h2 className="mb-3 border-b border-slate-200 pb-1 text-sm font-bold uppercase text-slate-900">
                    Experience
                  </h2>
                  {cvData.experience.map((exp) => (
                    <div key={exp.id} className="mb-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-sm font-bold text-slate-800">{exp.company || "Company name"}</h3>
                        <span className="text-xs text-slate-500">{exp.period || "Dates"}</span>
                      </div>
                      <p className="mb-1 text-xs font-semibold text-blue-600">{exp.role || "Job title"}</p>
                      <p className="text-xs leading-relaxed text-slate-600">{exp.description || "Responsibilities and impact"}</p>
                    </div>
                  ))}
                </section>

                <section>
                  <h2 className="mb-3 border-b border-slate-200 pb-1 text-sm font-bold uppercase text-slate-900">
                    Core Expertise
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {cvData.skills.map((skill) => (
                      <span key={skill} className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="mb-3 border-b border-slate-200 pb-1 text-sm font-bold uppercase text-slate-900">
                    Prepared By
                  </h2>
                  <p className="text-xs leading-relaxed text-slate-600">
                    {siteConfig.productName} demo by {siteConfig.creator}, {siteConfig.school}. Contact: {siteConfig.email}
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
