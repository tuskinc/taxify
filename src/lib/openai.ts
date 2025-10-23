import OpenAI from 'openai';
import { apiKeyService, trackAPIUsage } from './api-key-service';

// Initialize OpenAI client with dynamic API key
let openai: OpenAI | null = null;

// Function to initialize OpenAI client with API key
const initializeOpenAI = async (): Promise<OpenAI> => {
  if (openai) return openai;

  // Try to get API key from secure service first
  const apiKey = await apiKeyService.getOpenAIKey();
  
  if (!apiKey) {
    // Fallback to environment variable
    const envKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!envKey) {
      throw new Error('OpenAI API key not found. Please configure your API key.');
    }
    
    openai = new OpenAI({
      apiKey: envKey,
      dangerouslyAllowBrowser: true
    });
  } else {
    openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  return openai;
};

export interface AIAnalysisRequest {
  type: 'document_analysis' | 'tax_insights' | 'financial_advice' | 'report_generation';
  data: any;
  context?: string;
}

export interface AIAnalysisResponse {
  insights: string[];
  recommendations: string[];
  confidence: number;
  extractedData?: any;
  summary?: string;
}

export interface DocumentAnalysisRequest {
  fileContent: string;
  fileName: string;
  fileType: string;
  userContext?: {
    filingStatus?: string;
    dependents?: number;
    income?: number;
  };
}

export interface TaxInsightsRequest {
  financialData: {
    income: number;
    deductions: number;
    businessExpenses?: number;
    filingStatus: string;
    dependents: number;
  };
  documentAnalysis?: any;
}

export class OpenAIService {
  private static instance: OpenAIService;
  
  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  /**
   * Analyze uploaded financial documents
   */
  async analyzeDocument(request: DocumentAnalysisRequest): Promise<AIAnalysisResponse> {
    const startTime = Date.now();
    let client: OpenAI;
    
    try {
      client = await initializeOpenAI();
      const prompt = this.buildDocumentAnalysisPrompt(request);
      
      const response = await client!.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a tax expert AI assistant. Analyze financial documents and provide insights, recommendations, and extract relevant financial data. Always be accurate and helpful."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const content = response.choices[0]?.message?.content || '';
      const responseTime = Date.now() - startTime;
      
      // Track usage
      await trackAPIUsage({
        keyType: 'openai',
        userId: 'system', // You might want to pass actual user ID
        endpoint: 'analyzeDocument',
        tokensUsed: response.usage?.total_tokens || 0,
        costUsd: this.calculateCost(response.usage?.total_tokens || 0),
        responseTimeMs: responseTime,
        success: true
      });

      return this.parseDocumentAnalysisResponse(content);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Track failed usage
      await trackAPIUsage({
        keyType: 'openai',
        userId: 'system',
        endpoint: 'analyzeDocument',
        responseTimeMs: responseTime,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      console.error('OpenAI document analysis error:', error);
      throw new Error('Failed to analyze document with AI');
    }
  }

  /**
   * Generate tax insights and recommendations
   */
  async generateTaxInsights(request: TaxInsightsRequest): Promise<AIAnalysisResponse> {
    const startTime = Date.now();
    let client: OpenAI;
    
    try {
      client = await initializeOpenAI();
      const prompt = this.buildTaxInsightsPrompt(request);
      
      const response = await client!.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a tax optimization expert. Analyze financial data and provide personalized tax insights, savings opportunities, and recommendations. Focus on maximizing tax savings while ensuring compliance."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1500
      });

      const content = response.choices[0]?.message?.content || '';
      const responseTime = Date.now() - startTime;
      
      // Track usage
      await trackAPIUsage({
        keyType: 'openai',
        userId: 'system',
        endpoint: 'generateTaxInsights',
        tokensUsed: response.usage?.total_tokens || 0,
        costUsd: this.calculateCost(response.usage?.total_tokens || 0),
        responseTimeMs: responseTime,
        success: true
      });

      return this.parseTaxInsightsResponse(content);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Track failed usage
      await trackAPIUsage({
        keyType: 'openai',
        userId: 'system',
        endpoint: 'generateTaxInsights',
        responseTimeMs: responseTime,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      console.error('OpenAI tax insights error:', error);
      throw new Error('Failed to generate tax insights');
    }
  }

  /**
   * Generate comprehensive financial report content
   */
  async generateReportContent(financialData: any, documentAnalysis?: any): Promise<string> {
    try {
      const prompt = this.buildReportGenerationPrompt(financialData, documentAnalysis);
      
      const response = await openai!.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a professional tax advisor. Generate comprehensive, personalized tax analysis reports that are clear, actionable, and legally compliant."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 3000
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI report generation error:', error);
      throw new Error('Failed to generate report content');
    }
  }

  /**
   * Get personalized financial advice
   */
  async getFinancialAdvice(context: any): Promise<AIAnalysisResponse> {
    try {
      const prompt = this.buildFinancialAdvicePrompt(context);
      
      const response = await openai!.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a financial advisor and tax expert. Provide personalized, actionable financial advice based on the user's situation. Focus on tax optimization and financial planning."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1500
      });

      const content = response.choices[0]?.message?.content || '';
      return this.parseFinancialAdviceResponse(content);
    } catch (error) {
      console.error('OpenAI financial advice error:', error);
      throw new Error('Failed to generate financial advice');
    }
  }

  private buildDocumentAnalysisPrompt(request: DocumentAnalysisRequest): string {
    return `
Analyze this financial document and provide insights:

Document: ${request.fileName} (${request.fileType})
Content: ${request.fileContent}

User Context:
- Filing Status: ${request.userContext?.filingStatus || 'Not specified'}
- Dependents: ${request.userContext?.dependents || 0}
- Income: $${request.userContext?.income || 'Not specified'}

Please provide:
1. Key financial data extracted (income, expenses, deductions, etc.)
2. Tax-relevant insights and opportunities
3. Specific recommendations for tax optimization
4. Confidence level (0-1) in your analysis

Format your response as JSON with the following structure:
{
  "insights": ["insight1", "insight2", ...],
  "recommendations": ["rec1", "rec2", ...],
  "confidence": 0.85,
  "extractedData": {
    "income": 0,
    "expenses": 0,
    "deductions": 0,
    "additionalInsights": []
  }
}
    `.trim();
  }

  private buildTaxInsightsPrompt(request: TaxInsightsRequest): string {
    return `
Analyze this financial situation and provide tax optimization insights:

Financial Data:
- Annual Income: $${request.financialData.income}
- Deductions: $${request.financialData.deductions}
- Business Expenses: $${request.financialData.businessExpenses || 0}
- Filing Status: ${request.financialData.filingStatus}
- Dependents: ${request.financialData.dependents}

Document Analysis: ${request.documentAnalysis ? JSON.stringify(request.documentAnalysis) : 'None'}

Please provide:
1. Tax optimization opportunities
2. Potential savings strategies
3. Compliance recommendations
4. Next steps for tax planning

Format your response as JSON with the following structure:
{
  "insights": ["insight1", "insight2", ...],
  "recommendations": ["rec1", "rec2", ...],
  "confidence": 0.85,
  "summary": "Brief summary of key findings"
}
    `.trim();
  }

  private buildReportGenerationPrompt(financialData: any, documentAnalysis?: any): string {
    return `
Generate a comprehensive tax analysis report based on this data:

Financial Data: ${JSON.stringify(financialData, null, 2)}
Document Analysis: ${documentAnalysis ? JSON.stringify(documentAnalysis, null, 2) : 'None'}

Create a professional, detailed report that includes:
1. Executive Summary
2. Tax Liability Analysis
3. Optimization Opportunities
4. Recommendations
5. Next Steps

Make it personalized, actionable, and easy to understand.
    `.trim();
  }

  private buildFinancialAdvicePrompt(context: any): string {
    return `
Provide personalized financial advice based on this context:

Context: ${JSON.stringify(context, null, 2)}

Focus on:
1. Tax optimization strategies
2. Financial planning recommendations
3. Risk management
4. Investment considerations
5. Retirement planning

Format your response as JSON with the following structure:
{
  "insights": ["insight1", "insight2", ...],
  "recommendations": ["rec1", "rec2", ...],
  "confidence": 0.85,
  "summary": "Brief summary of advice"
}
    `.trim();
  }

  private parseDocumentAnalysisResponse(content: string): AIAnalysisResponse {
    try {
      const parsed = JSON.parse(content);
      return {
        insights: parsed.insights || [],
        recommendations: parsed.recommendations || [],
        confidence: parsed.confidence || 0.5,
        extractedData: parsed.extractedData || {},
        summary: parsed.summary
      };
    } catch (error) {
      console.error('Failed to parse document analysis response:', error);
      return {
        insights: ['Document analysis completed'],
        recommendations: ['Review the document for tax optimization opportunities'],
        confidence: 0.5
      };
    }
  }

  private parseTaxInsightsResponse(content: string): AIAnalysisResponse {
    try {
      const parsed = JSON.parse(content);
      return {
        insights: parsed.insights || [],
        recommendations: parsed.recommendations || [],
        confidence: parsed.confidence || 0.5,
        summary: parsed.summary
      };
    } catch (error) {
      console.error('Failed to parse tax insights response:', error);
      return {
        insights: ['Tax analysis completed'],
        recommendations: ['Consider consulting a tax professional'],
        confidence: 0.5
      };
    }
  }

  private parseFinancialAdviceResponse(content: string): AIAnalysisResponse {
    try {
      const parsed = JSON.parse(content);
      return {
        insights: parsed.insights || [],
        recommendations: parsed.recommendations || [],
        confidence: parsed.confidence || 0.5,
        summary: parsed.summary
      };
    } catch (error) {
      console.error('Failed to parse financial advice response:', error);
      return {
        insights: ['Financial advice generated'],
        recommendations: ['Consider professional financial planning'],
        confidence: 0.5
      };
    }
  }

  /**
   * Calculate cost based on token usage
   */
  private calculateCost(tokens: number): number {
    // GPT-4 pricing: $0.03 per 1K input tokens, $0.06 per 1K output tokens
    // Using average of $0.045 per 1K tokens for estimation
    return (tokens / 1000) * 0.045;
  }
}

// Export singleton instance
export const openaiService = OpenAIService.getInstance();
