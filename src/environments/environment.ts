export const environment = { 
  production: false, 
  // Updated backend URL
  apiUrl: 'https://accessibility-checker-2sj3m9idk-kates-projects-e59a7a1b.vercel.app',
  // API endpoints
  uploadEndpoint: '/upload-pdf',
  officeEndpoint: '/process-office-file',
  // Microsoft Graph configuration
  msalConfig: {
    clientId: 'your-client-id-here', // Replace with your Azure App Registration client ID
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: 'http://localhost:4200'
  },
  graphScopes: ['Files.Read', 'Files.Read.All', 'Sites.Read.All', 'User.Read']
};
