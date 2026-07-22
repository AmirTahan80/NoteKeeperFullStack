import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { ApiUrlSettings } from '../../environmets/ApiSettings';
import { ApiService } from '../../services/base.api';

@Component({
  selector: 'app-topic-notes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './topic-notes.component.html',
  styleUrls: ['./topic-notes.component.scss']
})
export class TopicNotesComponent implements OnInit, OnDestroy {
  topicId = '';
  topicName = '';
  notes: GetNoteItemsDto[] = [];
  loading = false;
  private readonly apiSettings = new ApiUrlSettings();
  private readonly objectUrls: string[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.topicId = this.route.snapshot.paramMap.get('id') || '';
    this.loadTopicNotes();
  }

  ngOnDestroy(): void {
    this.objectUrls.forEach(url => URL.revokeObjectURL(url));
  }

  private loadTopicNotes(): void {
    if (!this.topicId) return;

    this.loading = true;
    this.apiService
      .get<GetNoteItemsDto[]>(`${this.apiSettings.getNoteSettingItems}/${this.topicId}`)
      .pipe(
        switchMap(notes => notes.length === 0
          ? of([])
          : forkJoin(notes.map(note => this.loadFiles(note))))
      )
      .subscribe({
        next: notes => {
          this.notes = notes;
          this.loading = false;
        },
        error: error => {
          console.error('Error loading topic notes:', error);
          this.loading = false;
        }
      });
  }

  private loadFiles(note: GetNoteItemsDto) {
    if (note.filePaths.length === 0) return of(note);

    return forkJoin(note.filePaths.map(path => this.apiService.getBlob(path))).pipe(
      map(files => ({
        ...note,
        filePaths: files.map(file => {
          const url = URL.createObjectURL(file);
          this.objectUrls.push(url);
          return url;
        })
      }))
    );
  }
}

interface GetNoteItemsDto {
  redirectLink: string;
  detail: string;
  searchWords: string;
  uuid: string;
  filePaths: string[];
  creationDate: Date;
}
