import app from '../server/src/app.js';

// Vercel treats this file as a serverless function.
// Exporting the Express app directly lets Vercel forward every
// request that matches the routes defined in vercel.json to it.
export default app;
