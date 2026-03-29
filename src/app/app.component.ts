import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
  businessOutline, globeOutline, downloadOutline
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

    <ion-menu contentId="main-content" type="reveal">
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Menu</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-content>
        <ion-list id="menu-list">
          <ion-note class="ion-padding-start">VVH HARLINGEN</ion-note>

          <ion-menu-toggle auto-hide="false" *ngFor="let p of appPages">
            <ion-item routerDirection="root" [routerLink]="[p.url]" routerLinkActive="selected" detail="false" lines="none">
              <ion-icon aria-hidden="true" slot="start" [name]="p.icon"></ion-icon>
              <ion-label>{{ p.title }}</ion-label>
            </ion-item>
          </ion-menu-toggle>
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
          <ion-title>VVH Harlingen</ion-title>
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
  installPrompt = signal<any>(null);

  public appPages = [
    { title: 'Clubnieuws', url: '/news', icon: 'newspaper-outline' },
    { title: 'Nevobo Nieuws', url: '/nevobo-nieuws', icon: 'volleyball-outline' },
    { title: 'Programma', url: '/programma', icon: 'calendar-outline' },
    { title: 'De Waddenhal', url: '/waddenhal', icon: 'business-outline' }
  ];

  constructor() {
    // Centrale Icon Registry [cite: 2026-01-09]
    addIcons({
      'newspaper-outline': newspaperOutline,
      'volleyball-outline': trophyOutline, // Volleyball heeft geen outline variant
      'calendar-outline': calendarOutline,
      'business-outline': businessOutline,
      'globe-outline': globeOutline,
      'download-outline': downloadOutline
    });
  }

  ngOnInit() {
    // Check voor PWA updates
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          if (confirm("Nieuwe versie beschikbaar. Herladen?")) window.location.reload();
        });
    }

    // Luister naar installatie prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt.set(e);
    });
  }

  installApp() {
    const prompt = this.installPrompt();
    if (prompt) {
      prompt.prompt();
      this.installPrompt.set(null);
    }
  }
}
