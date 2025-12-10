import React, { useState } from 'react';
import { FileText, HelpCircle, AlertTriangle, PlayCircle, X } from 'lucide-react';
import { explainContractClause, simulateContractScenario } from '../services/geminiService';

const MOCK_CONTRACT = `
LOAN AGREEMENT TERMS AND CONDITIONS

1. REPAYMENT SCHEDULE
The Borrower agrees to repay the Principal Amount of ₱15,000 plus Interest in monthly installments as specified in the Payment Schedule. Failure to pay on the Due Date constitutes a Default Event.

2. LATE PAYMENT FEES
If an installment is not received within 3 days of the Due Date ("Grace Period"), a Late Fee of 5% of the outstanding installment amount (approx. ₱115) will be charged. This fee is cumulative for each month the amount remains unpaid.

3. PREPAYMENT
The Borrower may prepay the outstanding balance at any time. A Prepayment Processing Fee of 2% of the prepaid amount may apply unless the loan has been active for at least 6 months.

4. DEFAULT AND ACCELERATION
Upon the occurrence of a Default Event continuing for more than 30 days, the Lender declares the entire unpaid Principal Balance immediately due and payable. The Lender may initiate collection proceedings as permitted by law.
`;

const ContractCompanion: React.FC = () => {
  const [selectedText, setSelectedText] = useState('');
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  const handleTextSelection = () => {
    const text = window.getSelection()?.toString();
    if (text && text.length > 10) {
      setSelectedText(text);
      setExplanation(null); // Reset explanation
    }
  };

  const handleExplain = async () => {
    if (!selectedText) return;
    setLoading(true);
    const result = await explainContractClause(selectedText);
    setExplanation(result);
    setLoading(false);
  };

  const handleSimulate = async (scenario: string) => {
    setLoading(true);
    setSimulationResult(null);
    const result = await simulateContractScenario(scenario, "Personal Cash Loan");
    setSimulationResult(result);
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 animate-fade-in">
      
      {/* Contract Viewer */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-[#E30613]" size={20} />
            Loan Agreement #L-1024
          </h2>
          <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">Read-Only Mode</span>
        </div>
        
        <div 
          className="p-6 overflow-y-auto text-sm leading-relaxed text-gray-600 font-serif" 
          onMouseUp={handleTextSelection}
        >
          <p className="whitespace-pre-wrap">{MOCK_CONTRACT}</p>
        </div>

        <div className="bg-red-50 p-3 text-xs text-[#E30613] text-center">
          💡 Tip: Highlight any text above to ask AI to explain it.
        </div>
      </div>

      {/* AI Assistant Panel */}
      <div className="w-full md:w-80 shrink-0 space-y-4">
        
        {/* Explainer Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
           <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
             <HelpCircle className="text-emerald-500" size={18} /> Clause Explainer
           </h3>
           
           {!selectedText ? (
             <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed rounded-xl">
               Select text from the contract to get a simple explanation.
             </div>
           ) : (
             <div className="space-y-3">
               <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded italic border-l-2 border-red-400 truncate">
                 "{selectedText}"
               </div>
               
               {!explanation ? (
                 <button 
                   onClick={handleExplain}
                   disabled={loading}
                   className="w-full py-2 bg-[#E30613] text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                 >
                   {loading ? 'Analyzing...' : 'Explain This'}
                 </button>
               ) : (
                 <div className="bg-emerald-50 p-3 rounded-xl text-sm text-emerald-800 animate-fade-in">
                   <p>{explanation}</p>
                   <button 
                    onClick={() => { setSelectedText(''); setExplanation(null); }}
                    className="mt-2 text-xs text-emerald-600 underline"
                   >
                     Clear
                   </button>
                 </div>
               )}
             </div>
           )}
        </div>

        {/* Simulator Card */}
        <div className="bg-gray-900 rounded-2xl shadow-md p-5 text-white">
           <h3 className="font-bold mb-3 flex items-center gap-2">
             <PlayCircle className="text-yellow-400" size={18} /> "What If" Simulator
           </h3>
           <p className="text-xs text-gray-300 mb-4">See what happens before you act.</p>
           
           <div className="space-y-2">
             <button 
               onClick={() => handleSimulate("I pay 5 days late")}
               className="w-full text-left p-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors flex items-center gap-2"
             >
               <AlertTriangle size={14} className="text-orange-400" /> Pay 5 days late?
             </button>
             <button 
               onClick={() => handleSimulate("I pay double this month")}
               className="w-full text-left p-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors flex items-center gap-2"
             >
               <PlayCircle size={14} className="text-green-400" /> Pay double this month?
             </button>
           </div>

           {simulationResult && (
             <div className="mt-4 bg-black/20 p-3 rounded-xl text-xs leading-relaxed animate-fade-in border border-white/10">
               {loading ? "Simulating..." : simulationResult}
             </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default ContractCompanion;