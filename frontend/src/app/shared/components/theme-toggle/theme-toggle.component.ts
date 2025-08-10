import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ThemeService, Theme } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <button pButton 
            [icon]="(currentTheme$ | async) === 'dark' ? 'pi pi-sun' : 'pi pi-moon'"
            class="p-button-text p-button-rounded theme-toggle-btn" 
            (click)="toggleTheme()"
            [attr.aria-label]="(currentTheme$ | async) === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'"
            [title]="(currentTheme$ | async) === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'">
    </button>
  `,
  styles: [`
    .theme-toggle-btn {
      color: var(--text-primary) !important;
      background: var(--bg-secondary) !important;
      border: 1px solid var(--border-color) !important;
      transition: all 0.3s ease !important;
      
      &:hover {
        background: var(--bg-tertiary) !important;
        border-color: var(--border-hover) !important;
        transform: scale(1.05);
      }
      
      &:focus {
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3) !important;
      }
    }
  `]
})
export class ThemeToggleComponent implements OnInit {
  currentTheme$ = this.themeService.currentTheme$;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {}

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
} 