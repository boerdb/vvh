import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AsyncPipe, NgFor, NgIf, DatePipe } from '@angular/common';
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonContent, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-nevobo-nieuws',
  standalone: true,
  imports: [AsyncPipe, NgFor, NgIf, DatePipe, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonContent, IonButton],
  template: `
    <ion-content class="nevobo-nieuws-container ion-padding">
      <h2 class="section-title">Nevobo Nieuws</h2>

      <ion-card *ngIf="(nieuws$ | async)?.length === 0" class="nevobo-nieuws-card">
        <ion-card-content>Geen nieuws gevonden op dit moment.</ion-card-content>
      </ion-card>

      <ion-card *ngFor="let item of nieuws$ | async" class="nevobo-nieuws-card">
        <ion-card-header>
          <ion-card-title>{{ item.titel }}</ion-card-title>
          <ion-card-subtitle>{{ item.datum | date:'dd-MM-yyyy HH:mm' }}</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <div class="nevobo-nieuws-description" [innerHTML]="item.omschrijving"></div>
          <ion-button [disabled]="!item.link" [href]="item.link || '#'" target="_blank" fill="clear">
            Lees meer
          </ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `
})
export class NevoboNieuwsComponent {
  private http = inject(HttpClient);

  private readonly PROXY = 'https://weer.benswebradio.nl/proxy.php?url=';

  // HIER ZAT DE FOUT: Het nieuws staat niet in de vereniging-map
  // We gebruiken de algemene nieuwsfeed (of die van de regio)
  private readonly NIEUWS_URL = encodeURIComponent('https://api.nevobo.nl/export/nieuws.rss');

  nieuws$: Observable<any[]> = this.http.get(this.PROXY + this.NIEUWS_URL, { responseType: 'text' }).pipe(
    map((xmlString: string) => {
      // 1. De '2 spaties' / StartTag fix: Negeer alles voor de eerste '<'
      const start = xmlString.indexOf('<');
      if (start === -1) throw new Error('Geen XML gevonden in de response van de server');

      const cleanXml = xmlString.substring(start).trim();
      const parser = new DOMParser();
      const xml = parser.parseFromString(cleanXml, 'text/xml');

      const items = Array.from(xml.querySelectorAll('item'));

      // Helper om tekst in te korten tot max aantal woorden
      function truncateWords(text: string, maxWords: number): string {
        if (!text) return '';
        // Strip HTML tags voor woordentelling
        const plain = text.replace(/<[^>]+>/g, '');
        const words = plain.split(/\s+/);
        if (words.length <= maxWords) return text;
        const truncated = words.slice(0, maxWords).join(' ');
        return truncated + '...';
      }

      return items.map(item => {
        const rawOmschrijving = item.querySelector('description')?.textContent || '';
        return {
          titel: item.querySelector('title')?.textContent || 'Geen titel',
          datum: item.querySelector('pubDate')?.textContent || '',
          omschrijving: truncateWords(rawOmschrijving, 150),
          link: item.querySelector('link')?.textContent || ''
        };
      });
    }),
    catchError(err => {
      console.error('Nevobo Nieuws Error:', err);
      // Toon de foutmelding in de UI voor debugging
      return of([{
        titel: 'Fout bij laden',
        omschrijving: 'De Nevobo nieuwsfeed kon niet worden geladen via de proxy.'
      }]);
    })
  );
}
