import { Component, ViewChild } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';



@Component({
  selector: 'app-navigation',
  standalone:true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    FlexLayoutModule
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })),
      transition(':enter', [
        animate('0.5s ease-in')
      ])
    ])
  ]
})
export class NavigationComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  toggleSidenav() {
    console.log('log');
    
    this.sidenav.toggle();
  }

  closeSidenav() {
    console.log('log');
    this.sidenav.close();
  }
}
