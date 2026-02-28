// Simulated TRAI-style telecom performance dataset
// Inspired by data.gov.in telecom subscriber data

export interface TelecomRow {
  id: string;
  state: string;
  circle: string;
  year: number;
  quarter: string;
  operator: string;
  technology: string;
  subscribers: number;
  broadbandSubscribers: number;
  wirelessSubscribers: number;
  marketShare: number;
  avgRevenuePerUser: number;
  dataUsageGB: number;
  callDropRate: number;
  networkQualityScore: number;
  category: string;
  status: string;
}

export interface DigitalRow {
  id: string;
  state: string;
  district: string;
  year: number;
  quarter: string;
  scheme: string;
  category: string;
  beneficiaries: number;
  budgetAllocated: number;
  budgetUtilized: number;
  completionPercentage: number;
  digitalLiteracyScore: number;
  internetPenetration: number;
  commonServiceCentres: number;
  status: string;
}

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Chandigarh", "Jammu & Kashmir", "Ladakh", "Puducherry",
];

const CIRCLES = [
  "Metro", "A", "B", "C",
];

const OPERATORS = [
  "Jio", "Airtel", "Vi (Vodafone Idea)", "BSNL", "MTNL", "Tata Docomo",
];

const TECHNOLOGIES = ["2G", "3G", "4G", "5G"];

const CATEGORIES = [
  "Wireless", "Broadband", "Fixed-line", "Internet", "DTH",
];

const SCHEMES = [
  "BharatNet", "PM-WANI", "Digital Saksharta Abhiyan", "e-Governance",
  "Aadhaar Services", "DigiLocker", "UMANG", "CSC Network", "PMGDISHA",
];

const DIGITAL_CATEGORIES = [
  "Infrastructure", "Capacity Building", "Service Delivery", "Rural Connectivity",
  "Urban Digital", "Cybersecurity", "AI & ML", "Startup Ecosystem",
];

const STATUSES = ["Active", "Completed", "Under Review", "Pending"];

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateTelecomData(count: number = 100000): TelecomRow[] {
  const rows: TelecomRow[] = [];
  const years = [2019, 2020, 2021, 2022, 2023, 2024];
  const quarters = ["Q1", "Q2", "Q3", "Q4"];

  for (let i = 0; i < count; i++) {
    const seed = i * 137.508;
    const r = (offset: number) => seededRandom(seed + offset);

    const state = STATES[Math.floor(r(1) * STATES.length)];
    const year = years[Math.floor(r(2) * years.length)];
    const quarter = quarters[Math.floor(r(3) * quarters.length)];
    const operator = OPERATORS[Math.floor(r(4) * OPERATORS.length)];
    const technology = TECHNOLOGIES[Math.floor(r(5) * TECHNOLOGIES.length)];
    const category = CATEGORIES[Math.floor(r(6) * CATEGORIES.length)];

    const baseSubscribers = Math.floor(r(7) * 50000000) + 100000;
    const marketShare = parseFloat((r(8) * 45 + 2).toFixed(2));

    rows.push({
      id: `TEL-${String(i + 1).padStart(6, "0")}`,
      state,
      circle: CIRCLES[Math.floor(r(9) * CIRCLES.length)],
      year,
      quarter,
      operator,
      technology,
      subscribers: baseSubscribers,
      broadbandSubscribers: Math.floor(baseSubscribers * r(10) * 0.8),
      wirelessSubscribers: Math.floor(baseSubscribers * (0.85 + r(11) * 0.15)),
      marketShare,
      avgRevenuePerUser: parseFloat((r(12) * 250 + 50).toFixed(2)),
      dataUsageGB: parseFloat((r(13) * 20 + 0.5).toFixed(2)),
      callDropRate: parseFloat((r(14) * 3).toFixed(3)),
      networkQualityScore: parseFloat((r(15) * 40 + 60).toFixed(1)),
      category,
      status: STATUSES[Math.floor(r(16) * STATUSES.length)],
    });
  }

  return rows;
}

export function generateDigitalData(count: number = 100000): DigitalRow[] {
  const rows: DigitalRow[] = [];
  const years = [2019, 2020, 2021, 2022, 2023, 2024];
  const quarters = ["Q1", "Q2", "Q3", "Q4"];

  for (let i = 0; i < count; i++) {
    const seed = i * 97.316;
    const r = (offset: number) => seededRandom(seed + offset);

    const state = STATES[Math.floor(r(1) * STATES.length)];
    const year = years[Math.floor(r(2) * years.length)];
    const quarter = quarters[Math.floor(r(3) * quarters.length)];
    const scheme = SCHEMES[Math.floor(r(4) * SCHEMES.length)];
    const category = DIGITAL_CATEGORIES[Math.floor(r(5) * DIGITAL_CATEGORIES.length)];

    const budget = Math.floor(r(6) * 100000000) + 1000000;
    const completion = parseFloat((r(7) * 100).toFixed(1));

    rows.push({
      id: `DIG-${String(i + 1).padStart(6, "0")}`,
      state,
      district: `District ${Math.floor(r(8) * 50) + 1}`,
      year,
      quarter,
      scheme,
      category,
      beneficiaries: Math.floor(r(9) * 500000) + 1000,
      budgetAllocated: budget,
      budgetUtilized: Math.floor(budget * (0.5 + r(10) * 0.5)),
      completionPercentage: completion,
      digitalLiteracyScore: parseFloat((r(11) * 80 + 20).toFixed(1)),
      internetPenetration: parseFloat((r(12) * 90 + 10).toFixed(1)),
      commonServiceCentres: Math.floor(r(13) * 500) + 10,
      status: STATUSES[Math.floor(r(14) * STATUSES.length)],
    });
  }

  return rows;
}

// Summary statistics
export function getTelecomSummary(data: TelecomRow[]) {
  const totalSubscribers = data.reduce((sum, r) => sum + r.subscribers, 0);
  const avgARPU = data.reduce((sum, r) => sum + r.avgRevenuePerUser, 0) / data.length;
  const avgDropRate = data.reduce((sum, r) => sum + r.callDropRate, 0) / data.length;
  const avgQuality = data.reduce((sum, r) => sum + r.networkQualityScore, 0) / data.length;

  const byState = data.reduce((acc, r) => {
    acc[r.state] = (acc[r.state] || 0) + r.subscribers;
    return acc;
  }, {} as Record<string, number>);

  const topState = Object.entries(byState).sort((a, b) => b[1] - a[1])[0];

  return {
    totalSubscribers,
    avgARPU: avgARPU.toFixed(2),
    avgDropRate: avgDropRate.toFixed(3),
    avgQuality: avgQuality.toFixed(1),
    topState: topState?.[0] ?? "N/A",
    rowCount: data.length,
  };
}

export function getDigitalSummary(data: DigitalRow[]) {
  const totalBeneficiaries = data.reduce((sum, r) => sum + r.beneficiaries, 0);
  const avgCompletion = data.reduce((sum, r) => sum + r.completionPercentage, 0) / data.length;
  const totalBudget = data.reduce((sum, r) => sum + r.budgetAllocated, 0);
  const totalUtilized = data.reduce((sum, r) => sum + r.budgetUtilized, 0);

  return {
    totalBeneficiaries,
    avgCompletion: avgCompletion.toFixed(1),
    totalBudget,
    budgetUtilizationRate: ((totalUtilized / totalBudget) * 100).toFixed(1),
    rowCount: data.length,
  };
}

// Unique values for filters
export const UNIQUE_STATES = STATES;
export const UNIQUE_YEARS = [2019, 2020, 2021, 2022, 2023, 2024];
export const UNIQUE_CATEGORIES = CATEGORIES;
export const UNIQUE_DIGITAL_CATEGORIES = DIGITAL_CATEGORIES;
