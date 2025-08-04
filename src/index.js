#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Import calculators
import { AffordabilityCalculator } from './calculators/affordability.js';
import { BRRRRCalculator } from './calculators/brrrr.js';
import { HouseHackingCalculator } from './calculators/house-hacking.js';
import { PortfolioSimulator } from './calculators/portfolio.js';
import { SyndicationAnalyzer } from './calculators/syndication.js';
import { MortgageAffordabilityCalculator } from './calculators/mortgage-affordability.js';
import { DebtToIncomeCalculator } from './calculators/debt-to-income.js';
import { IRRCalculator } from './calculators/irr.js';
import { FixFlipCalculator } from './calculators/fix-flip.js';
import { LoanComparisonTool } from './calculators/loan-comparison.js';
import { NPVCalculator } from './calculators/npv.js';
import { COCRCalculator } from './calculators/cocr.js';
import { DSCRCalculator } from './calculators/dscr.js';
import { BreakevenCalculator } from './calculators/breakeven.js';
import { SensitivityAnalysisCalculator } from './calculators/sensitivity-analysis.js';
import { MonteCarloSimulator } from './calculators/monte-carlo.js';
import { TaxBenefitsCalculator } from './calculators/tax-benefits.js';
import { PropertyComparisonTool } from './calculators/property-comparison.js';

// Import resources
import { InsightsResource } from './resources/insights.js';
import { StateAssistanceResource } from './resources/state-assistance.js';
import { MarketDataResource } from './resources/market-data.js';

// Create server instance
const server = new Server({
  name: 'realvest-mcp',
  version: '1.0.0',
  description: 'MCP server for RealVest.ai real estate investment tools'
}, {
  capabilities: {
    tools: true,
    resources: true
  }
});

// Initialize calculators
const affordabilityCalc = new AffordabilityCalculator();
const brrrrCalc = new BRRRRCalculator();
const houseHackingCalc = new HouseHackingCalculator();
const portfolioSim = new PortfolioSimulator();
const syndicationAnalyzer = new SyndicationAnalyzer();
const mortgageAffordabilityCalc = new MortgageAffordabilityCalculator();
const debtToIncomeCalc = new DebtToIncomeCalculator();
const irrCalc = new IRRCalculator();
const fixFlipCalc = new FixFlipCalculator();
const loanComparisonTool = new LoanComparisonTool();
const npvCalc = new NPVCalculator();
const cocrCalc = new COCRCalculator();
const dscrCalc = new DSCRCalculator();
const breakevenCalc = new BreakevenCalculator();
const sensitivityCalc = new SensitivityAnalysisCalculator();
const monteCarloSim = new MonteCarloSimulator();
const taxBenefitsCalc = new TaxBenefitsCalculator();
const propertyComparisonTool = new PropertyComparisonTool();

// Initialize resources
const insightsResource = new InsightsResource();
const stateAssistanceResource = new StateAssistanceResource();
const marketDataResource = new MarketDataResource();

// Register tools
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'calculate_affordability',
        description: 'Calculate how much house you can afford based on income, debts, and down payment',
        inputSchema: affordabilityCalc.getSchema()
      },
      {
        name: 'analyze_brrrr_deal',
        description: 'Analyze a BRRRR (Buy, Rehab, Rent, Refinance, Repeat) real estate deal',
        inputSchema: brrrrCalc.getSchema()
      },
      {
        name: 'evaluate_house_hack',
        description: 'Calculate returns from house hacking (living in one unit and renting others)',
        inputSchema: houseHackingCalc.getSchema()
      },
      {
        name: 'project_portfolio_growth',
        description: 'Project real estate portfolio growth over 20 years',
        inputSchema: portfolioSim.getSchema()
      },
      {
        name: 'analyze_syndication',
        description: 'Evaluate a real estate syndication investment opportunity',
        inputSchema: syndicationAnalyzer.getSchema()
      },
      {
        name: 'calculate_mortgage_affordability',
        description: 'Advanced mortgage affordability calculator with dual income and detailed DTI analysis',
        inputSchema: mortgageAffordabilityCalc.getSchema()
      },
      {
        name: 'analyze_debt_to_income',
        description: 'Analyze debt-to-income ratios for mortgage qualification with different loan types',  
        inputSchema: debtToIncomeCalc.getSchema()
      },
      {
        name: 'calculate_irr',
        description: 'Calculate Internal Rate of Return (IRR) for real estate investments with cash flow analysis',
        inputSchema: irrCalc.getSchema()
      },
      {
        name: 'analyze_fix_flip',
        description: 'Analyze profitability of fix and flip real estate investments with detailed cost breakdown',
        inputSchema: fixFlipCalc.getSchema()
      },
      {
        name: 'compare_loans',
        description: 'Compare multiple mortgage loan scenarios side by side to find the best option',
        inputSchema: loanComparisonTool.getSchema()
      },
      {
        name: 'calculate_npv',
        description: 'Calculate Net Present Value for real estate investment decisions',
        inputSchema: npvCalc.getSchema()
      },
      {
        name: 'calculate_cocr',
        description: 'Calculate Cash-on-Cash Return with detailed expense analysis and projections',
        inputSchema: cocrCalc.getSchema()
      },
      {
        name: 'calculate_dscr',
        description: 'Calculate Debt Service Coverage Ratio for investment property loans',
        inputSchema: dscrCalc.getSchema()
      },
      {
        name: 'analyze_breakeven',
        description: 'Calculate breakeven points for occupancy, rent, and ROI for real estate investments',
        inputSchema: breakevenCalc.getSchema()
      },
      {
        name: 'analyze_sensitivity',
        description: 'Perform multi-variable sensitivity analysis on real estate investments',
        inputSchema: sensitivityCalc.getSchema()
      },
      {
        name: 'run_monte_carlo',
        description: 'Run Monte Carlo simulation to assess investment risk and return probabilities',
        inputSchema: monteCarloSim.getSchema()
      },
      {
        name: 'calculate_tax_benefits',
        description: 'Calculate depreciation, deductions, and tax savings for real estate investments',
        inputSchema: taxBenefitsCalc.getSchema()
      },
      {
        name: 'compare_properties',
        description: 'Compare multiple investment properties side by side with comprehensive analysis',
        inputSchema: propertyComparisonTool.getSchema()
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'calculate_affordability':
        return { 
          content: [{
            type: 'text',
            text: JSON.stringify(affordabilityCalc.calculate(args), null, 2)
          }]
        };
      
      case 'analyze_brrrr_deal':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(brrrrCalc.analyze(args), null, 2)
          }]
        };
      
      case 'evaluate_house_hack':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(houseHackingCalc.evaluate(args), null, 2)
          }]
        };
      
      case 'project_portfolio_growth':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(portfolioSim.project(args), null, 2)
          }]
        };
      
      case 'analyze_syndication':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(syndicationAnalyzer.analyze(args), null, 2)
          }]
        };
      
      case 'calculate_mortgage_affordability':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(mortgageAffordabilityCalc.calculate(args), null, 2)
          }]
        };
      
      case 'analyze_debt_to_income':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(debtToIncomeCalc.calculate(args), null, 2)
          }]
        };
      
      case 'calculate_irr':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(irrCalc.calculate(args), null, 2)
          }]
        };
      
      case 'analyze_fix_flip':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(fixFlipCalc.calculate(args), null, 2)
          }]
        };
      
      case 'compare_loans':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(loanComparisonTool.calculate(args), null, 2)
          }]
        };
      
      case 'calculate_npv':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(npvCalc.calculate(args), null, 2)
          }]
        };
      
      case 'calculate_cocr':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(cocrCalc.calculate(args), null, 2)
          }]
        };
      
      case 'calculate_dscr':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(dscrCalc.calculate(args), null, 2)
          }]
        };
      
      case 'analyze_breakeven':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(breakevenCalc.calculate(args), null, 2)
          }]
        };
      
      case 'analyze_sensitivity':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(sensitivityCalc.calculate(args), null, 2)
          }]
        };
      
      case 'run_monte_carlo':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(monteCarloSim.calculate(args), null, 2)
          }]
        };
      
      case 'calculate_tax_benefits':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(taxBenefitsCalc.calculate(args), null, 2)
          }]
        };
      
      case 'compare_properties':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(propertyComparisonTool.calculate(args), null, 2)
          }]
        };
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
});

// Register resources
server.setRequestHandler('resources/list', async () => {
  return {
    resources: [
      {
        uri: 'realvest://insights',
        name: 'RealVest Insights Articles',
        description: 'Search and access RealVest.ai educational articles and market insights',
        mimeType: 'application/json'
      },
      {
        uri: 'realvest://state-assistance',
        name: 'State Assistance Programs',
        description: 'Access down payment assistance programs for all 50 states',
        mimeType: 'application/json'
      },
      {
        uri: 'realvest://market-data',
        name: 'Current Market Data',
        description: 'Get current mortgage rates and market conditions',
        mimeType: 'application/json'
      },
      {
        uri: 'realvest://calculator-examples',
        name: 'Calculator Examples',
        description: 'Example scenarios for each calculator',
        mimeType: 'application/json'
      }
    ]
  };
});

// Handle resource reads
server.setRequestHandler('resources/read', async (request) => {
  const { uri } = request.params;

  try {
    switch (uri) {
      case 'realvest://insights':
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(await insightsResource.getAll(), null, 2)
          }]
        };
      
      case 'realvest://state-assistance':
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(await stateAssistanceResource.getAll(), null, 2)
          }]
        };
      
      case 'realvest://market-data':
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(await marketDataResource.getCurrent(), null, 2)
          }]
        };
      
      case 'realvest://calculator-examples':
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(getCalculatorExamples(), null, 2)
          }]
        };
      
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  } catch (error) {
    throw new Error(`Failed to read resource: ${error.message}`);
  }
});

// Calculator examples
function getCalculatorExamples() {
  return {
    affordability: [
      {
        title: "First-Time Buyer - Median Income",
        description: "Single person with median US income, minimal debt, saving for first home",
        inputs: {
          annual_income: 75000,
          monthly_debts: 500,
          down_payment: 20000,
          interest_rate: 6.85,
          property_tax_rate: 1.2,
          insurance_rate: 0.5,
          hoa_monthly: 0,
          loan_term_years: 30
        },
        expected_outcome: "Can afford approximately $285,000-$305,000 home"
      },
      {
        title: "Dual Income - High Debt",
        description: "Married couple with good income but student loans and car payments",
        inputs: {
          annual_income: 135000,
          monthly_debts: 2200,
          down_payment: 50000,
          interest_rate: 6.85,
          property_tax_rate: 1.5,
          insurance_rate: 0.6,
          hoa_monthly: 250,
          loan_term_years: 30
        },
        expected_outcome: "Can afford approximately $425,000-$450,000 home"
      },
      {
        title: "High Earner - 15-Year Mortgage",
        description: "Tech professional seeking faster payoff with 15-year term",
        inputs: {
          annual_income: 185000,
          monthly_debts: 800,
          down_payment: 100000,
          interest_rate: 6.02,
          property_tax_rate: 1.1,
          insurance_rate: 0.4,
          hoa_monthly: 0,
          loan_term_years: 15
        },
        expected_outcome: "Can afford approximately $600,000-$650,000 home"
      }
    ],
    brrrr: [
      {
        title: "Midwest Single Family BRRRR",
        description: "Classic BRRRR in Cleveland area - distressed property rehabilitation",
        inputs: {
          purchase_price: 85000,
          rehab_cost: 45000,
          after_repair_value: 175000,
          monthly_rent: 1400,
          refinance_ltv: 0.75,
          holding_costs_monthly: 800,
          holding_period_months: 4
        },
        expected_outcome: "Cash out ~$1,250, monthly cash flow ~$200-250"
      },
      {
        title: "Small Multi-Family BRRRR",
        description: "Duplex BRRRR in growing secondary market",
        inputs: {
          purchase_price: 225000,
          rehab_cost: 65000,
          after_repair_value: 385000,
          monthly_rent: 3200,
          refinance_ltv: 0.70,
          holding_costs_monthly: 1500,
          holding_period_months: 6
        },
        expected_outcome: "Cash out ~$20,000, monthly cash flow ~$400-500"
      },
      {
        title: "Value-Add Triplex",
        description: "Heavy rehab triplex in Phoenix suburbs",
        inputs: {
          purchase_price: 320000,
          rehab_cost: 120000,
          after_repair_value: 575000,
          monthly_rent: 4800,
          refinance_ltv: 0.75,
          holding_costs_monthly: 2200,
          holding_period_months: 8
        },
        expected_outcome: "Cash out ~$25,000, monthly cash flow ~$600-800"
      }
    ],
    house_hacking: [
      {
        title: "FHA Duplex House Hack",
        description: "First-time buyer using FHA 3.5% down on duplex",
        inputs: {
          purchase_price: 385000,
          down_payment: 13475,
          monthly_rent_unit2: 1800,
          owner_expenses: 900,
          interest_rate: 6.45,
          property_tax_rate: 1.2,
          insurance_rate: 0.6,
          pmi_rate: 0.85
        },
        expected_outcome: "Net housing cost ~$900/month vs $2,400 renting"
      },
      {
        title: "Triplex with ADU",
        description: "Living in main unit, renting 2 units + ADU",
        inputs: {
          purchase_price: 625000,
          down_payment: 125000,
          monthly_rent_unit2: 1600,
          monthly_rent_unit3: 1600,
          monthly_rent_adu: 1200,
          owner_expenses: 1200,
          interest_rate: 6.85
        },
        expected_outcome: "Live for free + $800-1000/month positive cash flow"
      },
      {
        title: "Single Family with Basement Rental",
        description: "SFR with finished basement apartment",
        inputs: {
          purchase_price: 425000,
          down_payment: 85000,
          monthly_rent_basement: 1400,
          owner_expenses: 1100,
          interest_rate: 6.85,
          property_tax_rate: 1.3,
          insurance_rate: 0.5
        },
        expected_outcome: "Reduce housing cost by 40-50%"
      }
    ],
    portfolio_growth: [
      {
        title: "Conservative Buy & Hold",
        description: "Starting with one rental, acquiring one every 2 years",
        inputs: {
          starting_capital: 50000,
          annual_savings: 15000,
          initial_property_value: 200000,
          annual_appreciation: 3.5,
          annual_rent_growth: 3.0,
          target_cash_flow_per_property: 300,
          acquisition_pace_years: 2
        },
        expected_outcome: "10 properties, $3M+ portfolio value in 20 years"
      },
      {
        title: "Aggressive BRRRR Strategy",
        description: "BRRRR investor recycling capital rapidly",
        inputs: {
          starting_capital: 75000,
          annual_savings: 25000,
          initial_property_value: 150000,
          annual_appreciation: 4.0,
          annual_rent_growth: 3.5,
          target_cash_flow_per_property: 400,
          acquisition_pace_years: 0.75
        },
        expected_outcome: "25+ properties, $5M+ portfolio in 20 years"
      },
      {
        title: "Mixed Strategy - SFR to Multi-Family",
        description: "Starting with SFRs, transitioning to small multi-family",
        inputs: {
          starting_capital: 100000,
          annual_savings: 30000,
          initial_property_value: 250000,
          annual_appreciation: 3.8,
          annual_rent_growth: 3.2,
          target_cash_flow_per_property: 500,
          acquisition_pace_years: 1.5
        },
        expected_outcome: "15 properties, $4M portfolio, $10k+/month cash flow"
      }
    ],
    syndication: [
      {
        title: "Class B Multi-Family Value-Add",
        description: "200-unit apartment complex in growing Sun Belt market",
        inputs: {
          minimum_investment: 50000,
          total_raise: 8500000,
          preferred_return: 7,
          profit_split_after_pref: 70,
          projected_hold_period: 5,
          projected_irr: 15.5,
          projected_equity_multiple: 1.95
        },
        expected_outcome: "$97,500 total return on $50k investment"
      },
      {
        title: "Ground-Up Development",
        description: "New construction 150-unit apartment complex",
        inputs: {
          minimum_investment: 100000,
          total_raise: 12000000,
          preferred_return: 8,
          profit_split_after_pref: 65,
          projected_hold_period: 3,
          projected_irr: 22,
          projected_equity_multiple: 1.75
        },
        expected_outcome: "$75,000 total return on $100k (higher risk/return)"
      },
      {
        title: "Stabilized Cash Flow Play",
        description: "Fully occupied Class A property in major metro",
        inputs: {
          minimum_investment: 25000,
          total_raise: 5000000,
          preferred_return: 6,
          profit_split_after_pref: 75,
          projected_hold_period: 7,
          projected_irr: 12,
          projected_equity_multiple: 2.1
        },
        expected_outcome: "Steady 6-8% annual returns + appreciation"
      }
    ],
    tips: [
      "Always run multiple scenarios with different assumptions",
      "Include all costs: closing, holding, maintenance, property management",
      "Be conservative with rent estimates and aggressive with expense estimates",
      "Factor in vacancy rates: 5-10% for SFR, 10-15% for multi-family",
      "Don't forget reserves: 6 months of expenses minimum per property"
    ]
  };
}

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('RealVest MCP Server started successfully');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});