// frontend/web-app/src/app/(dashboards)/loan-case/page.tsx
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, CheckCircle2 } from 'lucide-react';

type Step = 'inputData' | 'documentVerification' | 'runScore';

export default function LoanCaseFunnelPage() {
  const [currentStep, setCurrentStep] = useState<Step>('inputData');
  const [formData, setFormData] = useState<any>({}); // Global state for the funnel
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());

  const handleNextStep = (stepName: Step, data: any) => {
    setFormData((prev: any) => ({ ...prev, ...data }));
    setCompletedSteps((prev) => new Set(prev).add(currentStep));
    switch (stepName) {
      case 'inputData':
        setCurrentStep('documentVerification');
        break;
      case 'documentVerification':
        setCurrentStep('runScore');
        break;
      case 'runScore':
        // Final step, maybe redirect or show summary
        break;
    }
  };

  const getStepIndicatorClass = (step: Step) => {
    const base = "flex items-center space-x-2 p-3 rounded-lg font-medium transition-all";
    if (completedSteps.has(step)) {
      return `${base} bg-green-500/10 text-green-700`;
    } else if (currentStep === step) {
      return `${base} bg-primary/10 text-primary border border-primary/20`;
    }
    return `${base} bg-surface-variant/50 text-on-surface-variant`;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'inputData':
        return <InputCustomerLoanData onNext={(data) => handleNextStep('inputData', data)} initialData={formData} />;
      case 'documentVerification':
        return <DocumentVerification onNext={(data) => handleNextStep('documentVerification', data)} initialData={formData} />;
      case 'runScore':
        return <RunScore onNext={(data) => handleNextStep('runScore', data)} initialData={formData} />;
      default:
        return <div>Unknown Step</div>;
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">New Loan Case</h1>

      {/* Step Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className={getStepIndicatorClass('inputData')}>
          {completedSteps.has('inputData') ? <CheckCircle2 className="w-5 h-5" /> : <span>1.</span>}
          <span>Input Data</span>
          {currentStep === 'inputData' && <ChevronRight className="w-4 h-4 ml-auto" />}
        </div>
        <div className={getStepIndicatorClass('documentVerification')}>
          {completedSteps.has('documentVerification') ? <CheckCircle2 className="w-5 h-5" /> : <span>2.</span>}
          <span>Document Verification</span>
          {currentStep === 'documentVerification' && <ChevronRight className="w-4 h-4 ml-auto" />}
        </div>
        <div className={getStepIndicatorClass('runScore')}>
          {completedSteps.has('runScore') ? <CheckCircle2 className="w-5 h-5" /> : <span>3.</span>}
          <span>Run Score</span>
          {currentStep === 'runScore' && <ChevronRight className="w-4 h-4 ml-auto" />}
        </div>
      </div>

      {/* Current Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
      >
        {renderStepContent()}
      </motion.div>
    </div>
  );
}

// --- Placeholder Components for each step ---

interface StepProps {
  onNext: (data: any) => void;
  initialData: any;
}

const InputCustomerLoanData: React.FC<StepProps> = ({ onNext, initialData }) => {
  const [customerName, setCustomerName] = useState(initialData.customerName || '');
  const [customerID, setCustomerID] = useState(initialData.customerID || '');
  const [loanAmount, setLoanAmount] = useState(initialData.loanAmount || '');
  const [loanTerms, setLoanTerms] = useState(initialData.loanTerms || '');
  const [sector, setSector] = useState(initialData.sector || '');
  const [country, setCountry] = useState(initialData.country || '');
  const [financials, setFinancials] = useState<FileList | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerID || !loanAmount || !loanTerms || !sector || !country) {
      alert('Please fill all required fields.');
      return;
    }
    onNext({ customerName, customerID, loanAmount, loanTerms, sector, country, financials });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Step 1: Input Customer & Loan Data</h2>
      <p className="text-gray-600">Enter the customer and loan details to begin the assessment.</p>
      
      {/* Customer Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Customer Name</label>
          <input 
            type="text" 
            id="customerName" 
            value={customerName} 
            onChange={(e) => setCustomerName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>
        <div>
          <label htmlFor="customerID" className="block text-sm font-medium text-gray-700">Customer ID</label>
          <input 
            type="text" 
            id="customerID" 
            value={customerID} 
            onChange={(e) => setCustomerID(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>
      </div>

      {/* Loan Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700">Loan Amount</label>
          <input 
            type="number" 
            id="loanAmount" 
            value={loanAmount} 
            onChange={(e) => setLoanAmount(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>
        <div>
          <label htmlFor="loanTerms" className="block text-sm font-medium text-gray-700">Loan Terms (Months)</label>
          <input 
            type="number" 
            id="loanTerms" 
            value={loanTerms} 
            onChange={(e) => setLoanTerms(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>
      </div>

      {/* Sector and Country */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sector" className="block text-sm font-medium text-gray-700">Sector</label>
          <input 
            type="text" 
            id="sector" 
            value={sector} 
            onChange={(e) => setSector(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
          <input 
            type="text" 
            id="country" 
            value={country} 
            onChange={(e) => setCountry(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>
      </div>

      {/* File Upload for Financials */}
      <div>
        <label htmlFor="financials" className="block text-sm font-medium text-gray-700">Upload Financials / Statements</label>
        <input 
          type="file" 
          id="financials" 
          onChange={(e) => setFinancials(e.target.files)}
          className="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-primary/10 file:text-primary
            hover:file:bg-primary/20"
          multiple
        />
      </div>
      
      <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
        Next: Document Verification
      </button>
    </form>
  );
};

const DocumentVerification: React.FC<StepProps> = ({ onNext, initialData }) => {
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [extractedFields, setExtractedFields] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocumentFile(file);
      setDocumentPreview(URL.createObjectURL(file));
      setExtractedFields(null); // Clear previous extractions
      setVerificationError("");
    }
  };

  const handleVerifyDocument = async () => {
    if (!documentFile) {
      setVerificationError("Please upload a document first.");
      return;
    }
    setIsVerifying(true);
    setVerificationError("");

    try {
      // Simulate API call to TBML Engine for document extraction
      // In a real scenario, this would send documentFile to the backend
      // and receive extracted data and highlight info.
      await new Promise(resolve => setTimeout(resolve, 2000)); 

      const mockExtractedData = {
        invoiceNumber: "INV-2025-001",
        amount: initialData.loanAmount || 100000,
        currency: "USD",
        shipper: "Global Trade Inc.",
        consignee: initialData.customerName || "Customer ABC",
        status: "Approved",
        mismatchedValues: ["currency"], // Example: if currency in doc doesn't match form
        riskItems: ["High-risk shipper location"], // Example: from TBML analysis
      };
      setExtractedFields(mockExtractedData);
      setVerificationError("");
      
    } catch (error) {
      console.error("Document verification failed:", error);
      setVerificationError("Failed to extract document data. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extractedFields) {
      setVerificationError("Please verify the document before continuing.");
      return;
    }
    onNext({ documentVerified: true, extractedFields });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Step 2: Document Verification (AI Extraction)</h2>
      <p className="text-gray-600">Upload and verify supporting documents for AI extraction.</p>
      
      {/* File Upload */}
      <div>
        <label htmlFor="documentUpload" className="block text-sm font-medium text-gray-700">Upload Document</label>
        <input 
          type="file" 
          id="documentUpload" 
          onChange={handleFileChange}
          className="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-primary/10 file:text-primary
            hover:file:bg-primary/20"
          accept=".pdf,.png,.jpg,.jpeg"
        />
      </div>

      {verificationError && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-md text-sm text-error-foreground flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {verificationError}
        </div>
      )}

      {documentFile && (
        <div className="mt-4 flex flex-col md:flex-row gap-4">
          {/* Document Preview Panel */}
          <div className="flex-1 border border-gray-200 rounded-md p-4">
            <h3 className="text-md font-semibold mb-2">Document Preview</h3>
            {documentPreview && (
              documentFile.type.startsWith('image/') ? (
                <img src={documentPreview} alt="Document Preview" className="max-w-full h-auto rounded-md" />
              ) : (
                <div className="flex items-center justify-center h-40 bg-gray-100 text-gray-500 rounded-md">
                  PDF Preview (Not implemented, display message)
                </div>
              )
            )}
            <button
              type="button"
              onClick={handleVerifyDocument}
              disabled={isVerifying}
              className="mt-4 w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isVerifying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              {isVerifying ? "Extracting..." : "Extract Data with AI"}
            </button>
          </div>

          {/* Extracted Fields Panel */}
          <div className="flex-1 border border-gray-200 rounded-md p-4 space-y-3">
            <h3 className="text-md font-semibold mb-2">Extracted Fields</h3>
            {extractedFields ? (
              <div className="space-y-2 text-sm">
                {Object.entries(extractedFields).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                    <span className={clsx(
                      extractedFields.mismatchedValues?.includes(key) && 'bg-yellow-100 text-yellow-800 p-0.5 rounded',
                      extractedFields.riskItems?.includes(key) && 'bg-red-100 text-red-800 p-0.5 rounded'
                    )}>
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Upload a document and click "Extract Data with AI" to see extracted fields.</p>
            )}
          </div>
        </div>
      )}
      
      <button 
        type="submit" 
        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        disabled={!extractedFields || isVerifying}
      >
        Next: Run Score
      </button>
    </form>
  );
};

const RunScore: React.FC<StepProps> = ({ onNext, initialData }) => {
  const [scoreResult, setScoreResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRunScore = async () => {
    setIsLoading(true);
    setError("");
    try {
      // Assuming initialData contains necessary fields like customerID, loanAmount, etc.
      // Call the ScoringService.getScore with relevant data from initialData
      const mockEntityId = initialData.customerID || "mock-entity-123"; // Use actual ID from form data
      const result = await ScoringService.getScore(mockEntityId); // Mock API call
      setScoreResult(result);
      setError("");
    } catch (err: any) {
      console.error("Error running score:", err);
      setError("Failed to generate score. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (action: string) => (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Action: ${action} for score: ${scoreResult?.composite_rating}`);
    onNext({ scoreRun: true, finalAction: action, scoreResult });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Step 3: Run the Score (The Magic Moment)</h2>
      <p className="text-gray-600">Initiate the credit scoring process and review results.</p>
      
      {!scoreResult && (
        <button 
          type="button" 
          onClick={handleRunScore} 
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center justify-center"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Calculating..." : "Run Score"}
        </button>
      )}

      {error && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-md text-sm text-error-foreground flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {scoreResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-50 p-6 rounded-lg shadow-inner space-y-4"
        >
          <h3 className="text-lg font-bold text-gray-800">Scoring Results:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Composite Rating:</p>
              <p className="text-2xl font-bold text-primary">{scoreResult.composite_rating}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Probability of Default (PD):</p>
              <p className="text-xl font-bold text-red-600">{scoreResult.pd_12m * 100}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Loss Given Default (LGD):</p>
              <p className="text-xl font-bold text-orange-600">{scoreResult.lgd * 100}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Expected Credit Loss (ECL):</p>
              <p className="text-xl font-bold text-red-700">${scoreResult.ead_usd}</p>
            </div>
          </div>

          <h4 className="text-md font-semibold text-gray-800 mt-4">Explanation:</h4>
          <p className="text-gray-700">{scoreResult.plain_language_explanation}</p>

          <h4 className="text-md font-semibold text-gray-800 mt-4">Red Flags:</h4>
          {scoreResult.top_negative_factors && scoreResult.top_negative_factors.length > 0 ? (
            <ul className="list-disc list-inside text-red-600 text-sm">
              {scoreResult.top_negative_factors.map((factor: any, index: number) => (
                <li key={index}>{factor.factor}: {factor.value} ({factor.impact})</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">No significant red flags identified.</p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button type="button" onClick={handleSubmit('Approve')} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
              Approve
            </button>
            <button type="button" onClick={handleSubmit('Decline')} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
              Decline
            </button>
            <button type="button" onClick={handleSubmit('Refer to Committee')} className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
              Refer to Credit Committee
            </button>
            <button type="button" onClick={handleSubmit('Override')} className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600">
              Override (with Justification)
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
