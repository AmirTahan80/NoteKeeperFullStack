import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiUrlSettings } from '../../environmets/ApiSettings';
import { ApiService } from '../../services/base.api';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './public-profile.component.html',
  styleUrl: './public-profile.component.scss'
})
export class PublicProfileComponent implements OnInit {
  userName = '';
  loading = true;
  notFound = false;
  private apiSettings = new ApiUrlSettings();

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const userName = this.route.snapshot.paramMap.get('username') ?? '';

    this.apiService
      .get<PublicUserProfileDto>(
        `${this.apiSettings.publicProfile}/${encodeURIComponent(userName)}`
      )
      .subscribe({
        next: profile => {
          this.userName = profile.userName;
          this.loading = false;
        },
        error: () => {
          this.notFound = true;
          this.loading = false;
        }
      });
  }
}

interface PublicUserProfileDto {
  userName: string;
}
