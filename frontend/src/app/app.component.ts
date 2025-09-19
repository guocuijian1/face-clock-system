import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  selectedTab: 'register' | 'attend' = 'register';

  constructor(private readonly router: Router) {}

  ngOnInit() {
    if (this.router.url !== '/register') {
      this.selectedTab = 'register';
      this.router.navigate(['register']).then(r => {});
    }
  }

  selectTab(tab: 'register' | 'attend') {
    this.selectedTab = tab;
    this.router.navigate([tab]).then(r => {});
  }

  onTabKeyDown(event: KeyboardEvent, tab: 'register' | 'attend') {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.selectTab(tab);
    }
  }
}
