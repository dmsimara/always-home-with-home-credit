import React, { useState } from 'react';
import { UserProfile, Reward, Quest } from '../types';
import { Trophy, Star, TrendingUp, Gift, Lock, Unlock, Gamepad2, CheckCircle, ChevronRight, Info } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import StoryModeModal from './StoryModeModal';

interface GamificationHubProps {
  user: UserProfile;
  quests: Quest[];
  onStartQuest: (quest: Quest) => void;
  onStoryComplete: () => void;
}

const GamificationHub: React.FC<GamificationHubProps> = ({ user, quests, onStartQuest, onStoryComplete }) => {
  const [showStoryMode, setShowStoryMode] = useState(false);

  const data = [
    { name: 'Score', value: user.reputationScore },
    { name: 'Remaining', value: 1000 - user.reputationScore },
  ];
  const COLORS = ['#FFFFFF', 'rgba(255,255,255,0.2)'];

  // Real Home Credit style rewards
  const rewards: Reward[] = [
    { 
        id: '1', 
        title: 'Last Installment FREE', 
        cost: 2500, 
        description: 'The ultimate reward! We pay your last month if you finish your term on time.', 
        icon: '🎁', 
        unlocked: user.points >= 2500 
    },
    { 
        id: '2', 
        title: 'Waived Processing Fee', 
        cost: 1200, 
        description: 'Save ~₱500-₱1,000 on fees when you apply for your next Cash Loan.', 
        icon: '🎫', 
        unlocked: user.points >= 1200 
    },
    { 
        id: '3', 
        title: '₱500 SM Gift Pass', 
        cost: 800, 
        description: 'Shop at The SM Store, Supermarket, and affiliates nationwide.', 
        icon: '🛍️', 
        unlocked: user.points >= 800 
    },
    { 
        id: '4', 
        title: '0% Interest Qwarta', 
        cost: 600, 
        description: 'Unlock 0% interest for 1 month on your Qwarta credit line purchases.', 
        icon: '💳', 
        unlocked: user.points >= 600 
    },
    { 
        id: '5', 
        title: 'Grace Pass (3 Days)', 
        cost: 300, 
        description: 'SafetyNet exclusive: Extend a due date without penalty fees.', 
        icon: '🛡️', 
        unlocked: user.points >= 300 
    },
    { 
        id: '6', 
        title: '₱100 GCash Load', 
        cost: 150, 
        description: 'Instant load for your prepaid mobile or wallet.', 
        icon: '📱', 
        unlocked: user.points >= 150 
    },
  ];

   // Helper component for Tooltip
   const InfoTooltip = ({ text }: { text: string }) => (
    <div className="group relative ml-1 inline-flex items-center">
      <Info size={14} className="text-white/60 cursor-help hover:text-white" />
      <div className="tooltip-content hidden absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg p-3 z-50 shadow-xl">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Score Card */}
      <div className="bg-[#E30613] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-5 -mb-5"></div>
        
        <div className="flex flex-col sm:flex-row items-center justify-between relative z-10">
          <div className="mb-6 sm:mb-0 text-center sm:text-left">
             <div className="flex items-center justify-center sm:justify-start">
                 <h2 className="text-red-100 text-sm font-medium uppercase tracking-wider mb-1">Trust Score</h2>
                 <InfoTooltip text="Higher score = better trust rating! This helps you get bigger loans and lower interest rates later." />
             </div>
             
             <div className="text-4xl font-bold mb-2 flex items-center gap-2 justify-center sm:justify-start">
                {user.reputationScore} 
                <span className="text-sm bg-white/20 px-2 py-0.5 rounded text-white font-normal">/ 1000</span>
             </div>
             <div className="inline-flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/10">
                <Trophy size={16} className="text-yellow-400" />
                <span className="font-semibold text-sm">{user.level} Level</span>
             </div>
          </div>

          <div className="h-32 w-32 relative">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={data}
                   cx="50%"
                   cy="50%"
                   innerRadius={40}
                   outerRadius={55}
                   fill="#8884d8"
                   paddingAngle={5}
                   dataKey="value"
                   stroke="none"
                   startAngle={180}
                   endAngle={0}
                 >
                   {data.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex items-center justify-center pt-4 flex-col">
                <span className="text-xs text-red-100">Streak</span>
                <span className="font-bold text-lg">{user.streakMonths} mo</span>
             </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
           <div className="flex items-center gap-2">
              <Star className="text-yellow-400 fill-yellow-400" size={18} />
              <span className="font-bold">{user.points} Points</span>
              <InfoTooltip text="Points are like money! Use them to buy rewards like Interest Rebates below." />
           </div>
           <button className="text-xs font-medium text-red-100 hover:text-white underline">View History</button>
        </div>
      </div>

      {/* Story Mode Banner */}
      <div 
        onClick={() => setShowStoryMode(true)}
        className="bg-gray-900 rounded-xl p-1 overflow-hidden cursor-pointer shadow-lg group hover:scale-[1.01] transition-transform"
      >
        <div className="bg-[url('https://images.unsplash.com/photo-1614726365723-49cfae96a604?auto=format&fit=crop&q=80&w=600')] bg-cover bg-center h-24 rounded-lg relative flex items-center p-6">
            <div className="absolute inset-0 bg-black/60 rounded-lg"></div>
            <div className="relative z-10 flex items-center justify-between w-full">
                <div>
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <Gamepad2 className="text-purple-400" /> Financial Quest
                    </h3>
                    <p className="text-gray-300 text-xs mt-1">Play Story Mode • Earn 100 XP</p>
                </div>
                <div className="bg-white/20 p-2 rounded-full text-white group-hover:bg-white/40 transition-colors">
                    <ChevronRight />
                </div>
            </div>
        </div>
      </div>

      {/* Quests List */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
         <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-[#E30613]" /> Daily Tasks
         </h3>
         <div className="space-y-3">
            {quests.map(quest => (
                <div key={quest.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${quest.completed ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                            {quest.completed ? <CheckCircle size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>}
                        </div>
                        <div>
                            <h4 className={`font-medium text-sm ${quest.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{quest.title}</h4>
                            <p className="text-xs text-gray-500">{quest.description}</p>
                        </div>
                    </div>
                    {!quest.completed ? (
                        <button 
                            onClick={() => onStartQuest(quest)}
                            className="text-xs font-bold px-3 py-1.5 bg-red-100 text-[#E30613] rounded-lg hover:bg-red-200"
                        >
                            Go
                        </button>
                    ) : (
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+ {quest.rewardPoints} pts</span>
                    )}
                </div>
            ))}
         </div>
      </div>

      {/* Rewards Grid */}
      <div>
        <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
           <Gift className="text-[#E30613]" /> Rewards Catalog
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => (
                <div key={reward.id} className={`
                    border rounded-xl p-4 flex flex-col justify-between transition-all h-full
                    ${reward.unlocked ? 'bg-white border-gray-100 hover:shadow-md' : 'bg-gray-50 border-gray-100 opacity-70'}
                `}>
                    <div className="flex items-start gap-4 mb-3">
                        <div className="text-2xl bg-gray-100 w-12 h-12 flex items-center justify-center rounded-lg shrink-0">
                            {reward.icon}
                        </div>
                        <div>
                            <div className="flex justify-between items-start w-full">
                                <h4 className="font-bold text-gray-900 leading-tight">{reward.title}</h4>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 leading-snug">{reward.description}</p>
                        </div>
                    </div>
                    
                    <button 
                        disabled={!reward.unlocked}
                        className={`text-xs font-bold py-2.5 px-3 rounded-lg w-full transition-colors mt-auto flex items-center justify-between
                            ${reward.unlocked 
                                ? 'bg-gray-900 text-white hover:bg-[#E30613]' 
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'}
                        `}
                    >
                        <span>Redeem</span>
                        <span className="flex items-center gap-1 opacity-90">
                           {reward.unlocked ? <Unlock size={12}/> : <Lock size={12}/>} 
                           {reward.cost} pts
                        </span>
                    </button>
                </div>
            ))}
        </div>
      </div>

      {showStoryMode && (
        <StoryModeModal 
            onClose={() => setShowStoryMode(false)} 
            onComplete={() => {
                setShowStoryMode(false);
                onStoryComplete();
            }}
        />
      )}
    </div>
  );
};

export default GamificationHub;