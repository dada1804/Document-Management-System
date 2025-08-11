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
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.scss']
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