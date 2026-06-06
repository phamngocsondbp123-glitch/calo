import { env } from './config/env.js';

const { default: app } = env.demoMode ? await import('./demoApp.js') : await import('./app.js');

app.listen(env.port, () => console.log(`Calo API running on http://localhost:${env.port}${env.demoMode ? ' (demo mode, no PostgreSQL)' : ''}`));
