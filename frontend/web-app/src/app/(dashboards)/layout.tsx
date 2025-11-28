"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserMenu from "@/components/UserMenu";
import ProtectedLayout from "@/components/ProtectedLayout";
import { 
  LayoutDashboard, 
  Shield, 
  Briefcase, 
  Menu, 
  X, 
  AlertTriangle, 
  Activity, 
  FileText, 
  Settings 
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navSections = [
    {
      title: "Workspaces",
      items: [
        { href: "/analyst", label: "Analyst Console", icon: LayoutDashboard },
        { href: "/governance", label: "Governance", icon: Shield },
        { href: "/executive", label: "Executive", icon: Briefcase },
      ]
    },
    {
      title: "Intelligence",
      items: [
        { href: "/alerts", label: "TBML Alerts", icon: AlertTriangle },
        { href: "/scoring", label: "Risk Models", icon: Activity },
        { href: "/reports", label: "Reports", icon: FileText },
      ]
    },
    {
      title: "System",
      items: [
        { href: "/settings", label: "Settings", icon: Settings },
      ]
    }
  ];

  return (
    <ProtectedLayout>
      <div className="flex h-screen bg-background text-on-background overflow-hidden font-sans">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-surface/80 backdrop-blur-md border-b border-outline/10 flex items-center justify-between px-4 z-50">
          <div className="font-bold text-xl tracking-tight text-primary">TF-ICRE™</div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-on-surface">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {(isMobileMenuOpen || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
             <motion.aside 
               initial={{ x: -280 }}
               animate={{ x: 0 }}
               exit={{ x: -280 }}
               transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className={clsx(
                 "fixed inset-y-0 left-0 z-40 w-72 bg-surface border-r border-outline/10 flex flex-col p-6 lg:static lg:translate-x-0 shadow-2xl lg:shadow-none overflow-y-auto",
                 !isMobileMenuOpen && "hidden lg:flex"
               )}
             >
              <div className="text-2xl font-bold mb-8 tracking-tight text-primary flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                TF-ICRE™
              </div>

              <nav className="flex flex-col gap-6 mb-auto">
                {navSections.map((section, idx) => (
                  <div key={idx}>
                    <div className="px-4 mb-2 text-xs font-semibold text-on-surface-variant/50 uppercase tracking-wider">
                      {section.title}
                    </div>
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        const Icon = item.icon;
                        return (
                          <Link 
                            key={item.href} 
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={clsx(
                              "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                              isActive 
                                ? "bg-primary/10 text-primary font-medium shadow-sm" 
                                : "text-on-surface-variant hover:bg-surface-variant/30 hover:text-on-surface"
                            )}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="activeNav"
                                className="absolute inset-0 bg-primary/10 rounded-xl"
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              />
                            )}
                            <Icon className={clsx("w-5 h-5 z-10 relative", isActive ? "text-primary" : "text-on-surface-variant group-hover:text-on-surface")} />
                            <span className="z-10 relative">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-outline/10">
                <UserMenu />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 pt-16 lg:pt-0 overflow-auto relative bg-surface-variant/5">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />
          <div className="p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
             {children}
          </div>
        </main>
      </div>
    </ProtectedLayout>
  );
}