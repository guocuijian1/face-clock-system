import { Routes } from '@angular/router';
import RegisterComponent from './components/register/register.component';
import AttendComponent from './components/attend/attend.component';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'attend', component: AttendComponent },
  { path: '', redirectTo: 'register', pathMatch: 'full' }
];
