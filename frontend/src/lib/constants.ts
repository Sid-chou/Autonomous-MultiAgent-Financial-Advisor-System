import { UserProfile } from "@/types";

export const SUPPORTED_TICKERS = [
  { symbol: "INFY.NS",       name: "Infosys" },
  { symbol: "TCS.NS",        name: "Tata Consultancy Services" },
  { symbol: "RELIANCE.NS",   name: "Reliance Industries" },
  { symbol: "HDFCBANK.NS",   name: "HDFC Bank" },
  { symbol: "WIPRO.NS",      name: "Wipro" },
  { symbol: "ICICIBANK.NS",  name: "ICICI Bank" },
  { symbol: "SBIN.NS",       name: "State Bank of India" },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors" },
  { symbol: "HCLTECH.NS",    name: "HCL Technologies" },
  { symbol: "TECHM.NS",      name: "Tech Mahindra" },
  { symbol: "BAJFINANCE.NS", name: "Bajaj Finance" },
  { symbol: "KOTAKBANK.NS",  name: "Kotak Mahindra Bank" },
  { symbol: "AXISBANK.NS",   name: "Axis Bank" },
  { symbol: "SUNPHARMA.NS",  name: "Sun Pharmaceutical" },
  { symbol: "MARUTI.NS",     name: "Maruti Suzuki" },
];

export const DEFAULT_PROFILE: UserProfile = {
  totalBudget: 100000,
  cashAvailable: 100000,
  maxTradeSize: 0.10,
  dailyLossLimit: 0.05,
  maxExposurePerStock: 0.15,
  riskLevel: "moderate",
  currentDailyLoss: 0.0,
  currentExposure: {},
};

export const PROFILE_STORAGE_KEY = "finAdvisorProfile";

export const LOADING_STEPS = [
  "Fetching live news headlines...",
  "Computing technical signals...",
  "Reading financial reports...",
  "Checking your risk profile...",
  "Generating recommendation...",
];

export const DECISION_COLORS: Record<string, string> = {
  BUY:     "#4caf78",
  SELL:    "#e05c5c",
  HOLD:    "#e0b84c",
  BLOCKED: "#5a5a6a",
};

export const TICKER_TO_COMPANY: Record<string, string> = {
  "INFY":       "Infosys",
  "TCS":        "Tata Consultancy Services",
  "RELIANCE":   "Reliance Industries",
  "HDFCBANK":   "HDFC Bank",
  "WIPRO":      "Wipro",
  "ICICIBANK":  "ICICI Bank",
  "SBIN":       "State Bank of India",
  "TATAMOTORS": "Tata Motors",
  "HCLTECH":    "HCL Technologies",
  "TECHM":      "Tech Mahindra",
  "BAJFINANCE": "Bajaj Finance",
  "KOTAKBANK":  "Kotak Mahindra Bank",
  "AXISBANK":   "Axis Bank",
  "SUNPHARMA":  "Sun Pharmaceutical",
  "MARUTI":     "Maruti Suzuki",
};
