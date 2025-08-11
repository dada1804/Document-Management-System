import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ChipModule } from 'primeng/chip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RouterModule } from '@angular/router';
import { DocumentService, Document, PageResponse } from '../../../core/services/document.service';
import { FileSizePipe } from '../../../shared/pipes/file-size.pipe';

@Component({
  selector: 'app-shared-documents',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    ChipModule,
    ProgressSpinnerModule,
    RouterModule,
    FileSizePipe
  ],
  templateUrl: './shared-documents.component.html',
  styleUrls: ['./shared-documents.component.scss'],
})
export class SharedDocumentsComponent implements OnInit {
  documents: Document[] = [];
  loading = false;

  constructor(private docs: DocumentService) {}

  ngOnInit(): void { this.load(); }

  load() {
    this.loading = true;
    this.docs.getAccessibleDocuments().subscribe({
      next: (res: PageResponse<Document>) => { this.documents = res.content; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  open(doc: Document) { /* navigate to document detail */ }
  getIcon(ct: string) { return this.docs.getFileIcon(ct); }
} 