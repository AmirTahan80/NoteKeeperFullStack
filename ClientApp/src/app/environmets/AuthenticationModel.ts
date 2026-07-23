import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
  })

export class AuthenticationModel{
    constructor(){}

    Set(validationToken:string, userName:string)
    {
        localStorage.setItem("TokenAuth", validationToken);
        localStorage.setItem("PublicUserName", userName);
    }
    GetToken()
    {
        return localStorage.getItem("TokenAuth");
    }
    GetRefreshToken()
    {
        return localStorage.getItem("RefreshAuth");
    }
    GetUserName()
    {
        return localStorage.getItem("PublicUserName");
    }
    GetAll()
    {
        var token= localStorage.getItem("TokenAuth");
        return {
            token: token,
            userName: this.GetUserName()
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
        localStorage.removeItem("TokenAuth");
        localStorage.removeItem("RefreshAuth");
        localStorage.removeItem("PublicUserName");
    }
}
