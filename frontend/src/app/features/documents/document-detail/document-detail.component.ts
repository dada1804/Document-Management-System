import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="document-detail-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Document Details</mat-card-title>
          <mat-card-subtitle>View document information</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>Document detail view coming soon...</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .document-detail-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
  `]
})
export class DocumentDetailComponent {}