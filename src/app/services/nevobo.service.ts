import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NevoboService {
  private http = inject(HttpClient);

  // We gebruiken proxy.php en het type 'programma'
  private readonly PROXY = 'https://weer.benswebradio.nl/proxy.php';

  getProgramma() {
    return this.http.get(`${this.PROXY}?type=programma`, { responseType: 'text' }).pipe(
      map(xmlString => {
        // 1. EXTRA ROBUUSTE OPSCHONING:
        // Zoek de eerste '<' en gooi alles daarvóór weg (spaties, BOM-tekens, etc.)
        const startIndex = xmlString.indexOf('<');
        if (startIndex === -1) {
          throw new Error('Geen geldige XML gevonden');
        }
        const cleanXml = xmlString.substring(startIndex).trim();

        // 2. XML PARSING
        const parser = new DOMParser();
        const xml = parser.parseFromString(cleanXml, 'text/xml');

        // 3. Controleer op parser errors
        const errorNode = xml.querySelector('parsererror');
        if (errorNode) {
          console.error('XML Parser Error:', errorNode.textContent);
          throw new Error('XML Parse fout');
        }

        // 4. Items omzetten naar een lijst (Array)
        const items = Array.from(xml.querySelectorAll('item'));

        return items.map(item => ({
          titel: item.querySelector('title')?.textContent || '',
          datum: item.querySelector('pubDate')?.textContent || '',
          omschrijving: item.querySelector('description')?.textContent || '',
          link: item.querySelector('link')?.textContent || ''
        }));
      })
    );
  }
}
