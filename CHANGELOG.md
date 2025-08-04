# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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