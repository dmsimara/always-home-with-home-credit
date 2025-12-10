export interface UserProfile {
  name: string;
  reputationScore: number;
  level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'VIP';
  points: number;
  streakMonths: number;
}

export interface Loan {
  id: string;
  type: string;
  amount: number;
  remainingAmount: number;
  nextDueDate: string; // ISO Date string
  installmentAmount: number;
  breakdown: {
    principal: number;
    interest: number;
    insurance: number;
    lateFees: number;
  };
  riskLevel: 'Low' | 'Medium' | 'High';
  status: 'Active' | 'Paid' | 'Overdue';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  rewardPoints: number;
  completed: boolean;
  actionRoute: string; // 'contract', 'tradein', 'promolens', etc.
}

export interface StoryScenario {
  text: string;
  options: {
    label: string;
    nextContext: string;
  }[];
}

// New Types for Smart Scan
export interface DevicePerk {
  id: string;
  title: string;
  description: string;
  type: 'discount' | 'boost' | 'points' | 'terms';
  value: string; // e.g., "1% Off" or "+500 Pts"
}

export interface ScanResult {
  deviceScore: number;
  tier: 'Essential' | 'Bonus' | 'Premium';
  isTradeInReady: boolean;
  bundleName: string; // e.g. "VIP Trust Bundle" or "Safety Builder Set"
  perks: DevicePerk[];
  tradeInValue: number; // Optional cash value (0 if not eligible for physical trade-in)
  aiMessage: string;
}