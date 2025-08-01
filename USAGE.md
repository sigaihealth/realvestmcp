# Using RealVest MCP Server

Now that the MCP server is published to NPM, here's how to use it:

## Installation

```bash
npm install -g @realvest/mcp-server
```

## Configuration

Add the following to your MCP settings file (e.g., `~/.config/claude/mcp.json`):

```json
{
  "servers": {
    "realvest": {
      "command": "npx",
      "args": ["@realvest/mcp-server"],
      "description": "RealVest real estate calculators and resources"
    }
  }
}
```

Or if installed globally:

```json
{
  "servers": {
    "realvest": {
      "command": "realvest-mcp",
      "description": "RealVest real estate calculators and resources"
    }
  }
}
```

## Available Tools

Once configured, AI assistants will have access to:

### Calculators
- `calculate_affordability` - Calculate home affordability based on income
- `analyze_brrrr_deal` - Analyze BRRRR investment deals
- `evaluate_house_hack` - Evaluate house hacking opportunities
- `project_portfolio_growth` - Project real estate portfolio growth
- `analyze_syndication` - Analyze syndication investments

### Resources
- `insights_articles` - Access educational real estate articles
- `state_assistance_programs` - Get down payment assistance info
- `market_data` - Current mortgage rates and market trends
- `calculator_examples` - Example scenarios for all calculators

## Example Usage

Ask your AI assistant:
- "Use RealVest to calculate what home I can afford with $75k income"
- "Analyze this BRRRR deal: $150k purchase, $35k rehab, $220k ARV"
- "Show me down payment assistance programs in Texas"
- "Project my portfolio growth with $50k starting capital"

## NPM Package

- Package: [@realvest/mcp-server](https://www.npmjs.com/package/@realvest/mcp-server)
- Version: 0.1.0
- License: MIT
- Source: [GitHub](https://github.com/sigaihealth/realvestai/tree/main/mcp-server)

## Support

For issues or questions:
- GitHub Issues: https://github.com/sigaihealth/realvestai/issues
- Email: support@realvest.ai