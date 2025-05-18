import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  toggleDarkMode() {
    document.documentElement.classList.toggle('dark');

    // Optional: Persist preference
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('darkMode', isDark ? 'true' : 'false');
  }

  ngOnInit() {
    // Load saved preference
    const darkPref = localStorage.getItem('darkMode') === 'true';
    if (darkPref) {
      document.documentElement.classList.add('dark');
    }
  }
}
