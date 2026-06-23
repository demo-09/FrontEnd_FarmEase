import './preboot';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { App } from './app/app';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';

const bootstrap = () => {
  bootstrapApplication(App, {
    providers: [
      provideRouter(routes, withHashLocation()),
      provideHttpClient(withInterceptors([authInterceptor]))
    ]
  }).catch(err => console.error(err));
};

if (typeof window !== 'undefined') {
  fetch('/config.json')
    .then(res => res.json())
    .then(config => {
      (window as any).process = {
        env: {
          GEMINI_API_KEY: config.geminiApiKey || '',
          API_URL: config.apiUrl || 'https://backend-farmease-1.onrender.com',
          CLOUDINARY_CLOUD_NAME: config.cloudinaryCloudName || '',
          CLOUDINARY_UPLOAD_PRESET: config.cloudinaryUploadPreset || ''
        }
      };
      bootstrap();
    })
    .catch(err => {
      console.error('Failed to load configuration:', err);
      bootstrap();
    });
} else {
  // On the server side (SSR), bootstrap immediately without fetching config.json
  bootstrap();
}
