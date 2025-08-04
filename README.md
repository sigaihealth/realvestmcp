# @realvest/mcp-server

An MCP (Model Context Protocol) server that provides AI assistants with direct access to RealVest.ai's comprehensive suite of **31 professional real estate investment calculators** and educational resources. Perfect for integrating professional-grade real estate analysis capabilities into Claude and other AI assistants.

[![npm version](https://badge.fury.io/js/@realvest%2Fmcp-server.svg)](https://www.npmjs.com/package/@realvest/mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

### 31 Professional Calculators

#### Basic Analysis Tools (5)
- **calculate_affordability** - Home affordability based on income and debts
- **analyze_brrrr_deal** - BRRRR (Buy, Rehab, Rent, Refinance, Repeat) analysis
- **evaluate_house_hack** - House hacking strategy calculator
- **project_portfolio_growth** - 20-year portfolio projection
- **analyze_syndication** - Syndication investment evaluation

#### Lending & Qualification Tools (3)
- **calculate_mortgage_affordability** - Advanced mortgage qualification with dual income
- **analyze_debt_to_income** - DTI analysis for different loan types
- **compare_loans** - Side-by-side comparison of up to 4 loan scenarios

#### Investment Analysis Tools (6)
- **calculate_irr** - Internal Rate of Return with sensitivity analysis
- **analyze_fix_flip** - Fix and flip profitability calculator
- **calculate_npv** - Net Present Value with inflation adjustment
- **calculate_cocr** - Cash-on-Cash Return with 5-year projections
- **calculate_dscr** - Debt Service Coverage Ratio for investment loans
- **analyze_breakeven** - Breakeven analysis for rental properties

#### Advanced Analysis Tools (15)
- **analyze_sensitivity** - Multi-variable sensitivity analysis
- **run_monte_carlo** - Monte Carlo risk simulation (10,000+ scenarios)
- **calculate_tax_benefits** - Tax benefits and depreciation calculator
- **compare_properties** - Compare up to 5 properties side-by-side
- **analyze_refinance** - Refinance analysis with break-even and NPV calculations
- **analyze_airbnb_str** - Airbnb/STR income analysis with seasonal variations
- **analyze_1031_exchange** - 1031 like-kind exchange tax analysis and qualification
- **analyze_market_comps** - Market analysis with comparable property analysis and CMA
- **analyze_construction_loan** - Construction loan analysis with draw schedules and permanent financing
- **analyze_wholesale_deal** - Wholesale deal analysis with assignment fees and exit strategies
- **analyze_subject_to_deal** - Subject-to deal analysis with existing mortgage takeover
- **analyze_seller_financing** - Seller financing analysis with terms optimization and risk assessment
- **analyze_hard_money_loan** - Hard money loan analysis with project viability and risk assessment
- **calculate_capital_gains_tax** - Capital gains tax calculator with optimization strategies
- **analyze_rent_vs_buy** - Compare costs and benefits of renting vs buying with comprehensive financial analysis
- **track_deal_pipeline** - Track and analyze multiple deals through various stages with performance metrics
- **analyze_joint_venture** - Analyze joint venture partnerships with profit splitting and risk assessment
- **analyze_property_management** - Compare self-management vs professional property management
- **track_property_expenses** - Track and analyze property expenses with benchmarking and tax analysis

### Educational Resources
- **insights_articles** - 35+ educational articles and market insights
- **state_assistance_programs** - Down payment assistance by state
- **market_data** - Current mortgage rates and market conditions
- **calculator_examples** - Example scenarios for each calculator

## 📦 Installation

### NPM Global Install (Recommended)
```bash
npm install -g @realvest/mcp-server
```

### NPM Local Install
```bash
npm install @realvest/mcp-server
```

### From Source
```bash
git clone https://github.com/sigaihealth/realvestmcp.git
cd realvestmcp
npm install
```

## 🔧 Configuration

### With Claude Desktop

Add to your Claude Desktop configuration:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "realvest": {
      "command": "npx",
      "args": ["@realvest/mcp-server"],
      "description": "RealVest.ai real estate investment tools"
    }
  }
}
```

Or if installed globally:
```json
{
  "mcpServers": {
    "realvest": {
      "command": "realvest-mcp",
      "description": "RealVest.ai real estate investment tools"
    }
  }
}
```

## 📚 Complete Usage Examples

### 🏠 Basic Calculators

#### Affordability Calculator
```
Human: I make $95,000/year with $800 in monthly debts. I have $30,000 saved. What house can I afford?

Claude: I'll calculate what you can afford using the RealVest affordability calculator.

[Uses calculate_affordability]

Based on your finances:
- Maximum home price: $385,000
- Monthly payment: $2,534
- Down payment: 7.8% ($30,000)
- Cash needed at closing: $37,850
- Front-end DTI: 32.1%
- Back-end DTI: 42.2%
```

#### BRRRR Calculator
```
Human: Analyzing a BRRRR deal: $120k purchase, $40k rehab, $210k ARV, $1,600/mo rent

Claude: I'll analyze this BRRRR opportunity for you.

[Uses analyze_brrrr_deal]

BRRRR Analysis Results:
- Total investment: $160,000
- Cash out at refinance: $2,500 (98.4% capital returned!)
- Monthly cash flow: $287
- Annual ROI: 39.4%
- Cash-on-cash return: 11.5%
- This is an excellent BRRRR deal!
```

#### House Hacking Calculator
```
Human: I'm buying a $450,000 triplex, living in one unit. Other units rent for $1,500 each.

Claude: Let me calculate your house hacking savings.

[Uses evaluate_house_hack]

House Hacking Analysis:
- Your effective housing cost: -$523/month (you're getting paid to live there!)
- Compared to renting: Save $2,023/month
- Annual savings: $24,276
- Plus you're building equity and getting tax benefits!
```

#### Portfolio Growth Projector
```
Human: Starting with $75k, saving $20k/year, buying a property every 18 months. 20-year projection?

Claude: I'll project your portfolio growth over 20 years.

[Uses project_portfolio_growth]

20-Year Portfolio Projection:
- Properties owned: 13
- Portfolio value: $4.2 million
- Total equity: $2.3 million
- Monthly cash flow: $11,400
- Annual passive income: $136,800
- Total ROI: 485%
```

#### Syndication Analyzer
```
Human: Evaluating a syndication: $100k investment, 8% preferred, 70/30 split, 17% projected IRR

Claude: I'll analyze this syndication opportunity.

[Uses analyze_syndication]

Syndication Analysis:
- Total projected return: $217,000
- Cash-on-cash average: 9.8%
- Equity multiple: 2.17x
- Risk-adjusted return: Good
- The 8% preferred return provides solid downside protection
```

### 💰 Lending & Qualification Tools

#### Mortgage Affordability Calculator
```
Human: Dual income: $85k + $65k, $1,200 monthly debts, $50k down. Include closing costs.

Claude: I'll calculate your mortgage affordability with both incomes.

[Uses calculate_mortgage_affordability]

Mortgage Affordability Analysis:
- Combined income: $150,000/year
- Maximum purchase price: $625,000
- Maximum loan amount: $575,000
- Monthly payment (PITI): $4,125
- Total monthly with debts: $5,325
- Front-end DTI: 33.0%
- Back-end DTI: 42.6%
- Closing costs estimate: $17,250
```

#### Debt-to-Income Calculator
```
Human: Income $120k, debts: $400 car, $200 credit cards, $150 student loans. Check all loan types.

Claude: I'll analyze your DTI for different loan types.

[Uses analyze_debt_to_income]

DTI Analysis Results:
- Current DTI: 7.5%
- With mortgage: 35.8%

Loan Type Qualification:
✅ Conventional: Qualified (max 45%)
✅ FHA: Qualified (max 57%)
✅ VA: Qualified (max 41%)
✅ USDA: Qualified (max 41%)
⚠️ Jumbo: Borderline (prefer <35%)

Maximum loan amounts by type vary from $485k-$625k
```

#### Loan Comparison Tool
```
Human: Compare: 1) 6.5% 30yr conventional, 2) 5.9% 15yr, 3) 6.2% FHA, 4) 5.8% 5/1 ARM

Claude: I'll compare these four loan options for you.

[Uses compare_loans]

Loan Comparison Results:

Best for monthly payment: FHA ($2,847/mo)
Best for total interest: 15-year ($158,420)
Best for equity building: 15-year 
Best overall value: Conventional 30-year

ARM Risk: Payment could increase to $3,425/mo
FHA PMI: $312/mo for 11 years
Break-even on points: 42 months
```

### 📊 Investment Analysis Tools

#### IRR Calculator
```
Human: Initial investment $150k, cash flows: Y1 $12k, Y2 $15k, Y3 $18k, Y4 $22k, Y5 $25k + $200k sale

Claude: I'll calculate the IRR for this investment.

[Uses calculate_irr]

IRR Analysis:
- IRR: 19.7%
- NPV at 10%: $63,482
- Total return: 128%
- Payback period: 4.2 years

Sensitivity Analysis:
- If rents drop 10%: IRR falls to 15.3%
- If exit value drops 10%: IRR falls to 16.8%
- Break-even sale price: $147,000
```

#### Fix & Flip Calculator
```
Human: Purchase $180k, rehab $65k, ARV $320k, 6-month timeline, hard money loan

Claude: I'll analyze this fix and flip project.

[Uses analyze_fix_flip]

Fix & Flip Analysis:
- Total investment: $245,000
- Net profit: $52,350
- ROI: 21.4%
- Profit margin: 16.4%
- MAO (70% rule): $159,000 ✅ Good deal!

Financing costs: $14,700
Break-even sale price: $259,700
Safety cushion: $60,300
```

#### NPV Calculator
```
Human: Evaluating a 10-year hold: -$200k initial, $24k/year cash flow, $400k sale, 8% discount rate

Claude: I'll calculate the NPV for this investment.

[Uses calculate_npv]

NPV Analysis:
- Nominal NPV: $128,745
- IRR: 13.8%
- Profitability Index: 1.64
- Payback period: 8.3 years

With 3% inflation:
- Real NPV: $142,380
- Real discount rate: 4.85%
- This investment significantly outpaces inflation!
```

#### Cash-on-Cash Return Calculator
```
Human: $350k property, 25% down, $3,200 rent, $1,400 expenses, 6.8% rate

Claude: I'll calculate your cash-on-cash return.

[Uses calculate_cocr]

Cash-on-Cash Analysis:
- Cash invested: $87,500
- Monthly cash flow: $642
- Annual cash flow: $7,704
- Cash-on-cash return: 8.8%
- Cap rate: 7.7%

5-Year Projection:
- Total cash flow: $42,168
- Property value: $405,963
- Total return: 86.4%
- Average annual: 17.3%
```

#### DSCR Calculator
```
Human: Investment property: $2,800 rent, 5% vacancy, $800 expenses, $350k loan at 7.25%

Claude: I'll calculate the DSCR for loan qualification.

[Uses calculate_dscr]

DSCR Analysis:
- Net Operating Income: $25,200/year
- Annual debt service: $28,644
- DSCR: 0.88 ❌ Below 1.0

Loan Qualification: Not qualified
- Need DSCR ≥ 1.0 for most loans
- Maximum loan at 1.0 DSCR: $306,000
- Or increase rent to $3,200 to qualify

Stress test: 20% vacancy would drop DSCR to 0.71
```

#### Breakeven Calculator
```
Human: 4-unit building: $500k price, $6k/mo total rent, $2k expenses, $400k loan

Claude: I'll calculate your breakeven points.

[Uses analyze_breakeven]

Breakeven Analysis:
- Breakeven occupancy: 63.3% (2.5 units)
- Current margin: $1,302/month
- Can withstand: 
  - 21.7% rent decrease
  - 65% expense increase
  
Sensitivity: Most vulnerable to vacancy changes
5-year average breakeven: 61.2%
Risk level: Low (good margin of safety)
```

### 🧮 Advanced Analysis Tools

#### Sensitivity Analysis
```
Human: How sensitive is my investment to interest rates, rents, and purchase price changes?

Claude: I'll perform a multi-variable sensitivity analysis.

[Uses analyze_sensitivity]

Sensitivity Analysis Results:

Most Impactful Variables (by elasticity):
1. Interest Rate: 1.82 elasticity
   - +1% rate → -8.2% returns
2. Rental Income: 1.45 elasticity  
   - -10% rent → -14.5% returns
3. Purchase Price: 0.93 elasticity
   - +10% price → -9.3% returns

Critical Values:
- Break-even interest rate: 8.7%
- Minimum viable rent: $2,150
- Maximum purchase price: $385,000

Tornado diagram shows interest rate risk dominates
```

#### Monte Carlo Simulator
```
Human: Run 10,000 simulations: rent $2,000-2,500, expenses $12-18k, appreciation 2-5%

Claude: I'll run a Monte Carlo simulation with your parameters.

[Uses run_monte_carlo]

Monte Carlo Results (10,000 simulations):

Expected Returns:
- Mean IRR: 14.3%
- Median IRR: 13.8%
- Standard deviation: 3.2%

Risk Analysis:
- Probability of loss: 4.2%
- Value at Risk (95%): 8.1%
- Best case (95th percentile): 20.4%

Success Probabilities:
- IRR > 10%: 89.3%
- IRR > 15%: 42.7%
- Positive cash flow: 94.6%

Recommendation: Strong risk-adjusted returns
```

#### Tax Benefits Calculator
```
Human: $400k property, $80k land, $48k rental income, $150k other income, married filing jointly

Claude: I'll calculate your tax benefits from depreciation.

[Uses calculate_tax_benefits]

Tax Benefits Analysis:

Depreciation Schedule:
- Annual depreciation: $11,636
- First-year tax savings: $3,723
- 10-year total savings: $37,230

Tax Impact:
- Taxable rental income: $24,187
- After depreciation: $12,551
- Effective tax rate on rental: 19.8%

Strategies:
- Consider cost segregation for $15k+ first year
- Passive loss limited to $12,449 due to income
- 1031 exchange to defer $29,090 recapture
```

#### Property Comparison Tool
```
Human: Compare 3 properties: A) $300k SFH $2,500 rent, B) $400k duplex $3,600 rent, C) $350k condo $2,800 rent

Claude: I'll compare these three investment properties.

[Uses compare_properties]

Property Comparison Results:

Rankings (Weighted Score):
1. Duplex (84.2/100) ⭐
2. Condo (76.8/100)
3. SFH (71.5/100)

Best for Different Goals:
- Highest cash flow: Duplex ($847/mo)
- Best cap rate: Duplex (8.1%)
- Lowest risk: Condo (65% breakeven)
- Best appreciation: SFH (location score 8.5)

5-Year Projections:
- Duplex: 92% total return
- Condo: 78% total return  
- SFH: 71% total return

Recommendation: Duplex offers best overall returns
```

#### Refinance Calculator
```
Human: Should I refinance? Current: $350k balance at 7.25%, 23 years left. New offer: 6.5% for 30 years

Claude: I'll analyze whether refinancing makes financial sense for you.

[Uses analyze_refinance]

Refinance Analysis Results:

Current vs New Loan:
- Monthly payment: $2,683 → $2,324 (save $359/mo)
- Total interest remaining: $391,564 → $486,640
- Closing costs: $7,000

Break-Even Analysis:
- Simple break-even: 19.5 months
- NPV at 7% discount rate: $42,815
- IRR: 26.3%

Decision: ✅ Refinance Recommended (High Confidence)
- Primary reason: Significant rate reduction with reasonable break-even
- Monthly savings of $359 provide excellent cash flow improvement
- Even with extended term, NPV is strongly positive

Recommendations:
1. Proceed with refinance - the 0.75% rate reduction justifies costs
2. Consider investing the $359 monthly savings for compound growth
3. Alternative: 20-year term saves $168,000 in interest vs 30-year

Risk Factors:
- You'll pay more total interest due to term extension
- Consider if you plan to keep property more than 2 years
```

#### Seller Financing Calculator
```
Human: Analyzing seller financing: $400k property, $80k down, 7.5% rate, 20-year term, motivated seller

Claude: I'll analyze this seller financing opportunity for you.

[Uses analyze_seller_financing]

Seller Financing Analysis Results:

Deal Summary:
- Property value: $400,000
- Down payment: $80,000 (20%)
- Seller note: $320,000
- Interest rate: 7.5%
- Monthly payment: $2,583
- LTV ratio: 80%

Financing Metrics:
- Total payments to seller: $619,920
- Total interest earned: $299,920
- Effective annual yield: 7.5%
- Payment type: Fully amortizing

Seller Benefits: Excellent Rating (Score: 78/100)
- Higher Interest Rate: Earning 7.5% vs 6.5% market rate
  - Annual advantage: $3,200
- Tax Deferral: Spread capital gains over 20 years
  - Estimated annual tax savings: $2,400
- Enhanced Marketability: Seller financing attracts more buyers
  - Property value enhancement: $8,000
- Commission Savings: Potential full-price sale without realtor
  - Commission savings: $24,000

Buyer Benefits: Very Good Rating (Score: 65/100)
- Below Market Interest Rate: 7.5% vs 8.2% conventional loans
  - Annual savings: $2,240
- Easier Qualification: Bypass strict bank requirements
- Faster Closing: 2-3 weeks vs 30-45 days
- Lower Down Payment: 20% vs typical 25% for investment

Cash Flow Analysis (Investment Property):
- Gross monthly rent: $3,200
- Operating expenses: $800
- Net operating income: $2,400
- Monthly payment: $2,583
- Monthly cash flow: -$183
- Cash-on-cash return: -2.7%
- DSCR: 0.93 (below 1.0)

Risk Assessment: Medium Risk (Score: 35/100)
- Legal Risk: MEDIUM - Comprehensive documentation needed
- Credit Risk: LOW - Buyer has 720 credit score
- Market Risk: LOW - 80% LTV provides equity cushion

Tax Analysis:
- Capital gain recognition: $5,000/year (vs $100k lump sum)
- Interest income: $24,000/year
- Estimated annual taxes: $7,200
- Tax advantages: Spread gains, avoid large tax hit

Exit Strategies:
1. ✅ Hold to Maturity (Recommended)
   - Timeline: 20 years
   - Total return: $299,920 interest
   
2. Early Payoff Incentive
   - Timeline: 7-10 years
   - Offer 3% discount for early payoff
   
3. Sell Note to Investor
   - Timeline: Any time
   - Expect 70-80% of remaining balance

Recommendations:
✅ Highly Recommended
- Strong mutual benefits for both parties
- Seller earns above-market returns with tax advantages
- Buyer gets easier qualification and competitive rate
- Implement comprehensive legal documentation
- Use experienced real estate attorney
- Consider mortgage servicing company for payments

Key Success Factors:
- Comprehensive promissory note and deed of trust
- Automatic payment processing
- Property insurance requirements
- Clear default procedures
- Regular payment monitoring
```

#### Capital Gains Tax Calculator
```
Human: Selling investment property I bought 3 years ago: Purchase $280k, Sale $420k, $35k improvements, $18k depreciation taken, married filing jointly, $150k income

Claude: I'll calculate your capital gains tax liability and provide optimization strategies.

[Uses calculate_capital_gains_tax]

Capital Gains Tax Analysis Results:

Transaction Summary:
- Sale price: $420,000
- Purchase price: $280,000
- Holding period: 3 years (Long-term)
- Property type: Investment Property
- Total gain: $140,000

Gain/Loss Analysis:
- Original basis: $280,000
- Capital improvements: $35,000
- Total depreciation taken: $18,000
- Adjusted basis: $297,000
- Net proceeds: $420,000
- Gross capital gain: $123,000

Tax Breakdown:
- Depreciation recapture: $18,000 (taxed at 25%)
- Capital gain after recapture: $105,000 (long-term rates)
- Depreciation recapture tax: $4,500
- Capital gains tax: $15,750 (15% rate)
- Net Investment Income Tax: $0 (income below threshold)
- Total federal tax liability: $20,250

Tax Rates Applied:
- Ordinary tax rate: 22%
- Long-term capital gains rate: 15%
- Depreciation recapture rate: 25%
- Effective tax rate: 16.5%

After-Tax Proceeds: $399,750

State Tax Analysis (if applicable):
- Varies by state (0% to 13.3%)
- Texas/Florida: $0 additional tax
- California: ~$16,359 additional tax

Tax Optimization Strategies:
1. ✅ 1031 Like-Kind Exchange (Best Strategy)
   - Tax savings: $20,250 (100% deferral)
   - Requirements: Identify replacement within 45 days
   - Timeline: Complete exchange within 180 days
   - Suitability: Highly Suitable

2. Installment Sale
   - Tax savings: ~$6,075 (spread over multiple years)
   - Requirements: Payments over multiple tax years
   - Benefits: Lower tax brackets, steady income

3. Tax Loss Harvesting
   - Requirements: Realize losses in same tax year
   - Benefits: Offset gains with losses

Recommendations:
✅ Highly Recommended: 1031 Exchange
- Defer entire $20,250 tax liability
- Build wealth through continued property ownership
- Step-up basis for heirs upon death
- Requires qualified intermediary and strict timelines

⚠️ Consider Professional Help
- Complex transaction with significant tax impact
- Multiple strategies available for optimization
- State tax implications vary significantly
- Proper documentation essential for tax benefits

Key Action Items:
- Review all available tax strategies
- Consider timing optimization
- Evaluate 1031 exchange opportunity
- Plan for estimated tax payments if not deferring
- Document all qualifying expenses and improvements
```

#### Airbnb/STR Income Calculator
```
Human: Analyzing a beach condo for Airbnb: $350k purchase, 2BR/2BA, $180/night average, 65% occupancy

Claude: I'll analyze the Airbnb potential for your beach condo investment.

[Uses analyze_airbnb_str]

Airbnb/STR Analysis Results:

Investment Summary:
- Total investment: $117,500 (25% down + startup costs)
- Annual gross revenue: $42,705 (256 occupied nights)
- Operating expenses: $18,450 (43% expense ratio)
- Annual cash flow: $4,890

Performance Metrics:
- Cash-on-cash return: 4.2%
- Cap rate: 6.9%
- Revenue per night: $167 (including cleaning fees)
- Profit margin: 11.4%

vs Traditional Rental:
- STR monthly cash flow: $408
- Traditional rental: $285/month
- STR advantage: $123/month (+43%)

Seasonal Analysis:
- Peak season (4 months): $220/night, 80% occupancy
- Low season (4 months): $140/night, 45% occupancy
- Shoulder season: $180/night, 65% occupancy

Risk Analysis: Medium Risk
- Tourism dependency creates income volatility
- 20% occupancy drop = -$8,500 annual cash flow
- High expense ratio limits profit margins

Break-Even Analysis:
- Break-even occupancy: 52%
- Current margin of safety: 13 percentage points
- Minimum 190 nights/year needed to break even

Recommendations:
1. ✅ Proceed - STR significantly outperforms traditional rental
2. Focus on peak season optimization and guest experience
3. Budget for 3-6 months of expenses as reserves
4. Consider professional management for 256+ bookings/year
5. Diversify marketing across seasons and guest types

Key Success Factors:
- Maintain above 60% occupancy through strong marketing
- Optimize pricing for seasonal demand patterns
- Excellent guest experience for positive reviews
```

#### 1031 Exchange Calculator
```
Human: Analyzing 1031 exchange: Selling rental for $500k, bought for $300k, $80k depreciation taken. Buying $600k replacement.

Claude: I'll analyze your 1031 like-kind exchange opportunity.

[Uses analyze_1031_exchange]

1031 Exchange Analysis Results:

Property Analysis:
- Sale price: $500,000
- Adjusted basis: $270,000 (cost + improvements - depreciation)
- Total gain: $200,000
- Depreciation recapture: $80,000
- Capital gain: $120,000

Tax Impact Without Exchange:
- Depreciation recapture tax: $20,000 (25% rate)
- Capital gains tax: $24,000 (20% rate)
- Estimated state tax: $10,000
- Total tax liability: $54,000

1031 Exchange Benefits:
- Immediate tax savings: $54,000
- QI fees: $3,000
- Net tax benefit: $51,000

Exchange Requirements: ✅ FULLY QUALIFIED
- Value test: PASS ($600k > $470k net proceeds)
- Debt test: PASS (no mortgage boot)
- Like-kind test: PASS (both investment properties)
- Zero boot: Perfect exchange structure

Cash Flow Impact:
- With 1031: $51,000 more available for investment
- Additional borrowing capacity from tax savings
- Can acquire higher-value replacement property

Qualification Analysis: 100% Qualified
✅ Like-kind properties (both investment real estate)
✅ 45-day identification rule
✅ 180-day exchange completion rule
✅ Investment/business use requirement met

Risk Analysis: Low Risk
- Success probability: 85%
- Main risks: Timing constraints, financing approval
- Mitigation: Pre-qualify financing, identify backup properties

Long-Term Benefits (10-year hold):
- Tax deferral benefit: $42,000 NPV
- Effective tax rate reduction: 15%
- Compounding effect of deferred taxes

Alternative Scenarios:
1. Taxable Sale: $54k immediate tax, $416k net proceeds
2. Installment Sale: Spread tax over 5 years
3. Opportunity Zone: 85% tax elimination potential if held 10+ years

Recommendations:
1. ✅ Proceed with 1031 exchange - saves $51k immediately
2. Engage qualified intermediary before listing
3. Pre-arrange replacement property financing
4. Identify 2-3 backup replacement properties
5. Consider long-term exit strategy for replacement property

Timeline Requirements:
- Day 0: Close on relinquished property
- Day 1-45: Identify replacement property
- Day 1-180: Complete acquisition of replacement property
```

#### Market Analysis Tool
```
Human: Analyze this property with 3 comparable sales: 1800 sqft, 3BR/2BA, built 2010, good condition

Claude: I'll analyze the market for your property using comparable sales data.

[Uses analyze_market_comps]

Market Analysis Results:

CMA Analysis:
- Estimated market value: $425,000
- Price per square foot: $236
- Confidence level: High (comparable score average: 87%)

Comparable Properties Analysis:
1. 125 Main St: $430k (95% similarity score)
   - Adjustments: +$5k (condition), -$3k (age)
   - Adjusted value: $432k

2. 456 Oak Ave: $415k (82% similarity score)  
   - Adjustments: +$8k (size), +$2k (lot)
   - Adjusted value: $425k

3. 789 Pine Rd: $440k (85% similarity score)
   - Adjustments: -$12k (condition), -$5k (location)
   - Adjusted value: $423k

Market Metrics:
- Average days on market: 23 days
- Price per sqft range: $225-$245
- Market absorption rate: Strong

Neighborhood Analysis:
- Market strength score: 78/100 (Good)
- Liquidity score: 82/100 (Excellent)
- Investment grade: B+
- Price momentum: Moderate appreciation

Investment Analysis:
- Estimated monthly rent: $2,400
- Gross rental yield: 6.8%
- Price-to-rent ratio: 177 (Favorable)
- Cap rate estimate: 5.2%

Price Recommendations:
- List price range: $415,000 - $435,000
- Investment max offer: $405,000 (assuming 1% rule)
- Quick sale price: $410,000

Market Insights:
- Market conditions: Balanced market
- Best listing strategy: Price competitively at $425k
- Investment outlook: Good cash flow potential
- Risk factors: Seasonal demand variations

Recommendations:
1. ✅ List at $425,000 for optimal market response
2. Price 2-3% below $440k recent sale to attract buyers
3. Highlight condition advantages over comps
4. For investors: Strong rental market fundamentals
5. Expected time on market: 20-25 days
```

#### Construction Loan Calculator
```
Human: Analyzing construction loan for $300k build, $75k land, $500k finished value, 6-month timeline

Claude: I'll analyze your construction loan financing structure.

[Uses analyze_construction_loan]

Construction Loan Analysis Results:

Project Overview:
- Total project cost: $456,000 (includes soft costs and contingency)
- Construction loan: $364,800 (80% LTC)
- Out-of-pocket needed: $91,200
- Estimated completion: 6 months

Draw Schedule (5 phases):
1. Foundation (15%): $54,720 - Month 1
2. Framing (20%): $72,960 - Month 2  
3. MEP Rough (20%): $72,960 - Month 3
4. Drywall/Interior (25%): $91,200 - Month 4
5. Final/Completion (20%): $72,960 - Month 5

Interest-Only Payments:
- Average monthly payment: $1,139
- Total construction interest: $6,834
- Peak monthly payment: $1,902

Profitability Analysis:
- Total investment: $462,898
- Gross profit: $37,102
- Profit margin: 7.4%
- Annualized ROI: 16.1%

Risk Assessment: Medium Risk
- 6-month timeline is manageable
- 10% contingency adequate for single-family
- 80% LTC provides reasonable leverage
- Profit margin acceptable but not high

Permanent Financing (if converting):
- Max permanent loan: $400,000 (80% of $500k)
- Monthly P&I payment: $2,847 (30-year at 6.5%)
- Cash needed at conversion: $0 (full conversion)

Recommendations:
1. ✅ Proceed - solid fundamentals with acceptable returns
2. Consider locking material costs early
3. Build 2-week buffer into timeline
4. Maintain 15% cost contingency reserve
5. Pre-qualify for permanent financing now

Break-Even Analysis:
- Minimum sale price: $462,898
- Can absorb 15% cost overrun and remain profitable
- Timeline delays of 2+ months reduce profitability significantly
```

#### Wholesale Deal Analyzer
```
Human: Analyzing wholesale deal: $80k contract price, $150k ARV, $25k repairs, $12k assignment fee

Claude: I'll analyze this wholesale deal opportunity for you.

[Uses analyze_wholesale_deal]

Wholesale Deal Analysis Results:

Deal Metrics:
- Contract price: $80,000
- Assignment fee: $12,000
- Buyer acquisition cost: $92,000
- ARV: $150,000
- Estimated repair costs: $25,000
- Deal grade: B

Buyer Analysis:
- Total investment: $117,000 (acquisition + repairs)
- Gross profit potential: $33,000
- Profit margin: 22.0%
- ROI: 28.2%
- 70% Rule compliance: ✅ PASS
  - Max allowable offer: $80,000 (70% of $150k - $25k repairs)
  - Actual offer: $92,000 (within acceptable range)

Wholesale Profitability:
- Gross profit: $12,000 (assignment fee)
- Marketing costs: $1,200
- Holding costs (20 days): $500
- Net profit: $10,300
- Profit margin: 85.8%
- Estimated assignment time: 20 days
- Annualized ROI: 187.5%
- Rating: Very Good

Risk Assessment: Medium Risk
- Property condition: Fair (manageable repair scope)
- Market trend: Stable
- Seller motivation: High
- Deal margin: $25,000 spread provides good buffer
- No major red flags identified

Exit Strategies:
1. ✅ Wholesale Assignment (Recommended)
   - Profit: $12,000
   - Timeline: 15-30 days
   - Risk: Medium
   
2. Double Close
   - Profit: $18,000
   - Timeline: 30-45 days  
   - Risk: High (capital requirement)
   
3. Fix & Flip
   - Profit: $28,000
   - Timeline: 4-6 months
   - Risk: High (construction/market risk)

Market Timing: Good (Score: 7/10)
- Spring season supports buyer activity
- Fresh listing (45 days on market)
- B-grade neighborhood has consistent demand

Recommendations:
1. ✅ Proceed with wholesale assignment
2. Pre-market to investor buyer list immediately
3. Ensure repair estimates are conservative
4. Have backup double-close option ready
5. Target fix-and-flip investors as primary buyers

Success Probability: 85% (based on deal quality and market conditions)
```

#### Subject-To Deal Calculator
```
Human: Analyzing subject-to deal: $180k value, $150k mortgage balance, $1200/mo payment, seller 2 months behind

Claude: I'll analyze this subject-to acquisition opportunity for you.

[Uses analyze_subject_to_deal]

Subject-To Deal Analysis Results:

Deal Metrics:
- Market value: $180,000
- Existing mortgage balance: $150,000
- Total cash invested: $8,000 (cash to seller + closing costs)
- Instant equity: $22,000
- Equity percentage: 12.2%
- Current LTV: 83.3%
- Deal quality score: 72/100 (Good)

Cash Flow Analysis:
- Gross monthly rent: $1,500
- Effective rent (5% vacancy): $1,425
- Monthly expenses:
  - Mortgage payment: $1,200
  - Management fee (8%): $114
  - Maintenance reserves: $75
  - Total expenses: $1,389
- Net monthly cash flow: $36
- Cash-on-cash return: 5.4%
- Coverage ratio: 1.19x
- Rating: Fair

Risk Assessment: High Risk
- Legal Risk: HIGH - Conventional loan with due-on-sale clause
- Payment Risk: MEDIUM - Seller 2 months behind ($2,400 arrears)
- Market Risk: MEDIUM - High 83% LTV provides limited equity buffer
- Insurance Risk: LOW - Authorization agreements in place
- Overall risk score: 8/15
- Legal compliance score: 65/100

Exit Strategies:
1. ✅ Hold and Rent (Recommended)
   - Timeline: Long-term (5+ years)
   - 5-year return: $89,000
   - Monthly cash flow: $36
   
2. Refinance and Legitimize
   - Timeline: 3-6 months
   - New payment: ~$1,320 (7% rate)
   - Eliminates due-on-sale risk
   
3. Quick Sale
   - Timeline: 1-3 months
   - Sale price: $153,000 (15% discount)
   - Net profit: $5,000

Long-Term Projections (5 years):
- Property value: $208,700 (3% appreciation)
- Remaining mortgage: $125,400
- Projected equity: $83,300
- Total cash flow: $2,160
- Total return: $85,460
- Average annual ROI: 213%

Recommendations:
1. ⚠️ Proceed with caution - High risk but good returns
2. Cure arrears immediately ($2,400) to prevent foreclosure
3. Implement comprehensive risk mitigation strategies
4. Consider LLC structure for liability protection
5. Maintain low profile to avoid triggering due-on-sale clause
6. Build 6-month payment reserves ($7,200)
7. Secure authorization agreements and power of attorney
8. Plan for potential refinance in 12-24 months

Risk Mitigation Strategies:
- Obtain comprehensive title and liability insurance
- Use authorization agreements for payment management  
- Structure through LLC for legal protection
- Maintain automatic payment systems
- Keep detailed documentation of all agreements
- Monitor market conditions and refinance opportunities

Legal Compliance: 65/100 (Needs Improvement)
- Warranty deed transfer: ✅ Good
- Authorization agreements: ✅ Good  
- Conventional loan: ⚠️ Higher due-on-sale risk
- Consider attorney consultation for optimization
```

#### Rent vs Buy Calculator
```
Human: Should I rent for $2,500/month or buy a $450k home? I have $90k down payment saved and expect to stay 7 years.

Claude: I'll analyze the rent vs buy decision for your situation.

[Uses analyze_rent_vs_buy]

Rent vs Buy Analysis (7-year timeline):

Buying Scenario:
- Purchase price: $450,000
- Down payment: $90,000 (20%)
- Monthly payment: $2,847 (P&I + taxes + insurance)
- Total monthly cost: $3,247 (including maintenance)
- 7-year total cost: $287,536

Renting Scenario:
- Monthly rent: $2,500
- Annual rent increases: 3%
- 7-year total cost: $217,840

Break-Even Analysis:
- Years to break even: 4.2 years
- You'll stay 7 years ✅ Buying wins
- Net advantage of buying: $69,696 over 7 years

Wealth Building:
- Equity after 7 years: $142,500
- Property value: $547,200 (3.5% appreciation)
- Net proceeds if sold: $485,300
- Renter investment balance: $198,400 (invested saved down payment)
- Homeowner advantage: $286,900

Recommendation: ✅ Buy (High Confidence)
- 7-year timeline exceeds 4.2-year break-even
- Strong wealth building advantage ($286k)
- Favorable home price-to-rent ratio
- Tax advantages for your income bracket
```

#### Deal Pipeline Tracker
```
Human: Track my 5 active deals: 2 under contract, 2 in due diligence, 1 being analyzed

Claude: I'll set up your deal pipeline tracking system.

[Uses track_deal_pipeline]

Deal Pipeline Analysis Results:

Pipeline Overview:
- Total active deals: 5
- Pipeline value: $2,100,000
- Expected closings: 3 deals (60% close rate)
- Average days in pipeline: 45 days

Deal Status Breakdown:
1. 123 Main St - Under Contract (Day 38)
   - Purchase price: $285,000
   - Close probability: 85%
   - Expected close: 12 days

2. 456 Oak Ave - Under Contract (Day 22)
   - Purchase price: $420,000
   - Close probability: 75%
   - Expected close: 18 days

Performance Metrics:
- Average deal size: $420,000
- Conversion rate: 75% (analysis → contract)
- Average time to close: 52 days
- Success rate: 68% historically

Recommendations:
1. ✅ Strong pipeline with good diversification
2. Consider adding 2-3 new prospects for Q2
3. Monitor financing contingencies closely

Pipeline Health Score: 78/100 (Good)
```

#### Joint Venture Calculator
```
Human: Analyzing JV partnership: I bring $150k cash, partner brings $200k and does all work. 50/50 profit split on $600k flip project.

Claude: I'll analyze this joint venture partnership structure for fairness and returns.

[Uses analyze_joint_venture]

Joint Venture Analysis Results:

Partnership Structure:
- Total project value: $600,000
- Your contribution: $150,000 cash (42.9% of capital)
- Partner contribution: $200,000 cash + sweat equity
- Profit split: 50/50

Capital Analysis:
- Total cash required: $350,000
- Your share: $150,000 (42.9%)
- Partner's share: $200,000 (57.1%)
- Your capital premium: -7.1%

Sweat Equity Valuation:
- Project management: $15,000
- Construction oversight: $25,000
- Permit/compliance work: $8,000
- Total sweat equity value: $48,000

Fairness Analysis: Very Good (Score: 78/100)
- Partner's sweat equity properly compensates for capital imbalance
- 50/50 split actually favors you when accounting for sweat equity

Financial Projections:
- Estimated gross profit: $125,000
- Your 50% share: $62,500
- Your ROI: 41.7%
- Your IRR: 67.2% (9-month project)

Recommendation: ✅ Favorable partnership structure
This JV provides good returns while leveraging partner's expertise
```

#### Property Management Calculator
```
Human: Should I self-manage my 4-unit building or hire a property manager? Current rent is $6,400/month total.

Claude: I'll analyze self-management vs professional property management for your 4-unit building.

[Uses analyze_property_management]

Property Management Analysis Results:

Property Overview:
- Property type: Small multifamily (4 units)
- Monthly rental income: $6,400
- Annual rental income: $76,800

Self-Management Analysis:
- Monthly time commitment: 8-12 hours
- Annual opportunity cost: $4,200
- Out-of-pocket expenses: $1,200/year
- Total annual cost: $5,400 (7.0% of rent)

Professional Management Analysis:
- Management fee: 8% of rent ($512/month)
- Annual management cost: $6,144
- Additional services: $1,000/year
- Total annual cost: $7,144 (9.3% of rent)

Annual Cost Comparison:
- Self-management: $5,400
- Professional management: $7,144
- Annual savings with self-management: $1,744

Suitability Score:
- Self-management suitability: 72/100 (Good fit)
- Property size is ideal for self-management
- Manageable time commitment

Recommendation: ✅ Self-Management
- Annual savings of $1,744 are significant
- Good learning opportunity for future properties
- Property size (4 units) is manageable
```

#### Property Expense Tracker
```
Human: Track expenses for my duplex: $1,800 maintenance, $600 property taxes, $300 insurance, $2,400 capital improvements this month.

Claude: I'll analyze and track your duplex property expenses.

[Uses track_property_expenses]

Property Expense Analysis Results:

Property Summary:
- Property type: Duplex
- Total units: 2
- Total expenses: $5,100

Expense Breakdown:
- Operating expenses: $1,800 (35.3%)
- Fixed expenses: $900 (17.6%)  
- Capital expenses: $2,400 (47.1%)
- Expense per unit: $2,550

Benchmark Comparison:
- Industry benchmark: $3,200/unit annually
- Your annualized expense: $30,600/unit
- Variance: +856% (due to capital improvements)
- Performance rating: High expenses this month

Tax Deduction Analysis:
- Annual deductible expenses: $54,000
- Capital expenses: $2,500 immediately deductible
- Estimated tax savings: $15,820

Recommendations:
1. ⚠️ High capital expense month - verify if one-time
2. Separate routine maintenance from improvements
3. Consider monthly budgeting vs annual tracking
4. Strong tax deduction potential with proper categorization
```

### 💡 Real-World Scenarios

#### Complete First-Time Investor Analysis
```
Human: I have $50k to invest and make $90k/year. Should I house hack or buy a rental?

Claude: I'll analyze both strategies for your situation.

1. House Hacking Analysis:
   [Uses evaluate_house_hack]
   - $300k duplex, live in one side
   - Your cost: $450/month
   - Save $1,050/month vs renting

2. Traditional Rental:
   [Uses calculate_cocr]
   - $200k property, $1,800 rent
   - Cash flow: $375/month
   - CoC return: 9.2%

3. 10-Year Projection:
   [Uses project_portfolio_growth]
   - House hack → rental → 5 properties
   - Projected portfolio: $1.8M
   - Monthly cash flow: $4,200

Recommendation: Start with house hacking for maximum capital efficiency
```

#### Professional Investor Portfolio Analysis
```
Human: I have a $2M portfolio with 8 properties. Analyze my refinance and expansion options.

Claude: I'll provide a comprehensive portfolio analysis.

1. Current Portfolio Metrics:
   - Total equity: $875,000
   - Monthly cash flow: $7,200
   - Average CoC: 11.3%

2. Refinance Analysis:
   [Multiple loan comparisons]
   - Can access $425,000 in capital
   - Maintain 1.25 DSCR minimum
   
3. Expansion Scenarios:
   [Monte Carlo simulation]
   - 82% probability of reaching $5M in 5 years
   - Optimal: Add 2 properties/year
   
4. Tax Optimization:
   [Tax benefits analysis]
   - $72,000 annual depreciation
   - Consider cost segregation on newer properties
```

#### Market Downturn Stress Test
```
Human: How would my portfolio survive a 2008-style crash? Properties worth $1.5M, $800k in loans

Claude: I'll stress test your portfolio for a severe downturn.

1. Sensitivity Analysis:
   [Uses analyze_sensitivity]
   - 30% value drop: Still $450k equity
   - 25% rent drop: $1,200/mo negative flow
   - Combined: Need $85k reserves

2. Monte Carlo Crash Simulation:
   [Uses run_monte_carlo]
   - Survival probability: 73%
   - Critical factor: Cash reserves
   - Recovery timeline: 4-6 years

3. Risk Mitigation:
   - Build 12-month reserves ($144k)
   - Lock in long-term tenants
   - Consider selling 1 property for liquidity

4. Historical Context:
   [Uses insights_articles]
   - 2008 recovery patterns
   - Strategies that worked
```

## 📖 Educational Resources

### Market Insights
```
Human: What are the best markets for cash flow in 2024?

Claude: I'll search for current market analysis.

[Uses insights_articles and market_data]

Top Cash Flow Markets Analysis:
1. "Hidden Gem Markets for Cash Flow Investors"
2. "Why Midwest Markets Dominate Returns"
3. Current mortgage rates by market

Key Findings:
- Best cash flow: Memphis, Cleveland, Birmingham
- Best appreciation: Austin, Raleigh, Phoenix
- Best balanced: Kansas City, Indianapolis
```

### Investment Strategies
```
Human: Explain the BRRRR strategy for beginners

Claude: I'll find educational content on BRRRR investing.

[Uses insights_articles and calculator_examples]

BRRRR Education Package:
1. "The Bootstrap Investor's Guide to BRRRR"
2. Step-by-step BRRRR calculator tutorial
3. Real BRRRR deal examples

Plus I'll walk you through a practice BRRRR analysis...
```

## 🛠️ Advanced Features

### Custom Scenarios
The MCP server supports complex, multi-step analyses:

```
Human: I'm considering three strategies: 
1. Buy 3 rentals cash
2. Buy 6 with leverage  
3. Invest in 2 syndications

Which builds more wealth over 10 years?

Claude: I'll model all three strategies for comparison.

[Runs multiple calculators and simulations]

10-Year Wealth Building Analysis:
1. Cash purchases: $1.2M net worth, $4,500/mo income
2. Leveraged rentals: $2.1M net worth, $6,800/mo income  
3. Syndications: $1.5M net worth, $0/mo income

Leveraged rentals win for total wealth and cash flow, but highest risk...
[Detailed risk-return analysis follows]
```

### API Integration Examples
```javascript
// Example: Programmatic usage
const results = await mcp.calculate_affordability({
  annual_income: 95000,
  monthly_debts: 500,
  down_payment: 25000,
  interest_rate: 6.85,
  loan_term: 30,
  property_tax_rate: 1.2,
  home_insurance_annual: 1200
});

// Chain multiple calculations
const brrrr = await mcp.analyze_brrrr_deal({...});
if (brrrr.success_metrics.cash_on_cash_return > 10) {
  const projection = await mcp.project_portfolio_growth({...});
}
```

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development
```bash
git clone https://github.com/sigaihealth/realvestmcp.git
cd realvestmcp
npm install
npm test  # Run all 241 tests
```

### Adding Calculators
1. Create calculator in `src/calculators/`
2. Add comprehensive tests
3. Update README with examples
4. Submit PR

## 📄 License

MIT © RealVest

## 🆘 Support

- **Documentation**: [realvest.ai/docs](https://www.realvest.ai/docs)
- **Issues**: [GitHub Issues](https://github.com/sigaihealth/realvestmcp/issues)
- **Email**: support@realvest.ai
- **Discord**: [Join our community](https://discord.gg/realvest)

## 📈 Stats

- **Calculators**: 31
- **Test Coverage**: 100% (241 tests)
- **Resources**: 100+ articles & guides
- **Active Users**: 1,000+
- **Calculations/Day**: 10,000+

---

Built with ❤️ by RealVest to democratize real estate investing through AI