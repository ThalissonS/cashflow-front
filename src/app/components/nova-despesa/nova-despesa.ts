import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Finance } from '../../services/finance';
import { Categoria } from '../../models/api.models';

@Component({
  selector: 'app-nova-despesa',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './nova-despesa.html',
})
export class NovaDespesaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private financeService = inject(Finance);

  categorias: Categoria[] = [];
  mensagem = '';

  formDespesa = this.fb.nonNullable.group({
    descricao: ['', Validators.required],
    valor: [0, [Validators.required, Validators.min(0.01)]],
    categoriaId: [null as number | null],
  });

  ngOnInit() {
    this.carregarCategorias();
    this.financeService.atualizarCategorias$.subscribe(() => {
      this.carregarCategorias();
    });
  }

  carregarCategorias() {
    this.financeService.getCategorias().subscribe({
      next: (dados) => (this.categorias = dados),
      error: () => console.error('Erro ao carregar categorias'),
    });
  }

  enviarParaNuvem() {
    if (this.formDespesa.invalid) return;
    this.mensagem = 'Enviando...';
    const val = this.formDespesa.getRawValue();

    const now = new Date();
    this.financeService
      .salvarLancamento({
        descricao: val.descricao,
        valor: val.valor,
        tipo: 'GASTO_VARIAVEL',
        ano: now.getFullYear(),
        mes: now.getMonth() + 1,
        ...(val.categoriaId ? { categoriaId: val.categoriaId } : {}),
      })
      .subscribe({
        next: () => {
          this.mensagem = 'Despesa salva com sucesso!';
          this.formDespesa.reset();
          this.financeService.atualizarLancamentos$.next();
        },
        error: () => {
          this.mensagem = 'Erro ao salvar despesa.';
        },
      });
  }
}
