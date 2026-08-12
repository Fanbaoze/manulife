export type Gender = 'male' | 'female';

export type PayYearsOption = 1 | 3 | 5 | 10 | 15 | 20;

export type PayoutFrequency = 'yearly' | 'monthly';

export type DividendTier = 'guaranteed' | 'medium' | 'high';

export interface AnnuityInput {
  productName: string;
  issueAge: number; // 被保人年龄 (如30)
  gender: Gender;
  annualPremium: number; // 年交保费 (元)
  payYears: PayYearsOption; // 缴费年限 (1/3/5/10/15/20)
  payoutStartAge: number; // 领取起始年龄 (如55, 60, 65)
  payoutFrequency: PayoutFrequency; // 年领100%或月领8.5%
  guaranteedRate: number; // 保证主险复利或定额系数 (如2.0%)
  dividendTier: DividendTier; // 分红档次
  enableUniversalAccount: boolean; // 是否附加万能账户二次增值
  universalAccountRate: number; // 万能账户预估结算利率 (如3.5%)
  firstYearBonusPercent: number; // 首年/满期特定生存金奖励比例
}

export interface YearlyBreakdownRow {
  policyYear: number; // 保单年度 (1, 2, 3...)
  age: number; // 对应年龄 (31, 32...)
  annualPremium: number; // 当期保费
  cumulativePremium: number; // 累计已交保费
  annuityPayout: number; // 当年生存/年金领取
  cumulativePayout: number; // 累计领取的年金
  cashValue: number; // 主险保单现金价值
  universalValue: number; // 万能账户滚存价值
  totalWealthValue: number; // 现金价值 + 万能账户价值
  deathBenefit: number; // 身故/全残保障价值
  annualRoiPercent: number; // 当年综合回报率
  irrPercent: number; // 累计IRR复利收益率 (%)
}

export interface AnnuityCalculationSummary {
  totalPremiumPaid: number; // 总投入保费
  paybackPolicyYear: number; // 回本保单年度
  paybackAge: number; // 回本年龄
  totalPayoutAtAge80: number; // 80岁时累计领取总金额
  cashValueAtAge80: number; // 80岁时保单退保现金价值
  totalBenefitAtAge80: number; // 80岁时累计利益(累计领取+现价)
  irrAtAge60: number; // 60岁IRR
  irrAtAge70: number; // 70岁IRR
  irrAtAge80: number; // 80岁IRR
  irrAtAge90: number; // 90岁IRR
  rows: YearlyBreakdownRow[];
}

export interface ReverseTargetInput {
  currentAge: number;
  targetStartAge: number;
  targetAnnualPayout: number;
  payYears: PayYearsOption;
  adjustmentType: 'flat' | 'front_loaded' | 'back_loaded' | 'universal_topup';
  userNotes?: string;
}

export interface PayYearsOptionComparison {
  years: number;
  annualPremium: number;
  totalPremium: number;
  commentary?: string;
}

export interface ReverseTargetResult {
  recommendedAnnualPremium: number;
  payYearsOptions: PayYearsOptionComparison[];
  actuarialAdvice: string;
  adjustmentStrategy: string;
  suggestedRows?: YearlyBreakdownRow[];
}

export interface ClientKocProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  occupation: string;
  familyStatus: string;
  annualIncome: string;
  riskPreference: '保守型' | '稳健型' | '积极型';
  primaryNeeds: ('品质养老' | '子女教育' | '资产隔离' | '高质医疗' | '财富传承' | '灵活现金流')[];
  kocRating: 'S级(意见领袖)' | 'A级(高潜传播者)' | 'B级(满意老客户)' | 'C级(潜在转介绍)';
  concerns: string;
  influenceScore: number; // 1-100
  notes: string;
  avatarBg: string;
}

export interface ObjectionItem {
  question: string;
  answer: string;
}

export interface RecommendedProductAction {
  productType: string;
  actionPlan: string;
  financialImpact: string;
}

export interface LifetimeMilestonePlan {
  ageNode: number;
  stageName: string;
  timeHorizonYears: number;
  predictedLifeScenario: string;
  riskAndNeedAnalysis: string;
  recommendedProductsAndArrangements: RecommendedProductAction[];
}

export interface KocAnalysisResult {
  corePainPoints: string[];
  annuityFitAnalysis: string;
  lifetimeMilestones?: LifetimeMilestonePlan[];
  personalizedPitchScript: {
    opening: string;
    valueProposition: string;
    objectionHandling: ObjectionItem[];
  };
  kocStrategy: {
    kocInfluenceRating: string;
    marketingChannelAdvice: string;
    referralIncentiveScript: string;
    circlePushCopy: string;
  };
  multiDimensionalNeedsBreakdown: {
    medical: string;
    education: string;
    pension: string;
    legacy: string;
  };
}
