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
  selector: 'app-shared-documents',
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
        <h1>Shared with me</h1>
        <p>All documents you can access</p>
      </div>

      <div class="content">
        <div *ngIf="loading" class="loading">
          <mat-spinner></mat-spinner>
          <p>Loading documents...</p>
        </div>

        <div *ngIf="!loading && documents.length === 0" class="empty-state">
          <mat-icon>folder_open</mat-icon>
          <h3>No Documents</h3>
          <p>No one has shared documents with you yet.</p>
        </div>

        <div *ngIf="!loading && documents.length > 0" class="documents-grid">
          <mat-card *ngFor="let document of documents" class="document-card" (click)="open(document)">
            <div class="thumb" *ngIf="document.thumbnailContent as t; else iconAvatar">
              <img [src]="'data:image/png;base64,' + t" alt="Preview" />
            </div>
            <ng-template #iconAvatar>
              <div class="thumb placeholder"><mat-icon class="thumb-icon">{{ getIcon(document.contentType) }}</mat-icon></div>
            </ng-template>

            <mat-card-header>
              <mat-card-title class="truncate">{{ document.originalFilename }}</mat-card-title>
              <mat-card-subtitle>{{ document.contentType }} • {{ document.fileSize | fileSize }}</mat-card-subtitle>
            </mat-card-header>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 24px; }
    .documents-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
    .document-card { cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease; overflow: hidden; }
    .document-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.12); }
    .thumb { width: 100%; height: 160px; display: block; background: #f5f5f5; position: relative; overflow: hidden; }
    .thumb.placeholder { display: flex; align-items: center; justify-content: center; }
    .thumb img { width: 100%; height: 100%; object-fit: contain; background: #fff; display: block; }
    .thumb-icon { font-size: 56px; width: 56px; height: 56px; color: #1976d2; opacity: 0.9; }
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