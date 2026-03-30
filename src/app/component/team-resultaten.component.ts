import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe, NgFor, DatePipe, NgIf } from '@angular/common';
import { TeamService } from '../services/team.service';
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonContent, IonButton } from '@ionic/angular/standalone';
import { Observable, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-team-resultaten',
  standalone: true,
  imports: [AsyncPipe, NgFor, DatePipe, NgIf, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonContent, IonButton],
  template: `
    <ion-content class="ion-padding">
      <div class="programma-container">
        <h2 class="section-title">Resultaten {{ teamCode }}</h2>
        <ion-card *ngFor="let wedstrijd of resultaten$ | async" class="match-card">
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
export class TeamResultatenComponent {
  private route = inject(ActivatedRoute);
  private teamService = inject(TeamService);
  teamCode = '';
  resultaten$: Observable<any[]> = this.route.paramMap.pipe(
    map(params => params.get('code') || ''),
    map(code => {
      this.teamCode = code;
      return code;
    }),
    switchMap(code => this.teamService.getTeamResultaten(code))
  );
}
