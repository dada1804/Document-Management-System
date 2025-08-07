import { Routes } from '@angular/router';

export const DOCUMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./document-list/document-list.component').then(m => m.DocumentListComponent)
  },
  {
    path: 'upload',
    loadComponent: () => import('./document-upload/document-upload.component').then(m => m.DocumentUploadComponent)
  },
  {
    path: 'public',
    loadComponent: () => import('./public-documents/public-documents.component').then(m => m.PublicDocumentsComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./document-detail/document-detail.component').then(m => m.DocumentDetailComponent)
  }
]; 