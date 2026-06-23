import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class ShellComponent {
  readonly auth = inject(AuthService);
  readonly menuAberto = signal(false);

  toggleMenu() {
    this.menuAberto.update((v) => !v);
  }

  fecharMenu() {
    this.menuAberto.set(false);
  }

  logout() {
    this.auth.logout();
  }
}
