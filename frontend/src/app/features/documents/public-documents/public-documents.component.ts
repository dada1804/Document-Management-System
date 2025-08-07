import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { DocumentService, Document, PageResponse } from '../../../core/services/document.service';
import { FileSizePipe } from '../../../shared/pipes/file-size.pipe';

@Component({
  selector: 'app-public-documents',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    RouterModule,
    FileSizePipe
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Public Documents</h1>
        <p>Browse publicly available documents</p>
      </div>

      <div class="content">
        <div *ngIf="loading" class="loading">
          <mat-spinner></mat-spinner>
          <p>Loading public documents...</p>
        </div>

        <div *ngIf="!loading && documents.length === 0" class="empty-state">
          <mat-icon>folder_open</mat-icon>
          <h3>No Public Documents</h3>
          <p>There are currently no public documents available.</p>
        </div>

        <div *ngIf="!loading && documents.length > 0" class="documents-grid">
          <mat-card *ngFor="let document of documents" class="document-card">
            <mat-card-header>
              <mat-card-title>{{ document.filename }}</mat-card-title>
              <mat-card-subtitle>
                Uploaded by {{ document.uploadedByUsername }} on {{ document.uploadDate | date:'medium' }}
              </mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <p *ngIf="document.description">{{ document.description }}</p>
              
              <div class="document-meta">
                <mat-chip-set>
                  <mat-chip>{{ document.contentType }}</mat-chip>
                  <mat-chip>{{ document.fileSize | fileSize }}</mat-chip>
                </mat-chip-set>
              </div>
            </mat-card-content>
            
            <mat-card-actions>
              <button mat-button color="primary" [routerLink]="['/documents', document.id]">
                <mat-icon>visibility</mat-icon>
                View Details
              </button>
              <button mat-button color="accent" (click)="downloadDocument(document)">
                <mat-icon>download</mat-icon>
                Download
              </button>
            </mat-card-actions>
          </mat-card>
        </div>

        <div *ngIf="error" class="error">
          <mat-icon>error</mat-icon>
          <h3>Error Loading Documents</h3>
          <p>{{ error }}</p>
          <button mat-raised-button color="primary" (click)="loadPublicDocuments()">
            Try Again
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 32px;
    }

    .header h1 {
      margin: 0 0 8px 0;
      color: #1976d2;
    }

    .header p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
    }

    .loading p {
      margin-top: 16px;
      color: #666;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      text-align: center;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #666;
    }

    .empty-state p {
      margin: 0;
      color: #999;
    }

    .documents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }

    .document-card {
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }

    .document-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .document-meta {
      margin-top: 16px;
    }

    .document-meta mat-chip-set {
      display: flex;
      gap: 8px;
    }

    mat-card-actions {
      display: flex;
      justify-content: space-between;
      padding: 16px;
    }

    .error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      text-align: center;
    }

    .error mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #f44336;
      margin-bottom: 16px;
    }

    .error h3 {
      margin: 0 0 8px 0;
      color: #f44336;
    }

    .error p {
      margin: 0 0 16px 0;
      color: #666;
    }

    @media (max-width: 768px) {
      .container {
        padding: 16px;
      }

      .documents-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }
  `]
})
export class PublicDocumentsComponent implements OnInit {
  documents: Document[] = [];
  loading = false;
  error: string | null = null;

  constructor(private documentService: DocumentService) {}

  ngOnInit(): void {
    this.loadPublicDocuments();
  }

  loadPublicDocuments(): void {
    this.loading = true;
    this.error = null;

    this.documentService.getPublicDocuments().subscribe({
      next: (response: PageResponse<Document>) => {
        this.documents = response.content;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load public documents. Please try again.';
        this.loading = false;
        console.error('Error loading public documents:', error);
      }
    });
  }

  downloadDocument(doc: Document): void {
    this.documentService.downloadDocument(doc.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.filename;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading document:', error);
        // You might want to show a snackbar or toast notification here
      }
    });
  }
} 