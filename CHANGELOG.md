# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0] - 2025-08-04

### Added
- **Capital Gains Tax Calculator** - Comprehensive capital gains tax analysis and optimization strategies
  - Complete gain/loss calculation with adjusted basis, depreciation recapture, and net proceeds
  - Federal tax calculations with proper rate application (0%, 15%, 20% for long-term gains)
  - Depreciation recapture tax at 25% rate for investment properties
  - Net Investment Income Tax (NIIT) calculation for high earners (3.8% surtax)
  - Primary residence exclusion analysis with Section 121 qualification requirements
  - State tax analysis for all 50 states with accurate rate tables
  - Holding period determination and short-term vs long-term classification
  - Tax strategy analysis including 1031 exchanges, installment sales, and opportunity zones
  - Timing optimization with multiple year scenarios and income projections
  - Tax year comparison tools for strategic timing decisions
  - Comprehensive recommendations engine with priority-based action items
  - Support for all property types: primary residence, investment, vacation, commercial
  - Advanced scenarios: cost segregation, charitable remainder trusts, tax loss harvesting

### Technical
- Added comprehensive test suite with 15 test scenarios covering all tax calculations
- Enhanced schema validation for complex tax calculation parameters
- Updated README with detailed Capital Gains Tax Calculator example showing $20,250 tax optimization
- Incremented version to 1.5.0 and updated test count to 177 tests
- Added capital gains tax tool to package.json tools list

## [1.3.0] - 2025-08-04

### Added
- **Seller Financing Calculator** - Comprehensive seller financing analysis and optimization
  - Multiple payment structures: fully amortizing, interest-only, balloon, partial amortization
  - Detailed financing metrics with payment schedules and effective yield calculations
  - Seller benefits analysis including interest rate advantages, tax deferral, and marketability
  - Buyer benefits analysis covering rate savings, qualification advantages, and closing speed
  - Cash flow analysis for investment properties with CoC returns and DSCR calculations
  - Risk assessment framework covering credit, market, legal, and payment risks
  - Scenario comparison tools for different terms, rates, and amortization schedules
  - Tax implications analysis with capital gains spreading and interest income treatment
  - Exit strategy analysis including hold-to-maturity, early payoff, and note sale options
  - Comprehensive recommendations engine for deal structure optimization
  - Support for all property types and seller/buyer profiles with risk tolerance matching
  - Legal compliance guidance and documentation requirements

### Technical
- Added comprehensive test suite with 13 test scenarios covering all calculator features
- Enhanced error handling and validation for seller financing parameters
- Updated README with detailed Seller Financing Calculator example
- Incremented version to 1.3.0 and updated test count to 147 tests

## [1.2.0] - 2025-08-04

### Added
- **Subject-To Deal Calculator** - Comprehensive subject-to real estate deal analysis
  - Deal quality scoring system with instant equity and LTV analysis
  - Cash flow analysis with rental income, vacancy, and management considerations
  - Risk assessment covering legal, payment, market, insurance, and interest rate risks
  - Legal compliance scoring for deal structure and transfer methods
  - Multiple exit strategy analysis (hold & rent, refinance, quick sale, seller financing)
  - Insurance requirement analysis with liability and coverage recommendations
  - Long-term projections with 5-year equity growth and return calculations
  - Comprehensive risk mitigation strategies for due-on-sale and legal compliance
  - Support for all loan types (conventional, FHA, VA, USDA, portfolio) with risk differentiation
  - Authorization agreement and deed transfer method analysis

### Technical
- Added comprehensive test suite with 11 test scenarios covering all calculator features
- Enhanced error handling and validation for subject-to deal parameters
- Updated README with detailed Subject-To Deal Calculator example
- Incremented version to 1.2.0 and updated test count to 134 tests

## [1.1.0] - 2025-08-04

### Added
- **Wholesale Deal Analyzer** - Comprehensive wholesale real estate deal analysis
  - Deal quality grading system with A-D ratings based on profit margins and spreads
  - End buyer analysis with 70% rule compliance checking and ROI calculations
  - Assignment fee optimization with profitability analysis and timeline estimation
  - Multiple exit strategy comparison (wholesale assignment, double close, fix & flip, lease option)
  - Market timing analysis with seasonal factors and neighborhood grading
  - Risk assessment covering property, market, deal, seller, time, and repair risks
  - Buyer deal analysis with financing scenarios and cash-on-cash returns
  - Comprehensive recommendations for deal optimization and risk mitigation
  - Support for all property types and condition levels
  - Assignment timeline estimation based on buyer list size and deal grade

### Technical
- Added comprehensive test suite with 11 test scenarios covering all analyzer features
- Enhanced error handling and validation for wholesale deal parameters
- Updated README with detailed Wholesale Deal Analyzer example
- Incremented version to 1.1.0 and updated test count to 123 tests

## [1.0.0] - 2025-08-04

### Added
- **Construction Loan Calculator** - Comprehensive construction financing analysis
  - Project cost breakdown with hard costs, soft costs, and contingency analysis
  - Customizable draw schedule with 5-phase default or user-defined phases
  - Interest-only payment calculations during construction period
  - Permanent financing conversion analysis with loan-to-value calculations
  - Profitability analysis with gross profit, profit margin, and ROI calculations
  - Risk assessment covering timeline, cost, financing, leverage, and market risks
  - Cash flow requirements tracking month-by-month out-of-pocket needs
  - Scenario comparison for different financing structures (70%, 80%, 90% LTC)
  - Stress testing for cost overruns, timeline delays, and market value changes
  - Comprehensive recommendations for budget, timeline, and risk mitigation
  - Support for single-family, multi-family, commercial, custom, and spec homes

### Technical
- Added comprehensive test suite with 11 test scenarios covering all calculator features
- Enhanced error handling and validation for construction loan parameters
- Updated README with detailed Construction Loan Calculator example
- Incremented version to 1.0.0 to mark stable release milestone

## [0.9.0] - 2025-08-04

### Added
- **Market Analysis Tool** - Comprehensive market analysis with comparable property analysis
  - CMA (Comparative Market Analysis) with property scoring algorithm
  - Comparable property adjustments for size, condition, age, and location differences
  - Market metrics calculation (average/median prices, days on market, absorption rates)
  - Neighborhood analysis with market strength and liquidity scoring
  - Investment analysis with rental comparables and cap rate estimation
  - Price recommendations for listing, investment offers, and quick sales
  - Market insights with trend analysis and risk identification
  - Support for single-family, multi-family, and condo property types
  - Professional-grade valuation methodology used by real estate appraisers

### Changed
- Expanded MCP tools from 21 to 22 calculators
- Updated package.json version to 0.9.0
- Increased test coverage to 102 tests

## [0.8.0] - 2025-08-04

### Added
- **1031 Exchange Calculator** - Comprehensive like-kind exchange analysis
  - Tax liability calculation with depreciation recapture
  - Exchange qualification requirements analysis
  - Like-kind property verification
  - Timing requirement compliance (45-day/180-day rules)
  - Boot calculation and partial exchange handling
  - Cash flow impact analysis with and without exchange
  - Long-term tax deferral benefits calculation
  - Risk assessment with mitigation strategies
  - Alternative scenario comparisons (taxable sale, installment sale, opportunity zones)
  - Professional guidance recommendations

### Changed
- Expanded MCP tools from 20 to 21 calculators
- Updated package.json version to 0.8.0
- Increased test coverage to 92 tests

## [0.7.0] - 2025-08-04

### Added
- **Airbnb/STR Income Calculator** - Comprehensive short-term rental analysis
  - Seasonal variation analysis with peak/low season rates
  - Traditional rental vs STR comparison
  - Multi-year revenue and expense projections
  - Risk assessment with stress testing scenarios
  - Break-even occupancy analysis
  - Startup cost analysis with furniture/renovation budgets
  - Platform fee and management cost calculations
  - RevPAR and profit margin metrics
  - Intelligent recommendations for STR optimization

### Changed
- Expanded MCP tools from 19 to 20 calculators
- Updated package.json version to 0.7.0
- Increased test coverage to 82 tests

## [0.6.0] - 2025-08-04

### Added
- **Refinance Calculator** - Comprehensive mortgage refinance analysis
  - Break-even analysis with simple and NPV-based calculations
  - Current vs new loan detailed comparison
  - Cash-out refinance support and scenarios
  - Tax-adjusted effective interest rates
  - LTV analysis with PMI detection
  - Multiple scenario comparisons (different terms, rates)
  - NPV and IRR calculations for refinance decision
  - Planning horizon impact analysis
  - Intelligent recommendations based on multiple factors

### Changed
- Expanded MCP tools from 18 to 19 calculators
- Updated package.json version to 0.6.0
- Increased test coverage to 72 tests

## [0.5.0] - 2025-08-04

### Added
- **Sensitivity Analysis Calculator** - Multi-variable sensitivity analysis for real estate investments
  - Analyze impact of changes in key variables (price, rent, expenses, rates)
  - Tornado diagram visualization of most impactful variables
  - Two-way sensitivity analysis for variable interactions
  - Critical value identification (break-even points)
  - Risk assessment with elasticity calculations
- **Monte Carlo Simulator** - Risk analysis through probabilistic simulation
  - Support for normal, uniform, and triangular distributions
  - 10,000+ scenario simulations with customizable parameters
  - Value at Risk (VaR) and Conditional VaR calculations
  - Probability analysis for target metrics
  - Correlation analysis between inputs and outputs
  - Confidence intervals and scenario identification
- **Tax Benefits Calculator** - Comprehensive tax analysis for real estate investments
  - Depreciation schedule calculation (27.5/39 year)
  - Cost segregation analysis with bonus depreciation
  - Federal and state tax savings calculations
  - Passive activity loss analysis and limitations
  - Tax strategies and planning recommendations
  - Effective tax rate calculations
- **Property Comparison Tool** - Side-by-side analysis of multiple properties
  - Compare 2-5 properties across all key metrics
  - Weighted scoring system with customizable criteria
  - Risk-return efficiency analysis
  - Sensitivity comparison across properties
  - Best option identification for different goals
  - Investment timeline projections

### Changed
- Expanded MCP tools from 14 to 18 calculators
- Updated package.json version to 0.5.0

### Testing
- Added comprehensive test suite for all advanced calculators
- 62 total tests with 100% pass rate
- Full coverage of edge cases and advanced scenarios

## [0.4.0] - 2025-08-04

### Added
- **IRR Calculator** - Calculate Internal Rate of Return for real estate investments
  - Cash flow analysis with NPV calculations
  - Performance rating system
  - Sensitivity analysis for key variables
  - Break-even rate calculations
  - Target IRR comparison
- **Fix & Flip Calculator** - Analyze profitability of fix and flip investments
  - Support for multiple financing types (cash, hard money, conventional, private)
  - Detailed cost breakdown with contingencies
  - MAO (Maximum Allowable Offer) 70% rule analysis
  - Risk assessment with mitigation strategies
  - Project timeline with phase breakdown
  - Break-even and safety cushion analysis
- **Loan Comparison Tool** - Compare up to 4 mortgage scenarios side by side
  - Support for conventional, FHA, VA, USDA, jumbo, and ARM loans
  - Points analysis with break-even calculations
  - PMI calculations and removal timeline
  - ARM risk analysis with max payment scenarios
  - Best option identification across multiple metrics
  - Side-by-side comparison tables
- **NPV Calculator** - Calculate Net Present Value for real estate investments
  - Nominal and real (inflation-adjusted) NPV calculations
  - Modified IRR and profitability index metrics
  - Payback period analysis (simple and discounted)
  - Sensitivity analysis with break-even discount rate
  - Opportunity cost comparison
  - Detailed cash flow schedule with present values
- **Cash-on-Cash Return Calculator** - Analyze cash returns on real estate investments
  - Complete investment and expense breakdown
  - Performance rating system across multiple metrics
  - Vacancy and expense scenario analysis
  - 5-year projection with appreciation
  - Monthly cash flow breakdown
  - Debt coverage ratio calculations
- **DSCR Calculator** - Calculate Debt Service Coverage Ratio for investment loans
  - Comprehensive NOI and debt service analysis
  - Loan qualification assessment by loan type
  - Maximum loan amount calculations
  - Stress testing with multiple scenarios
  - Break-even occupancy analysis
  - Resilience scoring and recommendations
- **Breakeven Analysis Calculator** - Determine property break-even points
  - Occupancy-based breakeven calculations
  - Revenue vs expense analysis
  - Multi-unit property support
  - Target cash flow analysis
  - Sensitivity analysis for rent and cost changes
  - Risk assessment with mitigation strategies

### Changed
- Expanded MCP tools from 7 to 14 calculators
- Updated package.json version to 0.4.0
- Added new tool entries to package.json mcp.tools array

### Fixed
- Fixed recursive call stack overflow in COCR calculator scenario analysis
- Fixed recursive call stack overflow in DSCR stress testing
- Fixed NPV inflation test expectation (real NPV > nominal NPV when inflation positive)
- Fixed null reference errors in DSCR recommendations

### Testing
- Added comprehensive test suite for all new calculators
- 50 total tests with 100% pass rate
- Full coverage of edge cases and scenarios

## [0.3.0] - 2025-08-04

### Added
- **Mortgage Affordability Calculator** - Advanced mortgage affordability analysis with:
  - Dual income support (primary borrower + co-borrower)
  - Comprehensive DTI (Debt-to-Income) analysis
  - PMI (Private Mortgage Insurance) calculations
  - Alternative scenarios and recommendations
  - Support for various down payment percentages
- **Debt-to-Income Calculator** - DTI analysis for mortgage qualification with:
  - Support for multiple loan types (Conventional, FHA, VA, USDA)
  - Front-end and back-end ratio calculations
  - Qualification status determination
  - Improvement strategies and recommendations
  - Maximum affordable payment calculations

### Changed
- Expanded MCP tools from 5 to 7 calculators
- Updated package.json version to 0.3.0

### Testing
- Added comprehensive test suite for new calculators
- 14 total tests with 100% pass rate
- Edge case coverage for high debt scenarios, dual income, and PMI calculations

## [0.2.4] - 2025-08-01

### Documentation
- Add full URLs to all educational resource examples
- Show article titles, summaries, and clickable links
- Clarify that users receive direct links to articles

## [0.2.3] - 2025-08-01

### Fixed
- Remove broken link to non-existent /docs directory in README

## [0.2.2] - 2025-08-01

### Added
- Comprehensive usage examples covering all calculators and resources
- Detailed use cases document with 50+ examples
- Quick reference guide with all parameters
- FAQ section in README
- Development setup instructions
- Troubleshooting guide

### Documentation
- Expanded README with real-world examples for every feature
- Added conversational examples showing AI assistant interactions
- Created parameter reference for all tools
- Added tips for optimal usage

## [0.2.1] - 2025-08-01

### Changed
- Moved to dedicated repository at https://github.com/sigaihealth/realvestmcp
- Updated all documentation links to point to new repository

## [0.2.0] - 2025-08-01

### Added
- Real data from RealVest.ai website for insights articles (30 articles)
- Comprehensive state assistance programs data for 10 states
- Current market data with mortgage rates, home prices, and trends
- Realistic calculator examples with multiple scenarios per calculator
- Federal assistance programs (FHA, VA, USDA, Good Neighbor)
- Market analysis by location functionality
- Investor metrics and cap rates by property class

### Changed
- Insights resource now loads from actual article data
- State assistance includes income limits and contact info
- Market data includes historical context and forecasts
- Calculator examples expanded from 3 to 15+ scenarios

### Fixed
- Resource loading with proper error handling
- Data persistence using JSON files

## [0.1.0] - 2025-08-01

### Added
- Initial release of RealVest MCP Server
- Affordability calculator with comprehensive DTI analysis
- BRRRR deal analyzer with success metrics
- House hacking calculator
- Portfolio growth simulator
- Syndication investment analyzer
- Educational insights resource
- State assistance programs resource
- Current market data resource
- Example scenarios for all calculators
- Full MCP protocol implementation
- NPM package configuration

### Features
- Calculate home affordability based on income, debts, and down payment
- Analyze BRRRR deals with detailed ROI metrics
- Evaluate house hacking opportunities
- Project portfolio growth over 20 years
- Analyze syndication investments
- Access educational articles and resources
- Get state-specific down payment assistance information
- Retrieve current mortgage rates and market data

[0.1.0]: https://github.com/sigaihealth/realvestai/releases/tag/v0.1.0