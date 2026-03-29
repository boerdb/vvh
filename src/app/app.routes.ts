import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'news',
    pathMatch: 'full',
  },
  {
    path: 'news',
    loadComponent: () => import('./component/news-list.component').then(m => m.NewsListComponent),
  },
  {
    path: 'nevobo-nieuws',
    loadComponent: () => import('./component/nevobo-nieuws.component').then(m => m.NevoboNieuwsComponent),
  },
  {
    path: 'programma',
    loadComponent: () => import('./component/programma.component').then(m => m.ProgrammaComponent),
  },
  {
    path: 'waddenhal',
    loadComponent: () => import('./component/waddenhal-programma.component').then(m => m.WaddenhalProgrammaComponent),
  }
];
