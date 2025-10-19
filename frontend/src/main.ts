import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { API_BASE_URL } from './app/app.tokens';

async function fetchRuntimeConfig() {
  try {
    const res = await fetch('/assets/config.json');
    if (!res.ok) throw new Error(`Failed to load config: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('Error loading runtime config, falling back to defaults', e);
    return { API_BASE_URL: 'http://backend:5000' };
  }
}

fetchRuntimeConfig().then((cfg) => {
  try {
    (window as any).__RUNTIME_CONFIG__ = cfg;
  } catch (e) {
    // ignore
  }

  const providers = [
    ...appConfig.providers,
    { provide: API_BASE_URL, useValue: cfg.API_BASE_URL }
  ];

  bootstrapApplication(AppComponent, { providers })
    .catch((err) => console.error(err));
});
