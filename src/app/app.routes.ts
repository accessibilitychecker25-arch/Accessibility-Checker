import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { AssignmentsComponent } from './assignments/assignments.component';
import { AuthGuard } from './auth.guard';
import { ScreenshotUploadComponent } from './screenshot-upload/screenshot-upload.component';

export const appRoutes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'assignments', component: AssignmentsComponent },
    ],
  },
];
