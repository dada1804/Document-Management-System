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
      color: var(--navbar-text) !important;
      background: var(--navbar-button-bg) !important;
      border: 1px solid var(--navbar-button-border) !important;
      transition: all 0.3s ease !important;
      width: 2.5rem !important;
      height: 2.5rem !important;
      
      &:hover {
        background: var(--navbar-button-hover-bg) !important;
        border-color: var(--navbar-button-hover-border) !important;
        transform: scale(1.05);
      }
      
      &:focus {
        box-shadow: 0 0 0 3px var(--navbar-button-border) !important;
      }
      
      .p-button-icon {
        font-size: 1rem;
      }
    }
    
    @media (max-width: 768px) {
      .theme-toggle-btn {
        width: 2.25rem !important;
        height: 2.25rem !important;
        
        .p-button-icon {
          font-size: 0.9rem;
        }
      }
    }
    
    @media (max-width: 576px) {
      .theme-toggle-btn {
        width: 2rem !important;
        height: 2rem !important;
        
        .p-button-icon {
          font-size: 0.85rem;
        }
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