import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="profile-container">
      <mat-card class="profile-card">
        <mat-card-header>
          <mat-card-title>User Profile</mat-card-title>
          <mat-card-subtitle>Manage your account information</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="profile-info">
            <div class="info-item">
              <strong>Username:</strong> {{ currentUser?.username }}
            </div>
            <div class="info-item">
              <strong>Email:</strong> {{ currentUser?.email }}
            </div>
            <div class="info-item">
              <strong>Role:</strong> {{ currentUser?.role }}
            </div>
          </div>
        </mat-card-content>
        
        <mat-card-actions>
          <button mat-raised-button color="primary">
            <mat-icon>edit</mat-icon>
            Edit Profile
          </button>
          <button mat-raised-button color="accent">
            <mat-icon>lock</mat-icon>
            Change Password
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }

    .profile-card {
      padding: 20px;
    }

    .profile-info {
      margin: 20px 0;
    }

    .info-item {
      margin: 12px 0;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }

    .info-item:last-child {
      border-bottom: none;
    }

    mat-card-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-start;
    }
  `]
})
export class ProfileComponent {
  currentUser: any;

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
  }
} 