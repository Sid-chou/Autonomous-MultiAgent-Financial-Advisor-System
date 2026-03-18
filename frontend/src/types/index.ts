export interface SentimentReport {
  sentiment_score: number | null;
  confidence: number | null;
  label: string | null;
  status: "OK" | "NULL";
  error?: string | null;
}

export interface TechnicalReport {
  rsi: number | null;
  macd_signal: string | null;
  regime_flag: number | null;
  regime_label: string | null;
  atr_zscore: number | null;
  technical_score: number | null;
  status: "OK" | "NULL";
  error?: string | null;
}

export interface FundamentalReport {
  valuation_signal: string | null;
  pe_ratio: number | null;
  revenue_growth: number | null;
  profit_margins: number | null;
  fundamental_score: number | null;
  confidence: number | null;
  reasoning?: string | null;
  status: "OK" | "NULL";
  error?: string | null;
}

export interface PortfolioReport {
  decision: "BUY" | "SELL" | "HOLD" | null;
  decision_score: number | null;
  confidence: number | null;
  regime_label: string | null;
  weights: {
    w1_sentiment: number;
    w2_technical: number;
    w3_fundamental: number;
  } | null;
  contributions: {
    sentiment_contribution: number;
    technical_contribution: number;
    fundamental_contribution: number;
  } | null;
  reasoning: string | null;
  agent_statuses: Record<string, string> | null;
  status: "OK" | "PARTIAL" | "NULL";
  error?: string | null;
}

export interface RiskReport {
  approved: boolean;
  proposed_trade_size: number | null;
  adjusted_size: number | null;
  adjusted_amount: number | null;
  block_reason: string | null;
  warnings: string[];
  rules_checked: string[];
  regime_flag: number | null;
  risk_level: string | null;
  status: "OK" | "NULL";
  error?: string | null;
}

export interface LiaisonReport {
  headline: string | null;
  explanation: string | null;
  action: string | null;
  risk_note: string | null;
  data_quality_note: string | null;
  warnings: string[];
  status: "OK" | "NULL";
  error?: string | null;
}

export interface AnalysisResponse {
  ticker: string;
  sentimentReport: SentimentReport;
  technicalReport: TechnicalReport;
  fundamentalReport: FundamentalReport;
  portfolioReport: PortfolioReport;
  riskReport: RiskReport;
  liaisonReport: LiaisonReport;
  pipelineStatus: "OK" | "PARTIAL" | "FAILED";
  timestamp: string;
}

export interface UserProfile {
  totalBudget: number;
  cashAvailable: number;
  maxTradeSize: number;
  dailyLossLimit: number;
  maxExposurePerStock: number;
  riskLevel: "low" | "moderate" | "high";
  currentDailyLoss: number;
  currentExposure: Record<string, number>;
}

export type ViewState = "landing" | "loading" | "dashboard";
