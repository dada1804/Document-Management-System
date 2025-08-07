import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Document {
  id: string;
  filename: string;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  uploadedBy: number;
  uploadedByUsername: string;
  uploadDate: string;
  isPublic: boolean;
  allowedUsers: number[];
  description: string;
  tags: string[];
  version: number;
  lastModified: string;
  downloadCount: number;
}

export interface DocumentUploadRequest {
  file: File;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
  allowedUsers?: number[];
}

export interface DocumentUpdateRequest {
  description?: string;
  tags?: string[];
  isPublic?: boolean;
  allowedUsers?: number[];
}

export interface DocumentStats {
  userDocumentCount: number;
  publicDocumentCount: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  constructor(private http: HttpClient) { }

  uploadDocument(request: DocumentUploadRequest): Observable<Document> {
    const formData = new FormData();
    formData.append('file', request.file);
    
    if (request.description) {
      formData.append('description', request.description);
    }
    
    if (request.tags && request.tags.length > 0) {
      request.tags.forEach(tag => formData.append('tags', tag));
    }
    
    formData.append('isPublic', request.isPublic ? 'true' : 'false');
    
    if (request.allowedUsers && request.allowedUsers.length > 0) {
      request.allowedUsers.forEach(userId => formData.append('allowedUsers', userId.toString()));
    }

    return this.http.post<Document>(`${environment.apiUrl}/documents/upload`, formData);
  }

  getDocument(id: string): Observable<Document> {
    return this.http.get<Document>(`${environment.apiUrl}/documents/${id}`);
  }

  downloadDocument(id: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/documents/download/${id}`, { responseType: 'blob' });
  }

  getMyDocuments(page: number = 0, size: number = 10, sortBy: string = 'uploadDate', sortDir: string = 'desc'): Observable<PageResponse<Document>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<PageResponse<Document>>(`${environment.apiUrl}/documents/my-documents`, { params });
  }

  getPublicDocuments(page: number = 0, size: number = 10, sortBy: string = 'uploadDate', sortDir: string = 'desc'): Observable<PageResponse<Document>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<PageResponse<Document>>(`${environment.apiUrl}/documents/public`, { params });
  }

  getAccessibleDocuments(page: number = 0, size: number = 10, sortBy: string = 'uploadDate', sortDir: string = 'desc'): Observable<PageResponse<Document>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    return this.http.get<PageResponse<Document>>(`${environment.apiUrl}/documents/accessible`, { params });
  }

  searchDocuments(query: string, page: number = 0, size: number = 10): Observable<PageResponse<Document>> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<Document>>(`${environment.apiUrl}/documents/search`, { params });
  }

  updateDocument(id: string, request: DocumentUpdateRequest): Observable<Document> {
    const formData = new FormData();
    
    if (request.description) {
      formData.append('description', request.description);
    }
    
    if (request.tags && request.tags.length > 0) {
      request.tags.forEach(tag => formData.append('tags', tag));
    }
    
    if (request.isPublic !== undefined) {
      formData.append('isPublic', request.isPublic.toString());
    }
    
    if (request.allowedUsers && request.allowedUsers.length > 0) {
      request.allowedUsers.forEach(userId => formData.append('allowedUsers', userId.toString()));
    }

    return this.http.put<Document>(`${environment.apiUrl}/documents/${id}`, formData);
  }

  deleteDocument(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/documents/${id}`);
  }

  getDocumentStats(): Observable<DocumentStats> {
    return this.http.get<DocumentStats>(`${environment.apiUrl}/documents/stats`);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(contentType: string): string {
    if (contentType.includes('pdf')) return 'picture_as_pdf';
    if (contentType.includes('word') || contentType.includes('document')) return 'description';
    if (contentType.includes('image')) return 'image';
    if (contentType.includes('video')) return 'video_file';
    if (contentType.includes('audio')) return 'audio_file';
    if (contentType.includes('zip') || contentType.includes('rar')) return 'folder_zip';
    return 'insert_drive_file';
  }
} 