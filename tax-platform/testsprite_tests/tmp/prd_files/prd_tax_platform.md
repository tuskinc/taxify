# Tax Analysis Platform - Product Requirements Document

## Overview
Build a comprehensive web application that analyzes both business and personal/family financials and provides AI-powered tax optimization advice for different countries. Support both business tax planning and individual/family tax strategies.

## Core Features

### 1. User Profile & Tax Type Selection
- User registration with Supabase Auth
- Profile setup: country, filing status (individual/married/family/business owner)
- Tax scenario selection: Personal Only, Business Only, or Combined (personal + business)
- Family size and dependent information collection

### 2. Country Selection & Tax Data Collection
- User selects their tax residence country from dropdown
- System automatically searches for current tax laws using Bing Search API
- Display personal income tax brackets, business tax rates, available deductions, and recent changes
- Store comprehensive tax data covering both personal and business scenarios

### 3. Personal/Family Financial Data Input
- **Personal Income**: Salary, freelance income, investment returns, rental income
- **Family Details**: Number of dependents, spouse income, childcare costs
- **Personal Expenses**: Mortgage/rent, medical expenses, charitable donations, education costs
- **Investment Data**: Capital gains/losses, dividend income, retirement contributions
- **Deductions**: Standard vs itemized deduction calculator

### 4. Business Financial Data Input (if applicable)
- Form with fields: revenue, employee costs, equipment, rent, utilities, marketing, other expenses
- Business structure selection (LLC, Corporation, Partnership, Sole Proprietorship)
- Business expense categorization for optimal deduction tracking

### 5. Combined Analysis Engine
- Send personal + business financial data + tax laws to Claude 3.5 Sonnet API
- Request structured JSON response with comprehensive tax optimization strategies
- Analyze tax-efficient strategies that combine personal and business planning
- Calculate optimal salary vs dividend distributions for business owners

### 6. Enhanced Report Generation
- Visual dashboard showing total tax liability, effective tax rates
- Separate sections for personal and business tax optimization
- Family tax planning recommendations (child tax credits, education benefits)
- Retirement planning integration with tax implications
- Monthly/quarterly tax planning calendar
- Tax document checklist and preparation timeline

## Technical Stack

### Frontend
- **Framework**: React 18 with TypeScript (most efficient for AI tooling)
- **Styling**: Tailwind CSS (fastest development, built-in optimization)
- **State**: useState and useContext only (no Redux - unnecessary complexity for MVP)
- **Forms**: React Hook Form (best performance)
- **Icons**: Lucide React (lightweight)
- **Build**: Vite (fastest build tool)

### Backend
- **Runtime**: Vercel Serverless Functions (most cost-effective)
- **Language**: TypeScript
- **Validation**: Zod for request/response validation
- **No separate server needed**: Functions deployed with frontend

### Database
- **Primary**: Supabase PostgreSQL
- **Features Used**: Database, Authentication, Real-time subscriptions, Row Level Security
- **Tables Schema**:
  ```sql
  -- Enable RLS and create tables
  users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE,
    country text NOT NULL,
    filing_status text NOT NULL, -- 'single', 'married_joint', 'married_separate', 'head_of_household'
    tax_scenarios text[] DEFAULT '{}', -- ['personal', 'business'] 
    created_at timestamp DEFAULT now()
  );
  
  user_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    birth_date date,
    dependents integer DEFAULT 0,
    spouse_income decimal(15,2) DEFAULT 0,
    filing_status text NOT NULL,
    updated_at timestamp DEFAULT now()
  );
  
  personal_finances (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    salary_income decimal(15,2) DEFAULT 0,
    freelance_income decimal(15,2) DEFAULT 0,
    investment_income decimal(15,2) DEFAULT 0,
    rental_income decimal(15,2) DEFAULT 0,
    capital_gains decimal(15,2) DEFAULT 0,
    retirement_contributions decimal(15,2) DEFAULT 0,
    mortgage_interest decimal(15,2) DEFAULT 0,
    property_taxes decimal(15,2) DEFAULT 0,
    charitable_donations decimal(15,2) DEFAULT 0,
    medical_expenses decimal(15,2) DEFAULT 0,
    childcare_costs decimal(15,2) DEFAULT 0,
    education_expenses decimal(15,2) DEFAULT 0,
    other_deductions decimal(15,2) DEFAULT 0,
    created_at timestamp DEFAULT now()
  );
  
  businesses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    name text NOT NULL,
    business_type text NOT NULL, -- 'llc', 'corporation', 'partnership', 'sole_proprietorship'
    country text NOT NULL,
    created_at timestamp DEFAULT now()
  );
  
  business_finances (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
    revenue decimal(15,2) NOT NULL,
    employee_costs decimal(15,2) DEFAULT 0,
    equipment decimal(15,2) DEFAULT 0,
    rent decimal(15,2) DEFAULT 0,
    utilities decimal(15,2) DEFAULT 0,
    marketing decimal(15,2) DEFAULT 0,
    travel_expenses decimal(15,2) DEFAULT 0,
    office_supplies decimal(15,2) DEFAULT 0,
    professional_services decimal(15,2) DEFAULT 0,
    insurance decimal(15,2) DEFAULT 0,
    other_expenses decimal(15,2) DEFAULT 0,
    created_at timestamp DEFAULT now()
  );
  
  tax_data (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    country text UNIQUE NOT NULL,
    personal_tax_brackets jsonb NOT NULL, -- income brackets and rates
    corporate_tax_rate decimal(5,2) NOT NULL,
    standard_deduction decimal(15,2) DEFAULT 0,
    personal_deductions jsonb DEFAULT '[]'::jsonb,
    business_deductions jsonb DEFAULT '[]'::jsonb,
    tax_credits jsonb DEFAULT '[]'::jsonb, -- child tax credit, education credits, etc.
    retirement_limits jsonb DEFAULT '{}'::jsonb, -- 401k, IRA limits
    updated_at timestamp DEFAULT now()
  );
  
  comprehensive_analyses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    analysis_type text NOT NULL, -- 'personal', 'business', 'combined'
    personal_summary jsonb,
    business_summary jsonb,
    combined_strategy jsonb,
    tax_optimization_plan jsonb NOT NULL,
    recommendations jsonb NOT NULL,
    tax_calendar jsonb DEFAULT '[]'::jsonb,
    document_checklist jsonb DEFAULT '[]'::jsonb,
    estimated_savings decimal(15,2) DEFAULT 0,
    created_at timestamp DEFAULT now()
  );
  ```

### External APIs
- **AI**: Anthropic Claude 3.5 Sonnet API (most effective for tax reasoning)
- **Search**: Bing Search API v7 (cheapest option at $3/1000 queries)
- **Database**: Supabase Client SDK (includes auth, database, storage)
- **No additional APIs needed for MVP**

### Deployment
- **Frontend + Backend**: Vercel (free tier, serverless functions included)
- **Database**: Supabase (free tier: 2 projects, 500MB storage, 50K monthly active users)
- **Total cost for MVP**: $0/month until scale

## File Structure
```
tax-platform/
├── src/
│   ├── components/
│   │   ├── AuthWrapper.tsx
│   │   ├── UserProfileSetup.tsx
│   │   ├── TaxScenarioSelector.tsx
│   │   ├── PersonalFinanceForm.tsx
│   │   ├── FamilyDetailsForm.tsx
│   │   ├── BusinessFinanceForm.tsx
│   │   ├── TaxBracketDisplay.tsx
│   │   ├── ComprehensiveAnalysisReport.tsx
│   │   ├── TaxCalendarPlanner.tsx
│   │   ├── RetirementTaxPlanner.tsx
│   │   └── Dashboard.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── taxCalculations.ts
│   │   └── database.ts
│   ├── api/
│   │   ├── tax-search-comprehensive.ts (Vercel function)
│   │   ├── generate-personal-analysis.ts (Vercel function)
│   │   ├── generate-combined-analysis.ts (Vercel function)
│   │   └── save-financial-data.ts (Vercel function)
│   ├── hooks/
│   │   ├── useSupabase.ts
│   │   ├── useAuth.ts
│   │   ├── usePersonalTaxes.ts
│   │   ├── useBusinessTaxes.ts
│   │   └── useCombinedAnalysis.ts
│   ├── types/
│   │   └── database.ts (Supabase generated types)
│   ├── utils/
│   │   ├── taxBracketCalculator.ts
│   │   ├── deductionOptimizer.ts
│   │   └── helpers.ts
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── config.toml
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_personal_tax_features.sql
├── package.json
├── vite.config.ts
└── README.md
```

## API Endpoints

### Vercel Serverless Functions
```typescript
// /api/tax-search-comprehensive.ts
POST /api/tax-search-comprehensive
Body: { country: string, scenario: 'personal' | 'business' | 'combined' }
Response: { 
  personalTaxBrackets: object[], 
  corporateTaxRate: number, 
  standardDeduction: number,
  personalDeductions: string[], 
  businessDeductions: string[],
  taxCredits: object[],
  retirementLimits: object
}

// /api/save-financial-data.ts  
POST /api/save-financial-data
Body: { 
  scenario: string,
  personalData?: object, 
  businessData?: object,
  profileData?: object 
}
Headers: Authorization: Bearer {supabase_token}
Response: { success: boolean, dataId: string }

// /api/generate-personal-analysis.ts
POST /api/generate-personal-analysis
Body: { 
  personalFinances: object, 
  taxData: object, 
  filingStatus: string,
  dependents: number 
}
Headers: Authorization: Bearer {supabase_token}
Response: { 
  personalTaxLiability: number,
  effectiveTaxRate: number,
  recommendations: object[],
  taxCreditsAvailable: object[],
  retirementOptimization: object
}

// /api/generate-combined-analysis.ts
POST /api/generate-combined-analysis
Body: { 
  personalData: object, 
  businessData: object, 
  taxData: object,
  userProfile: object
}
Headers: Authorization: Bearer {supabase_token}
Response: { 
  combinedStrategy: object,
  salaryVsDividendOptimization: object,
  totalTaxSavings: number,
  taxCalendar: object[],
  documentChecklist: string[]
}
```

## Environment Variables
```
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI & Search APIs  
CLAUDE_API_KEY=sk-...
BING_SEARCH_KEY=...
```

## Database Models

### Supabase TypeScript Interfaces
```typescript
// Generated by Supabase CLI: supabase gen types typescript
interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          country: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email?: string | null;
          country: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          country?: string;
          created_at?: string;
        };
      };
      businesses: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          country: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          country: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          country?: string;
          created_at?: string;
        };
      };
      financial_data: {
        Row: {
          id: string;
          business_id: string;
          revenue: number;
          employee_costs: number;
          equipment: number;
          rent: number;
          utilities: number;
          marketing: number;
          other_expenses: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          revenue: number;
          employee_costs?: number;
          equipment?: number;
          rent?: number;
          utilities?: number;
          marketing?: number;
          other_expenses?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          revenue?: number;
          employee_costs?: number;
          equipment?: number;
          rent?: number;
          utilities?: number;
          marketing?: number;
          other_expenses?: number;
          created_at?: string;
        };
      };
      tax_data: {
        Row: {
          id: string;
          country: string;
          corporate_tax_rate: number;
          deductions: string[];
          incentives: string[];
          recent_changes: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          country: string;
          corporate_tax_rate: number;
          deductions?: string[];
          incentives?: string[];
          recent_changes?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          country?: string;
          corporate_tax_rate?: number;
          deductions?: string[];
          incentives?: string[];
          recent_changes?: string | null;
          updated_at?: string;
        };
      };
      analyses: {
        Row: {
          id: string;
          business_id: string;
          financial_summary: {
            revenue: number;
            totalExpenses: number;
            grossProfit: number;
            estimatedTax: number;
            netProfit: number;
          };
          tax_strategies: {
            strategy: string;
            description: string;
            potentialSavings: string;
          }[];
          recommendations: string[];
          risk_areas: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          financial_summary: {
            revenue: number;
            totalExpenses: number;
            grossProfit: number;
            estimatedTax: number;
            netProfit: number;
          };
          tax_strategies: {
            strategy: string;
            description: string;
            potentialSavings: string;
          }[];
          recommendations: string[];
          risk_areas?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          financial_summary?: {
            revenue: number;
            totalExpenses: number;
            grossProfit: number;
            estimatedTax: number;
            netProfit: number;
          };
          tax_strategies?: {
            strategy: string;
            description: string;
            potentialSavings: string;
          }[];
          recommendations?: string[];
          risk_areas?: string[];
          created_at?: string;
        };
      };
    };
  };
}
```

## Additional Features for Personal/Family Taxes

### 1. Tax Bracket Calculator
- Real-time tax calculation as user inputs income
- Visual representation of marginal vs effective tax rates
- State and federal tax integration (for US users)
- Comparison of filing status options (single, married filing jointly, etc.)

### 2. Deduction Optimizer
- Automatic comparison of standard vs itemized deductions
- Medical expense tracker with AGI threshold calculator
- Charitable donation optimizer with timing recommendations
- Home office deduction calculator for remote workers

### 3. Family Tax Planning Tools
- Child tax credit and dependent care credit calculator
- Education credit optimizer (American Opportunity vs Lifetime Learning)
- 529 plan contribution analyzer
- Dependent care FSA vs tax credit comparison

### 4. Retirement Tax Planning
- Traditional vs Roth IRA contribution analyzer
- 401(k) contribution optimizer considering employer match
- Required Minimum Distribution calculator
- Tax-loss harvesting recommendations

### 5. Life Event Tax Impact
- Marriage tax penalty/benefit calculator
- New baby tax benefit analyzer
- Home purchase tax implications
- Job change / state move tax calculator

### 6. Quarterly Estimated Tax Calculator
- Self-employment tax calculator
- Estimated tax payment scheduler
- Safe harbor rule compliance checker
- Penalty avoidance calculator

### 7. Document Management System
- Tax document upload and categorization
- Receipt scanning and expense categorization
- Tax document checklist with deadlines
- Prior year comparison reports

## Supabase Setup Instructions

### 1. Database Configuration
```sql
-- Run in Supabase SQL Editor
-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprehensive_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for enhanced security
CREATE POLICY "Users can manage own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own profile" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own personal finances" ON personal_finances
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own businesses" ON businesses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own business finances" ON business_finances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = business_finances.business_id 
      AND businesses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own analyses" ON comprehensive_analyses
  FOR ALL USING (auth.uid() = user_id);

-- Tax data remains public (read-only)
CREATE POLICY "Anyone can view tax data" ON tax_data
  FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX idx_personal_finances_user_id ON personal_finances(user_id);
CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE INDEX idx_comprehensive_analyses_user_id ON comprehensive_analyses(user_id);
CREATE INDEX idx_tax_data_country ON tax_data(country);
```

### 2. Enhanced Supabase Client Setup
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for tax calculations
export const taxHelpers = {
  calculateTaxBrackets: (income: number, brackets: any[]) => {
    // Implementation for progressive tax calculation
  },
  optimizeDeductions: (expenses: any, standardDeduction: number) => {
    // Compare itemized vs standard deduction
  },
  calculateEffectiveRate: (taxOwed: number, income: number) => {
    return (taxOwed / income) * 100;
  }
};
```

## AI Integration Specifications

### Claude API Configuration
```typescript
const CLAUDE_CONFIG = {
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 3000, // Increased for comprehensive analysis
  temperature: 0.1 // Low temperature for consistent financial advice
};
```

### Enhanced Prompt Templates
```typescript
// Personal Tax Analysis
const PERSONAL_TAX_ANALYSIS_PROMPT = `
Analyze this personal/family tax situation for ${country}:

Personal Details:
- Filing Status: ${filingStatus}
- Dependents: ${dependents}
- Total Income: ${totalIncome}
- Deductions: ${totalDeductions}

Tax Brackets: ${JSON.stringify(taxBrackets)}
Available Credits: ${JSON.stringify(taxCredits)}

Respond with valid JSON only:
{
  "taxLiability": number,
  "effectiveRate": number,
  "marginalRate": number,
  "optimizationStrategies": [
    {
      "category": "retirement/education/healthcare",
      "strategy": "name",
      "description": "details",
      "potentialSavings": "amount",
      "actionSteps": ["step1", "step2"]
    }
  ],
  "creditOptimization": [...],
  "retirementPlanning": {...},
  "nextYearProjections": {...}
}
`;

// Combined Personal + Business Analysis
const COMBINED_ANALYSIS_PROMPT = `
Analyze this combined personal and business tax situation for optimal tax efficiency:

Personal: ${JSON.stringify(personalData)}
Business: ${JSON.stringify(businessData)}
Tax Environment: ${JSON.stringify(taxData)}

Focus on:
1. Optimal salary vs dividend distribution
2. Business expense optimization that benefits personal taxes
3. Retirement planning through business entities
4. Family tax planning opportunities

Respond with valid JSON only:
{
  "combinedStrategy": {
    "optimalSalary": number,
    "dividendDistribution": number,
    "totalTaxSavings": number
  },
  "businessPersonalSynergies": [...],
  "familyTaxPlanning": [...],
  "quarterlyTaxCalendar": [...],
  "documentationNeeds": [...]
}
`;
```

## Implementation Steps

## Implementation Phases - Clear Steps for Cursor AI

### Phase 1: Foundation (Week 1)
**Cursor AI Instructions**: Create React + TypeScript project with these exact files:
1. `npm create vite@latest tax-platform -- --template react-ts`
2. Install dependencies: `npm install @supabase/supabase-js @hookform/resolvers zod react-hook-form lucide-react`
3. Setup Tailwind CSS following official Vite guide
4. Create Supabase project and copy connection details to `.env.local`
5. Build basic folder structure as specified in File Structure section

### Phase 2: Database & Auth (Week 2)  
**Cursor AI Instructions**: 
1. Copy the exact SQL schema from Database section and run in Supabase SQL Editor
2. Generate TypeScript types: `npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts`
3. Create `src/lib/supabase.ts` with the exact code from Supabase Client Setup section
4. Build `AuthWrapper.tsx` component using Supabase Auth UI
5. Test authentication flow works before proceeding

### Phase 3: Core Features (Week 3-4)
**Cursor AI Instructions**:
1. Build `TaxScenarioSelector.tsx` - dropdown for Personal/Business/Combined
2. Create forms using React Hook Form + Zod validation:
   - `PersonalFinanceForm.tsx` - all personal income/deduction fields from database schema  
   - `BusinessFinanceForm.tsx` - business revenue/expense fields from schema
3. Create Vercel API functions in `src/api/` folder using the exact endpoints from API Endpoints section
4. Test each form saves data to Supabase correctly before proceeding

### Phase 4: AI Integration (Week 5)
**Cursor AI Instructions**:
1. Copy the exact Claude API prompts from AI Integration section
2. Create API functions that call Claude API using the exact configuration specified
3. Build `ComprehensiveAnalysisReport.tsx` component that displays AI responses
4. Test AI analysis with sample data to ensure JSON responses parse correctly
5. Add error handling for AI API failures

### Phase 5: Polish & Deploy (Week 6)
**Cursor AI Instructions**:
1. Add charts using Recharts library for financial visualizations
2. Implement print functionality using `window.print()`
3. Deploy to Vercel using `vercel --prod` command
4. Test production deployment with real Supabase connection
5. Verify all API endpoints work in production environment

## Success Metrics
- User can complete personal tax analysis in under 7 minutes
- User can complete combined personal + business analysis in under 12 minutes
- AI provides relevant tax strategies for their specific situation and country
- System accurately calculates tax liabilities within 2% of professional software
- Reports provide actionable recommendations with clear next steps
- System handles 500+ concurrent users across multiple tax scenarios
- User retention rate of 70%+ for tax season planning

## Risk Mitigation
- Add legal disclaimers throughout the app
- Implement error handling for AI API failures
- Cache tax data to reduce API costs
- Log all analyses for audit purposes

## Cost Analysis (Cheapest Options Chosen)

### Free Tier Limits (MVP costs $0/month):
- **Vercel**: Unlimited personal projects, 100GB bandwidth
- **Supabase**: 2 projects, 500MB database, 50K monthly active users, 1GB file storage
- **Claude API**: Pay per use (~$0.003 per 1K input tokens, ~$0.015 per 1K output tokens)
- **Bing Search**: $3 per 1,000 queries (cache results to minimize calls)

### Estimated Monthly Costs by Scale:
- **MVP (100 users, 500 analyses/month)**: ~$15-25/month (mostly AI API)
- **Growth (1K users, 5K analyses/month)**: ~$150-250/month  
- **Scale (10K users, 50K analyses/month)**: ~$1,500-2,500/month
- **Enterprise (100K+ users)**: Need paid Supabase ($25/month base) + higher AI costs

## Security Requirements
- Validate all user inputs with Zod schemas
- Sanitize financial data before AI processing
- Use HTTPS for all communications
- Implement comprehensive rate limiting by user and IP
- Encrypt sensitive financial data at rest
- Audit trail for all tax calculations and recommendations
- GDPR compliance for international users
- Secure document upload and storage in Supabase Storage
- Two-factor authentication option for high-value accounts