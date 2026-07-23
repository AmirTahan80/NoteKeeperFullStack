import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { ApiUrlSettings } from '../../environmets/ApiSettings';
import { ApiService } from '../../services/base.api';

@Component({
  selector: 'app-note-detail',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './note-detail.component.html',
  styleUrls: ['./note-detail.component.scss']
})
export class NoteDetailComponent implements OnInit, OnDestroy {
  noteItem = new NoteItem();
  loading = true;
  error = '';
  private readonly apiRoutes = new ApiUrlSettings();
  private readonly objectUrls: string[] = [];

  constructor(
    private readonly apiService: ApiService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadNoteItem(this.route.snapshot.params['id']);
  }

  ngOnDestroy(): void {
    this.objectUrls.forEach(url => URL.revokeObjectURL(url));
  }

  public getSearchWordsArray(): string[] {
    return this.noteItem.searchWords?.split(',').filter(Boolean) || [];
  }

  public getFormattedDate(): string {
    return new Date(this.noteItem.creationDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private loadNoteItem(noteId: string): void {
    this.apiService.get<NoteItem>(`${this.apiRoutes.getNoteItem}/${noteId}`)
      .subscribe({
        next: note => this.loadFiles(note),
        error: () => {
          this.error = 'Could not load the note.';
          this.loading = false;
        }
      });
  }

  private loadFiles(note: NoteItem): void {
    if (note.filePaths.length === 0) {
      this.noteItem = note;
      this.loading = false;
      return;
    }

    forkJoin(note.filePaths.map(path => this.apiService.getBlob(path))).subscribe({
      next: files => {
        note.filePaths = files.map(file => {
          const url = URL.createObjectURL(file);
          this.objectUrls.push(url);
          return url;
        });
        this.noteItem = note;
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load the attached files.';
        this.loading = false;
      }
    });
  }
}

class NoteItem {
  redirectLink = '';
  detail = '';
  searchWords = '';
  uuid = '';
  filePaths: string[] = [];
  creationDate = '';
}
