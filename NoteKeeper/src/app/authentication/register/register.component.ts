// filepath: /d:/Projects/Private/NoteBookKeeper/Client/NoteKeeper/src/app/authentication/register/register.component.ts
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ApiUrlSettings } from '../../environmets/ApiSettings';
import { ApiService } from '../../services/base.api';
import { AuthenticationModel } from '../../environmets/AuthenticationModel';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
    userName: string='';
    email: string='';
    password: string='';
    repassword: string='';
    baseUrl:ApiUrlSettings = new ApiUrlSettings();
  
    constructor(private clientService: ApiService, private authenticationModel:AuthenticationModel,
      private router:Router
    ) {}
  
    register(){
        var request = new RegisterUserDto();
        request.userName = this.userName;
        request.email = this.email;
        request.password=this.password;
        request.rePassword=this.repassword;
        const content_ = JSON.stringify(request);

      this.clientService
      .post<any>(this.baseUrl.singUp, content_).subscribe({
        next:(value)=>{
          if(value == null)
            this.router.navigate(['/sign-in'])
        },
        error:(err)=>{
          console.log(err);
        }
      });
    }
}


class RegisterUserDto {
  userName='';
  email='';
  password='';
  rePassword='';
}