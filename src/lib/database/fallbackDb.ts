import fs from 'fs';
import path from 'path';
import { AeoReport, AeoLead, SaveScan } from '../../types';

const FALLBACK_DIR = path.join(process.cwd(), 'data');
const REPORTS_FILE = path.join(FALLBACK_DIR, 'aeo_reports.json');
const LEADS_FILE = path.join(FALLBACK_DIR, 'aeo_leads.json');
const SAVED_SCANS_FILE = path.join(FALLBACK_DIR, 'aeo_saved_scans.json');

// Ensure data folder exists
function ensureDataFolder() {
  if (!fs.existsSync(FALLBACK_DIR)) {
    try {
      fs.mkdirSync(FALLBACK_DIR, { recursive: true });
    } catch (e) {
      console.error('Failed to create fallback data directory:', e);
    }
  }
}

function readJsonFile<T>(filePath: string): T[] {
  ensureDataFolder();
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as T[];
  } catch (e) {
    console.error(`Error reading database file ${filePath}:`, e);
    return [];
  }
}

function writeJsonFile<T>(filePath: string, data: T[]) {
  ensureDataFolder();
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error(`Error writing database file ${filePath}:`, e);
  }
}

export const fallbackDb = {
  // Reports
  getReports: (): AeoReport[] => readJsonFile<AeoReport>(REPORTS_FILE),
  
  saveReport: (report: Omit<AeoReport, 'id' | 'created_at'> & { id?: string; created_at?: string }): AeoReport => {
    const reports = fallbackDb.getReports();
    const newReport: AeoReport = {
      ...report,
      id: report.id || `rep_${Math.random().toString(36).substr(2, 9)}`,
      created_at: report.created_at || new Date().toISOString()
    };
    reports.push(newReport);
    writeJsonFile(REPORTS_FILE, reports);
    return newReport;
  },

  getReportByDomain: (domain: string): AeoReport | null => {
    const reports = fallbackDb.getReports();
    const normalized = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();
    
    // Find reports for the domain created in last 24h
    const match = reports
      .filter(r => r.domain.toLowerCase() === normalized)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    if (!match) return null;

    // Check if within 24 hours
    const ageMs = Date.now() - new Date(match.created_at).getTime();
    const isUnder24h = ageMs < 24 * 60 * 60 * 1000;
    
    return isUnder24h ? match : null;
  },

  getReportById: (id: string): AeoReport | null => {
    const reports = fallbackDb.getReports();
    return reports.find(r => r.id === id) || null;
  },

  // Leads
  getLeads: (): AeoLead[] => readJsonFile<AeoLead>(LEADS_FILE),
  
  saveLead: (lead: Omit<AeoLead, 'id' | 'created_at'>): AeoLead => {
    const leads = fallbackDb.getLeads();
    const newLead: AeoLead = {
      ...lead,
      id: `lead_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString()
    };
    leads.push(newLead);
    writeJsonFile(LEADS_FILE, leads);
    return newLead;
  },

  hasLead: (domain: string, email: string): boolean => {
    const leads = fallbackDb.getLeads();
    const normalizedDomain = domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();
    return leads.some(l => l.domain.toLowerCase() === normalizedDomain && l.email.toLowerCase() === email.toLowerCase());
  },

  // Saved Scans
  getSavedScans: (): SaveScan[] => readJsonFile<SaveScan>(SAVED_SCANS_FILE),
  
  saveScanLink: (email: string, reportId: string): SaveScan => {
    const saved = fallbackDb.getSavedScans();
    const newSave: SaveScan = {
      id: `save_${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase(),
      report_id: reportId,
      created_at: new Date().toISOString()
    };
    saved.push(newSave);
    writeJsonFile(SAVED_SCANS_FILE, saved);
    return newSave;
  }
};
