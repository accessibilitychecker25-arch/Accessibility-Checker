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

  logout() {
    signOut(this.auth).then(() => {
      this.router.navigate(['/']); // go back to login after logout
    });
  }
}
