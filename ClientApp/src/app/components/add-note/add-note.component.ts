import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ApiService } from '../../services/base.api';
import { ApiUrlSettings } from '../../environmets/ApiSettings';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ViewChild, ElementRef } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { AuthenticationModel } from '../../environmets/AuthenticationModel';

interface NewNote {
  detail: string;
  redirectLink: string;
  searchWords: string[];
  files: File[];
}

@Component({
  selector: 'app-add-note',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './add-note.component.html',
  styleUrls: ['./add-note.component.scss']
})
export class AddNoteComponent implements OnInit {
  noteForm: FormGroup;
  @ViewChild('editor') editor!: ElementRef;
  loading = false;
  files: File[] = [];
  searchWords: string[] = [];
  baseUrls = new ApiUrlSettings();
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  topicId='';

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private apiService:ApiService,
    private authenticationModel:AuthenticationModel
  ) {
    if(!this.authenticationModel.IsUserLogin())
    {
      this.router.navigate(['/sign-in'])
    }
    this.noteForm = this.fb.group({
      detail: ['', Validators.required],
      redirectLink: [''],
      searchWord: ['']
    });
  }

  async ngOnInit() {
    this.topicId = this.route.snapshot.paramMap.get('id') || '';
  }

  formatDoc(command: string) {
    if (command === 'createLink') {
      const url = prompt('Enter a URL:');
      if (url) {
        document.execCommand(command, false, url);
      }
    } else {
      document.execCommand(command, false);
    }
    this.editor.nativeElement.focus();
  }

  onEditorInput(event: Event) {
    const content = (event.target as HTMLDivElement).innerHTML;
    this.noteForm.get('detail')?.setValue(content);
  }

  addSearchWord(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.searchWords.push(value);
      event.chipInput!.clear();
    }
  }

  removeSearchWord(word: string): void {
    const index = this.searchWords.indexOf(word);
    if (index >= 0) {
      this.searchWords.splice(index, 1);
    }
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
      this.files.push(files[i]);
    }
  }

  removeFile(index: number): void {
    this.files.splice(index, 1);
  }

  goBack() {
    this.router.navigate(['/note-list', this.topicId]);
  }

  onSubmit() {
    if (this.noteForm.valid) {
      if(this.searchWords.length == 0)
      {
        this.showErrorMessage('Add at least one keyword.');
        return;
      }
      this.loading = true;
      const formData = new FormData();
      formData.append('detail', this.noteForm.get('detail')?.value);
      formData.append('redirectLink', this.noteForm.get('redirectLink')?.value);
      formData.append('noteSettingId', this.topicId);
      
      this.searchWords.forEach(word => {
        formData.append('searchWords', word);
      });

      this.files.forEach(file => {
        formData.append('files', file);
      });

      this.apiService.post(this.baseUrls.createNoteSettingItem, formData)
        .subscribe({
          next: () => {
            this.showSuccessMessage();
            this.router.navigate(['/note-list/', this.topicId]);
            this.loading = false;
          },
          error: () => {
            this.loading = false;
            this.showErrorMessage();
          }
        });
    }
}

  private showSuccessMessage(): void {
    this.snackBar.open('Note saved successfully.', 'OK', {
      duration: 3000,
      horizontalPosition: 'start',
      panelClass: 'success-snackbar'
    });
    this.router.navigate(['note-list'])
  }

  private showErrorMessage(errMsg:string='Could not save the note.'): void {
    this.snackBar.open(errMsg, 'Try again', {
      duration: 5000,
      horizontalPosition: 'start',
      panelClass: 'error-snackbar'
    });
  }
}
