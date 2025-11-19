import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app/app.routes';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';

const firebaseConfig = {
  apiKey: "AIzaSyAuj6XLcgQduNnv547xplFh7M4dWlq1pQc",
  authDomain: "accessibility-checker-3cdd0.firebaseapp.com",
  projectId: "accessibility-checker-3cdd0",
  storageBucket: "accessibility-checker-3cdd0.firebasestorage.app",
  messagingSenderId: "948822095350",
  appId: "1:948822095350:web:25c55da2cffd2d33c083d7",
  measurementId: "G-7PJ1GWP2LY"
};

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideHttpClient(),
    provideRouter(appRoutes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
  ],
});
