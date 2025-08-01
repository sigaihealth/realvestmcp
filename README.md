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

### Affordability Analysis
```javascript
// Request
{
  "tool": "calculate_affordability",
  "arguments": {
    "annual_income": 95000,
    "monthly_debts": 500,
    "down_payment": 20000,
    "interest_rate": 7.5
  }
}

// Response includes:
// - Maximum affordable home price
// - Monthly payment breakdown
// - Debt-to-income ratios
// - PMI requirements
```

### BRRRR Deal Analysis
```javascript
// Request
{
  "tool": "analyze_brrrr_deal",
  "arguments": {
    "purchase_price": 150000,
    "rehab_cost": 35000,
    "after_repair_value": 220000,
    "monthly_rent": 1800
  }
}

// Response includes:
// - Cash needed upfront
// - Cash out at refinance
// - Monthly cash flow
// - Return on investment
// - Deal rating and recommendations
```

## API Reference

See the [full documentation](https://github.com/sigaihealth/realvestmcp/tree/main/docs) for detailed API reference.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © RealVest

## Support

- Documentation: [https://www.realvest.ai](https://www.realvest.ai)
- Issues: [GitHub Issues](https://github.com/sigaihealth/realvestmcp/issues)
- Discord: [Join our community](https://discord.gg/realvest)