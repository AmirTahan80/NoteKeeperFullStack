// features/notes/topic-notes/topic-notes.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../services/base.api';
import { ApiUrlSettings } from '../../environmets/ApiSettings';

interface TopicNote {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

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
export class TopicNotesComponent implements OnInit {
  topicId: string = '';
  topicName: string = '';
  notes: GetNoteItemsDto[] = [];
  loading: boolean = false;
  apiSetting=new ApiUrlSettings()

  constructor(
    private route: ActivatedRoute,
    private noteService: ApiService
  ) {}

  ngOnInit() {
    this.topicId = this.route.snapshot.paramMap.get('id') || '';
    this.loadTopicNotes();
  }

  private loadTopicNotes() {
    if (!this.topicId) return;
    
    this.loading = true;
    this.noteService.get<GetNoteItemsDto[]>(this.apiSetting.getNoteSettingItems+'/'+this.topicId).subscribe({
      next: (response) => {
        this.notes = response;
        console.log(this.notes);
        
        // this.topicName = response.topicName;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading topic notes:', error);
        this.loading = false;
      }
    });
  }

  viewNoteDetails(noteId: string) {
    // Navigate to note details page
    // You can implement this later
  }
}

class GetNoteItemsDto {
  redirectLink='';
  detail='';
  searchWords='';
  uuid='';
  filePaths='';
  creationDate='';
}
