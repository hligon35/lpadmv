import { requireServerEnv } from './serverEnv';

// Server-only base URL for your HTTPS functions (emulator or deployed)
// Example emulator: http://127.0.0.1:5001/<projectId>/us-central1
export function getFunctionsBaseUrl(): string {
  return requireServerEnv('FUNCTIONS_BASE_URL');
}
