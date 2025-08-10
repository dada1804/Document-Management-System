import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private readonly DEFAULT_THEME: Theme = 'light';
  
  private currentThemeSubject = new BehaviorSubject<Theme>(this.DEFAULT_THEME);
  public currentTheme$: Observable<Theme> = this.currentThemeSubject.asObservable();

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const savedTheme = this.getStoredTheme();
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
    }
  }

  private getStoredTheme(): Theme | null {
    try {
      const stored = localStorage.getItem(this.THEME_KEY);
      return stored === 'dark' || stored === 'light' ? stored : null;
    } catch {
      return null;
    }
  }

  private storeTheme(theme: Theme): void {
    try {
      localStorage.setItem(this.THEME_KEY, theme);
    } catch {
      // Handle localStorage errors gracefully
    }
  }

  public getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  public setTheme(theme: Theme): void {
    this.currentThemeSubject.next(theme);
    this.storeTheme(theme);
    this.applyTheme(theme);
  }

  public toggleTheme(): void {
    const newTheme = this.getCurrentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  private applyTheme(theme: Theme): void {
    const body = document.body;
    
    if (theme === 'dark') {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
    }
  }

  public isDarkTheme(): boolean {
    return this.getCurrentTheme() === 'dark';
  }

  public isLightTheme(): boolean {
    return this.getCurrentTheme() === 'light';
  }
} 