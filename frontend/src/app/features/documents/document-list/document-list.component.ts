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
    ButtonGroupModule,
    DataViewModule
  ],
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
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
          console.log(this.documents);
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