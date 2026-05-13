import { isDevMode } from '@angular/core';

const LIVE_URL = 'https://backend-farmease-1.onrender.com';
const LOCAL_URL = 'http://localhost:5009';

// Check if we are running on localhost
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const BASE_URL = isLocal ? LOCAL_URL : LIVE_URL;
export const API_URL = `${BASE_URL}/api`;
export const HUB_URL = `${BASE_URL}/chatHub`;
