# RealVest MCP Server - Detailed Use Cases

This document provides comprehensive examples of how to use every feature of the RealVest MCP Server.

## Table of Contents
- [Affordability Calculator](#affordability-calculator)
- [BRRRR Deal Analyzer](#brrrr-deal-analyzer)
- [House Hacking Calculator](#house-hacking-calculator)
- [Portfolio Growth Projector](#portfolio-growth-projector)
- [Syndication Analyzer](#syndication-analyzer)
- [Educational Resources](#educational-resources)
- [State Assistance Programs](#state-assistance-programs)
- [Market Data](#market-data)
- [Complex Scenarios](#complex-scenarios)

## Affordability Calculator

### Basic Affordability Check
```
Human: I make $75,000 per year with $500 in monthly debts and have $20,000 saved. What can I afford?

Claude: I'll calculate your home affordability using the RealVest calculator.

[Tool Call: calculate_affordability]
{
  "annual_income": 75000,
  "monthly_debts": 500,
  "down_payment": 20000,
  "interest_rate": 6.85
}

Results:
- Maximum home price: $305,000
- Maximum loan amount: $285,000
- Monthly payment breakdown:
  - Principal & Interest: $1,865
  - Property tax: $305
  - Insurance: $127
  - PMI: $119
  - Total: $2,416
- Debt-to-income ratios:
  - Front-end: 28%
  - Back-end: 35%
```

### High-Income Professional
```
Human: I'm a software engineer making $185,000 with minimal debt. I have $100,000 for down payment and want a 15-year mortgage.

Claude: I'll calculate affordability for a 15-year mortgage with your financial profile.

[Tool Call: calculate_affordability]
{
  "annual_income": 185000,
  "monthly_debts": 800,
  "down_payment": 100000,
  "interest_rate": 6.02,
  "loan_term_years": 15
}

Results:
- Maximum home price: $650,000
- Lower total interest paid over life of loan
- Higher monthly payment but builds equity faster
```

### Couple with Student Loans
```
Human: Combined income $135,000, but we have $2,200/month in student loans and car payments. $50,000 down payment.

Claude: I'll factor in your higher debt obligations.

[Tool Call shows reduced affordability due to high DTI]
- Maximum home price: $425,000
- Suggestion: Consider paying down some debt first to improve DTI
```

## BRRRR Deal Analyzer

### Classic Single-Family BRRRR
```
Human: Found a distressed property: $85k purchase, needs $45k rehab, ARV $175k, rent $1,400. Good deal?

Claude: I'll analyze this BRRRR opportunity comprehensively.

[Tool Call: analyze_brrrr_deal]
{
  "purchase_price": 85000,
  "rehab_cost": 45000,
  "after_repair_value": 175000,
  "monthly_rent": 1400,
  "refinance_ltv": 0.75
}

Analysis:
- Initial investment: $130,000
- Refinance amount: $131,250 (75% of $175k)
- Cash out: $1,250 (nearly all capital returned!)
- Monthly cash flow: $225
- Cash-on-cash return: 24%
- Annual ROI: 42%
- Deal rating: EXCELLENT - Nearly infinite return since you get all money back
```

### Multi-Family BRRRR
```
Human: Duplex opportunity: $225k purchase, $65k repairs, ARV $385k, total rents $3,200

Claude: Analyzing this multi-family BRRRR deal...

[Detailed analysis showing]:
- Higher cash flow potential
- Better economies of scale
- Risk mitigation with multiple units
- Strong refinance potential
```

### Heavy Rehab Project
```
Human: Considering a major fixer: $120k purchase, $100k rehab budget, ARV $310k, rent $2,100

Claude: This is a substantial rehab project. Let me analyze the numbers...

[Analysis includes]:
- Extended holding period considerations
- Higher risk factors
- Construction loan options
- Detailed ROI calculations
```

## House Hacking Calculator

### FHA First-Time Buyer
```
Human: I want to house hack a $385,000 duplex with FHA loan. Other unit rents for $1,800.

Claude: Perfect strategy for first-time buyers! Let me calculate your house hack scenario.

[Tool Call: evaluate_house_hack]
{
  "purchase_price": 385000,
  "down_payment": 13475,
  "monthly_rent_unit2": 1800,
  "owner_expenses": 900,
  "interest_rate": 6.45,
  "pmi_rate": 0.85
}

Results:
- Your net housing cost: $895/month
- Without house hacking: $2,695/month
- Monthly savings: $1,800
- You're essentially living for less than a studio apartment!
```

### Triplex with Owner Unit
```
Human: Found a triplex for $625k. I'll live in one unit, rent two at $1,600 each, plus there's a $1,200 ADU.

Claude: This is an advanced house hacking strategy with excellent income potential.

[Analysis shows]:
- Live for free PLUS $800-1,000 monthly profit
- Building significant equity
- Tax benefits of owner-occupancy
```

### Single-Family with Rentable Space
```
Human: $425k house with finished basement apartment renting for $1,400. Is this worthwhile?

Claude: Let me analyze this single-family house hack option...

[Shows 40-50% reduction in housing costs while maintaining privacy]
```

## Portfolio Growth Projector

### Conservative Buy-and-Hold
```
Human: I have $50k to start and can save $15k/year. Show me a conservative 20-year plan.

Claude: I'll project a conservative buy-and-hold strategy for you.

[Tool Call: project_portfolio_growth]
{
  "starting_capital": 50000,
  "annual_savings": 15000,
  "initial_property_value": 200000,
  "annual_appreciation": 3.5,
  "annual_rent_growth": 3.0,
  "target_cash_flow_per_property": 300,
  "acquisition_pace_years": 2
}

20-Year Projection:
- Year 1: 1 property, $200k value
- Year 5: 3 properties, $695k value
- Year 10: 5 properties, $1.3M value
- Year 15: 8 properties, $2.2M value
- Year 20: 10 properties, $3.2M value
- Monthly cash flow at year 20: $8,500
- Total equity: $1.8M
```

### Aggressive BRRRR Strategy
```
Human: What if I BRRRR aggressively with $75k starting capital?

Claude: Let me model an aggressive BRRRR approach...

[Shows potential for 25+ properties through capital recycling]
```

### Transition to Commercial
```
Human: Start with residential, then move to small apartments. Model this.

Claude: I'll project a strategy transitioning from SFR to multi-family...

[Shows progression from houses to duplexes to small apartment buildings]
```

## Syndication Analyzer

### Value-Add Apartment Deal
```
Human: Considering a syndication: $50k min, 7% pref, 70/30 split, 15.5% IRR, 5-year hold

Claude: I'll analyze this value-add syndication opportunity.

[Tool Call: analyze_syndication]
{
  "minimum_investment": 50000,
  "preferred_return": 7,
  "profit_split_after_pref": 70,
  "projected_irr": 15.5,
  "projected_hold_period": 5,
  "projected_equity_multiple": 1.95
}

Analysis:
- Total return: $97,500 on $50k (95% gain)
- Annual average: 14.3%
- Preferred return provides downside protection
- Tax benefits through depreciation
- Passive investment - no active management
```

### Development Deal
```
Human: New construction syndication: $100k min, 8% pref, 22% IRR, 3-year timeline

Claude: Development deals offer higher returns but with increased risk...

[Detailed risk/return analysis for ground-up development]
```

### Comparing Multiple Opportunities
```
Human: I have $150k to invest. Compare these three syndications...

Claude: I'll analyze all three opportunities for optimal allocation...

[Compares risk, returns, timelines, and suggests diversification strategy]
```

## Educational Resources

### Topic-Specific Learning
```
Human: I want to understand BRRRR strategy better

Claude: Let me find RealVest's best BRRRR educational content.

[Tool Call: insights_articles - search "BRRRR"]

Found articles about BRRRR and real estate investing strategies:

1. **The Bootstrap Investor's Guide: Building Real Estate Wealth from Zero**
   - Summary: Start investing with $5,000 or less. Proven strategies for building wealth from zero. Real examples + step-by-step action plan.
   - Category: Investment Strategy
   - Link: https://www.realvest.ai/insights/bootstrap-real-estate-wealth.html

2. **From Military Service to Multi-Million Dollar Portfolio**
   - Summary: VA loan strategies + geographic arbitrage. Replicable blueprint included.
   - Category: Investment Strategy  
   - Link: https://www.realvest.ai/insights/military-to-millions-portfolio.html

3. **The Messy Reality of Real Estate Investing**
   - Summary: Honest take on the challenges of property investing including BRRRR deals gone wrong and how to recover.
   - Category: Investment Psychology
   - Link: https://www.realvest.ai/insights/messy-reality-real-estate.html

Each article provides practical insights with real-world examples and actionable strategies.
```

### Market Condition Research
```
Human: How do I invest in high interest rate environments?

Claude: I'll find articles about investing in challenging rate environments.

[Tool Call: insights_articles - search "rates interest high"]

Here's guidance on investing in high-rate environments:

1. **How Real Estate Investors Thrived When Mortgage Rates Hit 18%**
   - Summary: How investors thrived at 18% rates in 1981. Historical proof high rates create millionaires. Apply these strategies today.
   - Link: https://www.realvest.ai/insights/high-rate-investing-history.html

2. **The Mortgage Rate Trap**
   - Summary: Why waiting for rates to drop costs you money. Mathematical proof that time in market beats timing market.
   - Link: https://www.realvest.ai/insights/mortgage-rate-trap.html

3. **Creative Financing Strategies for Today's Market**
   - Summary: Alternative financing methods when traditional mortgages are expensive.
   - Link: https://www.realvest.ai/insights/capital-labor-partnership-guide.html
```

### Beginner Education Path
```
Human: I'm completely new to real estate. Where should I start?

Claude: Let me curate a learning path for beginners.

[Tool Call: insights_articles - search "beginner first start"]

Here's your recommended learning path:

**Start Here - Mindset & Basics:**
1. **The Eternal Window Shopper: Real Estate Analysis Paralysis**
   - Summary: Stop overthinking & start investing. How analysis paralysis costs you $1000s monthly.
   - Link: https://www.realvest.ai/insights/analysis-paralysis-trap.html

**Building Your Foundation:**
2. **The Bootstrap Investor's Guide: Building Real Estate Wealth from Zero**
   - Summary: Start investing with $5,000 or less. Proven strategies for building wealth from zero.
   - Link: https://www.realvest.ai/insights/bootstrap-real-estate-wealth.html

**Avoid Common Pitfalls:**
3. **Fatal Real Estate Mistakes That Cost Investors Thousands**
   - Summary: Learn from others' expensive mistakes before making your own.
   - Link: https://www.realvest.ai/insights/fatal-real-estate-mistakes.html

**Understanding Reality:**
4. **When Real Estate Gets Real: The Dark Side Nobody Talks About**
   - Summary: Honest look at challenges you'll face and how to handle them.
   - Link: https://www.realvest.ai/insights/messy-reality-real-estate.html

Read in this order for best results!
```

## State Assistance Programs

### Single State Deep Dive
```
Human: Tell me everything about California's first-time buyer programs

Claude: I'll provide comprehensive information on California's assistance programs.

[Tool Call: state_assistance_programs - California]

California Programs:
1. CalHFA MyHome Assistance
   - Up to 3.5% of purchase price
   - Deferred payment loan
   - Income limits: $150k-300k by county
   
2. CalHFA Zero Interest Program (ZIP)
   - 3% down payment assistance
   - 0% interest, no payments
   - Must use CalHFA first mortgage

Plus federal programs available...
```

### Multi-State Comparison
```
Human: Compare Texas vs Florida vs Arizona for first-time buyer help

Claude: I'll compare assistance programs across these three states...

[Detailed comparison of amounts, requirements, and income limits]
```

### Program Eligibility Check
```
Human: I'm a veteran in Georgia making $88k. What programs can I use?

Claude: Let me check both state and federal programs for veterans...

[Shows VA loan benefits plus Georgia-specific programs]
```

## Market Data

### Rate Shopping
```
Human: What's the difference in rates between conventional, FHA, and VA loans right now?

Claude: I'll show you current rates for all loan types.

[Tool Call: market_data]

Current Mortgage Rates:
- Conventional 30-year: 6.85% (0.6 points)
- FHA 30-year: 6.45% (0.5 points)
- VA 30-year: 6.25% (0.3 points)
- Conventional 15-year: 6.02% (0.5 points)
- 5/1 ARM: 5.95% (0.4 points)

Trends: Rates up 0.12% this week...
```

### Local Market Analysis
```
Human: How's the Denver real estate market?

Claude: Let me pull Denver market data for you.

[Provides]:
- Median home price: $625,000
- YoY appreciation: +2.5%
- Inventory: 2.2 months
- Market temperature: Competitive
- Best neighborhoods for investment
```

### Investment Market Metrics
```
Human: What are typical cap rates for different property classes?

Claude: I'll show you current investor metrics by property class.

[Shows]:
- Class A: 4.5% cap rate
- Class B: 5.8% cap rate  
- Class C: 7.2% cap rate
- Cash-on-cash returns by strategy
```

## Complex Scenarios

### Complete Investment Analysis
```
Human: I have $200k cash and want to build a portfolio. Compare all strategies.

Claude: I'll run a comprehensive analysis of all investment strategies.

1. Traditional Buy-and-Hold
   [Runs affordability and portfolio projection]
   
2. BRRRR Strategy
   [Analyzes multiple BRRRR scenarios]
   
3. House Hacking First
   [Shows benefits of starting with house hack]
   
4. Syndication Portfolio
   [Compares passive investment returns]
   
5. Hybrid Approach
   [Combines multiple strategies]

Recommendation based on your risk tolerance and goals...
```

### Location Optimization
```
Human: I can work remotely. Which markets offer the best investment opportunities?

Claude: I'll analyze multiple markets for optimal investment locations.

[Compares]:
- Purchase prices vs rents
- State assistance programs
- Market appreciation trends
- Cash flow potential
- Tax considerations

Top markets for your situation...
```

### Tax-Optimized Strategy
```
Human: I'm a high earner. How can I use real estate to reduce taxes?

Claude: Let me design a tax-efficient real estate strategy.

[Analyzes]:
- Depreciation benefits
- Cost segregation opportunities
- 1031 exchange strategies
- Syndication tax advantages
- Optimal entity structures
```

### Risk Mitigation Planning
```
Human: I'm risk-averse but want real estate exposure. What's safest?

Claude: I'll design a low-risk real estate investment approach.

[Recommends]:
- Start with house hacking (live in safety net)
- Focus on stable markets
- Maintain higher reserves
- Consider syndications for passive approach
- Diversification strategies
```

## Tips for Best Results

1. **Be Specific**: Provide exact numbers for most accurate calculations
2. **Consider Multiple Scenarios**: Run optimistic, realistic, and pessimistic cases
3. **Factor All Costs**: Include maintenance, vacancies, property management
4. **Think Long-Term**: Real estate is a long game - project 10-20 years
5. **Start Conservative**: Better to exceed conservative projections than miss aggressive ones

## Getting Help

For issues or questions about the MCP server:
- GitHub: https://github.com/sigaihealth/realvestmcp/issues
- Email: support@realvest.ai
- Documentation: https://www.realvest.ai