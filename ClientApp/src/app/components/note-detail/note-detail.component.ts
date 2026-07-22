import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/base.api';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiUrlSettings } from '../../environmets/ApiSettings';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-note-detail',
    standalone:true,
    imports:[CommonModule, MatProgressSpinnerModule],
    templateUrl: './note-detail.component.html',
    styleUrls: ['./note-detail.component.scss']
})
export class NoteDetailComponent implements OnInit {
    noteItem=new NoteItem();
    loading = true;
    error = '';
    noteItemId='';
    apiRoutes = new ApiUrlSettings();

    constructor(
        private noteItemService: ApiService,
        private route: ActivatedRoute
    ) {}

    ngOnInit(): void {
        const noteId = this.route.snapshot.params['id'];
        this.loadNoteItem(noteId);
    }

    private loadNoteItem(noteId: string): void {
        this.noteItemService.get<NoteItem>(this.apiRoutes.getNoteItem+'/'+noteId)
            .subscribe({
                next: (data) => {
                    this.noteItem = data;
                    this.loading = false;
                },
                error: (error) => {
                    this.error = 'خطا در دریافت اطلاعات جزوه';
                    this.loading = false;
                }
            });
    }

    // متدهای کمکی برای کار با کلاس
    public getSearchWordsArray(): string[] {
        return this.noteItem.searchWords?.split(',').filter(Boolean) || [];
    }
  
    public getPersianDate(): string {
        return new Date(this.noteItem.creationDate).toLocaleDateString('fa-IR');
    }
}


// models/NoteItem.ts
class NoteItem {
  redirectLink='';
  detail='';
  searchWords='';
  uuid='';
  filePaths:string[] = [];
  creationDate=''
}