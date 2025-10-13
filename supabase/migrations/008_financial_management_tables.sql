-- Create budgets table for personal budgeting functionality
CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create investments table for portfolio management
CREATE TABLE IF NOT EXISTS investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_type VARCHAR(50) NOT NULL,
  amount_invested DECIMAL(15,2) NOT NULL,
  current_value DECIMAL(15,2) NOT NULL,
  returns DECIMAL(15,2) GENERATED ALWAYS AS (current_value - amount_invested) STORED,
  risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  symbol VARCHAR(20),
  purchase_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_date ON budgets(date);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category);
CREATE INDEX IF NOT EXISTS idx_budgets_type ON budgets(type);

CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_asset_type ON investments(asset_type);
CREATE INDEX IF NOT EXISTS idx_investments_risk_level ON investments(risk_level);
CREATE INDEX IF NOT EXISTS idx_investments_purchase_date ON investments(purchase_date);

-- Enable Row Level Security
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for budgets table
CREATE POLICY "Users can view their own budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets" ON budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets" ON budgets
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for investments table
CREATE POLICY "Users can view their own investments" ON investments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own investments" ON investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investments" ON investments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investments" ON investments
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investments_updated_at
  BEFORE UPDATE ON investments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for demonstration (optional)
INSERT INTO budgets (user_id, category, amount, type, date, notes) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Salary', 5000.00, 'income', '2024-01-01', 'Monthly salary'),
  ('00000000-0000-0000-0000-000000000000', 'Housing', 1200.00, 'expense', '2024-01-01', 'Rent payment'),
  ('00000000-0000-0000-0000-000000000000', 'Food', 400.00, 'expense', '2024-01-01', 'Groceries and dining'),
  ('00000000-0000-0000-0000-000000000000', 'Transportation', 200.00, 'expense', '2024-01-01', 'Gas and public transport'),
  ('00000000-0000-0000-0000-000000000000', 'Entertainment', 150.00, 'expense', '2024-01-01', 'Movies and subscriptions');

INSERT INTO investments (user_id, asset_type, amount_invested, current_value, risk_level, symbol, purchase_date) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Stocks', 1000.00, 1100.00, 'medium', 'AAPL', '2024-01-01'),
  ('00000000-0000-0000-0000-000000000000', 'ETFs', 2000.00, 2100.00, 'low', 'VTI', '2024-01-01'),
  ('00000000-0000-0000-0000-000000000000', 'Crypto', 500.00, 600.00, 'high', 'BTC', '2024-01-01'),
  ('00000000-0000-0000-0000-000000000000', 'Bonds', 1500.00, 1520.00, 'low', 'BND', '2024-01-01');
