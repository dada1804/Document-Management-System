import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { DocumentService, Document } from '../../../core/services/document.service';

interface UserSummary { id: number; username: string; email: string; firstName: string; lastName: string; }

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CardModule, ButtonModule, ChipModule, InputTextModule, MultiSelectModule],
  template: `
    <div class="document-detail-container" *ngIf="doc">
      <p-card header="{{ doc.originalFilename }}" subheader="{{ doc.contentType }} • {{ doc.fileSize | number }} bytes" styleClass="preview-card">
        <div class="preview">
          <!-- Image -->
          <img *ngIf="isImage(doc) && fullPreview" [src]="fullPreview" alt="preview" />
          <!-- PDF -->
          <iframe *ngIf="isPdf(doc) && fullBlobUrl" [src]="fullBlobUrl" title="PDF preview"></iframe>
          <!-- Video -->
          <video *ngIf="isVideo(doc) && fullBlobUrl" [src]="fullBlobUrl" controls></video>
          <!-- Fallback -->
          <div *ngIf="!isImage(doc) && !isPdf(doc) && !isVideo(doc)" class="fallback">
            <i class="pi pi-file-o fallback-icon"></i>
            <p>No inline preview available</p>
          </div>
        </div>
        
        <div class="preview-actions">
          <p-button 
            label="Download" 
            icon="pi pi-download" 
            class="p-button-primary"
            (click)="download()">
          </p-button>
        </div>
      </p-card>

      <p-card header="Manage Access" subheader="Choose who can access this document" styleClass="access-card">
        <div class="access-mode">
          <p-button 
            [outlined]="accessMode !== 'everyone'"
            [disabled]="accessMode === 'everyone'"
            label="Everyone" 
            icon="pi pi-globe" 
            (click)="setAccessMode('everyone')"
            styleClass="access-button">
          </p-button>
          <p-button 
            [outlined]="accessMode !== 'selected'"
            [disabled]="accessMode === 'selected'"
            label="Selected users" 
            icon="pi pi-users" 
            (click)="setAccessMode('selected')"
            styleClass="access-button">
          </p-button>
        </div>

        <div *ngIf="accessMode === 'selected'" class="user-select">
          <p-multiSelect 
            [(ngModel)]="selectedUserIds" 
            [options]="users" 
            optionLabel="username" 
            optionValue="id"
            placeholder="Select users"
            styleClass="w-100">
            <ng-template pTemplate="item" let-user>
              <div class="user-option">
                <span class="username">{{ user.username }}</span>
                <span class="email">({{ user.email }})</span>
              </div>
            </ng-template>
          </p-multiSelect>
        </div>
        
        <div class="access-actions">
          <p-button 
            label="Save" 
            icon="pi pi-save" 
            class="p-button-primary"
            (click)="saveAccess()">
          </p-button>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .document-detail-container { 
      padding: 20px; 
      max-width: 1200px; 
      margin: 0 auto; 
      display: grid; 
      grid-template-columns: 2fr 1fr; 
      gap: 24px; 
      min-height: 100vh;
    }
    
    .preview-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .preview-card .preview { 
      width: 100%; 
      height: 70vh; 
      background: #f8f9fa; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      overflow: hidden;
      border-radius: 8px;
      margin-bottom: 16px;
    }
    
    .preview img { 
      max-width: 100%; 
      max-height: 100%; 
      object-fit: contain;
      border-radius: 4px;
    }
    
    .preview iframe { 
      width: 100%; 
      height: 100%; 
      border: none;
      border-radius: 4px;
    }
    
    .preview video { 
      max-width: 100%; 
      max-height: 100%;
      border-radius: 4px;
    }
    
    .fallback { 
      color: #6c757d; 
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    
    .fallback-icon {
      font-size: 64px;
      color: #adb5bd;
    }
    
    .fallback p {
      font-size: 1.1rem;
      margin: 0;
      color: #6c757d;
    }
    
    .preview-actions {
      display: flex;
      justify-content: center;
      padding-top: 16px;
    }
    
    .access-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .access-mode { 
      display: flex; 
      gap: 12px; 
      margin: 16px 0 20px;
      flex-wrap: wrap;
    }
    
    .access-button {
      min-width: 140px;
      height: 44px;
      font-weight: 500;
    }
    
    .user-select { 
      margin-top: 16px; 
      margin-bottom: 20px;
    }
    
    .w-100 { 
      width: 100%; 
    }
    
    .selected-users {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
    
    .user-option {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .username {
      font-weight: 500;
      color: #2d3748;
    }
    
    .email {
      font-size: 0.85rem;
      color: #718096;
    }
    
    .access-actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 16px;
    }

    /* Responsive Design */
    @media (max-width: 1200px) {
      .document-detail-container {
        gap: 20px;
      }
    }

    @media (max-width: 992px) {
      .document-detail-container {
        padding: 16px;
        gap: 18px;
      }
      
      .preview-card .preview {
        height: 60vh;
      }
    }

    @media (max-width: 900px) {
      .document-detail-container { 
        grid-template-columns: 1fr; 
        gap: 20px;
      }
      
      .preview-card .preview { 
        height: 50vh; 
      }
      
      .access-mode {
        flex-direction: column;
      }
      
      .access-button {
        width: 100%;
        min-width: auto;
      }
    }

    @media (max-width: 768px) {
      .document-detail-container {
        padding: 12px;
        gap: 16px;
      }
      
      .preview-card .preview {
        height: 45vh;
      }
      
      .fallback-icon {
        font-size: 48px;
      }
      
      .fallback p {
        font-size: 1rem;
      }
    }

    @media (max-width: 576px) {
      .document-detail-container {
        padding: 8px;
        gap: 12px;
      }
      
      .preview-card .preview {
        height: 40vh;
      }
      
      .access-mode {
        gap: 8px;
      }
      
      .fallback-icon {
        font-size: 40px;
      }
    }

    /* Tablet Optimization */
    @media (min-width: 769px) and (max-width: 1024px) {
      .preview-card .preview {
        height: 65vh;
      }
    }

    /* High DPI Displays */
    @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
      .preview-card,
      .access-card {
        box-shadow: 0 2px 6px rgba(0,0,0,0.08);
      }
    }

    /* Dark Mode Support */
    @media (prefers-color-scheme: dark) {
      .preview-card .preview {
        background: #2d3748;
      }
      
      .fallback {
        color: #a0aec0;
      }
      
      .fallback-icon {
        color: #718096;
      }
      
      .fallback p {
        color: #a0aec0;
      }
      
      .username {
        color: #e2e8f0;
      }
      
      .email {
        color: #a0aec0;
      }
    }
  `]
})
export class DocumentDetailComponent implements OnInit {
  doc!: Document;
  users: UserSummary[] = [];
  accessMode: 'everyone' | 'selected' = 'selected';
  selectedUserIds: number[] = [];
  fullPreview: string | null = null;
  fullBlobUrl: string | null = null;

  constructor(private route: ActivatedRoute, private http: HttpClient, private documents: DocumentService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.documents.getDocument(id).subscribe(d => {
      this.doc = d;
      this.accessMode = d.isPublic ? 'everyone' : 'selected';
      this.selectedUserIds = Array.isArray(d.allowedUsers) ? [...d.allowedUsers] : [];
      this.loadPreview(d);
    });
    this.http.get<UserSummary[]>(`${environment.apiUrl}/users`).subscribe(u => this.users = u);
  }

  isImage(d: Document) { return !!d.contentType && d.contentType.startsWith('image/'); }
  isPdf(d: Document) { return d.contentType === 'application/pdf'; }
  isVideo(d: Document) { return !!d.contentType && d.contentType.startsWith('video/'); }

  loadPreview(d: Document) {
    if (this.isImage(d)) {
      this.documents.getDocumentContent(d.id).subscribe(r => this.fullPreview = `data:${d.contentType};base64,${r.content}`);
    } else if (this.isPdf(d) || this.isVideo(d)) {
      this.documents.downloadDocument(d.id).subscribe(response => this.fullBlobUrl = URL.createObjectURL(response.body as Blob));
    }
  }

  setAccessMode(mode: 'everyone' | 'selected') {
    this.accessMode = mode;
  }

  getUserDisplayName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.username : `User ${userId}`;
  }

  removeUser(userId: number) {
    this.selectedUserIds = this.selectedUserIds.filter(id => id !== userId);
  }

  saveAccess() {
    const isPublic = this.accessMode === 'everyone';
    const allowedUsers = isPublic ? [] : this.selectedUserIds;
    this.documents.updateDocument(this.doc.id, { isPublic, allowedUsers }).subscribe(updated => {
      this.doc = updated;
      this.accessMode = updated.isPublic ? 'everyone' : 'selected';
      this.selectedUserIds = Array.isArray(updated.allowedUsers) ? [...updated.allowedUsers] : [];
    });
  }

  download() {
    this.documents.downloadDocument(this.doc.id).subscribe(response => {
      const blob = response.body as Blob;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = this.doc.originalFilename || 'document';
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }
}