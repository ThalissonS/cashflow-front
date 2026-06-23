import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Finance } from '../../services/finance';
import {
  TipoInvestimentoInfo,
  OfertaInvestimento,
  SimulacaoResultado,
  TipoInvestimento,
} from '../../models/api.models';

@Component({
  selector: 'app-simulador',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './simulador.html',
  styleUrl: './simulador.css',
})
export class SimuladorComponent implements OnInit {
  private finance = inject(Finance);
  private fb = inject(FormBuilder);

  readonly tipos = signal<TipoInvestimentoInfo[]>([]);
  readonly ofertas = signal<OfertaInvestimento[]>([]);
  readonly resultado = signal<SimulacaoResultado | null>(null);
  readonly loading = signal(false);
  readonly carregandoOfertas = signal(false);
  readonly simulando = signal(false);
  readonly erro = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    tipo: ['' as TipoInvestimento, Validators.required],
    bancoId: ['' as string],
    valorInicial: [0, [Validators.required, Validators.min(0)]],
    aporteMensal: [0, [Validators.min(0)]],
    prazoMeses: [12, [Validators.required, Validators.min(1)]],
    percentualCdi: [null as number | null],
  });

  ngOnInit() {
    this.loading.set(true);
    this.finance.getTiposInvestimento().subscribe({
      next: (t) => {
        this.tipos.set(t);
        this.loading.set(false);
      },
      error: () => {
        this.erro.set('Erro ao carregar tipos de investimento.');
        this.loading.set(false);
      },
    });
  }

  onTipoChange(event: Event) {
    const tipo = (event.target as HTMLSelectElement).value as TipoInvestimento;
    this.form.patchValue({ tipo, bancoId: '', percentualCdi: null });
    this.ofertas.set([]);
    this.resultado.set(null);

    if (!tipo) return;
    this.carregandoOfertas.set(true);
    this.finance.getOfertas(tipo).subscribe({
      next: (o) => {
        this.ofertas.set(o);
        this.carregandoOfertas.set(false);
      },
      error: () => {
        this.carregandoOfertas.set(false);
      },
    });
  }

  onBancoChange(event: Event) {
    const bancoId = (event.target as HTMLSelectElement).value;
    const oferta = this.ofertas().find((o) => o.bancoId === bancoId);
    if (oferta) {
      this.form.patchValue({ percentualCdi: oferta.percentualCdi });
    }
  }

  simular() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.simulando.set(true);
    this.erro.set(null);
    const val = this.form.getRawValue();

    const req = {
      tipo: val.tipo,
      valorInicial: val.valorInicial,
      prazoMeses: val.prazoMeses,
      ...(val.aporteMensal > 0 ? { aporteMensal: val.aporteMensal } : {}),
      ...(val.percentualCdi !== null ? { percentualCdi: val.percentualCdi } : {}),
      ...(val.bancoId ? { bancoId: val.bancoId } : {}),
    };

    this.finance.simular(req).subscribe({
      next: (r) => {
        this.resultado.set(r);
        this.simulando.set(false);
      },
      error: () => {
        this.erro.set('Erro ao realizar simulação.');
        this.simulando.set(false);
      },
    });
  }

  formatar(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatarPct(valor: number): string {
    return `${valor.toFixed(2)}%`;
  }
}
