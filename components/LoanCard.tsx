import React, { useState } from 'react';
import { Loan } from '../types';
import { AlertTriangle, Calendar, CheckCircle, TrendingUp, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface LoanCardProps {
  loan: Loan;
  onOpenOptions: (loan: Loan) => void;
}

const LoanCard: React.FC<LoanCardProps> = ({ loan, onOpenOptions }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  const isHighRisk = loan.riskLevel === 'High';
  const isMediumRisk = loan.riskLevel === 'Medium';

  const riskColor = isHighRisk ? 'text-red-600 bg-red-50 border-red-200' :
                   isMediumRisk ? 'text-orange-600 bg-orange-50 border-orange-200' :
                   'text-green-600 bg-green-50 border-green-200';

  const riskLabel = isHighRisk ? 'Needs Attention' : isMediumRisk ? 'Payment Coming Up' : 'On Track';

  // Tooltip helper
  const InfoTooltip = ({ text }: { text: string }) => (
    <div className="group relative ml-1 inline-flex items-center">
      <Info size={12} className="text-gray-400 cursor-help hover:text-gray-600" />
      <div className="tooltip-content hidden absolute bottom-full mb-2 w-48 bg-gray-800 text-white text-[10px] rounded p-2 z-50 shadow-xl left-1/2 -translate-x-1/2">
        {text}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-4 transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-gray-800 text-lg">{loan.type}</h3>
          <p className="text-gray-500 text-sm">Contract: {loan.id}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${riskColor}`}>
          {isHighRisk && <AlertTriangle size={12} />}
          {isMediumRisk && <TrendingUp size={12} />}
          {!isHighRisk && !isMediumRisk && <CheckCircle size={12} />}
          {riskLabel}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center mb-1">
            Next Payment 
          </p>
          <div className="flex items-end gap-2">
              <p className="font-bold text-xl text-gray-900">₱{loan.installmentAmount.toLocaleString()}</p>
              <button 
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="text-xs text-[#E30613] hover:underline flex items-center mb-1 font-medium"
              >
                {showBreakdown ? 'Hide Breakdown' : 'View Breakdown'}
                {showBreakdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
          </div>
          
          {/* Payment Breakdown Panel */}
          {showBreakdown && (
            <div className="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs animate-fade-in">
                <div className="flex justify-between text-gray-500 mb-1">
                    <span>Principal Amount</span>
                    <span>₱{loan.breakdown.principal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500 mb-1">
                    <span>Interest</span>
                    <span>+ ₱{loan.breakdown.interest.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500 mb-1">
                    <span>Insurance/Fees</span>
                    <span>+ ₱{loan.breakdown.insurance.toLocaleString()}</span>
                </div>
                 {loan.breakdown.lateFees > 0 && (
                    <div className="flex justify-between text-red-600 font-medium mb-1 border-t border-gray-200 pt-1">
                        <span>Late Fees</span>
                        <span>+ ₱{loan.breakdown.lateFees.toLocaleString()}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-gray-800 border-t border-gray-200 pt-1 mt-1">
                    <span>Total Due</span>
                    <span>₱{loan.installmentAmount.toLocaleString()}</span>
                </div>
            </div>
          )}
        </div>
        
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Due Date</p>
          <div className="flex items-center gap-1">
             <Calendar size={14} className="text-gray-400"/>
             <p className="font-medium text-gray-700">{new Date(loan.nextDueDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
        <div 
            className="bg-[#E30613] h-2 rounded-full" 
            style={{ width: `${((loan.amount - loan.remainingAmount) / loan.amount) * 100}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mb-4">
        <span>Paid: ₱{(loan.amount - loan.remainingAmount).toLocaleString()}</span>
        <span>Total: ₱{loan.amount.toLocaleString()}</span>
      </div>

      {(isHighRisk || isMediumRisk) && (
        <button 
          onClick={() => onOpenOptions(loan)}
          className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-[#E30613] rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
        >
          <span>Can't pay on time?</span>
          <span className="bg-white px-1.5 py-0.5 rounded text-xs border border-red-200 shadow-sm">View Options</span>
        </button>
      )}
      
      {(!isHighRisk && !isMediumRisk) && (
         <button className="w-full py-2.5 px-4 bg-gray-50 text-gray-400 rounded-lg font-medium text-sm cursor-default border border-gray-100">
            Auto-debit scheduled
         </button>
      )}
    </div>
  );
};

export default LoanCard;