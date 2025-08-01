import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class StateAssistanceResource {
  constructor() {
    // Load state programs data from JSON file
    const dataPath = join(__dirname, '..', 'data', 'state-programs.json');
    try {
      const data = readFileSync(dataPath, 'utf-8');
      this.programsData = JSON.parse(data);
    } catch (error) {
      // Fallback to sample data if file doesn't exist
      this.programsData = {
        programs: [],
        federal_programs: [],
        tips: []
      };
    }
  }

  async getAll() {
    // Convert array format to object format for backward compatibility
    const statesObj = {};
    this.programsData.programs.forEach(stateData => {
      statesObj[stateData.state] = {
        programs: stateData.programs,
        income_limits: stateData.income_limits,
        contact: stateData.contact
      };
    });

    return {
      states: statesObj,
      federal_programs: this.programsData.federal_programs,
      tips: this.programsData.tips,
      total_states: this.programsData.programs.length,
      last_updated: this.programsData.last_updated
    };
  }

  async getByState(state) {
    // Find state data
    const stateData = this.programsData.programs.find(
      s => s.state.toLowerCase() === state.toLowerCase()
    );
    
    if (stateData) {
      return {
        state: stateData.state,
        programs: stateData.programs,
        income_limits: stateData.income_limits,
        contact: stateData.contact,
        federal_programs: this.programsData.federal_programs,
        tips: [
          `Income limits in ${stateData.state}: ${stateData.income_limits}`,
          'Many state programs can be combined with FHA, VA, or USDA loans',
          'Check city and county programs for additional assistance',
          `Contact ${stateData.state} housing agency: ${stateData.contact}`
        ]
      };
    } else {
      return { 
        programs: [], 
        federal_programs: this.programsData.federal_programs,
        message: `State-specific data for ${state} not available. Federal programs listed below are available nationwide.`,
        tips: [
          'Check your state housing finance agency website',
          'Look for local city/county down payment assistance',
          'Consider FHA (3.5% down) or VA loans (0% down for veterans)'
        ]
      };
    }
  }

  async searchPrograms(query) {
    const searchLower = query.toLowerCase();
    const results = [];

    // Search state programs
    this.programsData.programs.forEach(stateData => {
      stateData.programs.forEach(program => {
        if (program.name.toLowerCase().includes(searchLower) ||
            program.type.toLowerCase().includes(searchLower) ||
            program.eligibility.toLowerCase().includes(searchLower)) {
          results.push({
            state: stateData.state,
            ...program
          });
        }
      });
    });

    // Search federal programs
    this.programsData.federal_programs.forEach(program => {
      if (program.name.toLowerCase().includes(searchLower) ||
          program.type.toLowerCase().includes(searchLower) ||
          program.eligibility.toLowerCase().includes(searchLower)) {
        results.push({
          state: 'Federal',
          ...program
        });
      }
    });

    return results;
  }
}