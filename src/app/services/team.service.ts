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
        let tabelTeller = 1; // Houdt bij hoeveel tabellen we van dit team hebben gevonden

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          const firstCell = String(row[0] || '').trim();

          // Hebben we ons team gevonden?
          if (firstCell.startsWith(searchString) || firstCell.startsWith(`"${searchString}`)) {

              // Als we al een eerdere tabel hebben ingelezen, is dit dus een extra poule (bijv. bekercompetitie)
            if (standenLijst.length > 0) {
              tabelTeller++;
              // Voeg een speciaal scheidingsobject toe aan de lijst
              standenLijst.push({
                isDivider: true,
                  titel: tabelTeller === 2 ? 'Beker competitie' : `Extra Poule ${tabelTeller}`
              });
            }

            isCorrectTeam = true;
            continue;
          }

          if (isCorrectTeam) {
            // Stop helemaal als we bij een ánder VVH team aankomen
            if (firstCell.startsWith('V.V.H.') && !firstCell.startsWith(searchString)) break;

            // Lege regel gevonden? Dan is DEZE tabel klaar. We pauzeren het inlezen (isCorrectTeam = false),
            // maar de 'for-loop' gaat wel door met zoeken naar de volgende tabel van dit team!
            if (firstCell === '' || firstCell === 'undefined') {
               isCorrectTeam = false;
               continue;
            }

            // Sla de header-rij met titels over
            if (firstCell === 'Ranking') continue;

            // Voeg de rij toe als het een geldig nummer is
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
