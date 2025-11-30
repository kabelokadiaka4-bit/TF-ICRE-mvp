"use client";

import React, { useState } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript'; // Fallback for rego-like syntax
import { Button } from '@/components/ui/Button';
import { Save, Play, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { GovernanceService } from '@/lib/api';
import { motion } from 'framer-motion';

// Rego-like syntax highlighting (using JS as base)
const highlightCode = (code: string) => highlight(code, languages.js, 'javascript');

interface PolicyEditorProps {
  policyId: string;
  initialCode: string;
}

export const PolicyEditor: React.FC<PolicyEditorProps> = ({ policyId, initialCode }) => {
  const [code, setCode] = useState(initialCode);
  const [testResult, setTestResult] = useState<any>(null);

  const saveMutation = useMutation({
    mutationFn: (newCode: string) => GovernanceService.updatePolicy({ policy_id: policyId, rule_code: newCode }),
    onSuccess: () => {
        // Show toast (mocked)
        console.log("Policy saved successfully");
    }
  });

  // Mock evaluation for now
  const evaluateMutation = useMutation({
      mutationFn: async () => {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));
          return { allow: true, reason: "Policy checks passed." };
      },
      onSuccess: (data) => setTestResult(data)
  });

  return (
    <div className="flex flex-col h-full bg-surface border border-white/5 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-white/5 bg-surface-variant/5">
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-on-surface-variant">Policy ID:</span>
            <span className="text-sm font-bold text-primary font-mono">{policyId}</span>
        </div>
        <div className="flex gap-2">
            <Button 
                size="sm" 
                variant="secondary" 
                leftIcon={<Play className="w-3 h-3"/>}
                onClick={() => evaluateMutation.mutate()}
                isLoading={evaluateMutation.isPending}
            >
                Test Rule
            </Button>
            <Button 
                size="sm" 
                leftIcon={<Save className="w-3 h-3"/>}
                onClick={() => saveMutation.mutate(code)}
                isLoading={saveMutation.isPending}
            >
                Save Changes
            </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative min-h-[300px] bg-[#1e1e1e] font-mono text-sm">
        <Editor
          value={code}
          onValueChange={code => setCode(code)}
          highlight={highlightCode}
          padding={20}
          className="min-h-full"
          style={{
            fontFamily: '"Fira Code", "Fira Mono", monospace',
            fontSize: 14,
            backgroundColor: 'transparent',
            color: '#d4d4d4',
          }}
          textareaClassName="focus:outline-none"
        />
      </div>

      {/* Test Results Panel */}
      {testResult && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className={`p-4 border-t border-white/5 ${testResult.allow ? 'bg-green-500/5' : 'bg-red-500/5'}`}
          >
              <div className="flex items-start gap-3">
                  {testResult.allow ? <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0"/> : <AlertTriangle className="w-5 h-5 text-red-400 shrink-0"/>}
                  <div>
                      <h4 className={`text-sm font-bold ${testResult.allow ? 'text-green-400' : 'text-red-400'}`}>
                          Evaluation Result: {testResult.allow ? "ALLOWED" : "DENIED"}
                      </h4>
                      <p className="text-xs text-on-surface-variant mt-1">{testResult.reason}</p>
                  </div>
              </div>
          </motion.div>
      )}
    </div>
  );
};
