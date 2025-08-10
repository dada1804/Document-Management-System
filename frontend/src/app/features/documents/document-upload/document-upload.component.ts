import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { ToastrService } from 'ngx-toastr';
import { DocumentService, DocumentUploadRequest } from '../../../core/services/document.service';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    InputTextareaModule,
    ProgressSpinnerModule,
    CheckboxModule,
    ChipModule
  ],
  template: `
    <div class="upload-container">
      <p-card header="Upload Document" subheader="Upload a new document to your library" styleClass="upload-card">
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
            
            <i class="pi pi-cloud-upload upload-icon"></i>
            <h3>Drop files here or click to browse</h3>
            <p>Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, GIF, ZIP, RAR</p>
            <p>Maximum file size: 100MB</p>
            
            <div *ngIf="selectedFile" class="selected-file">
              <i [class]="getFileIcon(selectedFile.type)"></i>
              <span>{{ selectedFile.name }}</span>
              <span class="file-size">({{ formatFileSize(selectedFile.size) }})</span>
            </div>
          </div>

          <!-- Document Details -->
          <div class="form-fields" *ngIf="selectedFile">
            <div class="form-field">
              <label for="description" class="form-label">Description</label>
              <textarea 
                pInputTextarea 
                id="description"
                formControlName="description" 
                rows="3" 
                placeholder="Enter document description"
                styleClass="w-100">
              </textarea>
            </div>

            <div class="form-field">
              <label for="tags" class="form-label">Tags</label>
              <input 
                pInputText 
                id="tags"
                formControlName="tags" 
                placeholder="Enter tags separated by commas"
                styleClass="w-100">
              <small class="form-hint">e.g., work, important, project</small>
            </div>

            <p-checkbox 
              formControlName="isPublic" 
              [binary]="true"
              label="Make this document public">
            </p-checkbox>
          </div>

          <!-- Upload Button -->
          <div class="upload-actions" *ngIf="selectedFile">
            <p-button 
              label="Upload Document" 
              icon="pi pi-upload" 
              type="submit" 
              [disabled]="uploadForm.invalid || uploading"
              class="p-button-primary upload-button">
              <ng-template pTemplate="content">
                <p-progressSpinner *ngIf="uploading" [style]="{width: '20px', height: '20px'}"></p-progressSpinner>
                <span *ngIf="!uploading">Upload Document</span>
              </ng-template>
            </p-button>
            
            <p-button 
              label="Cancel" 
              [outlined]="true"
              type="button" 
              (click)="clearForm()"
              [disabled]="uploading">
            </p-button>
          </div>
        </form>
      </p-card>
    </div>
  `,
  styles: [`
    .upload-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
      min-height: 100vh;
    }

    .upload-card {
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .file-upload-area {
      border: 2px dashed #cbd5e0;
      border-radius: 12px;
      padding: 48px 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 24px;
      background: #f8fafc;
    }

    .file-upload-area:hover {
      border-color: #667eea;
      background-color: #f0f2ff;
      transform: translateY(-2px);
    }

    .file-upload-area.dragover {
      border-color: #667eea;
      background-color: #e6f3ff;
      transform: scale(1.02);
    }

    .upload-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      color: #667eea;
      margin-bottom: 20px;
      display: block;
    }

    .file-upload-area h3 {
      margin: 20px 0 12px 0;
      color: #2d3748;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .file-upload-area p {
      margin: 8px 0;
      color: #718096;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .selected-file {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 20px;
      padding: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      color: white;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .selected-file i {
      font-size: 24px;
    }

    .selected-file span {
      font-weight: 500;
    }

    .file-size {
      opacity: 0.8;
      font-size: 0.85rem;
    }

    .form-fields {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 24px;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-label {
      font-weight: 600;
      color: #2d3748;
      font-size: 0.95rem;
    }

    .form-hint {
      color: #718096;
      font-size: 0.85rem;
      margin-top: 4px;
    }

    .w-100 {
      width: 100%;
    }

    .upload-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-start;
      flex-wrap: wrap;
    }

    .upload-button {
      min-width: 160px;
      height: 48px;
      font-weight: 500;
    }

    /* Responsive Design */
    @media (max-width: 992px) {
      .upload-container {
        padding: 18px;
        max-width: 700px;
      }
      
      .file-upload-area {
        padding: 40px 20px;
      }
    }

    @media (max-width: 768px) {
      .upload-container {
        padding: 16px;
        max-width: 100%;
      }

      .file-upload-area {
        padding: 32px 16px;
      }

      .file-upload-area h3 {
        font-size: 1.3rem;
      }

      .upload-actions {
        flex-direction: column;
        gap: 12px;
      }

      .upload-button {
        width: 100%;
        min-width: auto;
      }
    }

    @media (max-width: 576px) {
      .upload-container {
        padding: 12px;
      }

      .file-upload-area {
        padding: 24px 12px;
      }

      .file-upload-area h3 {
        font-size: 1.2rem;
      }

      .file-upload-area p {
        font-size: 0.9rem;
      }

      .upload-icon {
        font-size: 56px;
        width: 56px;
        height: 56px;
      }

      .selected-file {
        padding: 12px;
        flex-direction: column;
        text-align: center;
        gap: 8px;
      }
    }

    /* Tablet Optimization */
    @media (min-width: 769px) and (max-width: 1024px) {
      .file-upload-area {
        padding: 44px 22px;
      }
    }

    /* High DPI Displays */
    @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
      .upload-card {
        box-shadow: 0 2px 6px rgba(0,0,0,0.08);
      }
      
      .file-upload-area:hover {
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }
    }

    /* Dark Mode Support */
    @media (prefers-color-scheme: dark) {
      .file-upload-area {
        background: #2d3748;
        border-color: #4a5568;
      }
      
      .file-upload-area:hover {
        background-color: #4a5568;
      }
      
      .file-upload-area.dragover {
        background-color: #2c5282;
      }
      
      .file-upload-area h3 {
        color: #e2e8f0;
      }
      
      .file-upload-area p {
        color: #a0aec0;
      }
      
      .form-label {
        color: #e2e8f0;
      }
      
      .form-hint {
        color: #a0aec0;
      }
    }

    /* Touch Device Optimization */
    @media (hover: none) and (pointer: coarse) {
      .file-upload-area {
        min-height: 200px;
      }
      
      .upload-button {
        min-height: 48px;
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