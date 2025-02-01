import { Component, Input } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { TextFieldModule } from '@angular/cdk/text-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';


@Component({
  selector: 'app-loading-overlay ',
  standalone:true,
  imports:[
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TextFieldModule],
  template: `
    <div class="loading-overlay" [@fadeInOut]>
      <div class="loading-content">
        <div class="spinner-container">
          <mat-spinner diameter="48" strokeWidth="4"></mat-spinner>
        </div>
        <p class="loading-text">{{ message }}</p>
      </div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      inset: 0;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
      display: grid;
      place-items: center;
      z-index: 1000;
    }

    .loading-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .spinner-container {
      display: grid;
      place-items: center;
      height: 48px;
    }

    .loading-text {
      color: #666;
      font-size: 1rem;
      font-weight: 500;
      text-align: center;
      margin: 0;
    }

    @media (max-width: 768px) {
      .loading-text {
        font-size: 0.875rem;
      }
    }
  `],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class LoadingOverlayComponent {
  @Input() message = 'در حال پردازش...';
}