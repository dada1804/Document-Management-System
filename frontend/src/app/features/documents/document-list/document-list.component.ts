import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';
import { DocumentService, Document, PageResponse } from '../../../core/services/document.service';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatChipsModule,
    MatMenuModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule
  ],
  template: `
    <div class="document-list-container">
      <!-- Header -->
      <div class="header">
        <h1>My Documents</h1>
        <button mat-raised-button color="primary" routerLink="/documents/upload">
          <mat-icon>cloud_upload</mat-icon>
          Upload Document
        </button>
      </div>

      <!-- Search and Filters -->
      <mat-card class="search-card">
        <mat-card-content>
          <div class="search-filters">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search documents</mat-label>
              <input matInput [(ngModel)]="searchQuery" (keyup.enter)="search()" placeholder="Search by name, description, or tags">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="sort-field">
              <mat-label>Sort by</mat-label>
              <mat-select [(ngModel)]="sortBy" (selectionChange)="loadDocuments()">
                <mat-option value="uploadDate">Upload Date</mat-option>
                <mat-option value="originalFilename">Name</mat-option>
                <mat-option value="fileSize">Size</mat-option>
                <mat-option value="downloadCount">Downloads</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="sort-direction-field">
              <mat-label>Order</mat-label>
              <mat-select [(ngModel)]="sortDir" (selectionChange)="loadDocuments()">
                <mat-option value="desc">Descending</mat-option>
                <mat-option value="asc">Ascending</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-raised-button (click)="search()" [disabled]="loading">
              <mat-icon>search</mat-icon>
              Search
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Loading Spinner -->
      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading documents...</p>
      </div>

      <!-- Documents List -->
      <div class="documents-content" *ngIf="!loading">
        <mat-card *ngIf="documents.length === 0" class="empty-state">
          <mat-card-content>
            <div class="empty-content">
              <mat-icon class="empty-icon">folder_open</mat-icon>
              <h3>No documents found</h3>
              <p *ngIf="searchQuery">No documents match your search criteria</p>
              <p *ngIf="!searchQuery">You haven't uploaded any documents yet</p>
              <button mat-raised-button color="primary" routerLink="/documents/upload">
                <mat-icon>cloud_upload</mat-icon>
                Upload Your First Document
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-list *ngIf="documents.length > 0" class="document-list">
          <mat-list-item *ngFor="let doc of documents" class="document-item">
            <mat-icon matListItemIcon [matTooltip]="doc.contentType">
              {{ getFileIcon(doc.contentType) }}
            </mat-icon>
            
            <div matListItemTitle class="document-title">
              {{ doc.originalFilename }}
            </div>
            
            <div matListItemLine class="document-details">
              <span class="document-meta">
                {{ formatFileSize(doc.fileSize) }} • 
                {{ doc.uploadDate | date:'short' }} • 
                {{ doc.downloadCount }} downloads
              </span>
              
              <div class="document-tags" *ngIf="doc.tags && doc.tags.length > 0">
                <mat-chip *ngFor="let tag of doc.tags.slice(0, 3)" variant="outlined" size="small">
                  {{ tag }}
                </mat-chip>
                <span *ngIf="doc.tags.length > 3" class="more-tags">+{{ doc.tags.length - 3 }} more</span>
              </div>
              
              <mat-chip *ngIf="doc.isPublic" color="primary" variant="outlined" size="small">
                Public
              </mat-chip>
            </div>
            
            <div matListItemMeta class="document-actions">
              <button mat-icon-button [matMenuTriggerFor]="menu" [matTooltip]="'More options'">
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
                <button mat-menu-item (click)="editDocument(doc.id)">
                  <mat-icon>edit</mat-icon>
                  <span>Edit</span>
                </button>
                <button mat-menu-item (click)="deleteDocument(doc.id)" class="delete-action">
                  <mat-icon>delete</mat-icon>
                  <span>Delete</span>
                </button>
              </mat-menu>
            </div>
          </mat-list-item>
        </mat-list>

        <!-- Pagination -->
        <mat-paginator 
          *ngIf="documents.length > 0"
          [length]="totalElements"
          [pageSize]="pageSize"
          [pageIndex]="currentPage"
          [pageSizeOptions]="[5, 10, 25, 50]"
          (page)="onPageChange($event)"
          showFirstLastButtons>
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .document-list-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      color: #333;
    }

    .search-card {
      margin-bottom: 24px;
    }

    .search-filters {
      display: grid;
      grid-template-columns: 1fr auto auto auto;
      gap: 16px;
      align-items: end;
    }

    .search-field {
      min-width: 300px;
    }

    .sort-field, .sort-direction-field {
      min-width: 150px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 40px;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
    }

    .empty-content {
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

    .document-list {
      margin-bottom: 24px;
    }

    .document-item {
      border-bottom: 1px solid #eee;
      padding: 16px 0;
    }

    .document-item:last-child {
      border-bottom: none;
    }

    .document-title {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .document-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .document-meta {
      color: #666;
      font-size: 14px;
    }

    .document-tags {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .more-tags {
      color: #666;
      font-size: 12px;
    }

    .document-actions {
      display: flex;
      gap: 8px;
    }

    .delete-action {
      color: #f44336;
    }

    @media (max-width: 768px) {
      .document-list-container {
        padding: 16px;
      }

      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .search-filters {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .search-field {
        min-width: auto;
      }

      .sort-field, .sort-direction-field {
        min-width: auto;
      }
    }
  `]
})
export class DocumentListComponent implements OnInit {
  documents: Document[] = [];
  loading = false;
  searchQuery = '';
  sortBy = 'uploadDate';
  sortDir = 'desc';
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;

  constructor(
    private documentService: DocumentService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading = true;
    
    this.documentService.getMyDocuments(this.currentPage, this.pageSize, this.sortBy, this.sortDir)
      .subscribe({
        next: (response: PageResponse<Document>) => {
          this.documents = response.content;
          this.totalElements = response.totalElements;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading documents:', error);
          this.toastr.error('Failed to load documents');
          this.loading = false;
        }
      });
  }

  search(): void {
    if (this.searchQuery.trim()) {
      this.loading = true;
      this.currentPage = 0;
      
      this.documentService.searchDocuments(this.searchQuery, this.currentPage, this.pageSize)
        .subscribe({
          next: (response: PageResponse<Document>) => {
            this.documents = response.content;
            this.totalElements = response.totalElements;
            this.loading = false;
          },
          error: (error) => {
            console.error('Error searching documents:', error);
            this.toastr.error('Failed to search documents');
            this.loading = false;
          }
        });
    } else {
      this.loadDocuments();
    }
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    
    if (this.searchQuery.trim()) {
      this.search();
    } else {
      this.loadDocuments();
    }
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
        this.toastr.success('Document downloaded successfully');
      },
      error: (error) => {
        console.error('Error downloading document:', error);
        this.toastr.error('Failed to download document');
      }
    });
  }

  viewDocument(id: string): void {
    this.router.navigate(['/documents', id]);
  }

  editDocument(id: string): void {
    this.router.navigate(['/documents', id, 'edit']);
  }

  deleteDocument(id: string): void {
    if (confirm('Are you sure you want to delete this document?')) {
      this.documentService.deleteDocument(id).subscribe({
        next: () => {
          this.toastr.success('Document deleted successfully');
          this.loadDocuments();
        },
        error: (error) => {
          console.error('Error deleting document:', error);
          this.toastr.error('Failed to delete document');
        }
      });
    }
  }

  getFileIcon(contentType: string): string {
    return this.documentService.getFileIcon(contentType);
  }

  formatFileSize(bytes: number): string {
    return this.documentService.formatFileSize(bytes);
  }
} 