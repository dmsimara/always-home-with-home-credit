
import React, { useState } from 'react';
import { X, ShieldCheck, AlertTriangle, Star, CheckCircle, Wrench, Trophy } from 'lucide-react';

interface SafetyNetGuideModalProps {
  onClose: () => void;
}

const SafetyNetGuideModal: React.FC<SafetyNetGuideModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'score' | 'tools'>('score');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gray-900 p-6 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/10 rounded-lg">
                <ShieldCheck size={24} className="text-[#E30613]" />
             </div>
             <div>
                 <h2 className="text-xl font-bold">How SafetyNet Works</h2>
                 <p className="text-gray-400 text-xs">Your guide to the financial ecosystem.</p>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
            <button 
                onClick={() => setActiveTab('score')}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors relative
                    ${activeTab === 'score' ? 'text-[#E30613]' : 'text-gray-500 hover:bg-gray-50'}
                `}
            >
                <Trophy size={16} /> Trust Score
                {activeTab === 'score' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#E30613]"></div>}
            </button>
            <button 
                onClick={() => setActiveTab('tools')}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors relative
                    ${activeTab === 'tools' ? 'text-[#E30613]' : 'text-gray-500 hover:bg-gray-50'}
                `}
            >
                <Wrench size={16} /> Smart Tools
                {activeTab === 'tools' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#E30613]"></div>}
            </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-white flex-1">
           
             {activeTab === 'score' && (
                 <div className="space-y-6 animate-slide-up">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
                       <strong>What is a Trust Score?</strong> It is an internal rating from 0-1000. Unlike a credit score which looks at history, this looks at your <em>current behavior</em>. Higher scores unlock VIP tools.
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                       <div>
                          <h3 className="font-bold text-green-700 mb-3 flex items-center gap-2"><CheckCircle size={18}/> How to EARN Points</h3>
                          <ul className="space-y-2 text-sm text-gray-600">
                             <li className="flex justify-between bg-green-50 p-2 rounded">
                                <span>Daily Login</span> 
                                <span className="font-bold text-green-600">+5 pts</span>
                             </li>
                             <li className="flex justify-between bg-green-50 p-2 rounded">
                                <span>On-Time Payment</span> 
                                <span className="font-bold text-green-600">+100 pts</span>
                             </li>
                             <li className="flex justify-between bg-green-50 p-2 rounded">
                                <span>Check Trade-In Value</span> 
                                <span className="font-bold text-green-600">+50 pts</span>
                             </li>
                          </ul>
                       </div>

                       <div>
                          <h3 className="font-bold text-red-700 mb-3 flex items-center gap-2"><AlertTriangle size={18}/> How to LOSE Points</h3>
                          <ul className="space-y-2 text-sm text-gray-600">
                             <li className="flex justify-between bg-red-50 p-2 rounded">
                                <span>Ghosting (Inactive)</span> 
                                <span className="font-bold text-red-600">-10 pts/day</span>
                             </li>
                             <li className="flex justify-between bg-red-50 p-2 rounded">
                                <span>Broken Promise</span> 
                                <span className="font-bold text-red-600">-100 pts</span>
                             </li>
                             <li className="flex justify-between bg-red-50 p-2 rounded">
                                <span>Late Payment</span> 
                                <span className="font-bold text-red-600">-150 pts</span>
                             </li>
                          </ul>
                       </div>
                    </div>

                    <div>
                       <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Star size={18} className="text-yellow-500"/> Level Benefits</h3>
                       <div className="border rounded-lg overflow-hidden text-sm">
                          <table className="w-full text-left">
                             <thead className="bg-gray-100 text-gray-600">
                                <tr>
                                   <th className="p-3">Level</th>
                                   <th className="p-3">Score Req.</th>
                                   <th className="p-3">Benefits</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y">
                                <tr>
                                   <td className="p-3 font-medium">Bronze</td>
                                   <td className="p-3">0 - 500</td>
                                   <td className="p-3 text-gray-500">Basic App Access</td>
                                </tr>
                                <tr>
                                   <td className="p-3 font-medium text-gray-800">Silver</td>
                                   <td className="p-3">501 - 750</td>
                                   <td className="p-3 text-gray-500">Unlocks "Pay Half Now" (Split)</td>
                                </tr>
                                <tr>
                                   <td className="p-3 font-medium text-yellow-600">Gold</td>
                                   <td className="p-3">751 - 900</td>
                                   <td className="p-3 text-gray-500">Unlocks "Extend Due Date"</td>
                                </tr>
                                <tr>
                                   <td className="p-3 font-medium text-[#E30613]">VIP</td>
                                   <td className="p-3">901+</td>
                                   <td className="p-3 text-gray-500">Unlocks "Gap Loan" & Priority Support</td>
                                </tr>
                             </tbody>
                          </table>
                       </div>
                    </div>
                 </div>
             )}

             {activeTab === 'tools' && (
                 <div className="space-y-6 animate-slide-up">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Adjustment Tools</h3>
                        <p className="text-sm text-gray-600">
                            These tools are designed to help you during temporary cash flow problems. To prevent misuse, they have strict eligibility rules based on your Trust Score tier.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Tool 1 */}
                        <div className="border border-gray-200 rounded-xl p-4 hover:border-yellow-300 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                 <h3 className="font-bold text-gray-800">1. Extend Due Date (Micro-Extension)</h3>
                                 <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded">GOLD+</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">Adds 3 extra days to your due date so you can pay without a late fee.</p>
                            <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1">
                                <p><strong>Limit:</strong> Once per month.</p>
                                <p><strong>Cost:</strong> Free if you have a "Grace Pass", otherwise 250 Points.</p>
                            </div>
                        </div>

                        {/* Tool 2 */}
                        <div className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                 <h3 className="font-bold text-gray-800">2. Pay Half Now (Split Payment)</h3>
                                 <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded">SILVER+</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">Allows you to pay 30% today and the rest within 7 days. Keeps your status "Green".</p>
                            <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1">
                                <p><strong>Limit:</strong> Twice per year.</p>
                                <p><strong>Risk:</strong> Missing the second payment results in a double penalty (-200 Score).</p>
                            </div>
                        </div>

                        {/* Tool 3 */}
                        <div className="border border-[#E30613] bg-red-50/50 rounded-xl p-4">
                            <div className="flex justify-between items-start mb-2">
                                 <h3 className="font-bold text-[#E30613]">3. Gap Loan (Emergency Top-up)</h3>
                                 <span className="bg-[#E30613] text-white text-[10px] font-bold px-2 py-1 rounded">VIP ONLY</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                               A small loan automatically applied to your bill to cover a shortage.
                            </p>
                            <div className="bg-white p-3 rounded-lg text-xs space-y-2 border border-red-100">
                                <p><strong>Eligibility:</strong> Must have 6 months of perfect history.</p>
                                <p><strong>Max Amount:</strong> 30% of your installment value.</p>
                                <p><strong>Frequency:</strong> Once every 6 months.</p>
                                <p className="text-red-600 italic">
                                   <AlertTriangle size={12} className="inline mr-1"/>
                                   <strong>Warning:</strong> This increases your total debt. Use only in emergencies.
                                </p>
                            </div>
                        </div>
                    </div>
                 </div>
             )}

        </div>
      </div>
    </div>
  );
};

export default SafetyNetGuideModal;
    