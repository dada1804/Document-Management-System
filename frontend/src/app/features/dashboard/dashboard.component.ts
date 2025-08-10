import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ListboxModule } from 'primeng/listbox';
import { ChipModule } from 'primeng/chip';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { DocumentService, Document, DocumentStats } from '../../core/services/document.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
    ListboxModule,
    ChipModule,
    MenuModule,
    TooltipModule
  ]
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

  getDocumentMenuItems(doc: Document): any[] {
    return [
      {
        label: 'Download',
        icon: 'pi pi-download',
        command: () => this.downloadDocument(doc.id)
      },
      {
        label: 'View Details',
        icon: 'pi pi-eye',
        command: () => this.viewDocument(doc.id)
      }
    ];
  }

  downloadDocument(id: string): void {
    this.documentService.downloadDocument(id).subscribe({
      next: (response) => {
        const blob = response.body as Blob;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = response.headers.get('content-disposition')?.split('filename=')[1] || 'document';
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