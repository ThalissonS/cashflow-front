import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Finance } from '../../services/finance';
import { ResumoMensalDTO } from '../../models/api.models';

@Component({
  selector: 'app-painel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './painel.html',
  styleUrl: './painel.css',
})
export class PainelComponent implements OnInit {
  private finance = inject(Finance);

  readonly ano = signal(new Date().getFullYear());
  readonly mes = signal(new Date().getMonth() + 1);
  readonly resumo = signal<ResumoMensalDTO | null>(null);
  readonly loading = signal(false);
  readonly erro = signal<string | null>(null);

  readonly meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  readonly anos = computed(() => {
    const atual = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => atual - 2 + i);
  });

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.loading.set(true);
    this.erro.set(null);
    this.finance.getResumoMensal(this.ano(), this.mes()).subscribe({
      next: (r) => {
        this.resumo.set(r);
        this.loading.set(false);
      },
      error: () => {
        this.erro.set('Erro ao carregar resumo.');
        this.loading.set(false);
      },
    });
  }

  formatar(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  formatarPct(valor: number): string {
    return `${valor.toFixed(2)}%`;
  }

  nomeMes(): string {
    return this.meses.find((m) => m.value === this.mes())?.label ?? '';
  }

  setMes(value: string) {
    this.mes.set(+value);
    this.carregar();
  }

  setAno(value: string) {
    this.ano.set(+value);
    this.carregar();
  }
}
