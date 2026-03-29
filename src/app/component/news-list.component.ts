import { Component, inject } from '@angular/core';
import { CommonModule, NgFor, NgIf, DatePipe, AsyncPipe } from '@angular/common';
import { NewsService } from '../services/news.service';
import {
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent, IonSpinner, IonContent, IonButton, IonImg
} from '@ionic/angular/standalone';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [
    CommonModule, NgFor, NgIf, DatePipe, AsyncPipe,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonCardContent, IonContent, IonButton, IonImg, IonSpinner
  ],
  template: `
    <ion-content class="ion-padding">
      <div class="programma-container">
        <h2 class="section-title">Laatste Nieuws</h2>

        <div *ngIf="!(news$ | async)" class="ion-text-center ion-padding">
          <ion-spinner name="crescent"></ion-spinner>
        </div>

        <ion-card *ngFor="let item of news$ | async" class="match-card">
          <ion-img *ngIf="item.image" [src]="item.image" class="news-img"></ion-img>

          <ion-card-header>
            <ion-card-title>{{ item.title }}</ion-card-title>
            <ion-card-subtitle>
              {{ (item.date || item.datum) | date:'dd MMM, yyyy' }}
            </ion-card-subtitle>
          </ion-card-header>

          <ion-card-content>
            <div class="match-description" [innerHTML]="item.summary || item.omschrijving">
            </div>

            <ion-button expand="block" (click)="openArticle(item.link)">
              Lees meer →
            </ion-button>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styleUrls: ['./programma.component.scss']
})
export class NewsListComponent {
  private newsService = inject(NewsService);

  // Gebruik de observable voor automatische updates
  news$: Observable<any[]> = this.newsService.getNews();

  openArticle(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }
}
