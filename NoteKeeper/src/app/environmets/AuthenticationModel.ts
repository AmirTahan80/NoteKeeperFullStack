import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
  })

export class AuthenticationModel{
    constructor(){}

    Set(validationToken:string)
    {
        localStorage.setItem("TokenAuth", validationToken);
    }
    GetToken()
    {
        return localStorage.getItem("TokenAuth");
    }
    GetRefreshToken()
    {
        return localStorage.getItem("RefreshAuth");
    }
    GetAll()
    {
        var token= localStorage.getItem("TokenAuth");
        return {
            token: token
        }
    }
    IsUserLogin()
    {
        var token = localStorage.getItem("TokenAuth");
        if(token !== '' && token !== null)
        {
            return true;
        }
        return false;
    }
    LogOut()
    {
        localStorage.clear();
    }
}