import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FileText, Lock, Mail, Sparkles, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEMO_USER, loginDemoUser, registerUser } from "@/lib/auth";
import { siteConfig } from "@/lib/site";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const [loginEmail, setLoginEmail] = useState(DEMO_USER.email);
  const [loginPassword, setLoginPassword] = useState(DEMO_USER.password);
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const user = loginDemoUser(loginEmail, loginPassword);

    if (!user) {
      toast.error("Login failed.", {
        description: "Use the demo login details shown on this page.",
      });
      return;
    }

    toast.success(`Welcome back, ${user.name}.`);
    navigate(redirectTo, { replace: true });
  };

  const handleRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      toast.error("Complete all registration fields first.");
      return;
    }

    registerUser(registerName, registerEmail);
    toast.success("Account created for the demo.", {
      description: "You are now signed in locally on this browser.",
    });
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.14),_transparent_30%),linear-gradient(180deg,_#fffdf7_0%,_#ffffff_45%,_#f8fafc_100%)] px-6 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_460px]">
        <div className="rounded-[2rem] bg-slate-950 p-10 text-white shadow-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-amber-300">
            <Sparkles size={16} />
            Secure entry into the career workflow
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight">
            Register or log in, then upload a CV in PDF, DOC, or DOCX format and start immediately.
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            This demo now includes a working auth entry screen and an upload intake step in the CV builder.
            Gemini is positioned as the LLM brain for CV rewriting, cover letter drafting, job search support,
            and application preparation, but real internet search and auto-submission still require backend API wiring.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              "Register a new local demo user",
              "Login with a ready-made demo account",
              "Upload CV files in pdf, doc, or docx format",
              "Continue to Gemini-powered workflow planning",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-3xl bg-white/8 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-300">Demo login details</p>
            <div className="mt-4 space-y-3 text-sm">
              <p>Email: <span className="font-semibold">{DEMO_USER.email}</span></p>
              <p>Password: <span className="font-semibold">{DEMO_USER.password}</span></p>
              <p className="text-slate-300">
                Creator: {siteConfig.creator}, {siteConfig.school}
              </p>
            </div>
          </div>
        </div>

        <Card className="border-none shadow-xl">
          <CardContent className="p-6">
            <div className="mb-6">
              <p className="text-2xl font-bold text-slate-900">Account Access</p>
              <p className="mt-2 text-sm text-slate-500">
                Use the demo login, or create a local account for this browser session.
              </p>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="mb-6 grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <Input className="pl-10" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <Input className="pl-10" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-slate-950 hover:bg-slate-800">
                    Login to Dashboard
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form className="space-y-4" onSubmit={handleRegister}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <Input className="pl-10" value={registerName} onChange={(e) => setRegisterName(e.target.value)} placeholder="Anthony Onoja" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <Input className="pl-10" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} placeholder="you@example.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <Input className="pl-10" type="password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} placeholder="Choose a password" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-slate-950 hover:bg-slate-800">
                    Create Demo Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <FileText size={16} className="text-amber-700" />
                What happens next
              </div>
              <p className="mt-2">
                After login, go to the CV Builder page and upload a CV file to begin the rewrite flow.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
