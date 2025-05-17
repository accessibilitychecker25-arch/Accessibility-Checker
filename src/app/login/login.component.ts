import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  constructor(
    private auth: Auth,
    private router: Router,
  ) {
    onAuthStateChanged(this.auth, (user: User | null) => {
      if (user) {
        console.log('User is logged in:', user);
        this.router.navigate(['/dashboard']); // <---- Navigate here on success
      } else {
        console.log('No user logged in');
      }
    });
  }

  login() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(this.auth, provider)
      .then((result) => {
        console.log('User logged in:', result.user);
        // TODO: Navigate to dashboard or save state
      })
      .catch((error) => console.error('Login error:', error));
  }
}
