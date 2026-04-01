import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe, NgFor, NgClass, NgIf } from '@angular/common';
import { TeamService } from '../services/team.service';
import { IonCard, IonCardContent, IonContent } from '@ionic/angular/standalone';
import { Observable, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-team-standen',
  standalone: true,
  imports: [AsyncPipe, NgFor, NgClass, NgIf, IonCard, IonCardContent, IonContent],
  template: `
    <ion-content>
      <div class="standen-container" *ngIf="vm$ | async as vm">
        <div class="standen-header">
          <h2 class="section-title">Stand {{ teamCode }}</h2>
          <p class="section-subtitle">Huidige stand voor {{ teamCodeLabel }}</p>

          <div class="meta-grid">
            <div class="meta-item">
              <span class="meta-label">Categorie</span>
              <strong class="meta-value">{{ teamCodeLabel }}</strong>
            </div>
            <div class="meta-item">
              <span class="meta-label">VVH positie</span>
              <strong class="meta-value">#{{ vm.vvhRank }}</strong>
            </div>
            <div class="meta-item">
              <span class="meta-label">VVH punten</span>
              <strong class="meta-value">{{ vm.vvhPoints }}</strong>
            </div>
          </div>
        </div>

        <ion-card class="stand-card">
          <ion-card-content>
            <table class="stand-table">
              <thead>
                <tr>
                  <th class="col-rank">#</th>
                  <th class="col-team">Team</th>
                  <th class="col-wed">W</th>
                  <th class="col-ptn">Ptn</th>
                  <th class="col-sets">Sets</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of vm.rows" [ngClass]="{'highlight-vvh': row.isVVH}">
                  <td>{{ row.rank }}</td>
                  <td>{{ row.team }}</td>
                  <td>{{ row.wedstrijden }}</td>
                  <td>{{ row.punten }}</td>
                  <td>{{ row.sets }}</td>
                </tr>
              </tbody>
            </table>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styleUrls: ['./team-standen.component.scss']
})
export class TeamStandenComponent {
  private route = inject(ActivatedRoute);
  private teamService = inject(TeamService);

  public teamCode = '';
  public teamCodeLabel = '';
  public vm$: Observable<{ rows: any[]; vvhRank: string; vvhPoints: string }>;

  constructor() {
    this.vm$ = this.route.paramMap.pipe(
      map(params => params.get('code') || ''),
      switchMap(code => {
        this.teamCode = code;
        this.teamCodeLabel = this.formatTeamCode(code);
        return this.teamService.getStanden(code);
      }),
      map(rows => {
        const vvhRow = rows.find(row => row.isVVH);
        return {
          rows,
          vvhRank: vvhRow?.rank ?? '-',
          vvhPoints: vvhRow?.punten ?? '-'
        };
      })
    );
  }

  private formatTeamCode(code: string): string {
    const match = code.match(/^([A-Za-z]+)(\d+)$/);
    if (!match) {
      return code;
    }

    return `${match[1].toUpperCase()} ${match[2]}`;
  }
}
