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
import { MatButtonToggleModule } from '@angular/material/button-toggle';
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
    MatTooltipModule,
    MatButtonToggleModule
  ],
  template: `
    <div class="document-list-container">
      <!-- Header -->
      <div class="header">
        <h1>My Documents</h1>
        <div class="header-actions">
          <mat-button-toggle-group [(ngModel)]="viewMode" (change)="onViewModeChange()" exclusive>
            <mat-button-toggle value="grid" [matTooltip]="'Grid view'"><mat-icon>view_module</mat-icon></mat-button-toggle>
            <mat-button-toggle value="list" [matTooltip]="'List view'"><mat-icon>view_list</mat-icon></mat-button-toggle>
          </mat-button-toggle-group>
          <button mat-raised-button color="primary" routerLink="/documents/upload">
            <mat-icon>cloud_upload</mat-icon>
            Upload Document
          </button>
        </div>
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

      <!-- Documents Content -->
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

        <!-- Grid view -->
        <div *ngIf="documents.length > 0 && viewMode==='grid'" class="documents-grid">
          <mat-card class="document-card" *ngFor="let doc of documents" (click)="viewDocument(doc.id)">
            <div class="thumb" *ngIf="doc.thumbnailContent as t; else noThumb">
              <img [src]="'data:image/png;base64,' + t" alt="Preview" />
            </div>
            <ng-template #noThumb>
              <div class="thumb placeholder" *ngIf="isImage(doc) && previews[doc.id] as src; else iconAvatar">
                <img [src]="src" alt="Preview" />
              </div>
            </ng-template>
            <ng-template #iconAvatar>
              <div class="thumb placeholder">
                <mat-icon class="thumb-icon">{{ getFileIcon(doc.contentType) }}</mat-icon>
              </div>
            </ng-template>

            <div class="card-info">
              <div class="title truncate" [matTooltip]="doc.originalFilename">{{ doc.originalFilename }}</div>
              <div class="meta">
                <span class="type-chip">{{ getFileTypeLabel(doc.contentType) }}</span>
                <span class="sep">•</span>
                <span>{{ formatFileSize(doc.fileSize) }}</span>
              </div>
            </div>

            <mat-card-content>
              <div class="document-tags" *ngIf="doc.tags && doc.tags.length > 0">
                <mat-chip *ngFor="let tag of doc.tags.slice(0, 3)" variant="outlined" size="small">
                  {{ tag }}
                </mat-chip>
                <span *ngIf="doc.tags.length > 3" class="more-tags">+{{ doc.tags.length - 3 }}</span>
              </div>
            </mat-card-content>

            <mat-card-actions align="end" (click)="$event.stopPropagation()">
              <button mat-icon-button (click)="downloadDocument(doc.id)" matTooltip="Download">
                <mat-icon>download</mat-icon>
              </button>
              <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="More options">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
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
            </mat-card-actions>
          </mat-card>
        </div>

        <!-- List view -->
        <mat-list *ngIf="documents.length > 0 && viewMode==='list'" class="document-list">
          <mat-list-item *ngFor="let doc of documents" class="document-item">
            <mat-icon matListItemIcon [matTooltip]="doc.contentType">
              {{ getFileIcon(doc.contentType) }}
            </mat-icon>
            <div matListItemTitle class="document-title truncate">{{ doc.originalFilename }}</div>
            <div matListItemLine class="document-details">
              <span class="document-meta">
                {{ getFileTypeLabel(doc.contentType) }} • {{ formatFileSize(doc.fileSize) }} • {{ doc.uploadDate | date:'short' }} • {{ doc.downloadCount }} downloads
              </span>
              <div class="document-tags" *ngIf="doc.tags && doc.tags.length > 0">
                <mat-chip *ngFor="let tag of doc.tags.slice(0, 3)" variant="outlined" size="small">{{ tag }}</mat-chip>
                <span *ngIf="doc.tags.length > 3" class="more-tags">+{{ doc.tags.length - 3 }}</span>
              </div>
            </div>
            <div matListItemMeta class="document-actions">
              <button mat-icon-button (click)="downloadDocument(doc.id)" matTooltip="Download">
                <mat-icon>download</mat-icon>
              </button>
              <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="More options">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="viewDocument(doc.id)"><mat-icon>visibility</mat-icon><span>View Details</span></button>
                <button mat-menu-item (click)="editDocument(doc.id)"><mat-icon>edit</mat-icon><span>Edit</span></button>
                <button mat-menu-item (click)="deleteDocument(doc.id)" class="delete-action"><mat-icon>delete</mat-icon><span>Delete</span></button>
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
    .document-list-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header-actions { display: flex; align-items: center; gap: 12px; }
    .search-card { margin-bottom: 24px; }
    .search-filters { display: grid; grid-template-columns: 1fr auto auto auto; gap: 16px; align-items: end; }
    .search-field { min-width: 300px; }
    .sort-field, .sort-direction-field { min-width: 150px; }

    .loading-container { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 40px; }
    .empty-state { text-align: center; padding: 40px; }
    .empty-content { display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .empty-icon { font-size: 64px; width: 64px; height: 64px; color: #ccc; }

    /* Grid */
    .documents-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .document-card { cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease; overflow: hidden; border-radius: 12px; }
    .document-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.12); }
    .thumb { width: 100%; height: 160px; display: block; background: #f5f5f5; position: relative; overflow: hidden; }
    .thumb.placeholder { display: flex; align-items: center; justify-content: center; }
    .thumb img { width: 100%; height: 100%; object-fit: contain; background: #fff; display: block; }
    .thumb-icon { font-size: 56px; width: 56px; height: 56px; color: #1976d2; opacity: 0.9; }
    .card-info { padding: 12px 16px 0 16px; }
    .title { font-weight: 600; color: #1f2937; margin-bottom: 6px; }
    .meta { color: #6b7280; font-size: 12px; display: flex; align-items: center; gap: 6px; }
    .type-chip { background: #e5f0ff; color: #1d4ed8; padding: 2px 8px; border-radius: 999px; font-weight: 600; font-size: 11px; }
    .sep { color: #9ca3af; }

    /* List */
    .document-list { margin-bottom: 24px; }
    .document-item { border-bottom: 1px solid #eee; padding: 12px 0; }
    .document-item:last-child { border-bottom: none; }
    .document-title { font-weight: 500; }
    .document-details { display: flex; flex-direction: column; gap: 8px; }
    .document-meta { color: #666; font-size: 13px; }
    .document-actions { display: flex; gap: 8px; }

    @media (max-width: 768px) {
      .document-list-container { padding: 16px; }
      .header { flex-direction: column; gap: 16px; align-items: stretch; }
      .header-actions { justify-content: space-between; }
      .search-filters { grid-template-columns: 1fr; gap: 12px; }
      .search-field, .sort-field, .sort-direction-field { min-width: auto; }
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
  previews: Record<string, string> = {};
  viewMode: 'grid' | 'list' = 'grid';

  constructor(
    private documentService: DocumentService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('documentListView');
    if (saved === 'grid' || saved === 'list') {
      this.viewMode = saved as any;
    }
    this.loadDocuments();
  }

  onViewModeChange(): void {
    localStorage.setItem('documentListView', this.viewMode);
  }

  private loadPreviews(): void {
    this.documents.filter(d => this.isImage(d) && !this.previews[d.id]).forEach(d => {
      this.documentService.getDocumentContent(d.id).subscribe({
        next: (res) => {
          const mime = d.contentType || 'image/*';
          this.previews[d.id] = `data:${mime};base64,${res.content}`;
        },
        error: () => {}
      });
    });
  }

  isImage(doc: Document): boolean {
    return !!doc.contentType && doc.contentType.startsWith('image/');
  }

  getFileTypeLabel(contentType: string): string {
    if (!contentType) return 'File';
    if (contentType.includes('pdf')) return 'PDF';
    if (contentType.includes('word') || contentType.includes('msword')) return 'Word';
    if (contentType.includes('presentation') || contentType.includes('powerpoint')) return 'PowerPoint';
    if (contentType.includes('sheet') || contentType.includes('excel')) return 'Excel';
    if (contentType.startsWith('image/')) return 'Image';
    if (contentType.startsWith('video/')) return 'Video';
    if (contentType.startsWith('audio/')) return 'Audio';
    if (contentType.includes('zip') || contentType.includes('rar')) return 'Archive';
    return 'File';
  }

  loadDocuments(): void {
    this.loading = true;
    
    this.documentService.getMyDocuments(this.currentPage, this.pageSize, this.sortBy, this.sortDir)
      .subscribe({
        next: (response: PageResponse<Document>) => {
          this.documents = response.content;
          this.totalElements = response.totalElements;
          this.loading = false;
          this.loadPreviews();
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
            this.loadPreviews();
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