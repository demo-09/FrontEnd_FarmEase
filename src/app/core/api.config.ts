import { isDevMode } from '@angular/core';

const LIVE_URL = 'https://backend-farmease-1.onrender.com';
const LOCAL_URL = 'http://localhost:5009';

// Check if we are running on localhost
// FORCE LIVE URL EVERYWHERE
export const BASE_URL = LIVE_URL;
export const API_URL = `${BASE_URL}/api`;
export const HUB_URL = `${BASE_URL}/chatHub`;
