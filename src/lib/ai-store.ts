import { create } from 'zustand';

interface ScanResult {
  vendorName: string;
  date: string;
  baseHT: string;
  tvaRate: string;
  tvaAmount: string;
  totalTTC: string;
  category: string;
  confidence: number;
}

interface AIStore {
  lastResult: ScanResult | null;
  setLastResult: (result: ScanResult | null) => void;
}

export const useAIStore = create<AIStore>((set) => ({
  lastResult: null,
  setLastResult: (lastResult) => set({ lastResult }),
}));
