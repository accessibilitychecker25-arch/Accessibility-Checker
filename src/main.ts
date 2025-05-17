import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app/app.routes';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDzrENp3FsgzsuLeiuellDsnE4W8Vbe3Lw",
  authDomain: "grade-checker-5bd43.firebaseapp.com",
  projectId: "grade-checker-5bd43",
  storageBucket: "grade-checker-5bd43.appspot.com",
  messagingSenderId: "397851820077",
  appId: "1:397851820077:web:2e15d2150f809ed177b8a4",
  measurementId: "G-H08YNXRWF5"
};

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth())
  ],
});
