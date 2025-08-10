import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { MenuItem } from 'primeng/api';
import { AuthService, User } from './core/services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MenubarModule,
    ButtonModule,
    SidebarModule,
    MenuModule,
    BadgeModule,
    AvatarModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  currentUser$ = this.authService.currentUser$;
  unreadCount$ = this.notifications.unreadCount$;
  sidebarVisible = false;
  userMenuItems: MenuItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private notifications: NotificationService
  ) {
    if (this.authService.isAuthenticated()) {
      this.notifications.connect();
      this.notifications.refreshUnreadCount();
    }
    
    this.initializeUserMenu();
  }

  private initializeUserMenu(): void {
    this.userMenuItems = [
      {
        label: 'Profile',
        icon: 'pi pi-user',
        command: () => this.navigateToProfile()
      },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => this.logout()
      }
    ];
  }

  logout(): void {
    this.authService.logout();
    this.notifications.close();
    this.router.navigate(['/auth/login']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  navigateToNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }
} 