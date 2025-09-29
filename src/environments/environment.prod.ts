export const environment = { 
  production: true, 
  // Updated backend URL - NEW DEPLOYMENT
  apiUrl: 'https://accessibility-checker-5kashuy08-kates-projects-e59a7a1b.vercel.app',
  // API endpoints - using /api/ prefix for Vercel
  uploadEndpoint: '/api/upload-pdf',
  officeEndpoint: '/api/process-office-file',
  // Microsoft Graph configuration
  msalConfig: {
    clientId: 'your-client-id-here', // Replace with your Azure App Registration client ID
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: 'https://kmoreland126.github.io/Accessibility-Checker/'
  },
  graphScopes: ['Files.Read', 'Files.Read.All', 'Sites.Read.All', 'User.Read']
};
