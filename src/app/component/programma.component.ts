import { Component, inject } from '@angular/core';

import { AsyncPipe, NgFor, DatePipe, NgIf } from '@angular/common';
import { NevoboService } from '../services/nevobo.service';
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-programma',
  standalone: true,
  imports: [AsyncPipe, NgFor, DatePipe, NgIf, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonContent],
  template: `
    <ion-content class="ion-padding">
      <div class="programma-container">
        <h2 class="section-title">Programma VVH</h2>
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
      </div>
    </ion-content>
  `,
  styleUrls: ['./programma.component.scss']
})
export class ProgrammaComponent {
  private nevoboService = inject(NevoboService);
  programma$ = this.nevoboService.getProgramma();
}
