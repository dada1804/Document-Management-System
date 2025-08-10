import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ChipModule } from 'primeng/chip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RouterModule } from '@angular/router';
import { DocumentService, Document, PageResponse } from '../../../core/services/document.service';
import { FileSizePipe } from '../../../shared/pipes/file-size.pipe';

@Component({
  selector: 'app-shared-documents',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    ChipModule,
    ProgressSpinnerModule,
    RouterModule,
    FileSizePipe
  ],
  template: `
    <div class="container">
      <div class="header">
        <h1>Shared with me</h1>
        <p>All documents you can access</p>
      </div>

      <div class="content">
        <div *ngIf="loading" class="loading">
          <p-progressSpinner [style]="{width: '50px', height: '50px'}"></p-progressSpinner>
          <p>Loading documents...</p>
        </div>

        <div *ngIf="!loading && documents.length === 0" class="empty-state">
          <i class="pi pi-folder-open empty-icon"></i>
          <h3>No Documents</h3>
          <p>No one has shared documents with you yet.</p>
        </div>

        <div *ngIf="!loading && documents.length > 0" class="documents-grid">
          <p-card *ngFor="let document of documents" class="document-card" (click)="open(document)">
            <div class="thumb" *ngIf="document.thumbnailContent as t; else iconAvatar">
              <img [src]="'data:image/png;base64,' + t" alt="Preview" />
            </div>
            <ng-template #iconAvatar>
              <div class="thumb placeholder">
                <i class="thumb-icon" [class]="getIcon(document.contentType)"></i>
              </div>
            </ng-template>

            <div class="document-info">
              <h3 class="document-title truncate">{{ document.originalFilename }}</h3>
              <p class="document-subtitle">{{ document.contentType }} • {{ document.fileSize | fileSize }}</p>
            </div>
          </p-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { 
      padding: 24px; 
      max-width: 1200px; 
      margin: 0 auto; 
      min-height: 100vh;
    }
    
    .header { 
      text-align: center; 
      margin-bottom: 32px; 
    }
    
    .header h1 {
      font-size: 2.5rem;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 8px;
    }
    
    .header p {
      font-size: 1.1rem;
      color: #718096;
      margin: 0;
    }
    
    .documents-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
      gap: 20px; 
    }
    
    .document-card { 
      cursor: pointer; 
      transition: all 0.3s ease; 
      overflow: hidden;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border: none;
    }
    
    .document-card:hover { 
      transform: translateY(-4px); 
      box-shadow: 0 12px 28px rgba(0,0,0,0.15); 
    }
    
    .thumb { 
      width: 100%; 
      height: 180px; 
      display: block; 
      background: #f7fafc; 
      position: relative; 
      overflow: hidden; 
      border-radius: 8px 8px 0 0;
    }
    
    .thumb.placeholder { 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .thumb img { 
      width: 100%; 
      height: 100%; 
      object-fit: contain; 
      background: #fff; 
      display: block; 
    }
    
    .thumb-icon { 
      font-size: 64px; 
      width: 64px; 
      height: 64px; 
      color: #fff; 
      opacity: 0.9; 
    }
    
    .document-info {
      padding: 16px;
    }
    
    .document-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 8px 0;
      line-height: 1.4;
    }
    
    .document-subtitle {
      font-size: 0.9rem;
      color: #718096;
      margin: 0;
      line-height: 1.4;
    }
    
    .truncate {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }
    
    .loading p {
      margin-top: 16px;
      color: #718096;
      font-size: 1rem;
    }
    
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      text-align: center;
    }
    
    .empty-icon {
      font-size: 80px;
      color: #cbd5e0;
      margin-bottom: 24px;
    }
    
    .empty-state h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #4a5568;
      margin: 0 0 12px 0;
    }
    
    .empty-state p {
      font-size: 1rem;
      color: #718096;
      margin: 0;
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .documents-grid {
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 18px;
      }
    }

    @media (max-width: 992px) {
      .container {
        padding: 20px;
      }
      
      .header h1 {
        font-size: 2.2rem;
      }
      
      .documents-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 16px;
      }
    }

    @media (max-width: 768px) {
      .container {
        padding: 16px;
        max-width: 100%;
      }
      
      .header {
        margin-bottom: 24px;
      }
      
      .header h1 {
        font-size: 2rem;
      }
      
      .documents-grid {
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 14px;
      }
      
      .thumb {
        height: 160px;
      }
    }

    @media (max-width: 576px) {
      .container {
        padding: 12px;
      }
      
      .header h1 {
        font-size: 1.8rem;
      }
      
      .header p {
        font-size: 1rem;
      }
      
      .documents-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .thumb {
        height: 140px;
      }
      
      .document-info {
        padding: 12px;
      }
    }

    /* Tablet Optimization */
    @media (min-width: 769px) and (max-width: 1024px) {
      .documents-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      }
    }

    /* High DPI Displays */
    @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
      .document-card {
        box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      }
      
      .document-card:hover {
        box-shadow: 0 6px 14px rgba(0,0,0,0.12);
      }
    }

    /* Dark Mode Support */
    @media (prefers-color-scheme: dark) {
      .header h1 {
        color: #e2e8f0;
      }
      
      .header p {
        color: #a0aec0;
      }
      
      .document-title {
        color: #e2e8f0;
      }
      
      .document-subtitle {
        color: #a0aec0;
      }
      
      .thumb {
        background: #2d3748;
      }
      
      .empty-state h3 {
        color: #e2e8f0;
      }
      
      .empty-state p {
        color: #a0aec0;
      }
    }
  `]
})
export class SharedDocumentsComponent implements OnInit {
  documents: Document[] = [];
  loading = false;

  constructor(private docs: DocumentService) {}

  ngOnInit(): void { this.load(); }

  load() {
    this.loading = true;
    this.docs.getAccessibleDocuments().subscribe({
      next: (res: PageResponse<Document>) => { this.documents = res.content; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  open(doc: Document) { /* navigate to document detail */ }
  getIcon(ct: string) { return this.docs.getFileIcon(ct); }
} 