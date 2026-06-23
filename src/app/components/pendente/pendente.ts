import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-pendente',
  standalone: true,
  template: `
    <div class="pendente-page">
      <div class="card pendente-card">
        <h2 class="pendente-title">Conta Pendente</h2>
        <p class="pendente-msg">
          Sua conta está aguardando aprovação do administrador.
          Você receberá acesso assim que for aprovado.
        </p>
        <button class="btn btn-ghost" (click)="logout()">Sair</button>
      </div>
    </div>
  `,
  styles: [`
    .pendente-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-md);
      background: var(--color-bg);
    }
    .pendente-card {
      max-width: 400px;
      text-align: center;
    }
    .pendente-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-warning);
      margin-bottom: var(--space-md);
    }
    .pendente-msg {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      margin-bottom: var(--space-lg);
      line-height: 1.6;
    }
  `],
})
export class PendenteComponent {
  private auth = inject(AuthService);

  logout() {
    this.auth.logout();
  }
}
