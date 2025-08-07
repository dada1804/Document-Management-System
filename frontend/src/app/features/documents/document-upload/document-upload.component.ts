import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { ToastrService } from 'ngx-toastr';
import { DocumentService, DocumentUploadRequest } from '../../../core/services/document.service';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatChipsModule
  ],
  template: `
    <div class="upload-container">
      <mat-card class="upload-card">
        <mat-card-header>
          <mat-card-title>Upload Document</mat-card-title>
          <mat-card-subtitle>Upload a new document to your library</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="uploadForm" (ngSubmit)="onSubmit()">
            <!-- File Upload Area -->
            <div 
              class="file-upload-area" 
              [class.dragover]="isDragOver"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event)"
              (click)="fileInput.click()">
              
              <input 
                #fileInput 
                type="file" 
                (change)="onFileSelected($event)" 
                style="display: none;"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar">
              
              <mat-icon class="upload-icon">cloud_upload</mat-icon>
              <h3>Drop files here or click to browse</h3>
              <p>Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, GIF, ZIP, RAR</p>
              <p>Maximum file size: 100MB</p>
              
              <div *ngIf="selectedFile" class="selected-file">
                <mat-icon>{{ getFileIcon(selectedFile.type) }}</mat-icon>
                <span>{{ selectedFile.name }}</span>
                <span class="file-size">({{ formatFileSize(selectedFile.size) }})</span>
              </div>
            </div>

            <!-- Document Details -->
            <div class="form-fields" *ngIf="selectedFile">
              <mat-form-field appearance="outline">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="3" placeholder="Enter document description"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Tags</mat-label>
                <input matInput formControlName="tags" placeholder="Enter tags separated by commas">
                <mat-hint>e.g., work, important, project</mat-hint>
              </mat-form-field>

              <mat-checkbox formControlName="isPublic" color="primary">
                Make this document public
              </mat-checkbox>
            </div>

            <!-- Upload Button -->
            <div class="upload-actions" *ngIf="selectedFile">
              <button 
                mat-raised-button 
                color="primary" 
                type="submit" 
                [disabled]="uploadForm.invalid || uploading"
                class="upload-button">
                <mat-spinner *ngIf="uploading" diameter="20"></mat-spinner>
                <span *ngIf="!uploading">Upload Document</span>
              </button>
              
              <button 
                mat-button 
                type="button" 
                (click)="clearForm()"
                [disabled]="uploading">
                Cancel
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .upload-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .upload-card {
      padding: 20px;
    }

    .file-upload-area {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 20px;
    }

    .file-upload-area:hover {
      border-color: #667eea;
      background-color: #f8f9ff;
    }

    .file-upload-area.dragover {
      border-color: #667eea;
      background-color: #f0f2ff;
    }

    .upload-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #667eea;
      margin-bottom: 16px;
    }

    .file-upload-area h3 {
      margin: 16px 0 8px 0;
      color: #333;
    }

    .file-upload-area p {
      margin: 4px 0;
      color: #666;
      font-size: 14px;
    }

    .selected-file {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 16px;
      padding: 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .file-size {
      color: #666;
      font-size: 12px;
    }

    .form-fields {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 20px;
    }

    .upload-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-start;
    }

    .upload-button {
      min-width: 150px;
    }

    @media (max-width: 768px) {
      .upload-container {
        padding: 16px;
      }

      .file-upload-area {
        padding: 20px;
      }

      .upload-actions {
        flex-direction: column;
      }

      .upload-button {
        width: 100%;
      }
    }
  `]
})
export class DocumentUploadComponent {
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  isDragOver = false;
  uploading = false;

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.uploadForm = this.fb.group({
      description: [''],
      tags: [''],
      isPublic: [false]
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  private handleFile(file: File): void {
    // Validate file size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      this.toastr.error('File size exceeds 100MB limit');
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/zip',
      'application/x-rar-compressed'
    ];

    if (!allowedTypes.includes(file.type)) {
      this.toastr.error('File type not supported');
      return;
    }

    this.selectedFile = file;
  }

  onSubmit(): void {
    if (this.uploadForm.valid && this.selectedFile) {
      this.uploading = true;

      const tags = this.uploadForm.value.tags
        ? this.uploadForm.value.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
        : [];

      const request: DocumentUploadRequest = {
        file: this.selectedFile,
        description: this.uploadForm.value.description,
        tags: tags,
        isPublic: this.uploadForm.value.isPublic
      };

      this.documentService.uploadDocument(request).subscribe({
        next: () => {
          this.toastr.success('Document uploaded successfully!');
          this.router.navigate(['/documents']);
        },
        error: (error) => {
          this.toastr.error(error.error || 'Upload failed');
          this.uploading = false;
        }
      });
    }
  }

  clearForm(): void {
    this.selectedFile = null;
    this.uploadForm.reset();
    this.uploadForm.patchValue({ isPublic: false });
  }

  getFileIcon(contentType: string): string {
    return this.documentService.getFileIcon(contentType);
  }

  formatFileSize(bytes: number): string {
    return this.documentService.formatFileSize(bytes);
  }
} 