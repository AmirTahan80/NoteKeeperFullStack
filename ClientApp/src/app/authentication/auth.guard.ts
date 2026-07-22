import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationModel } from '../environmets/AuthenticationModel';

export const authGuard: CanActivateFn = () => {
  const authentication = inject(AuthenticationModel);
  return authentication.IsUserLogin()
    ? true
    : inject(Router).createUrlTree(['/sign-in']);
};
