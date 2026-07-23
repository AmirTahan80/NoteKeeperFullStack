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
        const token = this.GetToken();
        if (!token) {
            return false;
        }

        try {
            const payloadPart = token.split('.')[1];
            if (!payloadPart) {
                this.LogOut();
                return false;
            }

            const normalizedPayload = payloadPart
                .replace(/-/g, '+')
                .replace(/_/g, '/')
                .padEnd(Math.ceil(payloadPart.length / 4) * 4, '=');
            const payload = JSON.parse(atob(normalizedPayload));
            const expiresAt = Number(payload.exp) * 1000;

            if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
                this.LogOut();
                return false;
            }

            return true;
        } catch {
            this.LogOut();
            return false;
        }
    }
    LogOut()
    {
        localStorage.removeItem("TokenAuth");
        localStorage.removeItem("RefreshAuth");
        localStorage.removeItem("PublicUserName");
    }
}
