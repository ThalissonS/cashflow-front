import { Component, inject, signal, OnInit } from '@angular/core';
import { Finance } from '../../services/finance';
import { Usuario } from '../../models/api.models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class AdminComponent implements OnInit {
  private finance = inject(Finance);

  readonly usuarios = signal<Usuario[]>([]);
  readonly loading = signal(false);
  readonly erro = signal<string | null>(null);
  readonly sucesso = signal<string | null>(null);

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.loading.set(true);
    this.erro.set(null);
    this.finance.getUsuarios().subscribe({
      next: (lista) => {
        this.usuarios.set(lista);
        this.loading.set(false);
      },
      error: () => {
        this.erro.set('Erro ao carregar usuários.');
        this.loading.set(false);
      },
    });
  }

  aprovar(id: number) {
    this.sucesso.set(null);
    this.erro.set(null);
    this.finance.aprovarUsuario(id).subscribe({
      next: () => {
        this.sucesso.set('Usuário aprovado com sucesso.');
        this.carregar();
      },
      error: () => {
        this.erro.set('Erro ao aprovar usuário.');
      },
    });
  }

  labelStatus(u: Usuario): string {
    return u.status === 'APROVADO' ? 'Aprovado' : 'Pendente';
  }

  labelPapel(u: Usuario): string {
    return u.papel === 'ROLE_ADMIN' ? 'Admin' : 'Usuário';
  }
}
