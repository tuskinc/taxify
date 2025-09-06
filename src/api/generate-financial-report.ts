import jsPDF from 'jspdf';
import { supabase } from '../lib/supabase';

interface FinancialReportData {
  user_id: string;
  personal_finances?: any;
  business_finances?: any;
  comprehensive_analysis?: any;
  user_profile?: any;
  user?: any;
}

export async function generateFinancialReport(userId: string): Promise<Uint8Array> {
  try {
    // Fetch all required data
    const reportData = await fetchReportData(userId);
    
    // Generate PDF
    const pdfBuffer = await createPDF(reportData);
    
    return pdfBuffer;
  } catch (error) {
    console.error('Error generating financial report:', error);
    throw new Error('Failed to generate financial report');
  }
}

async function fetchReportData(userId: string): Promise<FinancialReportData> {
  // Fetch user data
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (userError) throw userError;

  // Fetch user profile
  const { data: userProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (profileError) throw profileError;

  // Fetch personal finances
  const { data: personalFinances, error: personalError } = await supabase
    .from('personal_finances')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Fetch business finances (if exists)
  let businessFinances = null;
  if (user.tax_scenarios?.includes('business')) {
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (business && !businessError) {
      const { data: businessFin, error: businessFinError } = await supabase
        .from('business_finances')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!businessFinError) {
        businessFinances = businessFin;
      }
    }
  }

  // Fetch comprehensive analysis
  const { data: comprehensiveAnalysis, error: analysisError } = await supabase
    .from('comprehensive_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return {
    user_id: userId,
    user,
    user_profile: userProfile,
    personal_finances: personalFinances,
    business_finances: businessFinances,
    comprehensive_analysis: comprehensiveAnalysis,
  };
}

async function createPDF(data: FinancialReportData): Promise<Uint8Array> {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Generate PDF content
    generateCoverPage(doc, data);
    doc.addPage();
    generateExecutiveSummary(doc, data);
    doc.addPage();
    generatePersonalAnalysis(doc, data);
    
    if (data.business_finances) {
      doc.addPage();
      generateBusinessAnalysis(doc, data);
    }
    
    doc.addPage();
    generateCombinedStrategy(doc, data);
    doc.addPage();
    generateCalendarAndChecklist(doc, data);
    doc.addPage();
    generateAdvisorNotes(doc);

    // Return PDF as Uint8Array
    return doc.output('arraybuffer') as Uint8Array;
  } catch (error) {
    throw error;
  }
}

function generateCoverPage(doc: jsPDF, data: FinancialReportData) {
  // Title
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Tax Analysis Report', 105, 50, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text('AI-Powered Financial Analysis & Optimization', 105, 70, { align: 'center' });
  
  // User Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('Client Information', 50, 100);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  
  doc.text(`Name: ${data.user?.email || 'N/A'}`, 50, 120);
  doc.text(`Filing Status: ${data.user_profile?.filing_status || 'N/A'}`, 50, 135);
  doc.text(`Country: ${data.user?.country || 'N/A'}`, 50, 150);
  doc.text(`Dependents: ${data.user_profile?.dependents || 0}`, 50, 165);
  
  // Date
  doc.setFontSize(12);
  doc.setTextColor(107, 114, 128);
  doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 105, 200, { align: 'center' });
  
  // Disclaimer
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(156, 163, 175);
  doc.text('This report is AI-assisted and should be reviewed by a qualified tax professional before filing.', 105, 220, { align: 'center' });
}

function generateExecutiveSummary(doc: jsPDF, data: FinancialReportData) {
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Executive Summary', 50, 30);
  
  // Calculate key metrics
  const personalIncome = data.personal_finances ? 
    (data.personal_finances.salary_income || 0) +
    (data.personal_finances.freelance_income || 0) +
    (data.personal_finances.investment_income || 0) +
    (data.personal_finances.rental_income || 0) +
    (data.personal_finances.capital_gains || 0) : 0;
  
  const personalDeductions = data.personal_finances ?
    (data.personal_finances.retirement_contributions || 0) +
    (data.personal_finances.mortgage_interest || 0) +
    (data.personal_finances.property_taxes || 0) +
    (data.personal_finances.charitable_donations || 0) +
    (data.personal_finances.medical_expenses || 0) +
    (data.personal_finances.childcare_costs || 0) +
    (data.personal_finances.education_expenses || 0) +
    (data.personal_finances.other_deductions || 0) : 0;
  
  const businessRevenue = data.business_finances?.revenue || 0;
  const businessExpenses = data.business_finances ? 
    (data.business_finances.employee_costs || 0) +
    (data.business_finances.equipment || 0) +
    (data.business_finances.rent || 0) +
    (data.business_finances.utilities || 0) +
    (data.business_finances.marketing || 0) +
    (data.business_finances.travel_expenses || 0) +
    (data.business_finances.office_supplies || 0) +
    (data.business_finances.professional_services || 0) +
    (data.business_finances.insurance || 0) +
    (data.business_finances.other_expenses || 0) : 0;
  
  const businessNetIncome = businessRevenue - businessExpenses;
  const totalIncome = personalIncome + businessNetIncome;
  
  // Key Metrics
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('Key Financial Metrics', 50, 60);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  
  doc.text(`Total Personal Income: $${personalIncome.toLocaleString()}`, 50, 80);
  doc.text(`Personal Deductions: $${personalDeductions.toLocaleString()}`, 50, 95);
  doc.text(`Business Revenue: $${businessRevenue.toLocaleString()}`, 50, 110);
  doc.text(`Business Net Income: $${businessNetIncome.toLocaleString()}`, 50, 125);
  doc.text(`Combined Income: $${totalIncome.toLocaleString()}`, 50, 140);
  
  // Estimated Tax Impact
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('Estimated Tax Impact', 50, 170);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  
  // Simple tax calculation (this would be enhanced with actual tax brackets)
  const estimatedTax = totalIncome * 0.25; // Simplified 25% rate
  const estimatedSavings = personalDeductions * 0.25;
  
  doc.text(`Estimated Tax Liability: $${estimatedTax.toLocaleString()}`, 50, 190);
  doc.text(`Estimated Tax Savings: $${estimatedSavings.toLocaleString()}`, 50, 205);
  doc.text(`Effective Tax Rate: ${((estimatedTax / totalIncome) * 100).toFixed(1)}%`, 50, 220);
}

function generatePersonalAnalysis(doc: jsPDF, data: FinancialReportData) {
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Personal Financial Analysis', 50, 30);
  
  if (!data.personal_finances) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text('No personal financial data available.', 50, 60);
    return;
  }
  
  // Income Breakdown
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('Income Breakdown', 50, 60);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  
  const pf = data.personal_finances;
  doc.text(`Salary/Wages: $${(pf.salary_income || 0).toLocaleString()}`, 50, 80);
  doc.text(`Freelance Income: $${(pf.freelance_income || 0).toLocaleString()}`, 50, 95);
  doc.text(`Investment Income: $${(pf.investment_income || 0).toLocaleString()}`, 50, 110);
  doc.text(`Rental Income: $${(pf.rental_income || 0).toLocaleString()}`, 50, 125);
  doc.text(`Capital Gains: $${(pf.capital_gains || 0).toLocaleString()}`, 50, 140);
  
  // Deductions Analysis
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('Deductions Analysis', 50, 170);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  
  doc.text(`Retirement Contributions: $${(pf.retirement_contributions || 0).toLocaleString()}`, 50, 190);
  doc.text(`Mortgage Interest: $${(pf.mortgage_interest || 0).toLocaleString()}`, 50, 205);
  doc.text(`Property Taxes: $${(pf.property_taxes || 0).toLocaleString()}`, 50, 220);
  doc.text(`Charitable Donations: $${(pf.charitable_donations || 0).toLocaleString()}`, 50, 235);
  doc.text(`Medical Expenses: $${(pf.medical_expenses || 0).toLocaleString()}`, 50, 250);
  
  // AI Recommendations
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('AI Recommendations', 50, 280);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  
  doc.text('• Maximize retirement contributions to reduce taxable income', 50, 300);
  doc.text('• Consider itemizing deductions if they exceed standard deduction', 50, 315);
  doc.text('• Explore tax-advantaged investment accounts', 50, 330);
  doc.text('• Review eligibility for additional tax credits', 50, 345);
}

function generateBusinessAnalysis(doc: jsPDF, data: FinancialReportData) {
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Business Financial Analysis', 50, 30);
  
  if (!data.business_finances) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text('No business financial data available.', 50, 60);
    return;
  }
  
  const bf = data.business_finances;
  
  // Revenue and Expenses
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('Revenue & Expenses', 50, 60);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  
  doc.text(`Total Revenue: $${(bf.revenue || 0).toLocaleString()}`, 50, 80);
  doc.text(`Employee Costs: $${(bf.employee_costs || 0).toLocaleString()}`, 50, 95);
  doc.text(`Equipment & Supplies: $${(bf.equipment || 0).toLocaleString()}`, 50, 110);
  doc.text(`Rent & Utilities: $${(bf.rent || 0).toLocaleString()}`, 50, 125);
  doc.text(`Marketing: $${(bf.marketing || 0).toLocaleString()}`, 50, 140);
  
  // Net Income
  const totalExpenses = (bf.employee_costs || 0) + (bf.equipment || 0) + (bf.rent || 0) + 
                       (bf.utilities || 0) + (bf.marketing || 0) + (bf.travel_expenses || 0) + 
                       (bf.office_supplies || 0) + (bf.professional_services || 0) + 
                       (bf.insurance || 0) + (bf.other_expenses || 0);
  
  const netIncome = (bf.revenue || 0) - totalExpenses;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text(`Net Business Income: $${netIncome.toLocaleString()}`, 50, 170);
  
  // Business Optimization Tips
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('Business Optimization Tips', 50, 200);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  
  doc.text('• Review all business expenses for deductibility', 50, 220);
  doc.text('• Consider equipment depreciation strategies', 50, 235);
  doc.text('• Explore home office deduction opportunities', 50, 250);
  doc.text('• Review business structure for tax efficiency', 50, 265);
  doc.text('• Plan for quarterly estimated tax payments', 50, 280);
}

function generateCombinedStrategy(doc: jsPDF, data: FinancialReportData) {
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Combined Tax Strategy', 50, 30);
  
  // AI-Generated Optimizations
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('AI-Suggested Optimizations', 50, 60);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  
  doc.text('• Optimize salary vs. dividend distribution', 50, 80);
  doc.text('• Maximize retirement contributions through business', 50, 95);
  doc.text('• Utilize business expenses for personal benefit', 50, 110);
  doc.text('• Consider family business tax planning strategies', 50, 125);
  doc.text('• Explore tax-efficient investment structures', 50, 140);
  
  // Missed Deductions
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('Potential Missed Deductions', 50, 170);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  
  doc.text('• Home office expenses (if applicable)', 50, 190);
  doc.text('• Vehicle expenses for business use', 50, 205);
  doc.text('• Professional development and education', 50, 220);
  doc.text('• Health savings account contributions', 50, 235);
  doc.text('• State and local tax deductions', 50, 250);
}

function generateCalendarAndChecklist(doc: jsPDF, data: FinancialReportData) {
  // Tax Calendar
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Tax Calendar & Deadlines', 50, 30);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('Important Tax Dates', 50, 60);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  
  const currentYear = new Date().getFullYear();
  doc.text(`• January 31, ${currentYear + 1}: W-2 and 1099 forms due`, 50, 80);
  doc.text(`• April 15, ${currentYear + 1}: Individual tax returns due`, 50, 95);
  doc.text(`• June 15, ${currentYear}: Q2 estimated tax payment due`, 50, 110);
  doc.text(`• September 15, ${currentYear}: Q3 estimated tax payment due`, 50, 125);
  doc.text(`• January 15, ${currentYear + 1}: Q4 estimated tax payment due`, 50, 140);
  
  // Document Checklist
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('Document Checklist', 50, 170);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  
  doc.text('□ W-2 forms from all employers', 50, 190);
  doc.text('□ 1099 forms (interest, dividends, etc.)', 50, 205);
  doc.text('□ Receipts for all deductions', 50, 220);
  doc.text('□ Mortgage interest statements', 50, 235);
  doc.text('□ Property tax records', 50, 250);
  doc.text('□ Charitable donation receipts', 50, 265);
  doc.text('□ Medical expense records', 50, 280);
  doc.text('□ Business expense documentation', 50, 295);
}

function generateAdvisorNotes(doc: jsPDF) {
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text('Notes for Tax Advisors', 50, 30);
  
  // Important Disclaimer
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text('IMPORTANT DISCLAIMER', 105, 70, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  doc.text('This report was generated using AI-assisted analysis and should be considered as a starting point for tax planning discussions. The recommendations and calculations provided are estimates based on the information provided and current tax laws.', 105, 100, { align: 'center' });
  
  doc.text('Please review all information with a qualified tax professional before making any filing decisions or implementing tax strategies. Tax laws change frequently, and individual circumstances may affect the applicability of recommendations.', 105, 150, { align: 'center' });
  
  // Key Areas for Review
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('Key Areas Requiring Professional Review:', 50, 200);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(75, 85, 99);
  
  doc.text('• Verification of all income sources and amounts', 50, 220);
  doc.text('• Confirmation of deduction eligibility and limits', 50, 235);
  doc.text('• Review of business expense classifications', 50, 250);
  doc.text('• Analysis of tax credit opportunities', 50, 265);
  doc.text('• Estate and retirement planning implications', 50, 280);
  
  // Contact Information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text('Report generated by Taxify AI Platform', 105, 320, { align: 'center' });
  doc.text('For technical support: support@taxify.ai', 105, 335, { align: 'center' });
}
