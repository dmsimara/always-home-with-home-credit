import React, { useState } from 'react';
import { UserProfile, Loan } from '../types';
import LoanCard from './LoanCard';
import PaymentOptionsModal from './PaymentOptionsModal';
import { ShieldCheck, PieChart, Info, Filter } from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  loans: Loan[];
  onUpdateLoan: (loanId: string, action: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, loans, onUpdateLoan }) => {
  const [activeModalLoan, setActiveModalLoan] = useState<Loan | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Paid'>('All');

  const handleOpenOptions = (loan: Loan) => {
    setActiveModalLoan(loan);
  };

  const handleApplyOption = (action: string) => {
    if (activeModalLoan) {
      onUpdateLoan(activeModalLoan.id, action);
      setActiveModalLoan(null);
    }
  };

  const filteredLoans = loans.filter(loan => {
      if (filterStatus === 'All') return true;
      return loan.status === filterStatus;
  });

  // Helper component for Tooltip
  const InfoTooltip = ({ text }: { text: string }) => (
    <div className="group relative ml-1 inline-flex items-center justify-center">
      <Info size={14} className="text-gray-400 cursor-help hover:text-[#E30613]" />
      <div className="tooltip-content hidden absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-800 text-white text-xs rounded-lg p-3 z-50 shadow-xl">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-800"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome & Status */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Magandang Araw, {user.name} 👋</h1>
          <p className="text-gray-500 text-sm">Here is your account summary.</p>
        </div>
        <div className="text-right hidden sm:block">
           <div className="flex items-center justify-end gap-1">
             <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Current Level</p>
             <InfoTooltip text="Earn higher levels (Silver, Gold) by paying on time and completing daily quests. Higher levels get special rewards!" />
           </div>
           <p className="text-[#E30613] font-bold text-lg">{user.level}</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="text-gray-500 text-xs uppercase font-bold mb-1 flex items-center">
                <ShieldCheck size={14} className="mr-1" /> Trust Score
                <InfoTooltip text="This is your personal rating inside the app. A higher Trust Score means you are a trusted partner, which can unlock lower interest rates and faster loan approvals." />
            </div>
            <div className="text-2xl font-bold text-gray-800">{user.reputationScore}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="text-gray-500 text-xs uppercase font-bold mb-1 flex items-center gap-1">
                <PieChart size={14} /> Active Loans
            </div>
            <div className="text-2xl font-bold text-gray-800">{loans.filter(l => l.status === 'Active').length}</div>
        </div>
        <div className="col-span-2 md:col-span-1 bg-gray-900 p-4 rounded-xl shadow-md text-white flex flex-col justify-center relative overflow-hidden">
             <div className="absolute right-0 top-0 w-16 h-16 bg-white/10 rounded-full -mr-4 -mt-4 blur-xl"></div>
             <div className="relative z-10">
                <div className="text-gray-300 text-xs uppercase font-bold mb-1">Total Due</div>
                <div className="text-2xl font-bold">₱3,400</div>
             </div>
        </div>
      </div>

      {/* Active Loans */}
      <div>
        <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 text-lg">Your Loans</h2>
            
            {/* Loan Status Filter */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
                {(['All', 'Active', 'Paid'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                            filterStatus === status 
                            ? 'bg-white text-[#E30613] shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {status}
                    </button>
                ))}
            </div>
        </div>

        {filteredLoans.length > 0 ? (
            filteredLoans.map(loan => (
            <LoanCard 
                key={loan.id} 
                loan={loan} 
                onOpenOptions={handleOpenOptions} 
            />
            ))
        ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
                <Filter className="mx-auto text-gray-300 mb-2" size={32} />
                <p className="text-gray-500 text-sm">No {filterStatus !== 'All' ? filterStatus.toLowerCase() : ''} loans found.</p>
            </div>
        )}
      </div>

      <PaymentOptionsModal 
        loan={activeModalLoan} 
        onClose={() => setActiveModalLoan(null)}
        onApply={handleApplyOption}
      />
    </div>
  );
};

export default Dashboard;