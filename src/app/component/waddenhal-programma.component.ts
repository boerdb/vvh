import { Component, inject } from '@angular/core';
import { AsyncPipe, NgFor, DatePipe, NgIf } from '@angular/common';
import { NevoboService } from '../services/nevobo.service';
import { map } from 'rxjs';
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonLabel, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-waddenhal-programma',
  standalone: true,
  imports: [AsyncPipe, NgFor, DatePipe, NgIf, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonLabel, IonContent],
  template: `
    <ion-content class="ion-padding">
      <div class="programma-container">
        <h2 class="section-title">Thuis Wedstrijden</h2>
        <ion-card *ngFor="let wedstrijd of programma$ | async" class="match-card">
          <ion-card-header>
            <ion-card-title>{{ wedstrijd.titel }}</ion-card-title>
            <ion-card-subtitle>{{ wedstrijd.datum | date:'short' }}</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <div class="match-description" [innerHTML]="wedstrijd.omschrijving"></div>
            <ion-button *ngIf="wedstrijd.link" [href]="wedstrijd.link" target="_blank" expand="block">Meer info</ion-button>
          </ion-card-content>
        </ion-card>
        <div *ngIf="(programma$ | async)?.length === 0">
          <ion-label><em>Er zijn momenteel geen wedstrijden in de Waddenhal.</em></ion-label>
        </div>
      </div>
    </ion-content>
  `,
  styleUrls: ['./programma.component.scss']
})
export class WaddenhalProgrammaComponent {
  private nevoboService = inject(NevoboService);
  programma$ = this.nevoboService.getProgramma().pipe(
    map(items => items.filter(item =>
      (item.titel && item.titel.toLowerCase().includes('waddenhal')) ||
      (item.omschrijving && item.omschrijving.toLowerCase().includes('waddenhal'))
    ))
  );
}
