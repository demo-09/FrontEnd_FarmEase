import { HttpInterceptorFn } from '@angular/common/http';
import { SKIP_AUTH } from '../../services/data.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip JWT injection for requests that opt out (e.g. public external APIs)
  if (req.context.get(SKIP_AUTH)) {
    return next(req);
  }

  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('CurrentUser');

    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.token) {
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${user.token}`
          }
        });
      }
    }
  }

  return next(req);
};
