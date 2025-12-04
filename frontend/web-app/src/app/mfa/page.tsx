// frontend/web-app/src/app/mfa/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { MultiFactorResolver, TotpMultiFactorGenerator, multiFactor, getAuth } from "firebase/auth"; // Import necessary Firebase modules
import { auth } from "../../lib/firebase"; // Assuming `auth` object is exported from here

export default function MFAPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resolver, setResolver] = useState<MultiFactorResolver | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Retrieve the MFA resolver from session storage
    const storedResolver = sessionStorage.getItem("mfaResolver");
    if (storedResolver) {
      try {
        const parsedResolver = JSON.parse(storedResolver);
        // Rehydrate the MultiFactorResolver object
        const rehydratedResolver = MultiFactorResolver.fromJSON(parsedResolver);
        setResolver(rehydratedResolver);
      } catch (e) {
        console.error("Failed to parse or rehydrate MFA resolver:", e);
        setError("Authentication error. Please try logging in again.");
        router.push("/login"); // Redirect to login on error
      }
    } else {
      setError("MFA session not found. Please try logging in again.");
      router.push("/login"); // Redirect to login if no resolver
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!resolver) {
      setError("MFA session expired or invalid. Please log in again.");
      setIsLoading(false);
      router.push("/login");
      return;
    }

    try {
      // Assuming TOTP (Authenticator App) for demonstration.
      // Firebase also supports Phone MFA, which would require different handling here.
      const otpCredential = TotpMultiFactorGenerator.getAssertionForSignIn(resolver.hints[0].uid!, code);
      
      // Resolve the MFA challenge
      await multiFactor(auth.currentUser!).resolveSignIn(resolver, otpCredential);
      
      sessionStorage.removeItem("mfaResolver"); // Clear the resolver
      router.push("/org-select"); // Redirect to dashboard after successful MFA
    } catch (err: any) {
      console.error("MFA verification error:", err);
      // Improve error messages based on FirebaseError codes
      if (err.code === "auth/invalid-verification-code") {
        setError("Invalid verification code. Please check and try again.");
      } else if (err.code === "auth/missing-verification-code") {
        setError("Please enter a verification code.");
      } else {
        setError(`MFA verification failed: ${err.message}`);
      }
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
            <h1 className="text-3xl font-bold text-on-surface mb-2">Multi-Factor Authentication</h1>
            <p className="text-on-surface-variant text-sm">
              Please enter the verification code from your authenticator app.
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-on-surface-variant ml-1">Verification Code</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-on-surface-variant/70 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface/50 border border-outline/30 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all placeholder:text-on-surface-variant/30"
                  placeholder="------"
                  maxLength={6}
                  required
                />
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
                  Verify Code
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
