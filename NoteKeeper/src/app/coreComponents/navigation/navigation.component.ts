import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  animations: [
    trigger('menuContainer', [
      state('void', style({
        transform: 'translateY(-100%)',
        opacity: 0
      })),
      state('*', style({
        transform: 'translateY(0)',
        opacity: 1
      })),
      transition('void <=> *', [
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ]),
    trigger('menuRotate', [
      transition('* => *', [
        animate('600ms cubic-bezier(0.4, 0, 0.2, 1)')
      ])
    ])
  ]
})
export class NavigationComponent {
  activeIndex = 0;
  isMenuVisible = false;
  currentRotation = 0;
  menuItems = [
    { label: 'خانه', route: '/home' },
    { label: 'نوت‌ها', route: '/note-list' },
    { label: 'نوت جدید', route: '/new-note' }
  ];

  constructor(private router: Router) {}

  toggleMenu() {
    this.isMenuVisible = !this.isMenuVisible;
  }

  async navigate(direction: 'left' | 'right') {
    // Rotate animation
    this.currentRotation += direction === 'left' ? 120 : -120;
    
    // Update active index
    if (direction === 'left') {
      this.activeIndex = (this.activeIndex + 1) % this.menuItems.length;
    } else {
      this.activeIndex = (this.activeIndex - 1 + this.menuItems.length) % this.menuItems.length;
    }
  }

  async navigateToRoute() {
    // First animate menu up
    this.isMenuVisible = false;
    
    // Wait for animation to complete then navigate
    await new Promise(resolve => setTimeout(resolve, 400));
    this.router.navigate([this.menuItems[this.activeIndex].route]);
  }
}