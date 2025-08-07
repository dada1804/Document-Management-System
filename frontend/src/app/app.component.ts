import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService, User } from './core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule
  ],
  template: `
    <div class="app-container">
      <!-- Toolbar -->
      <mat-toolbar color="primary" class="toolbar">
        <button mat-icon-button (click)="sidenav.toggle()">
          <mat-icon>menu</mat-icon>
        </button>
        
        <span class="toolbar-title">Document Management System</span>
        
        <span class="spacer"></span>
        
        <ng-container *ngIf="currentUser$ | async as user; else authButtons">
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item (click)="navigateToProfile()">
              <mat-icon>person</mat-icon>
              <span>Profile</span>
            </button>
            <button mat-menu-item (click)="logout()">
              <mat-icon>exit_to_app</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </ng-container>
        
        <ng-template #authButtons>
          <button mat-button routerLink="/auth/login">Login</button>
          <button mat-button routerLink="/auth/register">Register</button>
        </ng-template>
      </mat-toolbar>

      <!-- Sidenav -->
      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav mode="side" opened class="sidenav">
          <mat-nav-list>
            <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
              <mat-icon>dashboard</mat-icon>
              <span>Dashboard</span>
            </a>
            <a mat-list-item routerLink="/documents" routerLinkActive="active">
              <mat-icon>folder</mat-icon>
              <span>Documents</span>
            </a>
            <a mat-list-item routerLink="/documents/upload" routerLinkActive="active">
              <mat-icon>cloud_upload</mat-icon>
              <span>Upload</span>
            </a>
            <a mat-list-item routerLink="/documents/public" routerLinkActive="active">
              <mat-icon>public</mat-icon>
              <span>Public Documents</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <!-- Main content -->
        <mat-sidenav-content class="main-content">
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }

    .toolbar-title {
      margin-left: 8px;
      font-size: 18px;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .sidenav-container {
      flex: 1;
      margin-top: 64px;
    }

    .sidenav {
      width: 250px;
    }

    .main-content {
      padding: 20px;
    }

    .mat-nav-list .active {
      background-color: rgba(0, 0, 0, 0.1);
    }

    mat-nav-list a {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  `]
})
export class AppComponent {
  currentUser$ = this.authService.currentUser$;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }
} 