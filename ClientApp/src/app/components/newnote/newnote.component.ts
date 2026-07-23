// features/notes/create-note/create-note.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TextFieldModule } from '@angular/cdk/text-field';
import { LoadingOverlayComponent } from '../../coreComponents/loading/loadingoverlay.component ';
import { CommonModule, DOCUMENT} from '@angular/common';
import { ApiService } from '../../services/base.api';
import { ApiUrlSettings } from '../../environmets/ApiSettings';
import { Router } from '@angular/router';
import { AuthenticationModel } from '../../environmets/AuthenticationModel';

interface NoteForm {
  subject: string;
  description: string;
}

@Component({
  selector: 'app-create-note',
  templateUrl: './newnote.component.html',
  styleUrls: ['./newnote.component.scss'],
  standalone:true,
  imports:[
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TextFieldModule,
    LoadingOverlayComponent]
})
export class NewNoteComponent implements OnInit {
  noteForm: FormGroup<{
    subject: FormControl<string>;
    description: FormControl<string>;
  }> | any;
  isLoading = false;
  apiSettings = new ApiUrlSettings();

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private apiService: ApiService,
    private router:Router,
    private authenticationModel:AuthenticationModel
      ) {
        if(!this.authenticationModel.IsUserLogin())
        {
          this.router.navigate(['/sign-in'])
        }
      }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.noteForm = this.fb.group({
      subject: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
  }

  onSubmit(): void {
    if (this.noteForm.valid) {
      const formData: NoteForm = this.noteForm.value;
      this.isLoading = true;
      var body= new CreateNoteSettingDto();
      body.topic = formData.subject;
      body.description = formData.description;

      try {
        // Replace with your actual service call
        this.apiService.post(this.apiSettings.createNoteSetting,body)
        .subscribe({
          next:(value)=>{            
            if(value == null)
            {
              this.showSuccessMessage();
            }
            else
            {
              this.showErrorMessage();
            }
          },
          error:(err)=>{
            this.isLoading = false;
            if(err.status !== 401)
            {
              this.showErrorMessage();
            }
            console.log(err);
          }
        });
      } catch (error) {
        this.showErrorMessage();
      } finally {
        this.isLoading = false;
      }
    }
  }

  private showSuccessMessage(): void {
    this.isLoading = false;
    this.snackBar.open('نوت با موفقیت ذخیره شد', 'باشه', {
      duration: 3000,
      horizontalPosition: 'start',
      direction: 'rtl',
      panelClass: 'success-snackbar'
    });
    this.router.navigate(['note-list'])
  }

  private showErrorMessage(): void {
    this.snackBar.open('خطا در ذخیره نوت', 'تلاش مجدد', {
      duration: 5000,
      horizontalPosition: 'start',
      direction: 'rtl',
      panelClass: 'error-snackbar'
    });
  }
}


class CreateNoteSettingDto {
  topic='';
  description ='';
}
