import { supabase } from '../lib/supabase'

export async function generateFinancialReport(userId: string): Promise<Buffer> {
  try {
    // Fetch user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError) throw userError

    // Fetch personal finances
    const { data: personalFinances, error: personalError } = await supabase
      .from('personal_finances')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (personalError) throw personalError

    // Fetch business finances if they exist
    const { data: businessFinances } = await supabase
      .from('business_finances')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Generate a simple text report for now
    const reportData = {
      user: user,
      personalFinances: personalFinances,
      businessFinances: businessFinances,
      generatedAt: new Date().toISOString()
    }

    // Convert to JSON and then to Buffer
    const reportText = JSON.stringify(reportData, null, 2)
    return Buffer.from(reportText, 'utf-8')
  } catch (error) {
    console.error('Error generating financial report:', error)
    throw error
  }
}
