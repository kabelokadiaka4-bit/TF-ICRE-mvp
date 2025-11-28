"use client";

import { useAuth } from "../context/AuthContext";
import { LogOut, User as UserIcon } from "lucide-react";

export default function UserMenu() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <div className="mt-auto pt-6 border-t border-outline/10">
      <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-surface-variant/20">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
           <UserIcon className="w-5 h-5 text-primary" />
        </div>
        <div className="overflow-hidden">
          <div className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Analyst</div>
          <div className="text-sm font-medium text-on-surface truncate" title={user.email || ""}>
            {user.email}
          </div>
        </div>
      </div>
      
      <button
        onClick={signOut}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-error/10 hover:bg-error/20 text-error rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
}