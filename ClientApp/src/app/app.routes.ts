import { Routes } from '@angular/router';
import { LoginComponent } from './authentication/login/login.component';
import { RegisterComponent } from './authentication/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { NewNoteComponent } from './components/newnote/newnote.component';
import { NoteListComponent } from './components/note-list-component/note-list.component';
import { TopicNotesComponent } from './components/topic-notes/topic-notes.component';
import { AddNoteComponent } from './components/add-note/add-note.component';
import { NoteDetailComponent } from './components/note-detail/note-detail.component';
import { authGuard } from './authentication/auth.guard';

export const routes: Routes = [
    {
        path:"sign-in",
        component:LoginComponent
    },
    {
        path:"sign-up",
        component:RegisterComponent
    },
    {
        path:"",
        component:HomeComponent
    },
    {
        path:"new-note",
        component:NewNoteComponent,
        canActivate: [authGuard]
    },
    {
        path:"note-list",
        component:NoteListComponent,
        canActivate: [authGuard]
    },
    {
        path:"note-list/:id",
        component:TopicNotesComponent,
        canActivate: [authGuard]
    },
    {
        path:"new-note-item/:id",
        component:AddNoteComponent,
        canActivate: [authGuard]
    },
    {
        path:"app-note-detail/:id",
        component:NoteDetailComponent,
        canActivate: [authGuard]
    }
];
