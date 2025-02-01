import { Routes } from '@angular/router';
import { LoginComponent } from './authentication/login/login.component';
import { RegisterComponent } from './authentication/register/register.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
    {
        path:"sign-in",
        component:LoginComponent
    },
    {
        path:"sign-up",
        component:RegisterComponent
    },
    {
        path:"",
        component:HomeComponent
    }
];
