import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ScanResult } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MENTOR_SYSTEM_INSTRUCTION = `
You are the Home Credit AI Financial Life Mentor. 
Your persona is "SafeRoute" - empathetic, non-judgmental, supportive, and proactively helpful.
Your goal is to help users manage their finances, understand their loans, and prevent overdue payments.
You speak in simple, clear language suitable for someone with basic financial literacy.
You encourage positive behavior and celebrate small wins.
If a user is stressed about payment, offer reassurance and suggest looking at the "Smart Adjustment Tools" like extensions or split payments.
Keep responses concise (under 150 words) unless asked for a detailed explanation.
`;

export const getFinancialAdvice = async (
  history: { role: string; text: string }[],
  userContext: string
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const prompt = `
      User Context: ${userContext}
      
      Conversation History:
      ${history.map(msg => `${msg.role === 'user' ? 'User' : 'Mentor'}: ${msg.text}`).join('\n')}
      
      Please respond to the last user message as the Mentor.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: MENTOR_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    return response.text || "I'm having trouble connecting right now, but remember I'm here to support you.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I apologize, but I'm currently unable to process your request. Please try again later.";
  }
};

export const analyzeRiskAndSuggest = async (loanDetails: string): Promise<string> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze this loan situation and provide a 1-sentence supportive tip to avoid being overdue: ${loanDetails}`,
             config: {
                systemInstruction: "You are a helpful financial assistant. Be brief and encouraging.",
            }
        });
        return response.text || "Stay on track with small savings daily!";
    } catch (e) {
        return "Keep up the good work on tracking your payments.";
    }
}

// --- New Features ---

export const explainContractClause = async (clauseText: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Explain this legal contract clause in very simple, easy-to-understand language for a non-expert. Avoid jargon. Clause: "${clauseText}"`,
      config: {
        systemInstruction: "You are a friendly legal assistant who simplifies complex text.",
      }
    });
    return response.text || "I couldn't simplify that right now, but it generally refers to your obligations.";
  } catch (e) {
    return "Service unavailable.";
  }
}

export const simulateContractScenario = async (scenario: string, contractType: string): Promise<string> => {
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on a standard ${contractType}, what happens if: ${scenario}? explain the consequences (fees, credit score impact) clearly and kindly.`,
      });
      return response.text || "That usually incurs a late fee.";
    } catch (e) {
      return "Unable to simulate right now.";
    }
}

export const analyzeDeviceRewards = async (device: string, condition: string, trustScore: number, contractId?: string): Promise<ScanResult> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `
            Analyze this device for the "Smart Scan Rewards" (Trade-In Ready) program based on the User's Trust Score.
            Device: ${device}
            Condition: ${condition}
            User Trust Score: ${trustScore} (Range: 0-1000)
            Verified Home Credit Contract ID: ${contractId || "Not Verified"}

            Reference Pricing Guide (PHP) - Second Hand Buyback Market:
            - Flagship Current Gen (e.g. iPhone 15, S24): 40,000 - 55,000
            - Flagship Previous Gen (e.g. iPhone 14, S23): 30,000 - 40,000
            - Flagship Older (e.g. iPhone 11-13): 12,000 - 25,000
            - Mid-Range (e.g. Samsung A54, Xiaomi 13T, Pixel 7): 10,000 - 18,000
            - Budget (e.g. Tecno, Infinix, Low-end Samsung): 3,000 - 7,000
            - Laptops (MacBook M1/M2): 30,000 - 45,000
            - Laptops (Windows Gaming/Ultrabook): 20,000 - 40,000
            - Tablets (iPad Pro/Air): 25,000 - 40,000
            - Tablets (Budget/Older): 5,000 - 15,000

            Logic:
            1. Calculate "deviceScore" (0-100) based on desirability and condition.
            2. Assign "tier": 'Essential' (<50), 'Bonus' (50-79), or 'Premium' (80+).
            
            3. DETERMINE TRADE-IN READY STATUS:
               - Set "isTradeInReady" to TRUE ONLY if "Verified Home Credit Contract ID" is present (not "Not Verified").
               - If Contract ID is missing, "isTradeInReady" MUST be FALSE, even if the device score is high.

            4. PREDICT OPTIMAL PERK BUNDLE based on Trust Score:
               - **High Trust (>700)**: Generate "Aggressive/VIP" perks. Focus on upsell and big savings.
                 Examples: "0% Interest on Qwarta", "Waived Last Installment", "Approval Boost (2x)", "Pre-approved Cash Loan".
                 Bundle Name Examples: "VIP Trust Bundle", "Platinum Upgrade Set".
                 
               - **Medium Trust (400-700)**: Generate "Balanced" perks. Focus on rebates and points.
                 Examples: "1% Interest Rebate", "500 Reward Points", "Free Device Insurance".
                 Bundle Name Examples: "Smart Saver Bundle", "Loyalty Booster Pack".

               - **Low Trust (<400)**: Generate "Safety/Behavioral" perks. Focus on risk reduction and encouraging good habits.
                 Examples: "SafePay Bonus (Points for on-time payment)", "Device Care Badge", "Application Fee Discount", "Free Financial Checkup".
                 Bundle Name Examples: "Trust Builder Set", "Safety Starter Pack".

            5. Estimate "tradeInValue" in PHP based on the Reference Pricing Guide and Condition.
               - Reduce value for 'Good' (80%) and 'Fair' (60%) conditions.
               - CRITICAL RULE: If the device is NOT a Smartphone (e.g. Laptop, Tablet, Appliance), tradeInValue MUST be 0. We only accept small gadgets (phones) for physical trade-in.
            
            Return JSON ONLY matching this interface:
            {
              "deviceScore": number,
              "tier": "Essential" | "Bonus" | "Premium",
              "isTradeInReady": boolean,
              "bundleName": "string",
              "perks": [{ "id": "1", "title": "string", "description": "string", "type": "string", "value": "string" }],
              "tradeInValue": number,
              "aiMessage": "One sentence explaining why this bundle fits their trust level."
            }
            `,
            config: { responseMimeType: "application/json" }
        });
        
        const text = response.text || "{}";
        return JSON.parse(text);
    } catch (e) {
        // Fallback robust pricing engine for offline/demo mode
        const cleanName = device.toLowerCase();
        
        // Comprehensive Price Lookup (Base Prices for Excellent Condition)
        const priceDb: Record<string, number> = {
            'iphone 15 pro max': 52000, 'iphone 15 pro': 45000, 'iphone 15': 38000,
            'iphone 14 pro max': 42000, 'iphone 14 pro': 36000, 'iphone 14': 29000,
            'samsung s24 ultra': 50000, 'samsung s24': 35000,
            'samsung s23 ultra': 34000, 'samsung s23': 26000,
            'samsung galaxy a54': 14000,
            'google pixel 8': 24000,
            'xiaomi 13t': 16000, 'xiaomi 13t pro': 22000,
            'tecno camon 20': 5500, 'realme 11': 9000,
            'ipad pro': 38000, 'ipad air': 24000, 'ipad 9': 11000,
            'samsung tab s9': 32000, 'xiaomi pad 6': 14000,
            'macbook air m2': 42000, 'macbook air m1': 30000,
            'macbook pro': 55000,
            'dell xps': 35000, 'acer nitro': 25000,
            'lenovo yoga': 28000, 'hp pavilion': 18000
        };

        // Find best match in DB
        let baseVal = 4000; // Default low end
        for (const key in priceDb) {
            if (cleanName.includes(key)) {
                baseVal = priceDb[key];
                break;
            }
        }

        // Apply condition penalty
        if (condition === 'Fair') baseVal *= 0.6;
        else if (condition === 'Good') baseVal *= 0.8;
        
        const isTabletOrLaptop = cleanName.includes('tab') || cleanName.includes('pad') || cleanName.includes('book') || cleanName.includes('laptop') || cleanName.includes('acer') || cleanName.includes('hp') || cleanName.includes('dell') || cleanName.includes('lenovo');

        return { 
            deviceScore: baseVal > 20000 ? 92 : baseVal > 10000 ? 75 : 45,
            tier: baseVal > 20000 ? 'Premium' : baseVal > 10000 ? 'Bonus' : 'Essential',
            isTradeInReady: !!contractId, // Only ready if contract exists
            bundleName: trustScore > 700 ? "VIP Trust Bundle" : "Smart Saver Bundle",
            perks: [
                { id: '1', title: '0% Interest Offer', description: 'Valid for your next Qwarta purchase.', type: 'discount', value: 'Save ~₱800' },
                { id: '2', title: 'Waived Processing Fee', description: 'Apply for a new cash loan for free.', type: 'boost', value: 'Save ₱500' }
            ],
            tradeInValue: isTabletOrLaptop ? 0 : Math.round(baseVal),
            aiMessage: "Based on our market data, this device holds strong value for a trade-in."
        };
    }
}

export const getNextStorySegment = async (previousContext: string, choice: string): Promise<string> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `
                You are running a text-adventure game called "Financial Quest".
                Current Context: ${previousContext}
                User Choice: ${choice}
                
                Generate the next part of the story (max 3 sentences) showing the result of the choice, and provide 2 distinct new options for the user labeled 'A' and 'B'.
                Format:
                [Story Text]
                Option A: [Action]
                Option B: [Action]
            `,
        });
        return response.text || "The story continues... try making a choice.";
    } catch (e) {
        return "You made a choice, but the story engine is resting. Try again later.";
    }
}

export const analyzePriceTag = async (itemDescription: string, price: number, trustLevel: string): Promise<{
    installment6mo: number;
    installment12mo: number;
    analysis: string;
    salesPitch: string;
}> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `
                Item: ${itemDescription}
                Price: ${price}
                User Trust Level: ${trustLevel} (Silver/Gold/VIP)

                Task:
                1. Calculate estimated monthly installment for 6 months and 12 months (add reasonable interest).
                2. Generate a short analysis of the product value.
                3. Generate a "salesPitch" strictly following this format: 
                   "We found a price of ₱[Price]. Based on your ${trustLevel} Tier, you can take this home today for only ₱[Installment12mo]/month. Show this screen to a Home Credit agent nearby!"

                Return JSON ONLY:
                {
                    "installment6mo": number,
                    "installment12mo": number,
                    "analysis": "string",
                    "salesPitch": "string"
                }
            `,
            config: { responseMimeType: "application/json" }
        });
        const text = response.text || "{}";
        return JSON.parse(text);
    } catch (e) {
        return {
            installment6mo: Math.round(price / 6 * 1.05),
            installment12mo: Math.round(price / 12 * 1.05),
            analysis: "Looks like a great item!",
            salesPitch: `We found a price of ₱${price}. Based on your ${trustLevel} Tier, you can take this home today for only ₱${Math.round(price/12*1.05)}/month. Show this screen to a Home Credit agent nearby!`
        };
    }
}

export const scanDeviceCondition = async (deviceType: string): Promise<{condition: string, message: string}> => {
    // Simulated Vision API call
    return {
        condition: "Good",
        message: "AI Scan Complete: Minor scratches detected on bezel. Screen is intact."
    };
}

export const getUpgradePrediction = async (userLevel: string, deviceModel: string): Promise<{
    shouldUpgrade: boolean;
    urgency: 'High' | 'Medium' | 'Low';
    reason: string;
    projectedDrop: string;
}> => {
    try {
        // In a real scenario, this would analyze usage logs, payment history, and market trends.
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `
                Act as a predictive analytics engine for a tech lender.
                User Level: ${userLevel}
                Device: ${deviceModel}
                
                Predict if the user should upgrade now based on market depreciation trends.
                Return JSON ONLY:
                {
                    "shouldUpgrade": boolean,
                    "urgency": "High" | "Medium" | "Low",
                    "reason": "Short persuasive reason (max 10 words)",
                    "projectedDrop": "Percentage value drop next month (e.g. 5%)"
                }
            `,
            config: { responseMimeType: "application/json" }
        });
        const text = response.text || "{}";
        return JSON.parse(text);
    } catch (e) {
        return {
            shouldUpgrade: true,
            urgency: 'Medium',
            reason: "Model value is stabilizing.",
            projectedDrop: "3%"
        };
    }
}