import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, InputTextModule],
  template: `
    <div class="profile-container">
      <p-card header="User Profile" subheader="Manage your account information" styleClass="profile-card">
        <div class="profile-info">
          <div class="info-item">
            <label class="info-label">Username:</label>
            <span class="info-value">{{ currentUser?.username }}</span>
          </div>
          <div class="info-item">
            <label class="info-label">Email:</label>
            <span class="info-value">{{ currentUser?.email }}</span>
          </div>
          <div class="info-item">
            <label class="info-label">Role:</label>
            <span class="info-value">{{ currentUser?.role }}</span>
          </div>
        </div>
        
        <div class="profile-actions">
          <p-button 
            label="Edit Profile" 
            icon="pi pi-pencil" 
            class="p-button-primary"
            styleClass="action-button">
          </p-button>
          <p-button 
            label="Change Password" 
            icon="pi pi-lock" 
            class="p-button-secondary"
            styleClass="action-button">
          </p-button>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
      min-height: 100vh;
    }

    .profile-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .profile-info {
      margin: 24px 0;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      margin: 16px 0;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #667eea;
      transition: all 0.2s ease;
    }

    .info-item:hover {
      background: #e9ecef;
      transform: translateX(4px);
    }

    .info-label {
      font-weight: 600;
      color: #495057;
      margin-bottom: 4px;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 1.1rem;
      color: #212529;
      font-weight: 500;
    }

    .profile-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-start;
      flex-wrap: wrap;
      margin-top: 24px;
    }

    .action-button {
      min-width: 140px;
      height: 44px;
      font-weight: 500;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .action-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .profile-container {
        padding: 16px;
        max-width: 100%;
      }

      .profile-info {
        margin: 16px 0;
      }

      .info-item {
        margin: 12px 0;
        padding: 12px;
      }

      .profile-actions {
        flex-direction: column;
        gap: 12px;
      }

      .action-button {
        width: 100%;
        min-width: auto;
      }
    }

    @media (max-width: 576px) {
      .profile-container {
        padding: 12px;
      }

      .info-item {
        padding: 10px;
      }

      .info-label {
        font-size: 0.8rem;
      }

      .info-value {
        font-size: 1rem;
      }
    }

    /* Tablet Optimization */
    @media (min-width: 769px) and (max-width: 1024px) {
      .profile-container {
        max-width: 700px;
        padding: 24px;
      }
    }

    /* Desktop and Mac Optimization */
    @media (min-width: 1025px) {
      .profile-container {
        max-width: 700px;
        padding: 32px;
      }

      .profile-card {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }
    }

    /* High DPI Displays */
    @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
      .profile-card {
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      }
    }

    /* Dark Mode Support */
    @media (prefers-color-scheme: dark) {
      .info-item {
        background: #2d3748;
        border-left-color: #667eea;
      }

      .info-item:hover {
        background: #4a5568;
      }

      .info-label {
        color: #a0aec0;
      }

      .info-value {
        color: #e2e8f0;
      }
    }
  `]
})
export class ProfileComponent {
  currentUser: any;

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
  }
} 