/**
 * DEPRECATED: This service has been replaced by analysisService.ts
 * for the strictly local air-gapped version of Sentinel AI Gateway.
 * 
 * Please update any remaining imports to point to ./analysisService
 */

import { LogEntry } from '../types';
import { analyzeGatewayTraffic as newAnalyze } from './analysisService';

export const analyzeGatewayTraffic = async (logs: LogEntry[]): Promise<string> => {
  console.warn("Using deprecated geminiService. Please migrate to analysisService.");
  return newAnalyze(logs);
};