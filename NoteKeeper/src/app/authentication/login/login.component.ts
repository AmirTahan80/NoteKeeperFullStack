import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/base.api';
import { ApiUrlSettings } from '../../environmets/ApiSettings';
import { AuthenticationModel } from '../../environmets/AuthenticationModel';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone:true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  userName: string='';
  password: string='';
  baseUrl:ApiUrlSettings = new ApiUrlSettings();

  constructor(private clientService: ApiService, private authenticationModel:AuthenticationModel,
    private router:Router
  ) {}

  login(): LoginResponseDto{
      var request = new LoginUserDto();
      request.userName = this.userName;
      request.password = this.password;
      const content_ = JSON.stringify(request);
      
    var response = new LoginResponseDto();
    this.clientService
    .post<LoginResponseDto>(this.baseUrl.signIn, content_).subscribe({
      next:(value)=>{
        this.authenticationModel.Set(value.token);
        this.router.navigate(['/'])
      },
      error:(err)=>{
        console.log(err);
      }
    });
    return response;
  }
}

class LoginUserDto {
  userName ='';
  password= '';
}

class LoginResponseDto{
  token=''
}
