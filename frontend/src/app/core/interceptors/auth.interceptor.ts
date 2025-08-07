import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  console.log('Auth interceptor - Request URL:', req.url);
  console.log('Auth interceptor - Token:', token ? 'Token exists' : 'No token');

  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    console.log('Auth interceptor - Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
    return next(authReq);
  }

  return next(req);
}; 