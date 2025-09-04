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

  constructor(private router: Router) {}

  ngOnInit() {
    if (this.router.url !== '/register') {
      this.selectedTab = 'register';
      this.router.navigate(['register']);
    }
  }

  selectTab(tab: 'register' | 'attend') {
    this.selectedTab = tab;
    this.router.navigate([tab]);
  }
}
