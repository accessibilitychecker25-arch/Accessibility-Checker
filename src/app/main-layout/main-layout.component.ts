import { Component } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  imports: [RouterModule],
})
export class MainLayoutComponent {
  constructor(
    private auth: Auth,
    private router: Router,
  ) {}

  isDarkMode = false;

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }

  ngOnInit(): void {
    const darkPref = localStorage.getItem('darkMode') === 'true';
    this.isDarkMode = darkPref;

    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  logout() {
    signOut(this.auth).then(() => {
      this.router.navigate(['/']); // go back to login after logout
    });
  }
}
