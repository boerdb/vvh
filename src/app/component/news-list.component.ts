import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsService } from '../services/news.service';
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonSpinner, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [CommonModule, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonSpinner, IonContent],
  template: `
    <ion-content class="ion-padding">
      <section class="news-feed">
        <h3 class="section-title">Laatste Nieuws</h3>

        <ion-card *ngFor="let item of news$ | async"
                  class="news-card fade-in"
                  (click)="openArticle(item.link)">

          <img *ngIf="item.image" [src]="item.image" class="news-img" alt="">

          <ion-card-header>
              <ion-card-title>{{ item.titel }}</ion-card-title>
              <ion-card-subtitle>{{ item.datum | date:'mediumDate' }}</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <div [innerHTML]="item.omschrijving"></div>
            <span class="read-more">Lees meer →</span>
          </ion-card-content>
        </ion-card>

        <div *ngIf="!(news$ | async)" class="loading-state">
          <ion-spinner></ion-spinner>
          <p>Nieuws laden...</p>
        </div>
      </section>
    </ion-content>
  `,
  styleUrls: ['./news-list.component.scss']
})
export class NewsListComponent {
  private newsService = inject(NewsService);
  news$ = this.newsService.getNews();

  openArticle(url: string) {
    if (url) window.open(url, '_blank');
  }
}
