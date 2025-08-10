import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DataViewModule } from 'primeng/dataview';
import { ChipModule } from 'primeng/chip';
import { MenuModule } from 'primeng/menu';
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { ToastrService } from 'ngx-toastr';
import { DocumentService, Document, PageResponse } from '../../../core/services/document.service';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    ProgressSpinnerModule,
    DataViewModule,
    ChipModule,
    MenuModule,
    PaginatorModule,
    TooltipModule,
    ButtonGroupModule
  ],
  template: `
    <div class="document-list-container">
      <!-- Header -->
      <div class="header">
        <h1>My Documents</h1>
        <div class="header-actions">
          <p-buttonGroup>
            <p-button 
              icon="pi pi-th-large" 
              [outlined]="viewMode !== 'grid'"
              (click)="setViewMode('grid')"
              pTooltip="Grid view">
            </p-button>
            <p-button 
              icon="pi pi-list" 
              [outlined]="viewMode !== 'list'"
              (click)="setViewMode('list')"
              pTooltip="List view">
            </p-button>
          </p-buttonGroup>
          <p-button 
            label="Upload Document" 
            icon="pi pi-cloud-upload" 
            routerLink="/documents/upload"
            class="p-button-primary">
          </p-button>
        </div>
      </div>

      <!-- Search and Filters -->
      <p-card class="search-card">
        <ng-template pTemplate="content">
          <div class="search-filters">
            <div class="search-field">
              <span class="p-input-icon-left">
                <i class="pi pi-search"></i>
                <input 
                  pInputText 
                  type="text" 
                  [(ngModel)]="searchQuery" 
                  (keyup.enter)="search()" 
                  placeholder="Search by name, description, or tags"
                  class="w-full">
              </span>
            </div>

            <div class="sort-field">
              <p-dropdown 
                [options]="sortOptions" 
                [(ngModel)]="sortBy" 
                (onChange)="loadDocuments()"
                placeholder="Sort by"
                optionLabel="label"
                optionValue="value"
                appendTo="body">
              </p-dropdown>
            </div>

            <div class="sort-direction-field">
              <p-dropdown 
                [options]="sortDirectionOptions" 
                [(ngModel)]="sortDir" 
                (onChange)="loadDocuments()"
                placeholder="Order"
                optionLabel="label"
                optionValue="value"
                appendTo="body">
              </p-dropdown>
            </div>

            <p-button 
              label="Search" 
              icon="pi pi-search" 
              (click)="search()" 
              [disabled]="loading"
              class="p-button-secondary">
            </p-button>
          </div>
        </ng-template>
      </p-card>

      <!-- Loading Spinner -->
      <div class="loading-container" *ngIf="loading">
        <p-progressSpinner [style]="{width: '50px', height: '50px'}"></p-progressSpinner>
        <p>Loading documents...</p>
      </div>

      <!-- Documents Content -->
      <div class="documents-content" *ngIf="!loading">
        <p-card *ngIf="documents.length === 0" class="empty-state">
          <ng-template pTemplate="content">
            <div class="empty-content">
              <i class="pi pi-folder-open empty-icon"></i>
              <h3>No documents found</h3>
              <p *ngIf="searchQuery">No documents match your search criteria</p>
              <p *ngIf="!searchQuery">You haven't uploaded any documents yet</p>
              <p-button 
                label="Upload Your First Document" 
                icon="pi pi-cloud-upload" 
                routerLink="/documents/upload"
                class="p-button-primary">
              </p-button>
            </div>
          </ng-template>
        </p-card>

        <!-- Grid view -->
        <div *ngIf="documents.length > 0 && viewMode === 'grid'" class="documents-grid">
          <p-card class="document-card" *ngFor="let doc of documents" (click)="viewDocument(doc.id)">
            <ng-template pTemplate="content">
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
                  <i class="pi" [class]="getFileIcon(doc.contentType)"></i>
                </div>
              </ng-template>

              <div class="card-info">
                <div class="title truncate" [pTooltip]="doc.originalFilename">{{ doc.originalFilename }}</div>
                <div class="meta">
                  <span class="type-chip">{{ getFileTypeLabel(doc.contentType) }}</span>
                  <span class="sep">•</span>
                  <span>{{ formatFileSize(doc.fileSize) }}</span>
                </div>
              </div>

              <div class="document-tags" *ngIf="doc.tags && doc.tags.length > 0">
                <p-chip *ngFor="let tag of doc.tags.slice(0, 3)" [label]="tag" severity="secondary"></p-chip>
                <span *ngIf="doc.tags.length > 3" class="more-tags">+{{ doc.tags.length - 3 }}</span>
              </div>
            </ng-template>
            
            <ng-template pTemplate="footer">
              <div class="card-actions" (click)="$event.stopPropagation()">
                <p-button 
                  icon="pi pi-download" 
                  (click)="downloadDocument(doc.id)" 
                  pTooltip="Download"
                  class="p-button-text p-button-rounded">
                </p-button>
                <p-menu #menu 
                        [popup]="true" 
                        [model]="getDocumentMenuItems(doc)"
                        appendTo="body">
                </p-menu>
                <p-button 
                  icon="pi pi-ellipsis-v" 
                  (click)="menu.toggle($event)" 
                  pTooltip="More options"
                  class="p-button-text p-button-rounded">
                </p-button>
              </div>
            </ng-template>
          </p-card>
        </div>

        <!-- List view -->
        <p-dataView *ngIf="documents.length > 0 && viewMode === 'list'" 
                    [value]="documents" 
                    [paginator]="false"
                    layout="list"
                    class="document-list">
          <ng-template pTemplate="list" let-doc>
            <div class="document-item">
              <div class="document-icon">
                <i class="pi" [class]="getFileIcon(doc.contentType)"></i>
              </div>
              <div class="document-title truncate">{{ doc.originalFilename }}</div>
              <div class="document-details">
                <span class="document-meta">
                  {{ getFileTypeLabel(doc.contentType) }} • {{ formatFileSize(doc.fileSize) }} • {{ doc.uploadDate | date:'short' }} • {{ doc.downloadCount }} downloads
                </span>
                <div class="document-tags" *ngIf="doc.tags && doc.tags.length > 0">
                  <p-chip *ngFor="let tag of doc.tags.slice(0, 3)" [label]="tag" severity="secondary"></p-chip>
                  <span *ngIf="doc.tags.length > 3" class="more-tags">+{{ doc.tags.length - 3 }}</span>
                </div>
              </div>
              <div class="document-actions">
                <p-button 
                  icon="pi pi-download" 
                  (click)="downloadDocument(doc.id)" 
                  pTooltip="Download"
                  class="p-button-text p-button-rounded">
                </p-button>
                <p-menu #menu 
                        [popup]="true" 
                        [model]="getDocumentMenuItems(doc)"
                        appendTo="body">
                </p-menu>
                <p-button 
                  icon="pi pi-ellipsis-v" 
                  (click)="menu.toggle($event)" 
                  pTooltip="More options"
                  class="p-button-text p-button-rounded">
                </p-button>
              </div>
            </div>
          </ng-template>
        </p-dataView>

        <!-- Pagination -->
        <p-paginator 
          *ngIf="documents.length > 0"
          [rows]="pageSize"
          [totalRecords]="totalElements"
          [rowsPerPageOptions]="[5, 10, 25, 50]"
          (onPageChange)="onPageChange($event)"
          [showFirstLastIcon]="true"
          [showPageLinks]="true">
        </p-paginator>
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
      flex-wrap: wrap;
      gap: 16px;
    }
    
    .header h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .header-actions { 
      display: flex; 
      align-items: center; 
      gap: 12px; 
      flex-wrap: wrap;
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

    /* Grid */
    .documents-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); 
      gap: 16px; 
      margin-bottom: 24px; 
    }
    
    .document-card { 
      cursor: pointer; 
      transition: transform 0.15s ease, box-shadow 0.15s ease; 
      overflow: hidden; 
      border-radius: 12px; 
    }
    
    .document-card:hover { 
      transform: translateY(-2px); 
      box-shadow: 0 8px 20px rgba(0,0,0,0.12); 
    }
    
    .thumb { 
      width: 100%; 
      height: 160px; 
      display: block; 
      background: #f5f5f5; 
      position: relative; 
      overflow: hidden; 
    }
    
    .thumb.placeholder { 
      display: flex; 
      align-items: center; 
      justify-content: center; 
    }
    
    .thumb img { 
      width: 100%; 
      height: 100%; 
      object-fit: contain; 
      background: #fff; 
      display: block; 
    }
    
    .thumb-icon { 
      font-size: 56px; 
      width: 56px; 
      height: 56px; 
      color: #1976d2; 
      opacity: 0.9; 
    }
    
    .card-info { 
      padding: 12px 16px 0 16px; 
    }
    
    .title { 
      font-weight: 600; 
      color: var(--text-primary); 
      margin-bottom: 6px; 
    }
    
    .meta { 
      color: var(--text-secondary); 
      font-size: 12px; 
      display: flex; 
      align-items: center; 
      gap: 6px; 
    }
    
    .type-chip { 
      background: #e5f0ff; 
      color: #1d4ed8; 
      padding: 2px 8px; 
      border-radius: 999px; 
      font-weight: 600; 
      font-size: 11px; 
    }
    
    .sep { 
      color: #9ca3af; 
    }
    
    .card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 8px 16px;
    }

    /* List */
    .document-list { 
      margin-bottom: 24px; 
    }
    
    .document-item { 
      border-bottom: 1px solid var(--border-color); 
      padding: 12px 0; 
      display: flex;
      align-items: center;
      gap: 16px;
      transition: background-color 0.2s ease;
      
      &:hover {
        background-color: var(--bg-secondary);
      }
    }
    
    .document-item:last-child { 
      border-bottom: none; 
    }
    
    .document-title { 
      font-weight: 500; 
      flex: 1;
      min-width: 0;
    }
    
    .document-details { 
      display: flex; 
      flex-direction: column; 
      gap: 8px; 
      flex: 1;
      min-width: 0;
    }
    
    .document-meta { 
      color: var(--text-muted); 
      font-size: 13px; 
    }
    
    .document-actions { 
      display: flex; 
      gap: 8px; 
    }
    
    .document-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #1976d2;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .document-tags {
      padding: 0 16px 16px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .more-tags {
      color: var(--text-muted);
      font-size: 12px;
      align-self: center;
    }

    .truncate {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .document-list-container { 
        padding: 16px; 
      }
      
      .header { 
        flex-direction: column; 
        gap: 16px; 
        align-items: stretch; 
      }
      
      .header h1 {
        font-size: 1.5rem;
        text-align: center;
      }
      
      .header-actions { 
        justify-content: center; 
      }
      
      .search-filters { 
        grid-template-columns: 1fr; 
        gap: 12px; 
      }
      
      .search-field, .sort-field, .sort-direction-field { 
        min-width: auto; 
      }
      
      .documents-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      
      .document-card {
        margin-bottom: 12px;
      }
    }
    
    @media (max-width: 576px) {
      .document-list-container {
        padding: 12px;
      }
      
      .header h1 {
        font-size: 1.25rem;
      }
      
      .search-filters {
        gap: 8px;
      }
      
      .documents-grid {
        gap: 8px;
      }
      
      .thumb {
        height: 120px;
      }
      
      .card-info {
        padding: 8px 12px 0 12px;
      }
      
      .document-tags {
        padding: 0 12px 12px;
      }
    }
    
    @media (min-width: 768px) and (max-width: 1024px) {
      .documents-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
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
  previews: Record<string, string> = {};
  viewMode: 'grid' | 'list' = 'grid';

  sortOptions = [
    { label: 'Upload Date', value: 'uploadDate' },
    { label: 'Name', value: 'originalFilename' },
    { label: 'Size', value: 'fileSize' },
    { label: 'Downloads', value: 'downloadCount' }
  ];

  sortDirectionOptions = [
    { label: 'Descending', value: 'desc' },
    { label: 'Ascending', value: 'asc' }
  ];

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

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
    localStorage.setItem('documentListView', mode);
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

  getFileIcon(contentType: string): string {
    if (!contentType) return 'pi pi-file';
    if (contentType.includes('pdf')) return 'pi pi-file-pdf';
    if (contentType.includes('word') || contentType.includes('document')) return 'pi pi-file-word';
    if (contentType.includes('presentation') || contentType.includes('powerpoint')) return 'pi pi-file-excel';
    if (contentType.includes('sheet') || contentType.includes('excel')) return 'pi pi-file-excel';
    if (contentType.startsWith('image/')) return 'pi pi-image';
    if (contentType.startsWith('video/')) return 'pi pi-video';
    if (contentType.startsWith('audio/')) return 'pi pi-volume-up';
    if (contentType.includes('zip') || contentType.includes('rar')) return 'pi pi-file-archive';
    return 'pi pi-file';
  }

  getFileTypeLabel(contentType: string): string {
    if (!contentType) return 'File';
    if (contentType.includes('pdf')) return 'PDF';
    if (contentType.includes('word') || contentType.includes('document')) return 'Word';
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
          this.loadPreviews();
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
    this.currentPage = 0;
    this.loadDocuments();
  }

  onPageChange(event: any): void {
    this.currentPage = event.page;
    this.pageSize = event.rows;
    this.loadDocuments();
  }

  viewDocument(id: string): void {
    this.router.navigate(['/documents', id]);
  }

  editDocument(id: string): void {
    this.router.navigate(['/documents', id, 'edit']);
  }

  downloadDocument(id: string): void {
    this.documentService.downloadDocument(id).subscribe({
      next: (response) => {
        const blob = new Blob([response.body as Blob], { type: response.body?.type });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = response.headers.get('content-disposition')?.split('filename=')[1] || 'document';
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

  getDocumentMenuItems(doc: Document): any[] {
    return [
      {
        label: 'View Details',
        icon: 'pi pi-eye',
        command: () => this.viewDocument(doc.id)
      },
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => this.editDocument(doc.id)
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.deleteDocument(doc.id),
        class: 'delete-action'
      }
    ];
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
} 