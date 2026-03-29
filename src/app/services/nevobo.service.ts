import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NevoboService {
  private http = inject(HttpClient);
  // Gebruik je eigen proxy
  private readonly PROXY = 'https://weer.benswebradio.nl/proxy.php?url=';
  private readonly NEVOBO_URL = encodeURIComponent('https://api.nevobo.nl/export/vereniging/CKL6L32/programma.rss');

  getProgramma() {
    return this.http.get(this.PROXY + this.NEVOBO_URL, { responseType: 'text' }).pipe(
      map(xmlString => {
        // EXTRA ROBUUSTE OPSCHONING:
        // Zoek de eerste '<' en gooi alles daarvóór weg (spaties, BOM-tekens, etc.)
        const startIndex = xmlString.indexOf('<');
        if (startIndex === -1) throw new Error('Geen geldige XML gevonden');
        const cleanXml = xmlString.substring(startIndex).trim();

        const parser = new DOMParser();
        // text/xml is minder streng dan application/xml
        const xml = parser.parseFromString(cleanXml, 'text/xml');

        // Controleer op parser errors
        const errorNode = xml.querySelector('parsererror');
        if (errorNode) {
          console.error('XML Parser Error:', errorNode.textContent);
          throw new Error('XML Parse fout');
        }

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
