# @realvest/mcp-server

An MCP (Model Context Protocol) server that provides AI assistants with direct access to RealVest.ai's real estate investment calculators and educational resources. Perfect for integrating real estate analysis capabilities into Claude and other AI assistants.

[![npm version](https://badge.fury.io/js/@realvest%2Fmcp-server.svg)](https://www.npmjs.com/package/@realvest/mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

### Tools
- **calculate_affordability** - Calculate home affordability based on income and debts
- **analyze_brrrr_deal** - Analyze BRRRR (Buy, Rehab, Rent, Refinance, Repeat) deals
- **evaluate_house_hack** - Calculate returns from house hacking strategies
- **project_portfolio_growth** - Project real estate portfolio growth over time
- **analyze_syndication** - Evaluate syndication investment opportunities

### Resources
- **insights_articles** - Access educational articles and market insights
- **state_assistance_programs** - Get down payment assistance programs by state
- **market_data** - Current mortgage rates and market conditions
- **calculator_examples** - Example scenarios for each calculator

## Installation

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

## Usage

### With Claude Desktop

1. Add to your Claude Desktop configuration:

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

2. Restart Claude Desktop

3. Use in conversations:
```
Human: Can I afford a $400,000 house with my $95,000 salary and $20,000 down payment?

Claude: I'll help you determine if you can afford a $400,000 house. Let me calculate that for you using RealVest's affordability calculator.

[Uses calculate_affordability tool]

Based on your financial situation...
```

## Example Usage

### 🏠 Affordability Calculator

**Use Case 1: First-Time Home Buyer**
```
Human: I make $75,000 a year and have saved $20,000 for a down payment. I have $500 in monthly debts. What can I afford?

Claude: I'll calculate what you can afford using the RealVest affordability calculator.

[Uses calculate_affordability with your inputs]

Based on your finances:
- Maximum home price: $305,000
- Monthly payment: $2,050
- You'll need PMI since down payment is 6.6%
```

**Use Case 2: Comparing Loan Terms**
```
Human: I make $150,000/year. Compare what I can afford with a 15-year vs 30-year mortgage.

Claude: I'll compare both scenarios for you...
[Runs two calculations showing higher purchase price with 30-year but lower total interest with 15-year]
```

### 🔄 BRRRR Deal Analysis

**Use Case 1: Single Family BRRRR**
```
Human: I found a distressed property for $85,000 that needs $45,000 in repairs. ARV is $175,000 and it should rent for $1,400. Is this a good BRRRR deal?

Claude: Let me analyze this BRRRR opportunity for you.

[Uses analyze_brrrr_deal]

Results:
- Total investment needed: $130,000
- Cash out at refinance: $1,250
- Monthly cash flow: $225
- Annual ROI: 42%
- Rating: Good deal! The 75% LTV refinance nearly returns all your capital.
```

**Use Case 2: Multi-Family BRRRR**
```
Human: Analyzing a duplex: $225k purchase, $65k rehab, $385k ARV, total rents $3,200/month

Claude: I'll evaluate this multi-family BRRRR deal...
[Provides detailed analysis including cash-on-cash return and refinance scenarios]
```

### 🏘️ House Hacking Calculator

**Use Case 1: FHA Duplex**
```
Human: I want to buy a $385,000 duplex with FHA financing. The other unit rents for $1,800. How much will I save?

Claude: I'll calculate your house hacking savings.

[Uses evaluate_house_hack]

Your results:
- Down payment needed: $13,475 (3.5%)
- Your housing cost: $900/month
- Compared to renting: Save $1,500/month
- Building equity while living almost free!
```

**Use Case 2: Single Family with ADU**
```
Human: Looking at a $425,000 house with a basement apartment that rents for $1,400. Worth it?

Claude: Let me analyze this house hacking opportunity...
[Shows how rental income reduces effective housing cost by 45%]
```

### 📈 Portfolio Growth Projector

**Use Case 1: Conservative Strategy**
```
Human: I have $50,000 to start and can save $15,000/year. Show me a 20-year projection buying one property every 2 years.

Claude: I'll project your portfolio growth with a conservative buy-and-hold strategy.

[Uses project_portfolio_growth]

20-year projection:
- Properties owned: 10
- Portfolio value: $3.2 million
- Monthly cash flow: $8,500
- Total equity: $1.8 million
```

**Use Case 2: Aggressive BRRRR Strategy**
```
Human: What if I do BRRRR deals every 9 months with $75,000 starting capital?

Claude: Let me model an aggressive BRRRR strategy...
[Shows potential for 25+ properties and $5M+ portfolio value]
```

### 🏢 Syndication Analysis

**Use Case 1: Evaluating a Deal**
```
Human: I'm looking at a syndication: $50k minimum, 7% preferred return, 70/30 split, 15.5% projected IRR over 5 years. Should I invest?

Claude: I'll analyze this syndication opportunity for you.

[Uses analyze_syndication]

Analysis:
- Total return on $50k: $97,500
- Average annual return: 14.3%
- Risk assessment: Moderate
- The 7% preferred return provides downside protection
```

**Use Case 2: Comparing Multiple Syndications**
```
Human: Compare a value-add deal (15% IRR) vs a development deal (22% IRR) vs a stabilized property (12% IRR)

Claude: I'll compare these three syndication types...
[Provides risk/return analysis for each type]
```

### 📚 Educational Resources

**Use Case 1: Finding Articles**
```
Human: I want to learn about investing during high interest rates

Claude: I'll search RealVest's educational articles for you.

[Uses insights_articles resource]

Found relevant articles:

1. **How Real Estate Investors Thrived When Mortgage Rates Hit 18%**
   - Summary: Historical lessons from the 1980s high-rate environment and strategies that worked
   - Link: https://www.realvest.ai/insights/high-rate-investing-history.html

2. **The Mortgage Rate Trap**
   - Summary: Why waiting for perfect rates costs more than investing now
   - Link: https://www.realvest.ai/insights/mortgage-rate-trap.html

3. **When Real Estate Gets Real: The Dark Side Nobody Talks About**
   - Summary: Honest look at challenges and how to overcome them
   - Link: https://www.realvest.ai/insights/messy-reality-real-estate.html
```

**Use Case 2: Market Research**
```
Human: What's the best real estate investing strategy for beginners in 2024?

Claude: Let me find beginner-focused content for you.

[Uses insights_articles resource]

Recommended reading for beginners:

1. **The Bootstrap Investor's Guide: Building Real Estate Wealth from Zero**
   - Summary: Start investing with $5,000 or less. Proven strategies for building wealth from zero
   - Link: https://www.realvest.ai/insights/bootstrap-real-estate-wealth.html

2. **The Eternal Window Shopper: Real Estate Analysis Paralysis**
   - Summary: Stop overthinking & start investing. Simple framework to make confident decisions
   - Link: https://www.realvest.ai/insights/analysis-paralysis-trap.html

3. **Fatal Real Estate Mistakes That Cost Investors Thousands**
   - Summary: Learn from others' costly errors before making your first investment
   - Link: https://www.realvest.ai/insights/fatal-real-estate-mistakes.html
```

### 🏛️ State Assistance Programs

**Use Case 1: State-Specific Help**
```
Human: What down payment assistance is available in Texas?

Claude: I'll look up Texas down payment assistance programs.

[Uses state_assistance_programs resource]

Texas programs:
- My First Texas Home: Up to 5% assistance
- Income limits: $95,500-$146,400
- Must be first-time buyer
- Contact: 800.792.1119
```

**Use Case 2: Comparing States**
```
Human: I can relocate. Which states have the best first-time buyer programs?

Claude: I'll compare assistance programs across states...
[Shows top states with most generous programs]
```

### 📊 Market Data

**Use Case 1: Current Rates**
```
Human: What are current mortgage rates?

Claude: I'll get you the latest mortgage rates.

[Uses market_data resource]

Current rates (as of today):
- 30-year fixed: 6.85%
- 15-year fixed: 6.02%
- FHA 30-year: 6.45%
- VA 30-year: 6.25%
- Trend: Up 0.12% from last week
```

**Use Case 2: Market Analysis**
```
Human: How's the Phoenix real estate market doing?

Claude: Let me check Phoenix market data...
[Provides median prices, inventory, YoY changes, and market temperature]
```

### 💡 Combined Analysis Examples

**Complete First-Time Buyer Analysis**
```
Human: I'm a first-time buyer in Florida making $80k/year with $15k saved. Walk me through my options.

Claude: I'll provide a comprehensive analysis of your home buying options.

1. First, let me check what you can afford...
   [Uses calculate_affordability]
   
2. Now let's look at Florida assistance programs...
   [Uses state_assistance_programs]
   
3. Here are current mortgage rates...
   [Uses market_data]
   
4. And some educational resources...
   [Uses insights_articles]

Based on all this data: You can afford up to $285k, qualify for $7,500 in state assistance...
```

**Investment Property Analysis**
```
Human: I have $100k to invest. Should I do BRRRR, house hacking, or syndications?

Claude: I'll analyze all three strategies with your capital.

1. BRRRR potential...
   [Runs BRRRR analysis]
   
2. House hacking option...
   [Runs house hack evaluation]
   
3. Syndication alternative...
   [Runs syndication analysis]
   
4. 20-year projections for each...
   [Runs portfolio projections]

Recommendation based on your goals...
```

## API Reference

For detailed API reference, check the source code and examples provided in this repository.

## 🎓 Additional Resources

- [Detailed Use Cases](examples/detailed-use-cases.md) - Comprehensive examples for every feature
- [Quick Reference Guide](examples/quick-reference.md) - Handy cheat sheet for all tools and resources
- [Calculator Examples](examples/usage-examples.md) - Sample calculations with expected outputs

## ❓ Frequently Asked Questions

### General Questions

**Q: What AI assistants support MCP?**
A: Currently, Claude Desktop supports MCP. More assistants are expected to add support soon.

**Q: Do I need to pay for RealVest.ai to use this?**
A: No, the MCP server is free and open source. It provides access to calculators and public educational content.

**Q: How accurate are the calculations?**
A: Calculations use industry-standard formulas. However, always verify with professionals for actual transactions.

### Technical Questions

**Q: Can I use this with the Claude API?**
A: This is designed for Claude Desktop. For API usage, you'd need to implement your own integration.

**Q: How often is market data updated?**
A: Market data is updated periodically. For real-time data, consult professional sources.

**Q: Can I modify the calculators?**
A: Yes! The code is open source. Fork the repository and customize as needed.

### Usage Questions

**Q: The affordability calculator shows I can't afford anything. What should I do?**
A: Try:
- Reducing monthly debts to improve DTI
- Saving a larger down payment
- Considering different locations
- Looking into state assistance programs

**Q: How do I compare multiple investment strategies?**
A: Run each calculator with your numbers, then use the portfolio projector to see long-term outcomes of each strategy.

**Q: Which calculator should I use for flipping houses?**
A: While there's no dedicated flip calculator, you can use the BRRRR calculator with a 100% "refinance" (sale) at the ARV.

### Troubleshooting

**Q: Claude says the MCP server isn't available**
A: 
1. Ensure the server is properly configured in Claude Desktop settings
2. Restart Claude Desktop
3. Check that Node.js is installed and working

**Q: Calculations seem wrong**
A: Double-check your inputs, especially:
- Interest rates (use percentages, e.g., 6.85 not 0.0685)
- All monetary values in dollars
- Ensure all required fields are provided

**Q: How do I get help?**
A: 
- Check the [detailed examples](examples/detailed-use-cases.md)
- Open an issue on [GitHub](https://github.com/sigaihealth/realvestmcp/issues)
- Email support@realvest.ai

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
```bash
git clone https://github.com/sigaihealth/realvestmcp.git
cd realvestmcp
npm install
npm test
```

### Adding New Features
1. Add calculator logic in `src/calculators/`
2. Add resources in `src/resources/`
3. Update tests in `test/`
4. Submit PR with description

## License

MIT © RealVest

## Support

- Documentation: [https://www.realvest.ai](https://www.realvest.ai)
- Issues: [GitHub Issues](https://github.com/sigaihealth/realvestmcp/issues)
- Discord: [Join our community](https://discord.gg/realvest)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

Built with ❤️ by RealVest to democratize real estate investing through AI