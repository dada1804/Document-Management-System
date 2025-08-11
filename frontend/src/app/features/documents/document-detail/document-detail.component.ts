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
  templateUrl: './document-detail.component.html',
  styleUrls: ['./document-detail.component.scss'],
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