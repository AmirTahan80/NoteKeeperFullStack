import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ApiService } from '../../services/base.api';
import { ApiUrlSettings } from '../../environmets/ApiSettings';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthenticationModel } from '../../environmets/AuthenticationModel';

@Component({
  selector: 'app-note-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatProgressSpinnerModule 
  ],
  templateUrl: './note-list.component.html',
  styleUrls: ['./note-list.component.scss']
})
export class NoteListComponent implements OnInit {
  notes: GetNotesDto[] = [];
  loading = false;
  searchTerm = '';
  currentPage = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  totalItems = 0;
  private searchSubject = new Subject<string>();
  apiSettings = new ApiUrlSettings();

  constructor(private apiService: ApiService,
      private router:Router,
      private authenticationModel:AuthenticationModel)
    {
      if(!this.authenticationModel.IsUserLogin())
      {
        this.router.navigate(['/sign-in'])
      }
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 0;
        this.loadNotes();
      });
  }

  ngOnInit() {
    this.loadNotes();
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadNotes();
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.loadNotes();
  }

  private loadNotes() {
    this.loading = true;
    
    var body = {
      pageNumber: this.currentPage + 1,
      pageSize: this.pageSize,
      search: this.searchTerm
    }

    this.apiService.get<GetNotesDto[]>(this.apiSettings.getNoteSettings,body)
    .subscribe({
        next: (response) => {
          this.notes = response;
          console.log(this.notes);
          console.log(this.notes);
          this.totalItems = 100;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading notes:', error);
          this.loading = false;
        }
      });
  }
}

class GetNotesDto
{
  uuid='';
  topic='';
  description='';
  creationDate='';
}