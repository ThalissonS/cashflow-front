import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Finance } from '../../services/finance';
import { Meta, ProjecaoMeta } from '../../models/api.models';

@Component({
  selector: 'app-metas',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './metas.html',
  styleUrl: './metas.css',
})
export class MetasComponent implements OnInit {
  private finance = inject(Finance);
  private fb = inject(FormBuilder);

  readonly metas = signal<Meta[]>([]);
  readonly projecoes = signal<Map<number, ProjecaoMeta>>(new Map());
  readonly loading = signal(false);
  readonly salvando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly mostrarForm = signal(false);

  form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    valorAlvo: [0, [Validators.required, Validators.min(0.01)]],
    aporteMensal: [0, [Validators.required, Validators.min(0)]],
    valorInicial: [null as number | null],
  });

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.loading.set(true);
    this.erro.set(null);
    this.finance.getMetas().subscribe({
      next: (lista) => {
        this.metas.set(lista);
        this.loading.set(false);
        lista.forEach((m) => this.carregarProjecao(m.id));
      },
      error: () => {
        this.erro.set('Erro ao carregar metas.');
        this.loading.set(false);
      },
    });
  }

  carregarProjecao(id: number) {
    this.finance.getProjecaoMeta(id).subscribe({
      next: (p) => {
        this.projecoes.update((map) => {
          const novo = new Map(map);
          novo.set(id, p);
          return novo;
        });
      },
    });
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.salvando.set(true);
    const val = this.form.getRawValue();

    const req = {
      nome: val.nome,
      valorAlvo: val.valorAlvo,
      aporteMensal: val.aporteMensal,
      ...(val.valorInicial !== null ? { valorInicial: val.valorInicial } : {}),
    };

    this.finance.salvarMeta(req).subscribe({
      next: () => {
        this.salvando.set(false);
        this.mostrarForm.set(false);
        this.form.reset({ aporteMensal: 0 });
        this.carregar();
      },
      error: () => {
        this.salvando.set(false);
        this.erro.set('Erro ao salvar meta.');
      },
    });
  }

  deletar(id: number) {
    if (!confirm('Excluir esta meta?')) return;
    this.finance.deletarMeta(id).subscribe({
      next: () => this.carregar(),
      error: () => this.erro.set('Erro ao excluir meta.'),
    });
  }

  formatar(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  progresso(id: number): number {
    const p = this.projecoes().get(id);
    if (!p || p.valorAlvo === 0) return 0;
    return Math.min(100, ((p.valorAlvo - p.falta) / p.valorAlvo) * 100);
  }
}
