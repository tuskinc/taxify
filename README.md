# Taxify - AI-Powered Tax Analysis Platform

A comprehensive web application that analyzes both business and personal/family financials and provides AI-powered tax optimization advice for different countries.

## 🚀 Features

### Core Functionality
- **User Profile & Tax Type Selection**: Registration with Supabase Auth, profile setup, and tax scenario selection
- **Country Selection & Tax Data**: Multi-country tax law integration using Bing Search API
- **Personal/Family Financial Analysis**: Comprehensive income, deductions, and tax credit optimization
- **Business Financial Analysis**: Business expense tracking and corporate tax planning
- **Combined Analysis Engine**: AI-powered optimization combining personal and business strategies
- **Enhanced Reporting**: Visual dashboards, tax calendars, and actionable recommendations
- **AI-Assisted PDF Reports**: Professional financial reports with tax optimization strategies

### Tax Scenarios Supported
- **Personal Only**: Individual and family tax optimization
- **Business Only**: Business tax planning and expense optimization
- **Combined**: Integrated personal + business tax strategy

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom component library
- **State Management**: React hooks (useState, useContext)
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Build Tool**: Vite
- **PDF Generation**: PDFKit for professional report generation

### Backend
- **Runtime**: Vercel Serverless Functions
- **Language**: TypeScript
- **Validation**: Zod schemas
- **API Integration**: Claude 3.5 Sonnet, Bing Search API

### Database
- **Primary**: Supabase PostgreSQL
- **Features**: Authentication, Real-time subscriptions, Row Level Security
- **Hosting**: Supabase Cloud

## 📁 Project Structure

```
tax-platform/
├── src/
│   ├── components/          # React components
│   │   ├── AuthWrapper.tsx
│   │   ├── UserProfileSetup.tsx
│   │   ├── TaxScenarioSelector.tsx
│   │   ├── PersonalFinanceForm.tsx
│   │   ├── BusinessFinanceForm.tsx
│   │   ├── ComprehensiveAnalysisReport.tsx
│   │   └── Dashboard.tsx
│   ├── lib/                # Core libraries
│   │   └── supabase.ts     # Supabase client & tax helpers
│   ├── api/                # Vercel serverless functions
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── supabase/               # Database migrations & config
├── package.json
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Claude API key (optional for MVP)
- Bing Search API key (optional for MVP)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tax-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your Supabase and API credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   CLAUDE_API_KEY=sk-...
   BING_SEARCH_KEY=...
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the SQL migrations from the PRD in the SQL Editor
   - Enable Row Level Security on all tables
   - Set up authentication policies

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🗄️ Database Setup

### Required Tables
- `users` - User authentication and basic info
- `user_profiles` - Extended user profile data
- `personal_finances` - Personal income and deductions
- `businesses` - Business entity information
- `business_finances` - Business financial data
- `tax_data` - Country-specific tax information
- `comprehensive_analyses` - Analysis results and recommendations

### Row Level Security
All tables have RLS enabled with appropriate policies for user data isolation.

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Prettier for code formatting
- Component-based architecture with custom hooks

### Component Development
Components follow a consistent pattern:
- Props interface definition
- State management with React hooks
- Form handling with React Hook Form + Zod
- Tailwind CSS for styling
- Lucide React icons

## 🌐 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables
Ensure all required environment variables are set in your deployment platform:
- Supabase credentials
- API keys for external services
- Database connection strings

## 📊 Features Roadmap

### Phase 1: Foundation ✅
- [x] React + TypeScript + Vite setup
- [x] Tailwind CSS configuration
- [x] Basic component structure
- [x] Supabase integration

### Phase 2: Core Features 🚧
- [x] User authentication
- [x] Profile setup
- [x] Tax scenario selection
- [x] Personal finance forms
- [ ] Business finance forms
- [ ] Tax data integration

### Phase 3: AI Integration 📋
- [x] Claude API integration (placeholder)
- [x] Tax optimization algorithms (basic)
- [x] Recommendation engine (basic)
- [x] Report generation (PDF export)

### Phase 4: Advanced Features 📋
- [ ] Multi-country tax support
- [ ] Tax calendar planning
- [ ] Document management
- [ ] Export functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This application is for educational and informational purposes only. It should not be considered as professional tax advice. Always consult with a qualified tax professional for specific tax guidance and compliance.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the PRD
- Review the component code examples

## 🔗 Links

- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [Claude API](https://docs.anthropic.com/)
