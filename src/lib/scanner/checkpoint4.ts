import axios from 'axios';
import { CheckpointResult } from '../../types';

export async function checkAgentPermissions(domain: string): Promise<CheckpointResult> {
  const targetUrl = `https://${domain}/agent-permissions.json`;
  
  try {
    const response = await axios.get(targetUrl, {
      timeout: 5000,
      headers: { 'User-Agent': 'AEOAnalyzer/1.0' },
      validateStatus: () => true
    });

    if (response.status === 200 && response.data) {
      let parsedJson;
      try {
        parsedJson = typeof response.data === 'object' ? response.data : JSON.parse(response.data);
        return {
          pass: true,
          label: 'Agent-Permissions.json',
          detail: 'Valid agent-permissions.json found at root. Offers highly controlled, structured rules for autonomous AI agents.'
        };
      } catch (parseError) {
        return {
          pass: false,
          label: 'Agent-Permissions.json',
          detail: 'File exists at root, but is not valid JSON. Ensure it has correct syntax and formatting.'
        };
      }
    }

    if (response.status === 404) {
      return {
        pass: false,
        label: 'Agent-Permissions.json',
        detail: 'File not found (404) at root. AI agents cannot find fine-grained crawling and interaction rules.'
      };
    }

    return {
      pass: false,
      label: 'Agent-Permissions.json',
      detail: `File returned status ${response.status}. Requires a valid JSON file detailing AI agent guidelines.`
    };
  } catch (error: any) {
    console.error('Error checking agent-permissions.json:', error.message);
    return {
      pass: false,
      label: 'Agent-Permissions.json',
      detail: `Could not check agent-permissions.json: ${error.message}. Please configure a valid JSON file at /agent-permissions.json.`
    };
  }
}
