import { Component, inject } from '@angular/core';
import { Finance } from './services/finance';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // A variável que vai aparecer no HTML
  totalDespesas: string | number = '---';

  // Injeta o serviço que criamos no Passo 1
  financeService = inject(Finance);

  buscarTotal() {
    this.totalDespesas = 'Calculando...';

    // Pede para o serviço ir na nuvem buscar o dado
    this.financeService.getTotalDespesas().subscribe({
      next: (valor) => {
        // Se deu sucesso, joga o valor na tela
        this.totalDespesas = valor;
      },
      error: (erro) => {
        // Se deu erro, avisa no console
        console.error('Erro ao buscar API:', erro);
        this.totalDespesas = 'Erro de Conexão';
      }
    });
  }
}