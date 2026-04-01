import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./component/home.component').then(m => m.HomeComponent),
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
  },
  {
    path: 'info',
    loadComponent: () => import('./component/info.component').then(m => m.InfoComponent),
  },
  {
    path: 'teams',
    loadComponent: () => import('./component/teams.component').then(m => m.TeamsComponent),
  },
  {
    path: 'team/:code',
    loadComponent: () => import('./component/team-resultaten.component').then(m => m.TeamResultatenComponent),
  },
  {
    path: 'standen/:code',
    loadComponent: () => import('./component/team-standen.component').then(m => m.TeamStandenComponent),
  }
];
