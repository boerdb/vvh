import { Component, inject, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonContent, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonSpinner } from '@ionic/angular/standalone';
import { TeamService } from '../services/team.service';
import { forkJoin, map } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor, NgIf,  IonContent, IonCard, IonCardContent,  IonMenuButton, IonSpinner],
 template: `
    <ion-content>
      <div class="home-container">

        <section class="hero">

          <ion-menu-button class="floating-menu"></ion-menu-button>

          <div class="hero-overlay">
            <img src="assets/logo-vvh.png" alt="VVH logo" class="hero-logo" />
            <p class="hero-kicker">Sinds 1971</p>
            <h1>Welkom bij VVH</h1>
            <p class="hero-subtitle">Meer dan volleybal: een club voor sport, groei en plezier.</p>

          </div>
        </section>

        <section class="upcoming">
          <h2>Komende wedstrijden</h2>

          <div *ngIf="isLoading" class="loading-state">
            <ion-spinner name="crescent" color="warning"></ion-spinner>
            <p>Wedstrijden laden...</p>
          </div>

          <div class="cards-grid" *ngIf="!isLoading">
            <ion-card class="match-card" *ngFor="let match of upcomingMatches">
              <ion-card-content>
                <div class="match-meta">{{ match.datumTekst }}</div>
                <h3>{{ match.thuisTeam }}</h3>
                <p>tegen {{ match.uitTeam }}</p>

              </ion-card-content>
            </ion-card>
            <p *ngIf="upcomingMatches.length === 0" class="geen-wedstrijden">Geen geplande wedstrijden binnenkort.</p>
          </div>
        </section>



      </div>
    </ion-content>
  `,
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private teamService = inject(TeamService);

  public upcomingMatches: any[] = [];
  public isLoading = true;

  ngOnInit() {
    // We halen meerdere teams op zodat we vrijwel altijd 3 kaarten kunnen tonen.
    forkJoin([
      this.teamService.getTeamProgramma('HS1'),
      this.teamService.getTeamProgramma('DS1'),
      this.teamService.getTeamProgramma('MA1')
    ]).pipe(
      map(([hs1, ds1, ma1]) => {
        const allMatches = [...hs1, ...ds1, ...ma1];
        const now = new Date();

        const upcoming = allMatches
          .filter(match => match?.datum instanceof Date && !isNaN(match.datum.getTime()))
          .filter(match => match.datum.getTime() >= now.getTime() - 24 * 60 * 60 * 1000)
          .sort((a, b) => a.datum.getTime() - b.datum.getTime());

        if (upcoming.length >= 3) {
          return upcoming.slice(0, 3);
        }

        // Fallback: toon alsnog maximaal 3 kaarten als de feed weinig toekomstige data bevat.
        return allMatches.slice(0, 3);
      })
    ).subscribe({
      next: (matches) => {
        // We mappen de Nevobo data zodat het in jouw mooie HTML structuur past
        this.upcomingMatches = matches.map(m => {
          // Nevobo titel is vaak: "VVH HS 1 - Tegenstander" of bevat een datum
          const teams = m.titel.split(' - ');
          return {
            datumTekst: m.omschrijving, // Bevat vaak "Zaterdag 13 apr, 14:00, Waddenhal"
            thuisTeam: teams[0] ? teams[0].replace(/.*\d{2}:\d{2}: /, '') : 'VVH', // Filtert evt tijdstip weg
            uitTeam: teams[1] || 'Tegenstander'
          };
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Kon wedstrijden niet laden', err);
        this.isLoading = false;
      }
    });
  }
}
