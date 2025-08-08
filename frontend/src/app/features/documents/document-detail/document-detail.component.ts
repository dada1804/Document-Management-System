import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { DocumentService, Document } from '../../../core/services/document.service';

interface UserSummary { id: number; username: string; email: string; firstName: string; lastName: string; }

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatCardModule, MatButtonModule, MatChipsModule, MatIconModule, MatSelectModule],
  template: `
    <div class="document-detail-container" *ngIf="doc">
      <mat-card class="preview-card">
        <mat-card-header>
          <mat-card-title>{{ doc.originalFilename }}</mat-card-title>
          <mat-card-subtitle>{{ doc.contentType }} • {{ doc.fileSize | number }} bytes</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="preview">
            <!-- Image -->
            <img *ngIf="isImage(doc) && fullPreview" [src]="fullPreview" alt="preview" />
            <!-- PDF -->
            <iframe *ngIf="isPdf(doc) && fullBlobUrl" [src]="fullBlobUrl" title="PDF preview"></iframe>
            <!-- Video -->
            <video *ngIf="isVideo(doc) && fullBlobUrl" [src]="fullBlobUrl" controls></video>
            <!-- Fallback -->
            <div *ngIf="!isImage(doc) && !isPdf(doc) && !isVideo(doc)" class="fallback">
              <mat-icon>insert_drive_file</mat-icon>
              <p>No inline preview available</p>
            </div>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="download()"><mat-icon>download</mat-icon> Download</button>
        </mat-card-actions>
      </mat-card>

      <mat-card class="access-card">
        <mat-card-header>
          <mat-card-title>Manage Access</mat-card-title>
          <mat-card-subtitle>Choose who can access this document</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="access-mode">
            <button mat-stroked-button color="primary" [disabled]="accessMode==='everyone'" (click)="setAccessMode('everyone')">
              <mat-icon>public</mat-icon>
              Everyone
            </button>
            <button mat-stroked-button color="primary" [disabled]="accessMode==='selected'" (click)="setAccessMode('selected')">
              <mat-icon>group</mat-icon>
              Selected users
            </button>
          </div>

          <div *ngIf="accessMode==='selected'" class="user-select">
            <mat-form-field appearance="fill" class="w-100">
              <mat-select [(ngModel)]="selectedUserIds" multiple placeholder="Select users">
                <mat-option *ngFor="let u of users" [value]="u.id">
                  {{ u.username }} ({{ u.email }})
                </mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="saveAccess()"><mat-icon>save</mat-icon> Save</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .document-detail-container { padding: 20px; max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
    .preview-card .preview { width: 100%; height: 70vh; background: #f5f5f5; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .preview img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .preview iframe { width: 100%; height: 100%; border: none; }
    .preview video { max-width: 100%; max-height: 100%; }
    .fallback { color: #666; text-align: center; }
    .access-mode { display: flex; gap: 12px; margin: 8px 0 16px; }
    .user-select { margin-top: 8px; }
    .w-100 { width: 100%; }
    @media (max-width: 900px) {
      .document-detail-container { grid-template-columns: 1fr; }
      .preview-card .preview { height: 50vh; }
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
      this.documents.downloadDocument(d.id).subscribe(blob => this.fullBlobUrl = URL.createObjectURL(blob));
    }
  }

  setAccessMode(mode: 'everyone' | 'selected') {
    this.accessMode = mode;
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
    this.documents.downloadDocument(this.doc.id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = this.doc.originalFilename || 'document';
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }
}