import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import * as XLSX from 'xlsx';

@Injectable({ providedIn: 'root' })
export class TeamService {
  // Moderne injectie in plaats van constructor parameters
  private http = inject(HttpClient);
  private readonly PROXY = 'https://weer.benswebradio.nl/proxy.php';

  getTeamProgramma(teamCode: string): Observable<any[]> {
    return this.http.get(`${this.PROXY}?team=${teamCode.toUpperCase()}`, { responseType: 'text' }).pipe(
      map(xmlString => this.parseItems(xmlString))
    );
  }

  getTeamResultaten(teamCode: string): Observable<any[]> {
    return this.http.get(`${this.PROXY}?team=${teamCode.toUpperCase()}&type=resultaten`, { responseType: 'text' }).pipe(
      map(xmlString => this.parseItems(xmlString))
    );
  }

  getTeamUitslagen(teamCode: string): Observable<any[]> {
    return this.http.get(`${this.PROXY}?team=${teamCode.toUpperCase()}&type=resultaten`, { responseType: 'text' }).pipe(
      map(xmlString => this.parseItems(xmlString))
    );
  }

// VOLLEDIG GEAUTOMATISEERDE STANDEN LEZER (Via Proxy & XLSX)
  getStanden(teamCode: string): Observable<any[]> {
    if (!teamCode || teamCode === 'undefined') {
      console.error('Fout: Geen geldige teamcode doorgekregen!');
      return of([]);
    }

    return this.http.get(`${this.PROXY}?type=standen`, { responseType: 'arraybuffer' }).pipe(
      map(buffer => {
        const data = new Uint8Array(buffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const match = teamCode.match(/([a-zA-Z]+)(\d+)/);
        const searchString = match ? `V.V.H. ${match[1].toUpperCase()} ${match[2]}` : teamCode;

        let isCorrectTeam = false;
        let standenLijst: any[] = [];

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const firstCell = String(row[0] || '').trim();

          // Controleer of we de titel van ons team vinden
          if (firstCell.startsWith(searchString) || firstCell.startsWith(`"${searchString}`)) {
            // BEVEILIGING 1: Als we al een tabel hebben gelezen en we komen de teamnaam
            // NOG een keer tegen (bijv. voor een 2e seizoenshelft), stop dan direct!
            if (standenLijst.length > 0) break;

            isCorrectTeam = true;
            continue;
          }

          if (isCorrectTeam) {
            // BEVEILIGING 2: Stop als we bij een heel ander VVH team aankomen
            if (firstCell.startsWith('V.V.H.') && !firstCell.startsWith(searchString)) break;

            // BEVEILIGING 3: Nevobo zet een lege regel tussen tabellen.
            // Als we al standen verzameld hebben en we zien een lege regel, is deze tabel klaar!
            if ((!row || row.length === 0 || firstCell === '' || firstCell === 'undefined') && standenLijst.length > 0) {
              break;
            }

            // Sla lege regels (voorafgaand aan de tabel) en de header-rij over
            if (!row || row.length === 0 || firstCell === '' || firstCell === 'undefined' || firstCell === 'Ranking') {
              continue;
            }

            // We checken of de eerste cel écht een getal is (de Ranking), dan pas toevoegen
            if (row.length >= 6 && /^\d+$/.test(firstCell)) {
              standenLijst.push({
                rank: row[0],
                team: String(row[1]).replace(/"/g, '').trim(),
                wedstrijden: row[2],
                punten: row[3],
                sets: `${row[4]}-${row[5]}`,
                isVVH: String(row[1]).includes('V.V.H.')
              });
            }
          }
        }

        return standenLijst;
      })
    );
  }
  // Hulpmethode voor het verwerken van de XML feeds (Programma & Resultaten)
  private parseItems(xmlString: string): any[] {
    const startIndex = xmlString.indexOf('<');
    if (startIndex === -1) throw new Error('Geen XML');

    const cleanXml = xmlString.substring(startIndex).trim();
    const parser = new DOMParser();
    const xml = parser.parseFromString(cleanXml, 'text/xml');
    const items = Array.from(xml.querySelectorAll('item'));

    return items.map(item => {
      // Datum verwerking
      const pubDate = item.querySelector('pubDate')?.textContent;
      let datumObject = null;
      if (pubDate) {
        datumObject = new Date(pubDate);
      }

      // Link verwerking
      let link = item.querySelector('link')?.textContent || '';
      const guid = item.querySelector('guid')?.textContent || '';
      if (!link && guid && guid.startsWith('http')) {
        link = guid;
      }

      return {
        titel: item.querySelector('title')?.textContent || 'Geen titel',
        link: link,
        omschrijving: item.querySelector('description')?.textContent || 'Geen details beschikbaar.',
        datum: datumObject
      };
    });
  }
}
