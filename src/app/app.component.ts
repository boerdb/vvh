import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { environment } from 'src/environments/environment';
import { CommonModule } from '@angular/common';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';
import {
  IonApp, IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem,
  IonMenu, IonMenuToggle, IonSplitPane, IonIcon, IonLabel, IonNote,
  IonRouterOutlet, IonFooter, IonButton, IonButtons, IonMenuButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  newspaperOutline, trophyOutline, calendarOutline,
  businessOutline, globeOutline, downloadOutline, peopleOutline,
  chevronDownOutline, chevronForwardOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, RouterLink, RouterLinkActive, IonApp, IonContent, IonHeader,
    IonToolbar, IonTitle, IonList, IonItem, IonMenu, IonMenuToggle,
    IonSplitPane, IonIcon, IonLabel, IonNote, IonRouterOutlet, IonFooter,
    IonButton, IonButtons, IonMenuButton
  ],
  template: `
<ion-app>
  <ion-split-pane contentId="main-content">

    <ion-menu contentId="main-content" type="overlay">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Menu</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <ion-list id="menu-list">
          <ion-note class="ion-padding-start">VVH HARLINGEN</ion-note>

          <ng-container *ngFor="let p of appPages">
            <ion-menu-toggle auto-hide="false" *ngIf="!p.submenu">
              <ion-item [routerLink]="p.url" routerLinkActive="selected" detail="false" lines="none">
                <ion-icon [name]="p.icon" slot="start"></ion-icon>
                <ion-label>{{ p.title }}</ion-label>
              </ion-item>
            </ion-menu-toggle>

            <ng-container *ngIf="p.submenu">
              <ion-item (click)="toggleTeams()" detail="false" lines="none" button>
                <ion-icon [name]="p.icon" slot="start"></ion-icon>
                <ion-label>{{ p.title }}</ion-label>
                <ion-icon [name]="showTeams ? 'chevron-down-outline' : 'chevron-forward-outline'" slot="end"></ion-icon>
              </ion-item>

              <ion-list class="submenu-list" *ngIf="showTeams">
                <ion-menu-toggle auto-hide="false" *ngFor="let team of p.submenu">
                  <ion-item [routerLink]="['/team', team.code]" routerLinkActive="selected" lines="none" detail="false">
                    <ion-label class="submenu-label">{{ team.label }}</ion-label>
                  </ion-item>
                </ion-menu-toggle>
              </ion-list>
            </ng-container>
          </ng-container>
        </ion-list>
      </ion-content>

      <ion-footer class="ion-no-border" *ngIf="installPrompt()">
        <ion-toolbar class="ion-padding">
          <ion-button expand="block" (click)="installApp()" color="success" mode="ios">
            <ion-icon name="download-outline" slot="start"></ion-icon>
            Installeer App
          </ion-button>
        </ion-toolbar>
      </ion-footer>
    </ion-menu>

    <div class="ion-page" id="main-content">
      <ion-header [translucent]="true">
        <ion-toolbar color="primary">
          <ion-buttons slot="start">
            <ion-menu-button></ion-menu-button>
          </ion-buttons>
          <ion-title class="centered-title">VVH Harlingen</ion-title>
          <div slot="end" class="header-logo-container">
            <img src="assets/icons/logo-vvh.png" alt="VVH Logo" class="header-logo" />
          </div>
        </ion-toolbar>
      </ion-header>
      <ion-router-outlet></ion-router-outlet>
    </div>

  </ion-split-pane>
</ion-app>
  `,
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  private swUpdate = inject(SwUpdate);
  private router = inject(Router); // Injecteer de router

  public environment = environment;
  public installPrompt = signal<any>(null);
  public showTeams = false;

  public appPages = [
    { title: 'Clubnieuws', url: '/news', icon: 'newspaper-outline' },
    { title: 'Nevobo Nieuws', url: '/nevobo-nieuws', icon: 'trophy-outline' },
    { title: 'Programma', url: '/programma', icon: 'calendar-outline' },
    { title: 'Thuis Wedstrijden', url: '/waddenhal', icon: 'business-outline' },
    { title: 'Uitslagen', url: '/teams', icon: 'people-outline', submenu: [
      { code: 'HS1', label: 'Heren 1' },
      { code: 'HS2', label: 'Heren 2' },
      { code: 'DS1', label: 'Dames 1' },
      { code: 'DS2', label: 'Dames 2' },
      { code: 'XB1', label: 'Mix B1' },
      { code: 'MA1', label: 'Meisjes A1' },
      { code: 'MC1', label: 'Meisjes C1' }
    ] },
    { title: 'Info', url: '/info', icon: 'globe-outline' }
  ];

  constructor() {
    // Luister naar navigatie: klap submenu in zodra de pagina wijzigt
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.showTeams = false;
    });

    addIcons({
      'newspaper-outline': newspaperOutline,
      'trophy-outline': trophyOutline,
      'calendar-outline': calendarOutline,
      'business-outline': businessOutline,
      'globe-outline': globeOutline,
      'download-outline': downloadOutline,
      'people-outline': peopleOutline,
      'chevron-down-outline': chevronDownOutline,
      'chevron-forward-outline': chevronForwardOutline
    });
  }

  ngOnInit(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((evt: any): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          if (confirm("Nieuwe update beschikbaar. Herladen?")) window.location.reload();
        });
    }

    window.addEventListener('beforeinstallprompt', (e: any) => {
      e.preventDefault();
      this.installPrompt.set(e);
    });
  }

  toggleTeams() {
    this.showTeams = !this.showTeams;
  }

  installApp(): void {
    const prompt = this.installPrompt();
    if (prompt) {
      prompt.prompt();
      this.installPrompt.set(null);
    }
  }
}
