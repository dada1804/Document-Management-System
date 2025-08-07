import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DocumentService, Document, DocumentStats } from '../../core/services/document.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule
  ],
  template: `
    <div class="dashboard-container">
      <h1>Welcome, {{ currentUser?.username }}!</h1>
      
      <!-- Statistics Cards -->
      <div class="stats-grid" *ngIf="!loading">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">folder</mat-icon>
              <div class="stat-info">
                <h3>{{ stats?.userDocumentCount || 0 }}</h3>
                <p>My Documents</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">public</mat-icon>
              <div class="stat-info">
                <h3>{{ stats?.publicDocumentCount || 0 }}</h3>
                <p>Public Documents</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">cloud_upload</mat-icon>
              <div class="stat-info">
                <h3>{{ recentDocuments.length || 0 }}</h3>
                <p>Recent Uploads</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Loading Spinner -->
      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading dashboard...</p>
      </div>

      <!-- Quick Actions -->
      <mat-card class="action-card" *ngIf="!loading">
        <mat-card-header>
          <mat-card-title>Quick Actions</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="action-buttons">
            <button mat-raised-button color="primary" routerLink="/documents/upload">
              <mat-icon>cloud_upload</mat-icon>
              Upload Document
            </button>
            <button mat-raised-button color="accent" routerLink="/documents">
              <mat-icon>folder</mat-icon>
              View Documents
            </button>
            <button mat-raised-button routerLink="/documents/public">
              <mat-icon>public</mat-icon>
              Public Documents
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Recent Documents -->
      <mat-card class="recent-documents-card" *ngIf="!loading && recentDocuments.length > 0">
        <mat-card-header>
          <mat-card-title>Recent Documents</mat-card-title>
          <mat-card-subtitle>Your latest uploads</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <mat-list>
            <mat-list-item *ngFor="let doc of recentDocuments" class="document-item">
              <mat-icon matListItemIcon [matTooltip]="doc.contentType">
                {{ getFileIcon(doc.contentType) }}
              </mat-icon>
              <div matListItemTitle>{{ doc.originalFilename }}</div>
              <div matListItemLine>
                <span class="document-meta">
                  {{ formatFileSize(doc.fileSize) }} • 
                  {{ doc.uploadDate | date:'short' }}
                </span>
                <mat-chip-set>
                  <mat-chip *ngIf="doc.isPublic" color="primary" variant="outlined">Public</mat-chip>
                  <mat-chip *ngFor="let tag of doc.tags?.slice(0, 2)" variant="outlined">{{ tag }}</mat-chip>
                </mat-chip-set>
              </div>
              <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="downloadDocument(doc.id)">
                  <mat-icon>download</mat-icon>
                  <span>Download</span>
                </button>
                <button mat-menu-item (click)="viewDocument(doc.id)">
                  <mat-icon>visibility</mat-icon>
                  <span>View Details</span>
                </button>
              </mat-menu>
            </mat-list-item>
          </mat-list>
        </mat-card-content>
      </mat-card>

      <!-- Empty State -->
      <mat-card class="empty-state-card" *ngIf="!loading && (!recentDocuments || recentDocuments.length === 0)">
        <mat-card-content class="empty-state-content">
          <mat-icon class="empty-icon">folder_open</mat-icon>
          <h3>No documents yet</h3>
          <p>Start by uploading your first document</p>
          <button mat-raised-button color="primary" routerLink="/documents/upload">
            <mat-icon>cloud_upload</mat-icon>
            Upload Document
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 24px;
      color: #333;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .stat-info h3 {
      margin: 0;
      font-size: 32px;
      font-weight: 500;
    }

    .stat-info p {
      margin: 4px 0 0 0;
      opacity: 0.9;
    }

    .action-card {
      margin-bottom: 24px;
    }

    .action-buttons {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .action-buttons button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
    }

    .recent-documents-card {
      margin-bottom: 24px;
    }

    .document-item {
      border-bottom: 1px solid #eee;
    }

    .document-item:last-child {
      border-bottom: none;
    }

    .document-meta {
      color: #666;
      font-size: 14px;
    }

    .empty-state-card {
      text-align: center;
      padding: 40px;
    }

    .empty-state-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 40px;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }

      .action-buttons button {
        width: 100%;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  stats: DocumentStats | null = null;
  recentDocuments: Document[] = [];
  loading = true;

  constructor(
    private documentService: DocumentService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading = true;
    
    // Load stats
    this.documentService.getDocumentStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });

    // Load recent documents
    this.documentService.getMyDocuments(0, 5).subscribe({
      next: (response) => {
        this.recentDocuments = response.content;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading recent documents:', error);
        this.loading = false;
      }
    });
  }

  getFileIcon(contentType: string): string {
    return this.documentService.getFileIcon(contentType);
  }

  formatFileSize(bytes: number): string {
    return this.documentService.formatFileSize(bytes);
  }

  downloadDocument(id: string): void {
    this.documentService.downloadDocument(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'document';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading document:', error);
      }
    });
  }

  viewDocument(id: string): void {
    this.router.navigate(['/documents', id]);
  }
} 