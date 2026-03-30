import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonListHeader, IonItem, IonLabel } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonListHeader, IonItem, IonLabel
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Teams</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-list-header>Kies een team</ion-list-header>
        <ion-item *ngFor="let team of teams" (click)="openTeam(team)">
          <ion-label>{{ team.label }}</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  styles: [``]
})
export class TeamsComponent {
  teams = [
    { code: 'HS1', label: 'Heren 1' },
    { code: 'HS2', label: 'Heren 2' },
    { code: 'DS1', label: 'Dames 1' },
    { code: 'DS2', label: 'Dames 2' },
    { code: 'XB1', label: 'Mix B1' },
    { code: 'MA1', label: 'Meisjes A1' },
    { code: 'MC1', label: 'Meisjes C1' }
  ];

  constructor(private router: Router) {}

  openTeam(team: any) {
    this.router.navigate(['/team', team.code]);
  }
}
