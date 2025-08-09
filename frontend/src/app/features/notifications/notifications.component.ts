import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationItem, NotificationService } from '../../core/services/notification.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications">
      <h2>Notifications</h2>
      <div *ngIf="(notifications$ | async) as notifications; else loading">
        <div *ngIf="notifications.length === 0" class="empty">No notifications yet</div>
        <ul>
          <li *ngFor="let n of notifications" [class.unread]="!n.read" (click)="onClick(n)">
            <div class="msg">{{ n.message }}</div>
            <div class="meta">{{ n.createdAt | date:'short' }}</div>
          </li>
        </ul>
      </div>
      <ng-template #loading>Loading...</ng-template>
    </div>
  `,
  styles: [`
    .notifications { padding: 1rem; }
    ul { list-style: none; padding: 0; margin: 0; }
    li { border-bottom: 1px solid #eee; padding: .5rem 0; cursor: pointer; display: flex; justify-content: space-between; }
    li.unread { background: #fff8e1; }
    .msg { font-weight: 500; }
    .meta { color: #666; font-size: .8rem; }
    .empty { color: #888; }
  `]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications$!: Observable<NotificationItem[]>;
  private sub?: Subscription;

  constructor(private notifications: NotificationService) {}

  ngOnInit(): void {
    this.notifications.connect();
    this.notifications$ = this.notifications.notifications$;
    this.sub = this.notifications.fetchAll().subscribe(list => {
      this.notifications.seed(list);
    });
  }

  onClick(n: NotificationItem) {
    if (!n.read) {
      this.notifications.markAsRead(n.id).subscribe();
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
} 