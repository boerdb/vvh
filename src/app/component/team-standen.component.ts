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
              <span class="meta-label">Poule</span>
              <strong class="meta-value">{{ vm.pouleNaam }}</strong>
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
                <tr *ngIf="vm.hasStandRows" class="poule-divider-row poule-main-row">
                  <td colspan="5">Reguliere competitie</td>
                </tr>

                <ng-container *ngFor="let row of vm.rows">

                  <tr *ngIf="row.isDivider" class="poule-divider-row">
                    <td colspan="5">{{ row.titel }}</td>
                  </tr>

                  <tr *ngIf="!row.isDivider" [ngClass]="{'highlight-vvh': row.isVVH}">
                    <td>{{ row.rank }}</td>
                    <td>{{ row.team }}</td>
                    <td>{{ row.wedstrijden }}</td>
                    <td>{{ row.punten }}</td>
                    <td>{{ row.sets }}</td>
                  </tr>

                </ng-container>
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
  // De Observable verwacht nu ook een pouleNaam string
  public vm$: Observable<{ rows: any[]; vvhRank: string; vvhPoints: string; hasStandRows: boolean; pouleNaam: string }>;

  constructor() {
    this.vm$ = this.route.paramMap.pipe(
      map(params => params.get('code') || ''),
      switchMap(code => {
        this.teamCode = code;
        this.teamCodeLabel = this.formatTeamCode(code);
        // We roepen de vernieuwde service aan die nu { standen, poule } teruggeeft
        return this.teamService.getStanden(code);
      }),
      map((result: any) => {
        // We pakken de standen en de poule uit het resultaat van de service
        const rows = result.standen || [];
        const poule = result.poule || `Poule onbekend`;

        // We zoeken de eerste echte VVH stand op (en negeren de divider-kopjes) voor het blok bovenaan
        const vvhRow = rows.find((row: any) => row.isVVH && !row.isDivider);

        return {
          rows,
          vvhRank: vvhRow?.rank ?? '-',
          vvhPoints: vvhRow?.punten ?? '-',
          hasStandRows: rows.some((row: any) => !row.isDivider),
          pouleNaam: poule
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
