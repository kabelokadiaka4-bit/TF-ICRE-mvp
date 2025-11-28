"use client";

import { Card } from "./ui/Card";
import { useState } from "react";
import { Sparkles, CheckCircle2, AlertOctagon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { scoringApi } from "../lib/api";
import { motion } from "framer-motion";

export default function ExplanationPanel() {
  const [activeTab, setActiveTab] = useState<'shap' | 'counterfactual'>('shap');

  // Fetch explanation data
  const { data, isLoading } = useQuery({
    queryKey: ['explanation', 'loan-123'],
    queryFn: () => scoringApi.getExplanation('loan-123'),
    initialData: {
      plain_language_summary: "Acme Manufacturing demonstrates strong revenue growth and consistent payment history. However, high debt levels (2.8x equity) require monitoring. Recommend approval with covenant requiring debt reduction.",
      explanation: {
        top_positive_factors: [
          { factor: "Revenue Growth", value: "+18% YoY", impact: "+45 points", description: "Strong trajectory" },
          { factor: "Mobile Money Consistency", value: "0.8", impact: "+12 points", description: "Regular cash flow" }
        ],
        top_negative_factors: [
          { factor: "Debt-to-Equity Ratio", value: "2.8:1", impact: "-20 points", description: "High leverage" },
          { factor: "Credit Bureau Score", value: "620", impact: "-31 points", description: "Below threshold" }
        ]
      }
    }
  });

  return (
    <Card className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('shap')}
            className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
              activeTab === 'shap' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-on-surface'
            }`}
          >
            Why this decision?
          </button>
          <button
            onClick={() => setActiveTab('counterfactual')}
            className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
              activeTab === 'counterfactual' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-on-surface'
            }`}
          >
            How to improve?
          </button>
        </div>
        <div className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          AI Insights
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'shap' ? (
          <ShapView 
            summary={data.plain_language_summary} 
            positive={data.explanation.top_positive_factors} 
            negative={data.explanation.top_negative_factors} 
          />
        ) : (
          <CounterfactualView />
        )}
      </div>
    </Card>
  );
}

function ShapView({ summary, positive, negative }: any) {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-surface-variant/5 border border-white/5 text-sm text-on-surface-variant leading-relaxed">
        {summary}
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Key Contributors</h4>
        
        {[...positive, ...negative].map((factor: any, idx: number) => {
           const isPositive = positive.includes(factor);
           // Extract numeric impact for bar width
           const impactVal = parseInt(factor.impact.replace(/[^0-9]/g, '')); 
           
           return (
            <div key={idx} className="relative">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-on-surface">{factor.factor}</span>
                <span className={isPositive ? 'text-green-400' : 'text-error'}>
                  {factor.impact}
                </span>
              </div>
              <div className="h-1.5 w-full bg-surface-variant/20 rounded-full overflow-hidden flex">
                <div className="w-1/2 flex justify-end">
                  {!isPositive && (
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(impactVal, 100)}%` }}
                      className="h-full bg-error rounded-l-full"
                    />
                  )}
                </div>
                <div className="w-1/2 flex justify-start border-l border-white/10">
                  {isPositive && (
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(impactVal, 100)}%` }}
                      className="h-full bg-green-500 rounded-r-full"
                    />
                  )}
                </div>
              </div>
              <p className="text-[10px] text-on-surface-variant/60 mt-1">{factor.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CounterfactualView() {
  return (
    <div className="space-y-6">
      <div className="bg-surface-variant/5 p-4 rounded-xl border border-white/5">
        <h4 className="text-sm font-bold text-on-surface mb-2">Scenario Analysis</h4>
        <p className="text-xs text-on-surface-variant mb-4">
          What minimal changes would flip the decision from <span className="text-error font-bold">Review</span> to <span className="text-green-400 font-bold">Approve</span>?
        </p>
        
        <div className="space-y-3">
          <ChangeItem 
            icon={<CheckCircle2 className="w-4 h-4 text-green-400" />}
            text="Reduce Debt-to-Equity to 1.8"
            subtext="Pay down $45k in short-term debt"
          />
          <ChangeItem 
            icon={<CheckCircle2 className="w-4 h-4 text-green-400" />}
            text="Improve Credit Score to 680"
            subtext="6 months of on-time payments"
          />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-primary uppercase">Projected Probability</span>
          <span className="text-lg font-bold text-primary">82%</span>
        </div>
        <div className="h-2 w-full bg-surface-variant/30 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-[82%] rounded-full" />
        </div>
      </div>
    </div>
  );
}

function ChangeItem({ icon, text, subtext }: any) {
  return (
    <div className="flex gap-3 items-start p-2 rounded-lg hover:bg-surface-variant/10 transition-colors">
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className="text-sm font-medium text-on-surface">{text}</div>
        <div className="text-xs text-on-surface-variant">{subtext}</div>
      </div>
    </div>
  );
}