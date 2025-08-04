export class DealPipelineTracker {
  getSchema() {
    return {
      type: 'object',
      properties: {
        deals: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              deal_id: { type: 'string' },
              property_address: { type: 'string' },
              deal_type: { 
                type: 'string', 
                enum: ['single_family', 'multi_family', 'commercial', 'land', 'fix_flip', 'wholesale', 'brrrr'] 
              },
              current_stage: {
                type: 'string',
                enum: ['lead', 'initial_analysis', 'offer_submitted', 'under_contract', 'due_diligence', 'financing', 'closing', 'completed', 'dead']
              },
              property_details: {
                type: 'object',
                properties: {
                  asking_price: { type: 'number', minimum: 0 },
                  estimated_value: { type: 'number', minimum: 0 },
                  square_footage: { type: 'number', minimum: 0 },
                  bedrooms: { type: 'number', minimum: 0 },
                  bathrooms: { type: 'number', minimum: 0 },
                  year_built: { type: 'number', minimum: 1800, maximum: 2030 },
                  lot_size: { type: 'number', minimum: 0 },
                  property_condition: { type: 'string', enum: ['excellent', 'good', 'fair', 'poor', 'distressed'] }
                }
              },
              financial_projections: {
                type: 'object',
                properties: {
                  purchase_price: { type: 'number', minimum: 0 },
                  down_payment: { type: 'number', minimum: 0 },
                  closing_costs: { type: 'number', minimum: 0 },
                  rehab_budget: { type: 'number', minimum: 0 },
                  monthly_rent: { type: 'number', minimum: 0 },
                  monthly_expenses: { type: 'number', minimum: 0 },
                  projected_arv: { type: 'number', minimum: 0 },
                  exit_strategy: { type: 'string', enum: ['hold', 'flip', 'wholesale', 'brrrr', 'owner_occupy'] }
                }
              },
              timeline: {
                type: 'object',
                properties: {
                  date_discovered: { type: 'string' },
                  date_analyzed: { type: 'string' },
                  offer_date: { type: 'string' },
                  contract_date: { type: 'string' },
                  inspection_deadline: { type: 'string' },
                  financing_deadline: { type: 'string' },
                  closing_date: { type: 'string' },
                  expected_completion: { type: 'string' }
                }
              },
              deal_metrics: {
                type: 'object',
                properties: {
                  cap_rate: { type: 'number' },
                  cash_on_cash_return: { type: 'number' },
                  total_return: { type: 'number' },
                  breakeven_ratio: { type: 'number' },
                  deal_score: { type: 'number', minimum: 0, maximum: 100 }
                }
              },
              contacts: {
                type: 'object',
                properties: {
                  seller_agent: { type: 'string' },
                  listing_agent: { type: 'string' },
                  lender: { type: 'string' },
                  inspector: { type: 'string' },
                  contractor: { type: 'string' },
                  attorney: { type: 'string' }
                }
              },
              notes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    date: { type: 'string' },
                    note: { type: 'string' },
                    category: { type: 'string', enum: ['general', 'financial', 'inspection', 'negotiation', 'timeline'] }
                  }
                }
              }
            },
            required: ['deal_id', 'property_address', 'deal_type', 'current_stage']
          }
        },
        analysis_options: {
          type: 'object',
          properties: {
            pipeline_analytics: { type: 'boolean' },
            deal_scoring: { type: 'boolean' },
            timeline_analysis: { type: 'boolean' },
            performance_metrics: { type: 'boolean' },
            stage_conversion_rates: { type: 'boolean' }
          }
        },
        filter_options: {
          type: 'object',
          properties: {
            deal_types: { type: 'array', items: { type: 'string' } },
            stages: { type: 'array', items: { type: 'string' } },
            date_range: {
              type: 'object',
              properties: {
                start_date: { type: 'string' },
                end_date: { type: 'string' }
              }
            },
            min_deal_score: { type: 'number', minimum: 0, maximum: 100 },
            price_range: {
              type: 'object',
              properties: {
                min_price: { type: 'number', minimum: 0 },
                max_price: { type: 'number', minimum: 0 }
              }
            }
          }
        }
      },
      required: ['deals']
    };
  }

  calculate(params) {
    const {
      deals,
      analysis_options = {},
      filter_options = {}
    } = params;

    // Filter deals based on criteria
    const filtered_deals = this.filterDeals(deals, filter_options);
    
    // Analyze each deal
    const analyzed_deals = filtered_deals.map(deal => this.analyzeDeal(deal));
    
    // Pipeline analytics
    const pipeline_analytics = analysis_options.pipeline_analytics
      ? this.generatePipelineAnalytics(analyzed_deals)
      : null;
    
    // Deal scoring
    const deal_scoring = analysis_options.deal_scoring
      ? this.scoreDealPipeline(analyzed_deals)
      : null;
    
    // Timeline analysis
    const timeline_analysis = analysis_options.timeline_analysis
      ? this.analyzeTimelines(analyzed_deals)
      : null;
    
    // Performance metrics
    const performance_metrics = analysis_options.performance_metrics
      ? this.calculatePerformanceMetrics(analyzed_deals)
      : null;
    
    // Stage conversion rates
    const conversion_rates = analysis_options.stage_conversion_rates
      ? this.calculateConversionRates(analyzed_deals)
      : null;
    
    // Generate insights and recommendations
    const insights = this.generateInsights(analyzed_deals, pipeline_analytics);
    const recommendations = this.generateRecommendations(analyzed_deals, pipeline_analytics, performance_metrics);

    return {
      pipeline_summary: {
        total_deals: analyzed_deals.length,
        active_deals: analyzed_deals.filter(d => !['completed', 'dead'].includes(d.current_stage)).length,
        completed_deals: analyzed_deals.filter(d => d.current_stage === 'completed').length,
        dead_deals: analyzed_deals.filter(d => d.current_stage === 'dead').length,
        total_pipeline_value: this.calculateTotalPipelineValue(analyzed_deals),
        average_deal_score: this.calculateAverageScore(analyzed_deals)
      },
      deals: analyzed_deals,
      pipeline_analytics,
      deal_scoring,
      timeline_analysis,
      performance_metrics,
      conversion_rates,
      insights,
      recommendations
    };
  }

  filterDeals(deals, filter_options) {
    let filtered = deals;

    if (filter_options.deal_types?.length > 0) {
      filtered = filtered.filter(deal => filter_options.deal_types.includes(deal.deal_type));
    }

    if (filter_options.stages?.length > 0) {
      filtered = filtered.filter(deal => filter_options.stages.includes(deal.current_stage));
    }

    if (filter_options.min_deal_score) {
      filtered = filtered.filter(deal => 
        (deal.deal_metrics?.deal_score || 0) >= filter_options.min_deal_score);
    }

    if (filter_options.price_range) {
      const { min_price, max_price } = filter_options.price_range;
      filtered = filtered.filter(deal => {
        const price = deal.financial_projections?.purchase_price || deal.property_details?.asking_price || 0;
        return (!min_price || price >= min_price) && (!max_price || price <= max_price);
      });
    }

    if (filter_options.date_range) {
      const start = new Date(filter_options.date_range.start_date);
      const end = new Date(filter_options.date_range.end_date);
      filtered = filtered.filter(deal => {
        if (!deal.timeline?.date_discovered) return true;
        const discovered = new Date(deal.timeline.date_discovered);
        return discovered >= start && discovered <= end;
      });
    }

    return filtered;
  }

  analyzeDeal(deal) {
    const analyzed = { ...deal };
    
    // Calculate deal metrics if not provided
    if (!analyzed.deal_metrics || Object.keys(analyzed.deal_metrics).length === 0) {
      analyzed.deal_metrics = this.calculateDealMetrics(deal);
    }
    
    // Calculate days in current stage
    analyzed.days_in_stage = this.calculateDaysInStage(deal);
    
    // Determine stage health
    analyzed.stage_health = this.assessStageHealth(deal);
    
    // Calculate completion percentage
    analyzed.completion_percentage = this.calculateCompletionPercentage(deal);
    
    // Identify risks
    analyzed.identified_risks = this.identifyDealRisks(deal);
    
    // Next action items
    analyzed.next_actions = this.generateNextActions(deal);
    
    return analyzed;
  }

  calculateDealMetrics(deal) {
    const metrics = {};
    
    if (deal.financial_projections) {
      const fp = deal.financial_projections;
      
      // Cap rate calculation
      if (fp.monthly_rent && fp.purchase_price) {
        const annual_rent = fp.monthly_rent * 12;
        const annual_expenses = (fp.monthly_expenses || 0) * 12;
        const noi = annual_rent - annual_expenses;
        metrics.cap_rate = (noi / fp.purchase_price) * 100;
      }
      
      // Cash-on-cash return
      if (fp.monthly_rent && fp.down_payment) {
        const annual_rent = fp.monthly_rent * 12;
        const annual_expenses = (fp.monthly_expenses || 0) * 12;
        const annual_debt_service = this.calculateAnnualDebtService(fp);
        const annual_cash_flow = annual_rent - annual_expenses - annual_debt_service;
        const total_cash_invested = fp.down_payment + (fp.closing_costs || 0) + (fp.rehab_budget || 0);
        metrics.cash_on_cash_return = total_cash_invested > 0 ? (annual_cash_flow / total_cash_invested) * 100 : 0;
      }
      
      // Total return (for flips)
      if (fp.projected_arv && fp.purchase_price) {
        const total_costs = fp.purchase_price + (fp.rehab_budget || 0) + (fp.closing_costs || 0);
        const gross_profit = fp.projected_arv - total_costs;
        const selling_costs = fp.projected_arv * 0.06; // Assume 6% selling costs
        const net_profit = gross_profit - selling_costs;
        metrics.total_return = total_costs > 0 ? (net_profit / total_costs) * 100 : 0;
      }
      
      // Breakeven ratio
      if (fp.monthly_rent && fp.monthly_expenses) {
        const monthly_debt_service = this.calculateMonthlyDebtService(fp);
        const total_monthly_costs = (fp.monthly_expenses || 0) + monthly_debt_service;
        metrics.breakeven_ratio = total_monthly_costs > 0 ? fp.monthly_rent / total_monthly_costs : 0;
      }
    }
    
    // Deal score (weighted combination of metrics)
    metrics.deal_score = this.calculateDealScore(deal, metrics);
    
    return metrics;
  }

  calculateDealScore(deal, metrics) {
    let score = 50; // Base score
    const weights = {
      cap_rate: 0.25,
      cash_on_cash: 0.25,
      total_return: 0.20,
      breakeven: 0.15,
      location: 0.10,
      condition: 0.05
    };
    
    // Cap rate scoring (higher is better)
    if (metrics.cap_rate) {
      if (metrics.cap_rate >= 10) score += 20 * weights.cap_rate * 4;
      else if (metrics.cap_rate >= 8) score += 15 * weights.cap_rate * 4;
      else if (metrics.cap_rate >= 6) score += 10 * weights.cap_rate * 4;
      else if (metrics.cap_rate >= 4) score += 5 * weights.cap_rate * 4;
      else score -= 10 * weights.cap_rate * 4;
    }
    
    // Cash-on-cash return scoring
    if (metrics.cash_on_cash_return) {
      if (metrics.cash_on_cash_return >= 15) score += 25 * weights.cash_on_cash * 4;
      else if (metrics.cash_on_cash_return >= 12) score += 20 * weights.cash_on_cash * 4;
      else if (metrics.cash_on_cash_return >= 8) score += 15 * weights.cash_on_cash * 4;
      else if (metrics.cash_on_cash_return >= 5) score += 10 * weights.cash_on_cash * 4;
      else score -= 10 * weights.cash_on_cash * 4;
    }
    
    // Total return scoring (for flips)
    if (metrics.total_return) {
      if (metrics.total_return >= 30) score += 25 * weights.total_return * 4;
      else if (metrics.total_return >= 20) score += 20 * weights.total_return * 4;
      else if (metrics.total_return >= 15) score += 15 * weights.total_return * 4;
      else if (metrics.total_return >= 10) score += 10 * weights.total_return * 4;
      else score -= 10 * weights.total_return * 4;
    }
    
    // Breakeven ratio scoring (higher is better)
    if (metrics.breakeven_ratio) {
      if (metrics.breakeven_ratio >= 1.3) score += 20 * weights.breakeven * 4;
      else if (metrics.breakeven_ratio >= 1.2) score += 15 * weights.breakeven * 4;
      else if (metrics.breakeven_ratio >= 1.1) score += 10 * weights.breakeven * 4;
      else if (metrics.breakeven_ratio >= 1.0) score += 5 * weights.breakeven * 4;
      else score -= 15 * weights.breakeven * 4;
    }
    
    // Property condition scoring
    if (deal.property_details?.property_condition) {
      const condition_scores = {
        'excellent': 20,
        'good': 15,
        'fair': 10,
        'poor': 0,
        'distressed': -10
      };
      score += (condition_scores[deal.property_details.property_condition] || 0) * weights.condition * 4;
    }
    
    // Ensure score is within bounds
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  generatePipelineAnalytics(deals) {
    const stages = ['lead', 'initial_analysis', 'offer_submitted', 'under_contract', 'due_diligence', 'financing', 'closing', 'completed', 'dead'];
    
    const stage_distribution = stages.map(stage => ({
      stage,
      count: deals.filter(d => d.current_stage === stage).length,
      total_value: deals.filter(d => d.current_stage === stage)
                       .reduce((sum, d) => sum + (d.financial_projections?.purchase_price || d.property_details?.asking_price || 0), 0)
    }));
    
    const deal_type_distribution = {};
    const types = ['single_family', 'multi_family', 'commercial', 'land', 'fix_flip', 'wholesale', 'brrrr'];
    types.forEach(type => {
      const type_deals = deals.filter(d => d.deal_type === type);
      deal_type_distribution[type] = {
        count: type_deals.length,
        percentage: deals.length > 0 ? (type_deals.length / deals.length) * 100 : 0,
        avg_score: type_deals.length > 0 ? 
                   type_deals.reduce((sum, d) => sum + (d.deal_metrics?.deal_score || 0), 0) / type_deals.length : 0
      };
    });
    
    const velocity_metrics = this.calculateVelocityMetrics(deals);
    const bottlenecks = this.identifyBottlenecks(deals);
    
    return {
      stage_distribution,
      deal_type_distribution,
      velocity_metrics,
      bottlenecks,
      pipeline_health_score: this.calculatePipelineHealthScore(deals)
    };
  }

  calculateVelocityMetrics(deals) {
    const completed_deals = deals.filter(d => d.current_stage === 'completed');
    const active_deals = deals.filter(d => !['completed', 'dead'].includes(d.current_stage));
    
    let avg_days_to_close = 0;
    if (completed_deals.length > 0) {
      const total_days = completed_deals.reduce((sum, deal) => {
        if (deal.timeline?.date_discovered && deal.timeline?.closing_date) {
          const start = new Date(deal.timeline.date_discovered);
          const end = new Date(deal.timeline.closing_date);
          return sum + Math.floor((end - start) / (1000 * 60 * 60 * 24));
        }
        return sum;
      }, 0);
      avg_days_to_close = total_days / completed_deals.length;
    }
    
    const deals_per_month = this.calculateDealsPerMonth(deals);
    const conversion_rate = deals.length > 0 ? (completed_deals.length / deals.length) * 100 : 0;
    
    return {
      average_days_to_close: Math.round(avg_days_to_close),
      deals_per_month,
      conversion_rate: Math.round(conversion_rate * 10) / 10,
      active_pipeline_value: active_deals.reduce((sum, d) => 
        sum + (d.financial_projections?.purchase_price || d.property_details?.asking_price || 0), 0)
    };
  }

  identifyBottlenecks(deals) {
    const stages = ['lead', 'initial_analysis', 'offer_submitted', 'under_contract', 'due_diligence', 'financing', 'closing'];
    const bottlenecks = [];
    
    stages.forEach(stage => {
      const stage_deals = deals.filter(d => d.current_stage === stage);
      const avg_days_in_stage = stage_deals.length > 0 ? 
        stage_deals.reduce((sum, d) => sum + (d.days_in_stage || 0), 0) / stage_deals.length : 0;
      
      // Define normal timeframes for each stage
      const normal_timeframes = {
        'lead': 7,
        'initial_analysis': 3,
        'offer_submitted': 7,
        'under_contract': 30,
        'due_diligence': 15,
        'financing': 21,
        'closing': 7
      };
      
      if (avg_days_in_stage > normal_timeframes[stage] * 1.5) {
        bottlenecks.push({
          stage,
          avg_days: Math.round(avg_days_in_stage),
          normal_days: normal_timeframes[stage],
          deals_affected: stage_deals.length,
          severity: avg_days_in_stage > normal_timeframes[stage] * 2 ? 'High' : 'Medium'
        });
      }
    });
    
    return bottlenecks;
  }

  scoreDealPipeline(deals) {
    const scored_deals = deals.map(deal => ({
      ...deal,
      score_breakdown: this.getScoreBreakdown(deal)
    })).sort((a, b) => (b.deal_metrics?.deal_score || 0) - (a.deal_metrics?.deal_score || 0));
    
    const top_deals = scored_deals.slice(0, 10);
    const avg_score = deals.length > 0 ? 
      deals.reduce((sum, d) => sum + (d.deal_metrics?.deal_score || 0), 0) / deals.length : 0;
    
    const score_distribution = {
      excellent: deals.filter(d => (d.deal_metrics?.deal_score || 0) >= 80).length,
      good: deals.filter(d => (d.deal_metrics?.deal_score || 0) >= 60 && (d.deal_metrics?.deal_score || 0) < 80).length,
      fair: deals.filter(d => (d.deal_metrics?.deal_score || 0) >= 40 && (d.deal_metrics?.deal_score || 0) < 60).length,
      poor: deals.filter(d => (d.deal_metrics?.deal_score || 0) < 40).length
    };
    
    return {
      scored_deals,
      top_deals,
      average_score: Math.round(avg_score * 10) / 10,
      score_distribution,
      scoring_methodology: this.getScoringMethodology()
    };
  }

  analyzeTimelines(deals) {
    const timeline_issues = [];
    const upcoming_deadlines = [];
    
    deals.forEach(deal => {
      if (!deal.timeline) return;
      
      const now = new Date();
      
      // Check for overdue items
      if (deal.timeline.inspection_deadline) {
        const deadline = new Date(deal.timeline.inspection_deadline);
        if (deadline < now && deal.current_stage === 'due_diligence') {
          timeline_issues.push({
            deal_id: deal.deal_id,
            issue: 'Overdue inspection deadline',
            days_overdue: Math.floor((now - deadline) / (1000 * 60 * 60 * 24)),
            severity: 'High'
          });
        }
      }
      
      if (deal.timeline.financing_deadline) {
        const deadline = new Date(deal.timeline.financing_deadline);
        if (deadline < now && deal.current_stage === 'financing') {
          timeline_issues.push({
            deal_id: deal.deal_id,
            issue: 'Overdue financing deadline',
            days_overdue: Math.floor((now - deadline) / (1000 * 60 * 60 * 24)),
            severity: 'High'
          });
        }
      }
      
      // Check for upcoming deadlines (next 7 days)
      const next_week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      ['inspection_deadline', 'financing_deadline', 'closing_date'].forEach(deadline_type => {
        if (deal.timeline[deadline_type]) {
          const deadline = new Date(deal.timeline[deadline_type]);
          if (deadline >= now && deadline <= next_week) {
            upcoming_deadlines.push({
              deal_id: deal.deal_id,
              deadline_type,
              deadline_date: deal.timeline[deadline_type],
              days_until: Math.floor((deadline - now) / (1000 * 60 * 60 * 24))
            });
          }
        }
      });
    });
    
    const average_timeline = this.calculateAverageTimeline(deals);
    
    return {
      timeline_issues,
      upcoming_deadlines,
      average_timeline,
      deals_with_timeline_risks: timeline_issues.length
    };
  }

  calculatePerformanceMetrics(deals) {
    const completed_deals = deals.filter(d => d.current_stage === 'completed');
    const active_deals = deals.filter(d => !['completed', 'dead'].includes(d.current_stage));
    
    const total_invested = completed_deals.reduce((sum, deal) => {
      const fp = deal.financial_projections;
      return sum + (fp?.down_payment || 0) + (fp?.closing_costs || 0) + (fp?.rehab_budget || 0);
    }, 0);
    
    const total_portfolio_value = completed_deals.reduce((sum, deal) => {
      return sum + (deal.financial_projections?.projected_arv || deal.financial_projections?.purchase_price || 0);
    }, 0);
    
    const monthly_cash_flow = completed_deals.reduce((sum, deal) => {
      const fp = deal.financial_projections;
      return sum + ((fp?.monthly_rent || 0) - (fp?.monthly_expenses || 0));
    }, 0);
    
    const roi = total_invested > 0 ? ((total_portfolio_value - total_invested) / total_invested) * 100 : 0;
    
    return {
      total_deals_completed: completed_deals.length,
      total_deals_active: active_deals.length,
      total_invested: Math.round(total_invested),
      total_portfolio_value: Math.round(total_portfolio_value),
      monthly_cash_flow: Math.round(monthly_cash_flow),
      overall_roi: Math.round(roi * 10) / 10,
      average_deal_size: completed_deals.length > 0 ? 
        Math.round(total_portfolio_value / completed_deals.length) : 0,
      success_rate: deals.length > 0 ? (completed_deals.length / deals.length) * 100 : 0
    };
  }

  calculateConversionRates(deals) {
    const stages = ['lead', 'initial_analysis', 'offer_submitted', 'under_contract', 'due_diligence', 'financing', 'closing', 'completed'];
    const conversion_rates = [];
    
    for (let i = 0; i < stages.length - 1; i++) {
      const current_stage = stages[i];
      const next_stage = stages[i + 1];
      
      const current_count = deals.filter(d => 
        this.hasReachedStage(d, current_stage)).length;
      const next_count = deals.filter(d => 
        this.hasReachedStage(d, next_stage)).length;
      
      const rate = current_count > 0 ? (next_count / current_count) * 100 : 0;
      
      conversion_rates.push({
        from_stage: current_stage,
        to_stage: next_stage,
        conversion_rate: Math.round(rate * 10) / 10,
        deals_converted: next_count,
        deals_available: current_count
      });
    }
    
    return {
      stage_conversions: conversion_rates,
      overall_conversion: deals.length > 0 ? 
        (deals.filter(d => d.current_stage === 'completed').length / deals.length) * 100 : 0,
      drop_off_analysis: this.analyzeDropOffs(conversion_rates)
    };
  }

  generateInsights(deals, pipeline_analytics) {
    const insights = [];
    
    // Deal volume insights
    if (deals.length < 5) {
      insights.push({
        type: 'Pipeline Volume',
        insight: 'Low deal volume in pipeline',
        recommendation: 'Focus on lead generation to build a stronger pipeline',
        priority: 'High'
      });
    }
    
    // Stage distribution insights
    if (pipeline_analytics?.stage_distribution) {
      const leads = pipeline_analytics.stage_distribution.find(s => s.stage === 'lead')?.count || 0;
      const analysis = pipeline_analytics.stage_distribution.find(s => s.stage === 'initial_analysis')?.count || 0;
      
      if (analysis > leads * 0.5) {
        insights.push({
          type: 'Stage Distribution',
          insight: 'High number of deals in analysis stage',
          recommendation: 'Streamline analysis process or increase lead generation',
          priority: 'Medium'
        });
      }
    }
    
    // Score insights
    const high_score_deals = deals.filter(d => (d.deal_metrics?.deal_score || 0) >= 70).length;
    if (high_score_deals < deals.length * 0.3) {
      insights.push({
        type: 'Deal Quality',
        insight: 'Low percentage of high-quality deals',
        recommendation: 'Refine deal sourcing criteria to focus on better opportunities',
        priority: 'High'
      });
    }
    
    return insights;
  }

  generateRecommendations(deals, pipeline_analytics, performance_metrics) {
    const recommendations = [];
    
    // Pipeline health recommendations
    const active_deals = deals.filter(d => !['completed', 'dead'].includes(d.current_stage));
    if (active_deals.length < 10) {
      recommendations.push({
        category: 'Pipeline Management',
        recommendation: '📈 Increase pipeline volume',
        reasoning: 'Maintain 10+ active deals for consistent deal flow',
        priority: 'High'
      });
    }
    
    // Bottleneck recommendations
    if (pipeline_analytics?.bottlenecks?.length > 0) {
      pipeline_analytics.bottlenecks.forEach(bottleneck => {
        recommendations.push({
          category: 'Process Improvement',
          recommendation: `⚡ Address ${bottleneck.stage} bottleneck`,
          reasoning: `Deals spending ${bottleneck.avg_days} days in ${bottleneck.stage} stage`,
          priority: bottleneck.severity
        });
      });
    }
    
    // Performance recommendations
    if (performance_metrics?.success_rate < 20) {
      recommendations.push({
        category: 'Success Rate',
        recommendation: '🎯 Improve deal qualification',
        reasoning: `Current success rate of ${Math.round(performance_metrics.success_rate)}% is below industry average`,
        priority: 'High'
      });
    }
    
    // Timeline recommendations
    const overdue_deals = deals.filter(d => this.hasOverdueItems(d));
    if (overdue_deals.length > 0) {
      recommendations.push({
        category: 'Timeline Management',
        recommendation: '⏰ Address overdue deadlines',
        reasoning: `${overdue_deals.length} deals have overdue items`,
        priority: 'High'
      });
    }
    
    return {
      recommendations,
      action_items: this.generateActionItems(deals),
      focus_areas: this.identifyFocusAreas(deals, pipeline_analytics)
    };
  }

  // Helper methods
  calculateDaysInStage(deal) {
    const stage_dates = {
      'lead': deal.timeline?.date_discovered,
      'initial_analysis': deal.timeline?.date_analyzed,
      'offer_submitted': deal.timeline?.offer_date,
      'under_contract': deal.timeline?.contract_date,
      'due_diligence': deal.timeline?.contract_date,
      'financing': deal.timeline?.contract_date,
      'closing': deal.timeline?.financing_deadline,
      'completed': deal.timeline?.closing_date
    };
    
    const stage_date = stage_dates[deal.current_stage];
    if (!stage_date) return 0;
    
    const now = new Date();
    const start = new Date(stage_date);
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
  }

  assessStageHealth(deal) {
    const days_in_stage = deal.days_in_stage || 0;
    const normal_timeframes = {
      'lead': 7,
      'initial_analysis': 3,
      'offer_submitted': 7,
      'under_contract': 30,
      'due_diligence': 15,
      'financing': 21,
      'closing': 7
    };
    
    const normal_days = normal_timeframes[deal.current_stage] || 30;
    
    if (days_in_stage <= normal_days) return 'Healthy';
    if (days_in_stage <= normal_days * 1.5) return 'At Risk';
    return 'Critical';
  }

  calculateCompletionPercentage(deal) {
    const stage_weights = {
      'lead': 10,
      'initial_analysis': 20,
      'offer_submitted': 35,
      'under_contract': 50,
      'due_diligence': 70,
      'financing': 85,
      'closing': 95,
      'completed': 100,
      'dead': 0
    };
    
    return stage_weights[deal.current_stage] || 0;
  }

  identifyDealRisks(deal) {
    const risks = [];
    
    // Timeline risks
    if (deal.days_in_stage > 30) {
      risks.push({
        type: 'Timeline',
        description: `Deal has been in ${deal.current_stage} stage for ${deal.days_in_stage} days`,
        severity: 'Medium'
      });
    }
    
    // Financial risks
    if (deal.deal_metrics?.breakeven_ratio < 1.0) {
      risks.push({
        type: 'Financial',
        description: 'Deal does not meet breakeven requirements',
        severity: 'High'
      });
    }
    
    // Market risks
    if (deal.property_details?.property_condition === 'poor' || deal.property_details?.property_condition === 'distressed') {
      risks.push({
        type: 'Property',
        description: 'Property condition may require significant investment',
        severity: 'Medium'
      });
    }
    
    return risks;
  }

  generateNextActions(deal) {
    const actions = [];
    
    switch (deal.current_stage) {
      case 'lead':
        actions.push('Complete initial property analysis');
        actions.push('Research comparable sales');
        break;
      case 'initial_analysis':
        actions.push('Prepare and submit offer');
        actions.push('Schedule property inspection');
        break;
      case 'offer_submitted':
        actions.push('Follow up on offer status');
        actions.push('Prepare for potential negotiations');
        break;
      case 'under_contract':
        actions.push('Schedule inspections');
        actions.push('Apply for financing');
        break;
      case 'due_diligence':
        actions.push('Complete inspection contingencies');
        actions.push('Finalize repair negotiations');
        break;
      case 'financing':
        actions.push('Submit all required documentation');
        actions.push('Schedule appraisal');
        break;
      case 'closing':
        actions.push('Coordinate final walkthrough');
        actions.push('Prepare closing documents');
        break;
    }
    
    return actions;
  }

  calculateAnnualDebtService(financial_projections) {
    // Simplified debt service calculation
    const loan_amount = (financial_projections.purchase_price || 0) - (financial_projections.down_payment || 0);
    const annual_rate = 0.07; // Assume 7% interest rate
    const years = 30;
    
    if (loan_amount <= 0) return 0;
    
    const monthly_rate = annual_rate / 12;
    const num_payments = years * 12;
    const monthly_payment = loan_amount * (monthly_rate * Math.pow(1 + monthly_rate, num_payments)) / 
                           (Math.pow(1 + monthly_rate, num_payments) - 1);
    
    return monthly_payment * 12;
  }

  calculateMonthlyDebtService(financial_projections) {
    return this.calculateAnnualDebtService(financial_projections) / 12;
  }

  calculateTotalPipelineValue(deals) {
    return deals.reduce((sum, deal) => {
      return sum + (deal.financial_projections?.purchase_price || deal.property_details?.asking_price || 0);
    }, 0);
  }

  calculateAverageScore(deals) {
    if (deals.length === 0) return 0;
    const total = deals.reduce((sum, deal) => sum + (deal.deal_metrics?.deal_score || 0), 0);
    return Math.round((total / deals.length) * 10) / 10;
  }

  calculatePipelineHealthScore(deals) {
    let score = 50;
    
    // Volume score
    if (deals.length >= 20) score += 15;
    else if (deals.length >= 10) score += 10;
    else if (deals.length >= 5) score += 5;
    else score -= 10;
    
    // Conversion rate score
    const completed = deals.filter(d => d.current_stage === 'completed').length;
    const conversion_rate = deals.length > 0 ? (completed / deals.length) * 100 : 0;
    
    if (conversion_rate >= 25) score += 15;
    else if (conversion_rate >= 20) score += 10;
    else if (conversion_rate >= 15) score += 5;
    else score -= 5;
    
    // Quality score
    const high_quality = deals.filter(d => (d.deal_metrics?.deal_score || 0) >= 70).length;
    const quality_rate = deals.length > 0 ? (high_quality / deals.length) * 100 : 0;
    
    if (quality_rate >= 40) score += 20;
    else if (quality_rate >= 30) score += 15;
    else if (quality_rate >= 20) score += 10;
    else score -= 10;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  calculateDealsPerMonth(deals) {
    if (deals.length === 0) return 0;
    
    const dates = deals.map(d => d.timeline?.date_discovered).filter(Boolean);
    if (dates.length === 0) return 0;
    
    const earliest = new Date(Math.min(...dates.map(d => new Date(d))));
    const latest = new Date(Math.max(...dates.map(d => new Date(d))));
    const months = (latest - earliest) / (1000 * 60 * 60 * 24 * 30);
    
    return months > 0 ? Math.round((deals.length / months) * 10) / 10 : 0;
  }

  getScoreBreakdown(deal) {
    return {
      financial_metrics: 60, // Weight of financial factors
      property_condition: 20, // Weight of property factors
      location_factors: 15,   // Weight of location factors
      market_timing: 5        // Weight of timing factors
    };
  }

  getScoringMethodology() {
    return {
      financial_metrics: {
        cap_rate: { weight: 25, excellent: '≥10%', good: '≥8%', fair: '≥6%', poor: '<4%' },
        cash_on_cash: { weight: 25, excellent: '≥15%', good: '≥12%', fair: '≥8%', poor: '<5%' },
        total_return: { weight: 20, excellent: '≥30%', good: '≥20%', fair: '≥15%', poor: '<10%' },
        breakeven_ratio: { weight: 15, excellent: '≥1.3', good: '≥1.2', fair: '≥1.1', poor: '<1.0' }
      },
      property_factors: {
        condition: { weight: 5, excellent: 'Excellent', good: 'Good', fair: 'Fair', poor: 'Poor/Distressed' }
      },
      scoring_scale: {
        excellent: '80-100 points',
        good: '60-79 points',
        fair: '40-59 points',
        poor: '0-39 points'
      }
    };
  }

  calculateAverageTimeline(deals) {
    const completed_deals = deals.filter(d => d.current_stage === 'completed' && d.timeline?.date_discovered && d.timeline?.closing_date);
    
    if (completed_deals.length === 0) return null;
    
    const total_days = completed_deals.reduce((sum, deal) => {
      const start = new Date(deal.timeline.date_discovered);
      const end = new Date(deal.timeline.closing_date);
      return sum + Math.floor((end - start) / (1000 * 60 * 60 * 24));
    }, 0);
    
    return {
      average_days: Math.round(total_days / completed_deals.length),
      sample_size: completed_deals.length,
      fastest_deal: Math.min(...completed_deals.map(deal => {
        const start = new Date(deal.timeline.date_discovered);
        const end = new Date(deal.timeline.closing_date);
        return Math.floor((end - start) / (1000 * 60 * 60 * 24));
      })),
      slowest_deal: Math.max(...completed_deals.map(deal => {
        const start = new Date(deal.timeline.date_discovered);
        const end = new Date(deal.timeline.closing_date);
        return Math.floor((end - start) / (1000 * 60 * 60 * 24));
      }))
    };
  }

  hasReachedStage(deal, stage) {
    const stage_hierarchy = ['lead', 'initial_analysis', 'offer_submitted', 'under_contract', 'due_diligence', 'financing', 'closing', 'completed'];
    const current_index = stage_hierarchy.indexOf(deal.current_stage);
    const target_index = stage_hierarchy.indexOf(stage);
    return current_index >= target_index;
  }

  analyzeDropOffs(conversion_rates) {
    return conversion_rates.filter(rate => rate.conversion_rate < 50)
                          .map(rate => ({
                            stage: rate.from_stage,
                            drop_off_rate: 100 - rate.conversion_rate,
                            potential_improvement: Math.round((100 - rate.conversion_rate) * 0.1)
                          }));
  }

  hasOverdueItems(deal) {
    if (!deal.timeline) return false;
    
    const now = new Date();
    const deadlines = ['inspection_deadline', 'financing_deadline', 'closing_date'];
    
    return deadlines.some(deadline => {
      if (!deal.timeline[deadline]) return false;
      return new Date(deal.timeline[deadline]) < now;
    });
  }

  generateActionItems(deals) {
    const actions = [];
    
    // High priority deals needing attention
    const critical_deals = deals.filter(d => d.stage_health === 'Critical');
    if (critical_deals.length > 0) {
      actions.push(`Review ${critical_deals.length} critical deals that need immediate attention`);
    }
    
    // Upcoming deadlines
    const upcoming = deals.filter(d => this.hasUpcomingDeadlines(d));
    if (upcoming.length > 0) {
      actions.push(`Prepare for ${upcoming.length} upcoming deadlines this week`);
    }
    
    // Low scoring deals
    const low_score = deals.filter(d => (d.deal_metrics?.deal_score || 0) < 40);
    if (low_score.length > 0) {
      actions.push(`Consider dropping ${low_score.length} low-scoring deals`);
    }
    
    return actions;
  }

  identifyFocusAreas(deals, pipeline_analytics) {
    const focus_areas = [];
    
    if (deals.length < 10) {
      focus_areas.push('Lead Generation - Increase pipeline volume');
    }
    
    if (pipeline_analytics?.bottlenecks?.length > 0) {
      focus_areas.push('Process Optimization - Address stage bottlenecks');
    }
    
    const high_quality_rate = deals.length > 0 ? 
      (deals.filter(d => (d.deal_metrics?.deal_score || 0) >= 70).length / deals.length) * 100 : 0;
    
    if (high_quality_rate < 30) {
      focus_areas.push('Deal Quality - Improve sourcing criteria');
    }
    
    return focus_areas;
  }

  hasUpcomingDeadlines(deal) {
    if (!deal.timeline) return false;
    
    const now = new Date();
    const next_week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const deadlines = ['inspection_deadline', 'financing_deadline', 'closing_date'];
    
    return deadlines.some(deadline => {
      if (!deal.timeline[deadline]) return false;
      const deadline_date = new Date(deal.timeline[deadline]);
      return deadline_date >= now && deadline_date <= next_week;
    });
  }
}