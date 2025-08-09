import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface NotificationItem {
  id: string;
  recipientUserId: number;
  senderUserId: number;
  message: string;
  documentId: string;
  createdAt: string;
  read: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<NotificationItem[]>([]);
  notifications$ = this.notificationsSubject.asObservable();
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  private eventSource?: EventSource;

  constructor(private http: HttpClient, private auth: AuthService, private zone: NgZone) {}

  connect(): void {
    if (this.eventSource) return;
    const token = this.auth.getToken();
    if (!token) return;

    const url = `${environment.apiUrl}/notifications/stream?access_token=${encodeURIComponent(token)}`;
    this.eventSource = new EventSource(url, { withCredentials: true });

    this.eventSource.addEventListener('INIT', () => {});

    this.eventSource.addEventListener('NOTIFICATION', (event: MessageEvent) => {
      const notification: NotificationItem = JSON.parse((event as MessageEvent).data);
      this.zone.run(() => {
        this.push(notification);
        try { window?.Notification?.requestPermission?.(); } catch {}
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('New notification', { body: notification.message });
        }
        // increment unread since new notifications are unread
        this.unreadCountSubject.next(this.unreadCountSubject.value + 1);
      });
    });

    this.eventSource.onerror = () => {
      this.close();
      setTimeout(() => this.connect(), 3000);
    };
  }

  close(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }
  }

  fetchAll(): Observable<NotificationItem[]> {
    return this.http.get<NotificationItem[]>(`${environment.apiUrl}/notifications`).pipe(
      tap(list => this.unreadCountSubject.next(list.filter(n => !n.read).length))
    );
  }

  refreshUnreadCount(): void {
    this.http.get<number>(`${environment.apiUrl}/notifications/unread-count`).subscribe(count => {
      this.unreadCountSubject.next(count);
    });
  }

  markAsRead(id: string): Observable<void> {
    return this.http.patch<void>(`${environment.apiUrl}/notifications/${id}/read`, {}).pipe(
      tap(() => {
        const items = this.notificationsSubject.value.map(n => n.id === id ? ({ ...n, read: true }) : n);
        this.notificationsSubject.next(items);
        if (this.unreadCountSubject.value > 0) {
          this.unreadCountSubject.next(this.unreadCountSubject.value - 1);
        }
      })
    );
  }

  seed(list: NotificationItem[]) {
    this.notificationsSubject.next(list);
  }

  private push(n: NotificationItem) {
    const list = this.notificationsSubject.value;
    this.notificationsSubject.next([n, ...list]);
  }
} 