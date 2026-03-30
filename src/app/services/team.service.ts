import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private http = inject(HttpClient);
  private readonly PROXY = 'https://weer.benswebradio.nl/proxy.php';

  getTeamProgramma(teamCode: string) {
    return this.http.get(`${this.PROXY}?team=${teamCode.toUpperCase()}`, { responseType: 'text' }).pipe(
      map(xmlString => this.parseItems(xmlString))
    );
  }

  getTeamResultaten(teamCode: string) {
    return this.http.get(`${this.PROXY}?team=${teamCode.toUpperCase()}&type=resultaten`, { responseType: 'text' }).pipe(
      map(xmlString => this.parseItems(xmlString))
    );
  }

  getTeamUitslagen(teamCode: string) {
    return this.http.get(`${this.PROXY}?team=${teamCode.toUpperCase()}&type=resultaten`, { responseType: 'text' }).pipe(
      map(xmlString => this.parseItems(xmlString))
    );
  }

  private parseItems(xmlString: string) {
    const startIndex = xmlString.indexOf('<');
    if (startIndex === -1) throw new Error('Geen XML');
    const cleanXml = xmlString.substring(startIndex).trim();
    const parser = new DOMParser();
    const xml = parser.parseFromString(cleanXml, 'text/xml');
    const items = Array.from(xml.querySelectorAll('item'));
    return items.map(item => ({
      titel: item.querySelector('title')?.textContent || '',
      datum: item.querySelector('pubDate')?.textContent || '',
      omschrijving: item.querySelector('description')?.textContent || '',
      link: item.querySelector('link')?.textContent || ''
    }));
  }
}
