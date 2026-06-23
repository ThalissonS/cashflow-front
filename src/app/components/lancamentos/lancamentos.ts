import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Finance } from '../../services/finance';
import {
  Categoria,
  Lancamento,
  TipoLancamento,
} from '../../models/api.models';

@Component({
  selector: 'app-lancamentos',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './lancamentos.html',
  styleUrl: './lancamentos.css',
})
export class LancamentosComponent implements OnInit {
  private finance = inject(Finance);
  private fb = inject(FormBuilder);

  readonly ano = signal(new Date().getFullYear());
  readonly mes = signal(new Date().getMonth() + 1);
  readonly lancamentos = signal<Lancamento[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly loading = signal(false);
  readonly salvando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly mostrarForm = signal(false);

  readonly tipos: { value: TipoLancamento; label: string }[] = [
    { value: 'RECEITA', label: 'Receita' },
    { value: 'GASTO_FIXO', label: 'Gasto Fixo' },
    { value: 'GASTO_VARIAVEL', label: 'Gasto Variável' },
    { value: 'INVESTIMENTO', label: 'Investimento' },
  ];

  readonly meses = [
    { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },   { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },   { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },{ value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },{ value: 12, label: 'Dezembro' },
  ];

  readonly anos = computed(() => {
    const atual = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => atual - 2 + i);
  });

  form = this.fb.nonNullable.group({
    descricao: ['', Validators.required],
    valor: [0, [Validators.required, Validators.min(0.01)]],
    tipo: ['RECEITA' as TipoLancamento, Validators.required],
    ano: [new Date().getFullYear(), Validators.required],
    mes: [new Date().getMonth() + 1, Validators.required],
    categoriaId: [null as number | null],
  });

  ngOnInit() {
    this.carregarCategorias();
    this.carregarLancamentos();
  }

  carregarCategorias() {
    this.finance.getCategorias().subscribe({
      next: (cats) => this.categorias.set(cats),
    });
  }

  carregarLancamentos() {
    this.loading.set(true);
    this.erro.set(null);
    this.finance.getLancamentosMes(this.ano(), this.mes()).subscribe({
      next: (lista) => {
        this.lancamentos.set(lista);
        this.loading.set(false);
      },
      error: () => {
        this.erro.set('Erro ao carregar lançamentos.');
        this.loading.set(false);
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
      descricao: val.descricao,
      valor: val.valor,
      tipo: val.tipo,
      ano: val.ano,
      mes: val.mes,
      ...(val.categoriaId ? { categoriaId: val.categoriaId } : {}),
    };

    this.finance.salvarLancamento(req).subscribe({
      next: () => {
        this.salvando.set(false);
        this.mostrarForm.set(false);
        this.form.reset({
          tipo: 'RECEITA',
          ano: this.ano(),
          mes: this.mes(),
        });
        this.carregarLancamentos();
      },
      error: () => {
        this.salvando.set(false);
        this.erro.set('Erro ao salvar lançamento.');
      },
    });
  }

  deletar(id: number) {
    if (!confirm('Excluir este lançamento?')) return;
    this.finance.deletarLancamento(id).subscribe({
      next: () => this.carregarLancamentos(),
      error: () => this.erro.set('Erro ao excluir lançamento.'),
    });
  }

  labelTipo(tipo: TipoLancamento): string {
    return this.tipos.find((t) => t.value === tipo)?.label ?? tipo;
  }

  classeTipo(tipo: TipoLancamento): string {
    const map: Record<TipoLancamento, string> = {
      RECEITA: 'tipo-receita',
      GASTO_FIXO: 'tipo-gasto-fixo',
      GASTO_VARIAVEL: 'tipo-gasto-var',
      INVESTIMENTO: 'tipo-invest',
    };
    return map[tipo];
  }

  formatar(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  nomeMes(): string {
    return this.meses.find((m) => m.value === this.mes())?.label ?? '';
  }

  setMes(value: string) {
    this.mes.set(+value);
    this.carregarLancamentos();
  }

  setAno(value: string) {
    this.ano.set(+value);
    this.carregarLancamentos();
  }
}
