import React, { useState } from 'react';
import { Camera, ScanLine, Tag, Info, ShoppingBag, Loader2, RefreshCw } from 'lucide-react';
import { analyzePriceTag } from '../services/geminiService';
import { UserProfile } from '../types';

interface PromoLensProps {
  user: UserProfile;
}

const PromoLens: React.FC<PromoLensProps> = ({ user }) => {
  const [itemText, setItemText] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{
    installment6mo: number;
    installment12mo: number;
    analysis: string;
    salesPitch: string;
  } | null>(null);

  const handleManualScan = async () => {
    if (!itemText || !price) return;
    performAnalysis(itemText, Number(price));
  };

  const handleSimulateScan = async () => {
      setScanning(true);
      setResult(null);
      // Simulate OCR delay and data extraction
      setTimeout(() => {
          setItemText("Samsung 55' 4K Smart TV");
          setPrice(28000);
          setScanning(false);
          performAnalysis("Samsung 55' 4K Smart TV", 28000);
      }, 2000);
  };

  const performAnalysis = async (item: string, amount: number) => {
    setLoading(true);
    const data = await analyzePriceTag(item, amount, user.level);
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 animate-fade-in">
      
      {/* Scanner Interface */}
      <div className="flex-1 bg-black rounded-2xl shadow-xl overflow-hidden relative flex flex-col items-center justify-center p-6 border-4 border-gray-800 group">
         
         {/* Simulated Camera Feed Background */}
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80"></div>
         
         {/* Scanning Overlay Animation */}
         {scanning && (
             <div className="absolute inset-0 z-20">
                 <div className="w-full h-1 bg-[#E30613]/50 shadow-[0_0_15px_#E30613] absolute top-0 animate-scan-down"></div>
             </div>
         )}

         <div className="z-30 w-full max-w-sm bg-black/40 backdrop-blur-md rounded-xl p-6 border border-white/10 relative">
            <div className="text-center mb-6">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(227,6,19,0.5)] transition-all ${scanning ? 'bg-[#E30613] scale-110' : 'bg-[#E30613]'}`}>
                    <Camera className="text-white" size={28} />
                </div>
                <h2 className="text-white font-bold text-xl">Promo Lens</h2>
                <p className="text-gray-300 text-xs mt-1">AI Price & Affordability Scanner</p>
            </div>

            {/* Simulated Scan Button */}
            <button 
                onClick={handleSimulateScan}
                disabled={loading || scanning}
                className="w-full py-4 mb-4 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
                {scanning ? <Loader2 className="animate-spin text-[#E30613]" /> : <ScanLine size={20} className="text-[#E30613]"/>}
                {scanning ? 'Scanning...' : 'Tap to Scan Tag (Demo)'}
            </button>

            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="flex-shrink-0 mx-4 text-gray-500 text-xs">OR ENTER MANUALLY</span>
                <div className="flex-grow border-t border-gray-600"></div>
            </div>

            <div className="space-y-3 mt-2">
                <input 
                    type="text" 
                    value={itemText}
                    onChange={(e) => setItemText(e.target.value)}
                    placeholder="Item Name"
                    className="w-full bg-black/50 border border-gray-600 text-white rounded-lg px-4 py-2 text-sm focus:border-[#E30613] focus:outline-none"
                />
                <input 
                    type="number" 
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="Price (₱)"
                    className="w-full bg-black/50 border border-gray-600 text-white rounded-lg px-4 py-2 text-sm focus:border-[#E30613] focus:outline-none"
                />
                <button 
                    onClick={handleManualScan}
                    disabled={loading || !price}
                    className="w-full py-3 bg-[#E30613] text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-colors"
                >
                    {loading ? 'Analyzing...' : 'Check Affordability'}
                </button>
            </div>
         </div>

         {/* Trust Level Badge */}
         <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${user.level === 'Gold' || user.level === 'VIP' ? 'bg-yellow-400' : 'bg-gray-400'}`}></div>
            <span className="text-xs text-gray-300">Level: <span className="font-bold text-white">{user.level}</span></span>
         </div>
      </div>

      {/* Results Panel */}
      <div className="w-full md:w-96 shrink-0 flex flex-col">
         {!result ? (
             <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                 <ShoppingBag size={48} className="mb-4 opacity-20" />
                 <h3 className="font-bold text-gray-600">Ready to Shop?</h3>
                 <p className="text-sm mt-2 max-w-[200px]">Scan a price tag to instantly see your personalized installment plan.</p>
             </div>
         ) : (
             <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-slide-up flex flex-col h-full relative">
                 <div className="bg-[#E30613] p-6 text-white relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
                     <h3 className="font-bold text-lg flex items-center gap-2 relative z-10">
                         <Tag size={20} /> AI Analysis
                     </h3>
                     <p className="text-red-100 text-sm relative z-10">{itemText}</p>
                 </div>
                 
                 <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                     {/* The Sales Pitch (Requested Format) */}
                     <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl relative">
                         <div className="absolute -top-3 -left-3 bg-emerald-500 text-white p-1.5 rounded-lg shadow-sm">
                             <RefreshCw size={16} />
                         </div>
                         <p className="text-emerald-900 text-sm font-medium leading-relaxed mt-2">
                             "{result.salesPitch}"
                         </p>
                     </div>

                     {/* Breakdown */}
                     <div className="space-y-3">
                         <p className="text-xs uppercase font-bold text-gray-400 tracking-wider">Payment Plan</p>
                         
                         <div className="border-2 border-[#E30613] bg-red-50 rounded-xl p-4 flex justify-between items-center shadow-sm cursor-pointer relative overflow-hidden">
                             <div className="absolute top-0 right-0 bg-[#E30613] text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">RECOMMENDED</div>
                             <div>
                                 <span className="text-xs text-[#E30613] font-bold uppercase">12 Months</span>
                                 <div className="font-bold text-2xl text-gray-900">₱{result.installment12mo.toLocaleString()}<span className="text-sm font-normal text-gray-500">/mo</span></div>
                             </div>
                             <div className="w-6 h-6 rounded-full border-2 border-[#E30613] bg-[#E30613] flex items-center justify-center">
                                 <div className="w-2 h-2 bg-white rounded-full"></div>
                             </div>
                         </div>

                         <div className="border border-gray-200 rounded-xl p-4 flex justify-between items-center hover:border-gray-300 transition-all opacity-70">
                             <div>
                                 <span className="text-xs text-gray-500 font-medium">6 Months</span>
                                 <div className="font-bold text-lg text-gray-600">₱{result.installment6mo.toLocaleString()}<span className="text-xs font-normal text-gray-400">/mo</span></div>
                             </div>
                             <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                         </div>
                     </div>
                 </div>

                 <div className="p-4 border-t border-gray-100 bg-gray-50">
                     <button className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-lg flex items-center justify-center gap-2">
                         <ScanLine size={16} /> Find Agent Nearby
                     </button>
                 </div>
             </div>
         )}
      </div>
    </div>
  );
};

export default PromoLens;