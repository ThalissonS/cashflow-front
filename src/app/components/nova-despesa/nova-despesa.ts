import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Finance } from '../../services/finance';

@Component({
  selector: 'app-nova-despesa',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './nova-despesa.html'
})
export class NovaDespesaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private financeService = inject(Finance);

  // Variável para guardar a lista que vem do backend
  categorias: any[] = [];
  mensagem = '';

  // O "Esqueleto" espelhando exatamente o JSON que o seu Java espera
  formDespesa = this.fb.group({
    descricao: ['', Validators.required],
    valor: ['', [Validators.required, Validators.min(0.01)]],
    dataVencimento: ['', Validators.required],
    // Sub-grupo, porque o Java espera: "categoria": { "id": 1 }
    categoria: this.fb.group({
      id: ['', Validators.required]
    })
  });

  // Roda automaticamente quando o componente aparece na tela
  carregarCategorias() {
    this.financeService.getCategorias().subscribe({
      next: (dados) => this.categorias = dados,
      error: (err) => console.error('Erro ao carregar categorias:', err)
    });
  }

  // 2. O ciclo de vida que roda ao abrir a tela
  ngOnInit() {
    // Busca a primeira vez que a tela desenha
    this.carregarCategorias();

    // Fica escutando o rádio. Se o formulário de cima gritar, ele busca de novo sozinho!
    this.financeService.atualizarCategorias$.subscribe(() => {
      this.carregarCategorias();
    });
  }

  enviarParaNuvem() {
    if (this.formDespesa.valid) {
      this.mensagem = 'Enviando...';
      
      this.financeService.salvarDespesa(this.formDespesa.value).subscribe({
        next: () => {
          this.mensagem = '✅ Despesa salva com sucesso!';
          this.formDespesa.reset();
          
        },
        error: (err) => {
          console.error(err);
          this.mensagem = '❌ Erro ao salvar despesa.';
        }
      });
    }
  }
}