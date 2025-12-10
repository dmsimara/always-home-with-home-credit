
import React, { useState } from 'react';
import { UserProfile, Loan, Quest } from './types';
import Dashboard from './components/Dashboard';
import AiMentor from './components/AiMentor';
import GamificationHub from './components/GamificationHub';
import TradeInHub from './components/TradeInHub';
import SafetyNetGuideModal from './components/SafetyNetGuideModal';
import { LayoutDashboard, MessageCircle, Trophy, Smartphone, Bell, HelpCircle, User } from 'lucide-react';

// Mock Data
const INITIAL_USER: UserProfile = {
  name: "Alex",
  reputationScore: 720,
  level: 'Silver',
  points: 350,
  streakMonths: 4
};

const INITIAL_LOANS: Loan[] = [
  {
    id: 'L-1024',
    type: 'Cash Loan',
    amount: 15000,
    remainingAmount: 4500,
    nextDueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    installmentAmount: 2300,
    breakdown: {
        principal: 1800,
        interest: 350,
        insurance: 150,
        lateFees: 0
    },
    riskLevel: 'Medium',
    status: 'Active'
  },
  {
    id: 'L-0099',
    type: 'Smartphone Loan',
    amount: 12000,
    remainingAmount: 0,
    nextDueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    installmentAmount: 0,
    breakdown: {
        principal: 0,
        interest: 0,
        insurance: 0,
        lateFees: 0
    },
    riskLevel: 'Low',
    status: 'Paid'
  }
];

const INITIAL_QUESTS: Quest[] = [
    { id: 'q2', title: 'Unlock Device Perks', description: 'Scan your gadget to see rewards.', rewardPoints: 100, completed: false, actionRoute: 'tradein' },
    { id: 'q3', title: 'Play "Financial Quest"', description: 'Complete a story chapter.', rewardPoints: 150, completed: false, actionRoute: 'story' } 
];

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'mentor' | 'rewards' | 'tradein'>('dashboard');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [loans, setLoans] = useState<Loan[]>(INITIAL_LOANS);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [notification, setNotification] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  // Eligibility Check for Trade-In
  const hasCompletedLoan = loans.some(loan => loan.status === 'Paid');

  const handleUpdateLoan = (loanId: string, action: string) => {
    // Optimistic UI Update
    setLoans(prevLoans => prevLoans.map(loan => {
      if (loan.id === loanId) {
        if (action === 'extend') {
          return { ...loan, nextDueDate: new Date(new Date(loan.nextDueDate).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), riskLevel: 'Low' };
        }
        if (action === 'split') {
          return { ...loan, installmentAmount: loan.installmentAmount * 0.7, riskLevel: 'Low' };
        }
      }
      return loan;
    }));

    setNotification(action === 'extend' ? 'Due date extended by 3 days! Iwas late fee!' : 'Payment split applied. Pay 70% later.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleStartQuest = (quest: Quest) => {
    if (quest.actionRoute === 'tradein') setActiveTab('tradein');
    
    // Simulate completion
    setTimeout(() => {
        setQuests(prev => prev.map(q => q.id === quest.id ? { ...q, completed: true } : q));
        setUser(prev => ({ ...prev, points: prev.points + quest.rewardPoints, reputationScore: prev.reputationScore + 10 }));
        setNotification(`Quest Completed! +${quest.rewardPoints} Points`);
        setTimeout(() => setNotification(null), 3000);
    }, 1500);
  };

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'mentor', label: 'Mentor', icon: MessageCircle },
    { id: 'tradein', label: 'Trade-In', icon: Smartphone },
    { id: 'rewards', label: 'Rewards', icon: Trophy },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard user={user} loans={loans} onUpdateLoan={handleUpdateLoan} />;
      case 'mentor': return <AiMentor user={user} />;
      case 'tradein': return <TradeInHub 
          user={user}
          hasCompletedLoan={hasCompletedLoan}
          onTradeInComplete={(val) => {
             if (val > 0) {
                setNotification(`Success! ₱${val.toLocaleString()} Voucher Generated.`);
             } else {
                setNotification(`Perks Activated! Check your dashboard.`);
             }
             setTimeout(() => setNotification(null), 4000);
          }} 
      />;
      case 'rewards': return <GamificationHub user={user} quests={quests} onStartQuest={handleStartQuest} onStoryComplete={() => {
         setUser(prev => ({ ...prev, points: prev.points + 100, reputationScore: prev.reputationScore + 20 }));
         setNotification("Story Chapter Complete! +100 XP");
         setTimeout(() => setNotification(null), 3000);
      }} />;
      default: return <Dashboard user={user} loans={loans} onUpdateLoan={handleUpdateLoan} />;
    }
  };

  return (
    <div className="h-[100dvh] bg-[#F9F9F9] text-gray-800 font-sans flex overflow-hidden w-full">
      
      {/* DESKTOP Sidebar Navigation (Hidden on Mobile) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 z-50 h-full">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2 shrink-0">
             <div className="w-8 h-8 bg-[#E30613] rounded-lg flex items-center justify-center text-white font-bold text-xl">
               HC
             </div>
             <span className="font-bold text-lg tracking-tight text-gray-900">SafetyNet</span>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
           {navItems.map((item) => (
             <button 
               key={item.id}
               onClick={() => setActiveTab(item.id as any)}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
                 ${activeTab === item.id ? 'bg-red-50 text-[#E30613]' : 'text-gray-600 hover:bg-gray-50'}
               `}
             >
               <item.icon size={20} /> {item.label}
             </button>
           ))}
        </nav>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-4 shrink-0">
           {/* Desktop User Profile */}
           <div className="flex items-center gap-3 px-2">
              <div className="w-9 h-9 bg-[#E30613] rounded-full flex items-center justify-center text-white shadow-md">
                 <User size={18} />
              </div>
              <div className="overflow-hidden">
                 <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                 <p className="text-xs text-gray-500 truncate">{user.level} Member</p>
              </div>
           </div>

           <button 
             onClick={() => setShowGuide(true)}
             className="w-full flex items-center gap-2 justify-center py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
           >
             <HelpCircle size={14} /> How it Works
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden relative w-full">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between shrink-0 z-40">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-[#E30613] rounded-lg flex items-center justify-center text-white font-bold">HC</div>
             <span className="font-bold text-gray-900">SafetyNet</span>
           </div>
           
           <div className="flex items-center gap-3">
               {/* Mobile Profile Icon */}
               <button className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center text-gray-700 border border-gray-100">
                  <User size={18} />
               </button>
               
               {/* Mobile Guide Button */}
               <button onClick={() => setShowGuide(true)} className="text-gray-500 p-2 bg-gray-50 rounded-full">
                 <HelpCircle size={20} />
               </button>
           </div>
        </header>

        {/* Scrollable Content - Added padding bottom for mobile nav */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 pb-24 md:pb-8 relative w-full scroll-smooth">
           {renderContent()}
        </div>

        {/* MOBILE Bottom Navigation (Hidden on Desktop) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 pb-[env(safe-area-inset-bottom)] z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg w-full transition-colors
                  ${activeTab === item.id ? 'text-[#E30613]' : 'text-gray-400'}
                `}
              >
                <item.icon size={22} className={activeTab === item.id ? 'mb-1' : 'mb-1 opacity-70'} />
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </button>
            ))}
        </nav>

        {/* Notifications Toast */}
        {notification && (
           <div className="fixed bottom-24 md:bottom-6 right-6 left-6 md:left-auto bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up z-[60]">
              <Bell size={18} className="text-yellow-400" />
              <span className="font-medium text-sm">{notification}</span>
           </div>
        )}

        {showGuide && <SafetyNetGuideModal onClose={() => setShowGuide(false)} />}

      </main>
    </div>
  );
}

export default App;
