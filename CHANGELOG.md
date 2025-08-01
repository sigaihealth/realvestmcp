# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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