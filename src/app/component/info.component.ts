import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonButton, IonIcon, IonList, IonItem, IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { globeOutline, mailOutline, informationCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [
    CommonModule, IonContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonButton, IonIcon,
    IonList, IonItem, IonLabel
  ],
  templateUrl: './info.component.html',
  styleUrls: ['./programma.component.scss'] // We hergebruiken deze voor de 3.5rem margin
})
export class InfoComponent {
  constructor() {
    addIcons({ globeOutline, mailOutline, informationCircleOutline });
  }
}
