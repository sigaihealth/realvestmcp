# RealVest MCP Server - Quick Reference

## 🛠️ Available Tools

### calculate_affordability
Calculate maximum home purchase price based on income and debts
```javascript
{
  annual_income: number,      // Gross annual income
  monthly_debts: number,      // Total monthly debt payments
  down_payment: number,       // Available down payment
  interest_rate: number,      // Current mortgage rate (e.g., 6.85)
  property_tax_rate?: number, // Annual property tax % (default: 1.2)
  insurance_rate?: number,    // Annual insurance % (default: 0.5)
  hoa_monthly?: number,       // Monthly HOA fees (default: 0)
  loan_term_years?: number    // Loan term (default: 30)
}
```

### analyze_brrrr_deal
Analyze Buy, Rehab, Rent, Refinance, Repeat deals
```javascript
{
  purchase_price: number,     // Property purchase price
  rehab_cost: number,         // Rehabilitation budget
  after_repair_value: number, // Expected value after repairs
  monthly_rent: number,       // Expected monthly rent
  refinance_ltv?: number,     // Refinance LTV (default: 0.75)
  holding_costs_monthly?: number, // Monthly costs during rehab
  holding_period_months?: number  // Rehab duration
}
```

### evaluate_house_hack
Calculate house hacking returns
```javascript
{
  purchase_price: number,     // Property price
  down_payment: number,       // Down payment amount
  monthly_rent_unit2: number, // Rent from other unit(s)
  monthly_rent_unit3?: number,// Additional unit rent
  monthly_rent_adu?: number,  // ADU rent if applicable
  owner_expenses: number,     // Your living expenses
  interest_rate: number,      // Mortgage rate
  property_tax_rate?: number, // Property tax %
  insurance_rate?: number,    // Insurance %
  pmi_rate?: number          // PMI rate if applicable
}
```

### project_portfolio_growth
Project real estate portfolio over 20 years
```javascript
{
  starting_capital: number,   // Initial investment capital
  annual_savings: number,     // Yearly savings to invest
  initial_property_value: number, // First property price
  annual_appreciation: number,    // Expected appreciation %
  annual_rent_growth: number,     // Expected rent growth %
  target_cash_flow_per_property: number, // Monthly cash flow goal
  acquisition_pace_years: number  // Years between purchases
}
```

### analyze_syndication
Evaluate syndication investment opportunities
```javascript
{
  minimum_investment: number,  // Minimum investment required
  total_raise?: number,       // Total capital raise
  preferred_return: number,   // Preferred return percentage
  profit_split_after_pref: number, // LP share after pref (e.g., 70)
  projected_hold_period: number,   // Investment period in years
  projected_irr: number,          // Projected internal rate of return
  projected_equity_multiple: number // Projected equity multiple
}
```

## 📚 Available Resources

### insights_articles
- Access 30+ educational articles
- Search by keyword or browse all
- Categories: Market Analysis, Investment Strategy, Rental Strategy, Investment Psychology

### state_assistance_programs
- Down payment assistance for 10+ states
- Federal programs (FHA, VA, USDA)
- Income limits and requirements
- Contact information

### market_data
- Current mortgage rates (all types)
- Home price trends by metro
- Rental market metrics
- Investor cap rates
- Economic indicators

### calculator_examples
- 15+ detailed examples
- Multiple scenarios per calculator
- Expected outcomes
- Best practices

## 💬 Common Prompts

### First-Time Buyers
- "I make $X per year with $Y saved. What can I afford?"
- "What down payment assistance is available in [state]?"
- "Should I buy now or wait for rates to drop?"

### Investors
- "Analyze this BRRRR deal: [provide numbers]"
- "Compare house hacking vs traditional rental"
- "Project my portfolio growth over 20 years"
- "Is this syndication a good investment?"

### Market Research
- "What are current mortgage rates?"
- "How's the [city] real estate market?"
- "Find articles about [topic]"
- "Which markets have the best cash flow?"

## 🎯 Pro Tips

1. **Always provide specific numbers** for accurate calculations
2. **Run multiple scenarios** (optimistic, realistic, pessimistic)
3. **Include all costs** (maintenance, vacancy, management)
4. **Consider your timeline** (short-term vs long-term goals)
5. **Factor in market conditions** (rates, inventory, trends)

## 🔗 Useful Combinations

### Complete First-Time Buyer Analysis
1. Check affordability
2. Find state assistance programs
3. Review current rates
4. Read relevant articles

### Investment Property Evaluation
1. Run BRRRR analysis
2. Project portfolio growth
3. Compare to syndications
4. Check market conditions

### Market Comparison
1. Get market data for multiple cities
2. Compare state programs
3. Analyze cash flow potential
4. Review local market articles

## ⚡ Quick Commands

- **"What can I afford?"** → Runs affordability calculator
- **"Analyze this deal"** → Runs appropriate investment calculator
- **"Current rates"** → Shows latest mortgage rates
- **"Help in [state]"** → Shows state assistance programs
- **"Learn about [topic]"** → Searches educational articles

## 📊 Output Interpretation

### Affordability Results
- **Max home price**: Total purchase price you can afford
- **DTI ratios**: Should stay under 28%/36% (front/back)
- **Monthly payment**: Full PITI payment breakdown

### BRRRR Analysis
- **Cash out**: Money returned after refinance
- **Cash flow**: Monthly profit after all expenses
- **ROI**: Annual return on invested capital

### Portfolio Projection
- **Properties**: Number owned at each milestone
- **Portfolio value**: Total real estate value
- **Cash flow**: Monthly passive income
- **Equity**: Net worth in properties

## 🆘 Troubleshooting

- **"Can't afford anything"**: Check DTI, consider paying down debts
- **"BRRRR shows negative"**: Verify ARV and rent estimates
- **"Syndication seems risky"**: Compare multiple opportunities
- **"Market data outdated"**: Data refreshed periodically

## 📝 Notes

- All calculations are estimates
- Consult professionals for actual transactions
- Market conditions vary by location
- Tax implications not included in calculations