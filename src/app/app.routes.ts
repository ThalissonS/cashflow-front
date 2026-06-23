import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/painel', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./components/registro/registro').then((m) => m.RegistroComponent),
  },
  {
    path: 'pendente',
    loadComponent: () =>
      import('./components/pendente/pendente').then((m) => m.PendenteComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./components/shell/shell').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'painel',
        loadComponent: () =>
          import('./components/painel/painel').then((m) => m.PainelComponent),
      },
      {
        path: 'lancamentos',
        loadComponent: () =>
          import('./components/lancamentos/lancamentos').then(
            (m) => m.LancamentosComponent
          ),
      },
      {
        path: 'metas',
        loadComponent: () =>
          import('./components/metas/metas').then((m) => m.MetasComponent),
      },
      {
        path: 'simulador',
        loadComponent: () =>
          import('./components/simulador/simulador').then(
            (m) => m.SimuladorComponent
          ),
      },
      {
        path: 'admin',
        loadComponent: () =>
          import('./components/admin/admin').then((m) => m.AdminComponent),
        canActivate: [adminGuard],
      },
    ],
  },
  { path: '**', redirectTo: '/painel' },
];
