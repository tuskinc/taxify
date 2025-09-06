// Test file to verify PDF generation
import { generateFinancialReport } from '../api/generate-financial-report';

export async function testPdfGeneration() {
  try {
    console.log('Testing PDF generation...');
    
    // Mock user ID for testing
    const testUserId = 'test-user-123';
    
    const pdfBuffer = await generateFinancialReport(testUserId);
    
    console.log('PDF generated successfully!');
    console.log('Buffer size:', pdfBuffer.length, 'bytes');
    
    return pdfBuffer;
  } catch (error) {
    console.error('PDF generation test failed:', error);
    throw error;
  }
}
