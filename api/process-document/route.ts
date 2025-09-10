/// <reference types="node" />
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import pdf from 'pdf-parse';
import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';
import { docxParser } from 'docx-parser';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

// Types
type FileType = 'application/pdf' | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' | 'text/csv';

interface ProcessRequest {
  fileUrl: string;
  fileName: string;
  fileType: FileType;
}

export async function POST(request: Request) {
  try {
    const { fileUrl, fileName, fileType } = (await request.json()) as ProcessRequest;

    // 1. Download the file from the URL
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    let textContent = '';

    // 2. Process the file based on its type
    if (fileType === 'application/pdf') {
      const pdfData = await pdf(buffer);
      textContent = pdfData.text;
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      textContent = await new Promise((resolve, reject) => {
        docxParser(buffer, (err: Error | null, text?: string) => {
          if (err) reject(err);
          else resolve(text || '');
        });
      });
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      const workbook = XLSX.read(buffer);
      textContent = workbook.SheetNames
        .map(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          return XLSX.utils.sheet_to_csv(worksheet);
        })
        .join('\n\n');
    } else if (fileType === 'text/csv') {
      const records = parse(buffer.toString(), {
        columns: true,
        skip_empty_lines: true,
      }) as Record<string, unknown>[];
      textContent = records.map(record => JSON.stringify(record)).join('\n');
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    // 3. Extract financial data using Claude
    const extractedData = await extractFinancialData(textContent);

    // 4. Return the extracted data
    return NextResponse.json({ 
      success: true, 
      data: extractedData 
    });

  } catch (error) {
    console.error('Error processing document:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process document' 
      },
      { status: 500 }
    );
  }
}

interface FinancialData {
  // Define the structure of your financial data here
  [key: string]: unknown;
}

async function extractFinancialData(text: string): Promise<FinancialData> {
  const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
  if (!CLAUDE_API_KEY) {
    throw new Error('Claude API key not configured');
  }

  const prompt = `You are a financial data extraction assistant.
Extract all relevant tax-related data from the following document text.

Document text:
---
${text.substring(0, 100000)} // Limit to first 100k chars
---

Respond ONLY with valid JSON matching this schema:

{
  "personalFinances": {
    "salary_income": number,
    "freelance_income": number,
    "investment_income": number,
    "rental_income": number,
    "capital_gains": number,
    "retirement_contributions": number,
    "mortgage_interest": number,
    "property_taxes": number,
    "charitable_donations": number,
    "medical_expenses": number,
    "childcare_costs": number,
    "education_expenses": number,
    "other_deductions": number
  },
  "businessFinances": {
    "revenue": number,
    "employee_costs": number,
    "equipment": number,
    "rent": number,
    "utilities": number,
    "marketing": number,
    "travel_expenses": number,
    "office_supplies": number,
    "professional_services": number,
    "insurance": number,
    "other_expenses": number
  }
}

- If a field is missing, set it to 0.
- Only return valid JSON, no explanations or markdown formatting.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-opus-20240229',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data = await response.json();
  const content = data.content[0]?.text;
  
  if (!content) {
    throw new Error('No content in Claude response');
  }

  // Clean the response to ensure it's valid JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not extract JSON from Claude response');
  }

  return JSON.parse(jsonMatch[0]);
}
