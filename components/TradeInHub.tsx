import React, { useState, useEffect } from 'react';
import { Smartphone, Tablet, Laptop, CheckCircle, ArrowRight, Loader2, Camera, Lock, ShieldAlert, Zap, Gift, Sparkles, Bell, Trophy, Info, X, ShieldCheck, Upload, EyeOff, Cpu, ScanLine, Fingerprint, RefreshCw } from 'lucide-react';
import { analyzeDeviceRewards, scanDeviceCondition, getUpgradePrediction } from '../services/geminiService';
import { UserProfile, ScanResult } from '../types';

interface TradeInHubProps {
  onTradeInComplete: (value: number) => void;
  hasCompletedLoan: boolean;
  user: UserProfile;
}

// Extended Mock Database for Simulation
const DEVICE_DB = {
    Smartphone: [
        { model: "iPhone 15 Pro Max", serialPrefix: "HCCP-APL" },
        { model: "iPhone 14 Pro", serialPrefix: "HCCP-APL" },
        { model: "Samsung S24 Ultra", serialPrefix: "HCCP-SAM" },
        { model: "Samsung Galaxy A54", serialPrefix: "HCCP-SAM" },
        { model: "Google Pixel 8", serialPrefix: "HCCP-GOO" },
        { model: "Xiaomi 13T Pro", serialPrefix: "HCCP-MIA" },
        { model: "Tecno Camon 20 Premier", serialPrefix: "HCCP-TEC" },
        { model: "Realme 11 Pro+", serialPrefix: "HCCP-RME" }
    ],
    Tablet: [
        { model: "iPad Pro 12.9 (M2)", serialPrefix: "HCCP-IPD" },
        { model: "iPad Air 5", serialPrefix: "HCCP-IPD" },
        { model: "Samsung Galaxy Tab S9", serialPrefix: "HCCP-TAB" },
        { model: "Xiaomi Pad 6", serialPrefix: "HCCP-PAD" },
        { model: "iPad 9th Gen", serialPrefix: "HCCP-IPD" }
    ],
    Laptop: [
        { model: "MacBook Air M2", serialPrefix: "HCCP-MAC" },
        { model: "MacBook Pro 14 (M1)", serialPrefix: "HCCP-MAC" },
        { model: "Dell XPS 13", serialPrefix: "HCCP-DEL" },
        { model: "Acer Nitro 5", serialPrefix: "HCCP-ACR" },
        { model: "Lenovo Yoga 7i", serialPrefix: "HCCP-LEN" },
        { model: "HP Pavilion 15", serialPrefix: "HCCP-HPQ" }
    ]
};

const TradeInHub: React.FC<TradeInHubProps> = ({ onTradeInComplete, hasCompletedLoan, user }) => {
  // State Management
  const [step, setStep] = useState<'INPUT' | 'SCANNING' | 'RESULTS'>('INPUT');
  const [scanMode, setScanMode] = useState<'INTERNAL' | 'EXTERNAL'>('INTERNAL');
  
  // Data State
  const [deviceType, setDeviceType] = useState('Smartphone');
  const [model, setModel] = useState('');
  const [condition, setCondition] = useState('Good');
  const [serialNumber, setSerialNumber] = useState('');
  
  // Verification State
  const [contractId, setContractId] = useState('');
  const [receiptFile, setReceiptFile] = useState<string | null>(null);
  
  // Results State
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [prediction, setPrediction] = useState<{shouldUpgrade: boolean, reason: string, projectedDrop: string} | null>(null);
  
  // UI Loading States
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState('');
  const [calculating, setCalculating] = useState(false);
  
  // Modals
  const [showScanContext, setShowScanContext] = useState(false);
  const [showTradeContext, setShowTradeContext] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Proactive Nudge
  const [showProactiveAlert, setShowProactiveAlert] = useState(false);

  useEffect(() => {
    if (hasCompletedLoan && step === 'INPUT') {
       const timer = setTimeout(() => {
           if (Math.random() > 0.5) setShowProactiveAlert(true);
       }, 3000);
       return () => clearTimeout(timer);
    }
  }, [hasCompletedLoan, step]);

  // --- ACTIONS ---

  const getRandomDevice = (type: string) => {
      const list = DEVICE_DB[type as keyof typeof DEVICE_DB] || DEVICE_DB.Smartphone;
      const item = list[Math.floor(Math.random() * list.length)];
      // Generate a semi-random serial
      const randomSerial = `${item.serialPrefix}-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
      return { model: item.model, serial: randomSerial };
  };

  const performScan = async () => {
      setIsScanning(true);
      setScanProgress(0);
      
      // Select a random device for simulation
      const detectedDevice = getRandomDevice(deviceType);

      if (scanMode === 'INTERNAL') {
          // Internal Scan Simulation
          const stages = ['Checking Hardware ID...', 'Verifying Screen Integrity...', 'Analyzing Battery Health...', 'Fetching Serial Number...'];
          for (let i = 0; i <= 100; i += 4) {
               setScanProgress(i);
               if (i < 30) setScanStage(stages[0]);
               else if (i < 60) setScanStage(stages[1]);
               else if (i < 85) setScanStage(stages[2]);
               else setScanStage(stages[3]);
               await new Promise(r => setTimeout(r, 60)); 
          }
          
          setModel(detectedDevice.model);
          setSerialNumber(detectedDevice.serial);
          setCondition('Good'); // Internal scan usually defaults to Good unless error codes found
          
      } else {
          // External Scan Simulation
          setScanStage('Initializing Camera...');
          await new Promise(r => setTimeout(r, 500));
          
          for (let i = 0; i <= 100; i += 3) {
               setScanProgress(i);
               setScanStage(i > 50 ? 'Identifying Object...' : 'Scanning Surface...');
               await new Promise(r => setTimeout(r, 50)); 
          }

          const scanRes = await scanDeviceCondition(deviceType);
          
          setModel(detectedDevice.model);
          setCondition(scanRes.condition); 
          setSerialNumber(""); // External scan can't read internal serial
      }

      setIsScanning(false);
  };

  const executeAssessment = async () => {
    setShowScanContext(false);
    setStep('SCANNING'); // Re-use scanning step for calculation loading
    setCalculating(true);

    try {
        const [result, predict] = await Promise.all([
            analyzeDeviceRewards(`${deviceType} ${model}`, condition, user.reputationScore, contractId),
            getUpgradePrediction(user.level, model)
        ]);
        setScanResult(result);
        setPrediction(predict);
        
        setTimeout(() => {
            setCalculating(false);
            setStep('RESULTS');
        }, 1500);
    } catch (e) {
        setStep('INPUT');
        setCalculating(false);
    }
  };

  const activatePerks = () => {
      onTradeInComplete(0); 
      setNotification("Deal Activated! Check your Dashboard.");
      setTimeout(() => setNotification(null), 3000);
  };

  const confirmPhysicalTrade = () => {
      setShowTradeContext(false);
      if (scanResult?.tradeInValue) {
          onTradeInComplete(scanResult.tradeInValue);
      }
  };

  const handleReceiptUpload = () => {
      setReceiptFile("receipt_2023.jpg");
  };

  const resetForm = () => {
      setStep('INPUT');
      setModel('');
      setSerialNumber('');
      setContractId('');
      setReceiptFile(null);
  };

  // --- SUB-COMPONENTS ---

  const ScanContextModal = () => (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="flex min-h-full items-center justify-center">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative overflow-hidden my-8">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-[#E30613]"></div>
                
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-red-50 rounded-full text-[#E30613] shrink-0">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Final Verification</h3>
                        <p className="text-xs text-gray-500">Confirming ownership for {serialNumber || 'Verification Required'}</p>
                    </div>
                </div>

                <div className="mb-5 bg-yellow-50 border border-yellow-100 p-3 rounded-xl flex gap-2">
                    <Info size={16} className="text-yellow-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-800 leading-snug">
                        <strong>Note:</strong> This assessment unlocks perks. Physical trade-in is optional.
                    </p>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <EyeOff size={18} className="text-gray-400 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-sm text-gray-800">Privacy First</h4>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                We verified hardware ID and condition only. No personal data was accessed.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => setShowScanContext(false)} className="flex-1 py-3 text-gray-500 font-bold text-sm hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                    <button onClick={executeAssessment} className="flex-1 py-3 bg-[#E30613] text-white font-bold text-sm rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                        <Zap size={16} fill="currentColor" /> Calculate Value
                    </button>
                </div>
            </div>
          </div>
      </div>
  );

  const TradeContextModal = () => (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="flex min-h-full items-center justify-center">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative my-8">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Physical Trade-In Process</h3>
                    <button onClick={() => setShowTradeContext(false)}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
                </div>
                
                <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg text-xs text-orange-800 mb-5 flex gap-2">
                    <Info size={16} className="shrink-0" />
                    <p>This creates a <strong>Provisional Voucher</strong>. You must visit a partner store within 7 days to finalize.</p>
                </div>

                <div className="space-y-5 mb-6">
                    <div className="flex items-center gap-4 relative">
                        <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold shrink-0 z-10">1</div>
                        <div className="absolute top-8 left-4 w-0.5 h-full bg-gray-100 -z-0"></div>
                        <p className="text-sm text-gray-600">Bring your <strong>{model}</strong> (Serial: {serialNumber}) to any Home Credit partner store.</p>
                    </div>
                    <div className="flex items-center gap-4 relative">
                        <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold shrink-0 z-10">2</div>
                        <div className="absolute top-8 left-4 w-0.5 h-full bg-gray-100 -z-0"></div>
                        <p className="text-sm text-gray-600">Show this QR code. Agent verifies device condition matches your scan.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#E30613] text-white border border-[#E30613] flex items-center justify-center text-xs font-bold shrink-0 z-10">3</div>
                        <p className="text-sm text-gray-800 font-bold">Receive ₱{scanResult?.tradeInValue.toLocaleString()} deducted from your new loan immediately.</p>
                    </div>
                </div>

                <button onClick={confirmPhysicalTrade} className="w-full py-3.5 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-black shadow-lg transition-all">
                    Generate Secure Voucher
                </button>
            </div>
          </div>
      </div>
  );

  // --- VIEWS ---

  if (!hasCompletedLoan) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in text-center py-12 px-6">
           <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
               <Lock className="text-gray-400" size={32} />
               <div className="absolute -bottom-1 -right-1 bg-red-100 p-2 rounded-full border-4 border-white">
                   <ShieldAlert size={16} className="text-[#E30613]" />
               </div>
           </div>
           <h2 className="text-2xl font-bold text-gray-900 mb-3">Feature Locked</h2>
           <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
               Smart Trade-In is exclusive to trusted partners who have <strong>completed at least one loan payment cycle</strong>.
           </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in relative pb-24 md:pb-12 px-4 md:px-0">
        
        {/* Modals */}
        {showScanContext && <ScanContextModal />}
        {showTradeContext && <TradeContextModal />}
        
        {/* Notification Toast */}
        {notification && (
           <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-slide-up z-50 w-max max-w-[90%]">
              <CheckCircle size={18} className="text-green-400 shrink-0" />
              <span className="font-medium text-sm truncate">{notification}</span>
           </div>
        )}

        {/* Nudge Notification */}
        {showProactiveAlert && step === 'INPUT' && (
            <div className="bg-indigo-900 rounded-xl p-4 text-white shadow-xl flex items-center justify-between border border-indigo-700 animate-slide-up relative z-20 mx-2 md:mx-0">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-500/30 p-2 rounded-full text-indigo-200 animate-pulse">
                        <Bell size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">Check your Device Value</h4>
                        <p className="text-xs text-indigo-200">Scanning now might unlock a 0% Interest offer.</p>
                    </div>
                </div>
                <button 
                  onClick={() => setShowProactiveAlert(false)}
                  className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                    Dismiss
                </button>
            </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between pt-2">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Trade-In Value Scan</h1>
                <p className="text-gray-500 text-sm mt-1">Assess your device. Unlock exclusive deals.</p>
            </div>
            {step === 'RESULTS' && (
                <button onClick={resetForm} className="text-sm font-bold text-gray-500 hover:text-[#E30613] transition-colors underline decoration-2 underline-offset-4">
                    Scan Another
                </button>
            )}
        </div>

        {/* --- STEP 1: INPUT & SCANNER --- */}
        {step === 'INPUT' && (
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                <div className="p-6 md:p-8 flex-1 space-y-6">
                    
                    {/* Device Category */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">Device Category</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'Smartphone', icon: Smartphone },
                                { id: 'Tablet', icon: Tablet },
                                { id: 'Laptop', icon: Laptop }
                            ].map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => { setDeviceType(type.id); setModel(''); setSerialNumber(''); }}
                                    className={`py-4 px-2 flex flex-col items-center gap-2 text-xs rounded-xl border-2 transition-all font-bold ${
                                        deviceType === type.id 
                                        ? 'bg-red-50 border-[#E30613] text-[#E30613]' 
                                        : 'border-gray-100 text-gray-500 hover:bg-gray-50 hover:border-gray-200'
                                    }`}
                                >
                                    <type.icon size={24} strokeWidth={1.5} />
                                    {type.id}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* SCANNER SECTION */}
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 overflow-hidden relative">
                        {/* Toggle Switch */}
                        <div className="flex bg-gray-200 p-1 rounded-xl mb-4 relative z-10">
                            <button 
                                onClick={() => { setScanMode('INTERNAL'); setModel(''); setSerialNumber(''); }}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all z-10 ${scanMode === 'INTERNAL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Scan This Device
                            </button>
                            <button 
                                onClick={() => { setScanMode('EXTERNAL'); setModel(''); setSerialNumber(''); }}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all z-10 ${scanMode === 'EXTERNAL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Scan External Device
                            </button>
                        </div>

                        {/* Scanner Interface */}
                        <div className="relative rounded-xl overflow-hidden min-h-[200px] flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-300 transition-all">
                            
                            {!isScanning ? (
                                // Idle State
                                <button 
                                     onClick={performScan}
                                     className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-3 hover:bg-gray-50 transition-colors group"
                                >
                                     <div className={`p-4 rounded-full transition-all duration-500 transform group-hover:scale-110 ${scanMode === 'INTERNAL' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-900 text-white'}`}>
                                        {scanMode === 'INTERNAL' ? <Cpu size={32} /> : <Camera size={32} />}
                                     </div>
                                     <div className="text-center px-4">
                                        <h4 className="font-bold text-gray-800 text-lg">
                                            {scanMode === 'INTERNAL' ? 'Start System Diagnostics' : 'Start AI Visual Scan'}
                                        </h4>
                                        <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
                                            {scanMode === 'INTERNAL' 
                                                ? 'Deep scan of internal components & identifiers.' 
                                                : 'Use camera to detect model & physical condition.'}
                                        </p>
                                     </div>
                                </button>
                            ) : (
                                // Scanning State
                                <div className="w-full h-full absolute inset-0 bg-gray-900 flex flex-col items-center justify-center text-white">
                                    {scanMode === 'INTERNAL' ? (
                                        // Internal Animation: Terminal style
                                        <div className="w-full max-w-xs space-y-4">
                                            <Cpu size={48} className="text-indigo-400 mx-auto animate-pulse" />
                                            <div className="space-y-2">
                                                 <div className="flex justify-between text-xs font-mono text-indigo-300">
                                                     <span>{scanStage}</span>
                                                     <span>{scanProgress}%</span>
                                                 </div>
                                                 <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                                     <div className="bg-indigo-500 h-full transition-all duration-75 ease-linear" style={{ width: `${scanProgress}%` }}></div>
                                                 </div>
                                            </div>
                                            <div className="h-20 font-mono text-[10px] text-green-400 opacity-70 overflow-hidden text-left pl-4 border-l border-gray-700">
                                                 {scanProgress > 10 && <div>> CPU_ID: A15_BIONIC_OK</div>}
                                                 {scanProgress > 30 && <div>> SCREEN_TOUCH: ACTIVE</div>}
                                                 {scanProgress > 50 && <div>> BATTERY_CYCLE: 82%</div>}
                                                 {scanProgress > 70 && <div>> IMEI_CHECK: VALID</div>}
                                            </div>
                                        </div>
                                    ) : (
                                        // External Animation: Camera style
                                        <>
                                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                                            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"></div>
                                            
                                            {/* Scan Line */}
                                            <div className="absolute inset-0 w-full h-1 bg-[#E30613] shadow-[0_0_15px_#E30613] animate-scan-down z-10"></div>
                                            
                                            <div className="relative z-20 text-center">
                                                <ScanLine size={48} className="text-[#E30613] mx-auto mb-4" />
                                                <h4 className="font-bold text-lg tracking-widest uppercase">Analyzing...</h4>
                                                <p className="text-xs text-red-200 mt-1 font-mono">{scanStage}</p>
                                            </div>
                                            
                                            {/* Corner Brackets */}
                                            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/50 z-20"></div>
                                            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/50 z-20"></div>
                                            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/50 z-20"></div>
                                            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white/50 z-20"></div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RESULTS FORM (Auto-filled) */}
                    <div className={`space-y-4 transition-all duration-500 ${model ? 'opacity-100 translate-y-0' : 'opacity-50 blur-[1px]'}`}>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Model</label>
                                <div className={`w-full px-4 py-3 border rounded-xl text-sm font-medium ${model ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                    {model || 'Pending Scan...'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Condition</label>
                                {scanMode === 'INTERNAL' ? (
                                    <div className="relative">
                                        <select 
                                            value={condition}
                                            onChange={(e) => setCondition(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E30613] bg-white text-sm appearance-none"
                                        >
                                            <option value="Excellent">Excellent</option>
                                            <option value="Good">Good</option>
                                            <option value="Fair">Fair</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><RefreshCw size={12}/></div>
                                    </div>
                                ) : (
                                    <div className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold bg-gray-50 text-gray-800 flex items-center justify-between">
                                        {condition}
                                        {model && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">AI Detect</span>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Verification Section */}
                        <div className="border-t border-gray-100 pt-4 mt-2">
                            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <ShieldCheck size={14} className="text-[#E30613]"/> 
                                HC Ownership Verification <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-gray-400 font-bold mb-1 block">Contract ID</label>
                                        <input 
                                            type="text" 
                                            value={contractId}
                                            onChange={(e) => setContractId(e.target.value)}
                                            placeholder="e.g. 230012999"
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E30613] focus:outline-none bg-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 font-bold mb-1 block flex items-center gap-1">
                                            Device Serial / IMEI 
                                            {serialNumber && <CheckCircle size={10} className="text-green-500"/>}
                                        </label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                value={serialNumber}
                                                readOnly={scanMode === 'INTERNAL' && !!serialNumber} // Read-only if fetched by system
                                                onChange={(e) => setSerialNumber(e.target.value)}
                                                placeholder={scanMode === 'INTERNAL' ? "Scan to fetch" : "Type Serial No."}
                                                className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none 
                                                    ${scanMode === 'INTERNAL' && serialNumber
                                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-800 font-bold cursor-not-allowed' 
                                                        : 'bg-white border-gray-200 focus:ring-2 focus:ring-[#E30613]'}`
                                                }
                                            />
                                            {!serialNumber && <Fingerprint size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />}
                                        </div>
                                        {model && scanMode === 'EXTERNAL' && <p className="text-[10px] text-gray-400 mt-1">Please check settings/back of device.</p>}
                                    </div>
                                </div>

                                <div 
                                    onClick={handleReceiptUpload}
                                    className={`border border-dashed rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-colors ${receiptFile ? 'bg-green-50 border-green-200' : 'border-gray-300 hover:bg-gray-50'}`}
                                >
                                    <Upload size={16} className={receiptFile ? "text-green-600" : "text-gray-400"} />
                                    <span className={`text-xs font-medium ${receiptFile ? "text-green-700" : "text-gray-500"}`}>
                                        {receiptFile ? `Uploaded: ${receiptFile}` : "Upload Purchase Receipt / Invoice"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => setShowScanContext(true)} 
                            disabled={!model || !contractId || !receiptFile || !serialNumber}
                            className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]
                                ${(!model || !contractId || !receiptFile || !serialNumber) ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#E30613] hover:bg-red-700 shadow-xl shadow-red-200'}
                            `}
                        >
                            <Zap size={20} fill="currentColor" /> Verify & Assess Value
                        </button>
                    </div>

                </div>
                
                {/* Marketing Panel */}
                <div className="bg-gray-900 p-8 w-full md:w-80 flex flex-col justify-between text-white relative overflow-hidden shrink-0">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-[#E30613] rounded-full blur-[80px] opacity-20 -mr-10 -mt-10"></div>
                     <div className="relative z-10">
                         <div className="flex items-center gap-2 mb-4 opacity-80">
                             <Sparkles size={16} className="text-yellow-400" />
                             <span className="text-xs font-bold tracking-widest uppercase">Value Unlock</span>
                         </div>
                         <h3 className="text-2xl font-bold leading-tight mb-4">Your device is your key.</h3>
                         <p className="text-gray-400 text-sm leading-relaxed">
                             {scanMode === 'INTERNAL' 
                                ? 'Scan this gadget to activate "Trade-In Ready" mode. Keep using it, but unlock exclusive offers.'
                                : 'Turn your old, unused electronics into credit towards your loan or next purchase.'
                             }
                         </p>
                     </div>
                     <div className="relative z-10 pt-8 border-t border-white/10 mt-auto">
                        <div className="flex items-center gap-3 text-sm font-medium">
                            <CheckCircle size={16} className="text-green-400" />
                            <span>0% Interest on Qwarta</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium mt-2">
                            <CheckCircle size={16} className="text-green-400" />
                            <span>Waived Processing Fees</span>
                        </div>
                     </div>
                </div>
            </div>
        )}

        {/* --- STEP 2: LOADING CALCULATION (Transition) --- */}
        {step === 'SCANNING' && (
             <div className="bg-white rounded-2xl p-16 text-center border border-gray-200 shadow-sm animate-fade-in">
                 <Loader2 className="mx-auto text-[#E30613] animate-spin mb-4" size={48} />
                 <h2 className="text-2xl font-bold text-gray-800">Analyzing Trade-In Potential...</h2>
                 <p className="text-gray-500 text-sm">Validating ownership & Trust Score tier.</p>
             </div>
        )}

        {/* --- STEP 3: RESULTS --- */}
        {step === 'RESULTS' && scanResult && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 animate-fade-in">
                
                {/* 1. Device Score Card */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 text-center h-full relative overflow-hidden flex flex-col justify-center">
                        {scanResult.isTradeInReady && (
                            <div className="absolute top-4 right-4 bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm border border-green-200">
                                <CheckCircle size={10} /> Trade-In Ready
                            </div>
                        )}
                        
                        <div className="relative w-40 h-40 mx-auto my-6 flex items-center justify-center shrink-0">
                             <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                                 <circle cx="80" cy="80" r="70" stroke="#f3f4f6" strokeWidth="12" fill="transparent" />
                                 <circle cx="80" cy="80" r="70" stroke={scanResult.deviceScore > 75 ? "#10b981" : "#E30613"} strokeWidth="12" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * scanResult.deviceScore) / 100} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                             </svg>
                             <div className="absolute inset-0 flex flex-col items-center justify-center">
                                 <span className="text-5xl font-extrabold text-gray-900 tracking-tighter">{scanResult.deviceScore}</span>
                                 <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Score</span>
                             </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 mb-1">{model}</h3>
                        <div className="inline-block px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold mb-4">
                            {scanResult.tier} Tier Condition
                        </div>
                        <p className="text-sm text-gray-500 italic leading-relaxed px-2">"{scanResult.aiMessage}"</p>
                    </div>
                </div>

                {/* 2. Perks List */}
                <div className="md:col-span-2 space-y-6">
                    
                    {/* Prediction Nudge */}
                    {prediction && prediction.shouldUpgrade && (
                        <div className="bg-gradient-to-r from-indigo-50 to-white border border-indigo-100 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
                            <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-600 shrink-0">
                                <Zap size={22} fill="currentColor" />
                            </div>
                            <div>
                                <h4 className="font-bold text-indigo-900 text-sm">Smart Suggestion</h4>
                                <p className="text-sm text-indigo-800 mt-1 leading-relaxed">{prediction.reason} Using your exclusive deals now maximizes your upgrade value.</p>
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="mb-4">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                                <Gift className="text-[#E30613]" /> Exclusive Deals for You
                            </h3>
                            {scanResult.bundleName && (
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] bg-gray-900 text-white font-bold uppercase tracking-wider">
                                        Bundle: {scanResult.bundleName}
                                    </span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <ShieldCheck size={12} className="text-green-500" />
                                        Personalized for Trust Score: <strong>{user.reputationScore}</strong>
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        <div className="grid gap-4">
                            {scanResult.perks.map((perk) => (
                                <div key={perk.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                    <div className={`absolute top-0 left-0 w-1 h-full ${user.reputationScore > 700 ? 'bg-yellow-400' : 'bg-[#E30613]'}`}></div>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-xl bg-red-50 text-[#E30613] flex items-center justify-center font-bold text-xl shrink-0">
                                                {perk.type === 'discount' ? '%' : perk.type === 'boost' ? '🚀' : perk.type === 'points' ? '★' : '🗓️'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 group-hover:text-[#E30613] transition-colors">{perk.title}</h4>
                                                <p className="text-sm text-gray-500 mt-0.5">{perk.description}</p>
                                                <span className="inline-block mt-2 text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                                                    Value: {perk.value}
                                                </span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={activatePerks}
                                            className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-700 transition-colors shadow-lg hover:shadow-xl shrink-0"
                                        >
                                            Claim
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. Optional Physical Trade-In */}
                    <div className="border-t border-gray-200 pt-8 mt-2">
                         <div className="flex items-center justify-between mb-5">
                             <div className="flex items-center gap-2">
                                 <Smartphone className="text-gray-400" size={20} />
                                 <h4 className="font-bold text-gray-700 text-base">Physical Trade-In (Optional)</h4>
                             </div>
                             <span className="text-[10px] uppercase font-bold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md tracking-wide">Smartphones Only</span>
                         </div>

                         {scanResult.tradeInValue > 0 ? (
                             <div className="bg-gray-50 rounded-2xl p-5 flex items-center justify-between border border-gray-200 group hover:border-gray-300 transition-colors relative overflow-hidden">
                                 <div>
                                     <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Estimated Cash Value</p>
                                     <p className="font-bold text-2xl text-gray-900">₱{scanResult.tradeInValue.toLocaleString()}</p>
                                     <p className="text-xs text-gray-400 mt-1">Deductible from your next device purchase.</p>
                                 </div>
                                 <button 
                                     onClick={() => setShowTradeContext(true)}
                                     className="text-sm font-bold text-[#E30613] group-hover:underline flex items-center gap-1 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100"
                                 >
                                     Get Cash Voucher <ArrowRight size={16} />
                                 </button>
                             </div>
                         ) : (
                             <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
                                 <Info size={20} className="text-gray-400" />
                                 <p>Physical trade-in is not available for this device type.</p>
                             </div>
                         )}
                    </div>

                </div>
            </div>
        )}

    </div>
  );
};

export default TradeInHub;