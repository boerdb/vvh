import { Component, inject, OnInit } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonContent, IonMenuButton, IonSpinner } from '@ionic/angular/standalone';
import { NevoboService } from '../services/nevobo.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [DatePipe, NgFor, NgIf, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonMenuButton, IonSpinner],
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
          <h2>Komende wedstrijden (thuis en uit)</h2>

          <div *ngIf="isLoading" class="loading-state">
            <ion-spinner name="crescent" color="warning"></ion-spinner>
            <p>Wedstrijden laden...</p>
          </div>

          <div class="cards-grid" *ngIf="!isLoading">
            <ion-card class="match-card" *ngFor="let match of upcomingMatches">
              <ion-card-header>
                <ion-card-title>{{ match.titel }}</ion-card-title>
                <ion-card-subtitle>
                  {{ match.datum | date:'dd-MM-yyyy HH:mm' }}
                  <span class="locatie-tag">{{ match.locatieTekst }}</span>
                </ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <div class="match-description" [innerHTML]="match.omschrijving"></div>
                <ion-button *ngIf="match.link" [href]="match.link" target="_blank" expand="block">Meer info</ion-button>
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
  private nevoboService = inject(NevoboService);

  public upcomingMatches: any[] = [];
  public isLoading = true;

  ngOnInit() {
    this.nevoboService.getProgramma().pipe(
      map(allMatches => {
        const now = new Date();

        const sorted = [...allMatches]
          .map(match => ({
            ...match,
            datumObj: this.toDate(match?.datum)
          }))
          .filter(match => !!match.datumObj)
          .sort((a, b) => a.datumObj!.getTime() - b.datumObj!.getTime());

        const upcoming = sorted.filter(match => match.datumObj!.getTime() >= now.getTime() - 24 * 60 * 60 * 1000);

        if (upcoming.length >= 3) {
          return upcoming.slice(0, 3);
        }

        return sorted.slice(0, 3);
      })
    ).subscribe({
      next: (matches) => {
        this.upcomingMatches = matches.map(m => {
          return {
            ...m,
            datum: m.datumObj,
            locatieTekst: this.getLocatieLabel(m.titel)
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

  private getLocatieLabel(title: string): 'Thuis' | 'Uit' {
    const teams = (title || '').split(' - ').map(part => part.trim());
    const first = teams[0] || '';
    return /V\.?V\.?H\.?/i.test(first) ? 'Thuis' : 'Uit';
  }

  private toDate(value: unknown): Date | null {
    if (!value) {
      return null;
    }

    if (value instanceof Date && !isNaN(value.getTime())) {
      return value;
    }

    const parsed = new Date(String(value));
    return isNaN(parsed.getTime()) ? null : parsed;
  }
}
