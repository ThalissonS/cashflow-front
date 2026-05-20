import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Finance } from '../../services/finance';

@Component({
  selector: 'app-nova-categoria',
  standalone: true,
  // 1. O Angular precisa saber que vamos usar Formulários Reativos aqui:
  imports: [ReactiveFormsModule],
  templateUrl: './nova-categoria.html'
})
export class NovaCategoriaComponent {
  // Injetando as ferramentas
  private fb = inject(FormBuilder);
  private financeService = inject(Finance);

  // 2. Construindo o "Esqueleto" do Formulário
  formCategoria = this.fb.group({
    nome: ['', Validators.required], // Obrigatório
    descricao: [''] // Opcional
  });

  mensagem = '';

  // 3. Função que roda quando clicamos em Salvar
  enviarParaNuvem() {
    if (this.formCategoria.valid) {
      this.mensagem = 'Enviando...';
      
      // Captura o JSON do formulário e manda pro Service
      this.financeService.salvarCategoria(this.formCategoria.value as any).subscribe({
        next: () => {
          this.mensagem = '✅ Categoria salva com sucesso!';
          this.formCategoria.reset(); // Limpa os campos

          this.financeService.atualizarCategorias$.next(); // Avisa que tem categoria nova
          
        },
        error: (err) => {
          console.error(err);
          this.mensagem = '❌ Erro ao salvar categoria.';
        }
      });
    }
  }
}