import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/auth']);
    return false;
  }

  const requiredRole = route.data?.['role'] as string | undefined;
  if (requiredRole && auth.user()?.role !== requiredRole) {
    // Redirect to their own dashboard instead of home
    const role = auth.user()?.role;
    if (role === 'STUDENT') router.navigate(['/student']);
    else if (role === 'INSTRUCTOR') router.navigate(['/instructor']);
    else if (role === 'ADMIN') router.navigate(['/admin']);
    else router.navigate(['/']);
    return false;
  }

  return true;
};
