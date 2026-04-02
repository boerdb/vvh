import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import * as XLSX from 'xlsx';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private http = inject(HttpClient);
  private readonly PROXY = 'https://weer.benswebradio.nl/proxy.php';

  private normalizeStandenTeamCode(teamCode: string): string {
    const normalizedCode = String(teamCode || '').trim().toUpperCase().replace(/\s+/g, '');
    const match = normalizedCode.match(/^([A-Z]+)(\d+)$/);

    if (!match) {
      return String(teamCode || '').trim();
    }

    return `V.V.H. ${match[1]} ${match[2]}`;
  }

  private extractPouleFromTitleRow(row: any[], searchString: string): string {
    const cleanedCells = (row || [])
      .map(cell => String(cell ?? '').replace(/"/g, '').trim())
      .filter(cell => cell.length > 0);

    if (cleanedCells.length === 0) {
      return '';
    }

    const inlineTitle = cleanedCells.find(cell => cell.startsWith(searchString) && cell.length > searchString.length);
    if (inlineTitle) {
      return inlineTitle.slice(searchString.length).replace(/^[\s-,:;]+/, '').trim();
    }

    const separateTitle = cleanedCells.find(cell => cell !== searchString && !/^ranking$/i.test(cell));
    return separateTitle || '';
  }

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

  // VOLLEDIG GEAUTOMATISEERDE STANDEN LEZER MET POULE HERKENNING
  getStanden(teamCode: string): Observable<{ standen: any[], poule: string }> {
    if (!teamCode || teamCode === 'undefined') {
      return of({ standen: [], poule: '' });
    }

    return this.http.get(`${this.PROXY}?type=standen`, { responseType: 'arraybuffer' }).pipe(
      map(buffer => {
        const data = new Uint8Array(buffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const searchString = this.normalizeStandenTeamCode(teamCode);

        let isCorrectTeam = false;
        let standenLijst: any[] = [];
        let tabelTeller = 1;
        let gevondenPoule = ''; // Hierin slaan we de poule op!

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          const firstCell = String(row[0] || '').trim();
          const isTeamTitleRow = firstCell.startsWith(searchString) || firstCell.startsWith(`"${searchString}`);

          if (isTeamTitleRow) {

            // Bewaar alleen de eerste gevonden hoofdpoule voor de kop van de pagina.
            if (!gevondenPoule) {
              gevondenPoule = this.extractPouleFromTitleRow(row, searchString);
            }

            if (standenLijst.length > 0) {
              tabelTeller++;
              standenLijst.push({
                isDivider: true,
                titel: tabelTeller === 2 ? 'Beker competitie' : `Extra Poule ${tabelTeller}`
              });
            }

            isCorrectTeam = true;
            continue;
          }

          if (isCorrectTeam) {
            if (firstCell.startsWith('V.V.H.') && !firstCell.startsWith(searchString)) break;

            if (firstCell === '' || firstCell === 'undefined') {
               isCorrectTeam = false;
               continue;
            }

            if (firstCell === 'Ranking') continue;

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

        return { standen: standenLijst, poule: gevondenPoule };
      })
    );
  }

  private parseItems(xmlString: string): any[] {
    const startIndex = xmlString.indexOf('<');
    if (startIndex === -1) throw new Error('Geen XML');

    const cleanXml = xmlString.substring(startIndex).trim();
    const parser = new DOMParser();
    const xml = parser.parseFromString(cleanXml, 'text/xml');
    const items = Array.from(xml.querySelectorAll('item'));

    return items.map(item => {
      const pubDate = item.querySelector('pubDate')?.textContent;
      let datumObject = null;
      if (pubDate) {
        datumObject = new Date(pubDate);
      }

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
