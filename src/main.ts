import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app/app.routes';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideAnimations } from '@angular/platform-browser/animations';

const firebaseConfig = {
  apiKey: 'AIzaSyBhW7HnnVFVO-4XFaJLk8mR7ymbxWhkTH4',
  authDomain: 'senior-design-accessibility.firebaseapp.com',
  projectId: 'senior-design-accessibility',
  storageBucket: 'senior-design-accessibility.firebasestorage.app',
  messagingSenderId: '521462721828',
  appId: '1:521462721828:web:2f4295b2658db5903b17b1',
  measurementId: 'G-XE1DW7D98T',
};

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideRouter(appRoutes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
  ],
});
