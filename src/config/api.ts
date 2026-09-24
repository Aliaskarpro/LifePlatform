const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
export const API_BASE_URL = configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:3001' : '');
const defaultWsUrl = API_BASE_URL
  ? API_BASE_URL.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:')
  : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
export const WS_URL = import.meta.env.VITE_WS_URL || defaultWsUrl;
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'LifePlatform';
