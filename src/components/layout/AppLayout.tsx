import { useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Briefcase,
  FileText,
  GraduationCap,
  HandCoins,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getStoredUser, logoutUser } from "@/lib/auth";
import { siteConfig } from "@/lib/site";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FileText, label: "CV Builder", path: "/cv-builder" },
  { icon: Briefcase, label: "Job Search", path: "/jobs" },
  { icon: GraduationCap, label: "Interview Prep", path: "/interview-prep" },
];

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleLogout = () => {
    logoutUser();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="flex h-screen bg-slate-50/70">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/45 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-slate-200 bg-white transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-4">
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-emerald-500 text-xl font-bold text-white">
              C
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{siteConfig.productName}</p>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Smart job seeker workflow
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ${
                    isActive
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="space-y-3 border-t border-slate-100 pt-4">
            <div className="rounded-2xl bg-slate-950 p-4 text-white">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <HandCoins size={16} className="text-amber-300" />
                Support my work
              </div>
              <p className="text-xs leading-5 text-slate-300">{siteConfig.supportLabel}</p>
              <a
                href={siteConfig.supportUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex text-sm font-semibold text-amber-300 underline-offset-4 hover:underline"
              >
                paypal.me/Onoja412
              </a>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">{user?.name ?? siteConfig.creator}</p>
              <p>{user?.email ?? siteConfig.school}</p>
              <a
                href={`mailto:${siteConfig.email}`}
                className="mt-2 inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800"
              >
                <Mail size={14} />
                {siteConfig.email}
              </a>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-600 lg:hidden"
          >
            <Menu size={24} />
          </button>

          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-slate-900">
              Smart career operations for job seekers
            </p>
            <p className="text-sm text-slate-500">
              Start from {siteConfig.startingPrice} to polish a CV and move faster into applications.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden gap-2 text-slate-600 lg:inline-flex" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </Button>
            <button className="relative rounded-full p-2 text-slate-600 hover:bg-slate-50">
              <Bell size={20} />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full border-2 border-white bg-red-500"></span>
            </button>
            <Avatar className="h-8 w-8 border border-slate-200">
              <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" />
              <AvatarFallback>AJ</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
