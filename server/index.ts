import express from 'express';
import path from 'path';

export function createServer() {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static files from dist/spa in production
  // In development, Vite dev server handles this
  if (process.env.NODE_ENV === 'production') {
    const spaDir = path.join(__dirname, '../dist/spa');
    app.use(express.static(spaDir));
  }

  // Helper function to get frontend URL
  function getFrontendUrl(req: express.Request): string {
    // Priority: environment variable > request origin > localhost
    if (process.env.FRONTEND_URL) {
      return process.env.FRONTEND_URL;
    }
    
    // In development, use the request's origin
    if (req.headers.origin) {
      return req.headers.origin;
    }
    
    // Fallback for development
    const isProduction = process.env.NODE_ENV === 'production';
    return isProduction ? 'https://yourfrontend.com' : 'http://localhost:8080';
  }

  // OAuth Callback Route - Handles Google OAuth callback
  app.get('/auth/callback', (req, res) => {
    const token = req.query.token || req.query.access_token;
    const refreshToken = req.query.refreshToken || req.query.refresh_token;
    const provider = req.query.provider || 'google';
    const error = req.query.error;
    const errorDescription = req.query.error_description;

    const frontendUrl = getFrontendUrl(req);

    if (error) {
      // Redirect to frontend with error
      return res.redirect(
        `${frontendUrl}/auth/callback?error=${encodeURIComponent(error as string)}&error_description=${encodeURIComponent(errorDescription as string || '')}`
      );
    }

    if (token) {
      // Build redirect URL with token and optional refresh token
      let redirectUrl = `${frontendUrl}/auth/callback?token=${encodeURIComponent(token as string)}&provider=${encodeURIComponent(provider as string)}`;
      if (refreshToken) {
        redirectUrl += `&refreshToken=${encodeURIComponent(refreshToken as string)}`;
      }
      return res.redirect(redirectUrl);
    }

    // No token or error - redirect to frontend error
    res.redirect(`${frontendUrl}/auth/callback?error=no_token_received&error_description=No token received from OAuth provider`);
  });

  // Google OAuth Initiate Route
  // This endpoint should be handled by your actual backend API
  // For now, we'll create a placeholder that redirects to your actual backend
  app.get('/auth/google', (req, res) => {
    // Get the redirect_uri that was passed in
    const redirectUri = req.query.redirect_uri;
    
    // If no redirect_uri, default to our callback endpoint
    const callbackUrl = redirectUri || `${getFrontendUrl(req)}/auth/callback`;
    
    // This should redirect to Google OAuth on your actual backend
    // The actual implementation depends on your backend setup
    const actualBackendGoogleUrl = `https://api.getcentauri.com/api/v1/auth/google?redirect_uri=${encodeURIComponent(callbackUrl)}`;
    res.redirect(actualBackendGoogleUrl);
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // SPA Fallback - serve index.html for all other routes in production
  if (process.env.NODE_ENV === 'production') {
    const spaDir = path.join(__dirname, '../dist/spa');
    app.get('*', (req, res) => {
      res.sendFile(path.join(spaDir, 'index.html'));
    });
  }

  return app;
}
