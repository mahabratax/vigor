import { defineConfig } from '@playwright/test';
export default defineConfig({
    testDir:'./tests', testMatch:'preview.spec.ts',
    use:{baseURL:'http://127.0.0.1:5173',viewport:{width:1440,height:1000}},
    webServer:{command:'node scripts/serve.cjs',url:'http://127.0.0.1:5173',reuseExistingServer:!process.env.CI}
});
