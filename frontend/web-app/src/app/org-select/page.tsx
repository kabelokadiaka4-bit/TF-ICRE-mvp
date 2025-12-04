// frontend/web-app/src/app/org-select/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Briefcase, ArrowRight, Loader2 } from "lucide-react";

// Mock organizations for demonstration
const mockOrganizations = [
  { id: "org1", name: "DBSA Group" },
  { id: "org2", name: "Absa Bank" },
  { id: "org3", name: "Standard Bank" },
];

export default function OrgSelectPage() {
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSelectOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!selectedOrg) {
      setError("Please select an organization.");
      return;
    }
    setIsLoading(true);

    try {
      // Simulate API call to set active organization or fetch org-specific data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem("selectedOrganizationId", selectedOrg); // Store selection
      router.push("/"); // Redirect to dashboard
    } catch (err: any) {
      setError("Failed to set organization. Please try again.");
      console.error("Org selection error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-surface-variant/50 backdrop-blur-xl border border-outline/20 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-on-surface mb-2">Select Organization</h1>
            <p className="text-on-surface-variant text-sm">
              Please choose the organization you wish to access.
            </p>
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
              <p className="text-sm text-error-foreground">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSelectOrg} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="organization" className="text-xs font-medium text-on-surface-variant ml-1">Organization</label>
              <div className="relative group">
                <Briefcase className="absolute left-4 top-3.5 w-5 h-5 text-on-surface-variant/70 group-focus-within:text-primary transition-colors" />
                <select
                  id="organization"
                  value={selectedOrg || ""}
                  onChange={(e) => setSelectedOrg(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface/50 border border-outline/30 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all appearance-none"
                  required
                >
                  <option value="" disabled>Select an organization</option>
                  {mockOrganizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ArrowRight className="h-5 w-5 text-on-surface-variant/70" />
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
