import { Component, inject, OnInit } from '@angular/core'; // Adicionamos OnInit
import { Finance } from './services/finance';
import { NovaCategoriaComponent } from './components/nova-categoria/nova-categoria';
import { NovaDespesaComponent } from './components/nova-despesa/nova-despesa';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NovaCategoriaComponent, NovaDespesaComponent], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit { // Implementamos OnInit
  totalDespesas: string | number = '---';
  financeService = inject(Finance);

  // 1. Inicia buscando o total e liga o rádio
  ngOnInit() {
    this.buscarTotal();

    // 2. Fica escutando: Se alguém salvar uma despesa, atualiza o total!
    this.financeService.atualizarDespesas$.subscribe(() => {
      this.buscarTotal();
    });
  }

  // 3. A mesma função que você já tinha
  buscarTotal() {
    this.totalDespesas = 'Calculando...';
    this.financeService.getTotalDespesas().subscribe({
      next: (valor) => this.totalDespesas = valor,
      error: (erro) => {
        console.error('Erro ao buscar API:', erro);
        this.totalDespesas = 'Erro de Conexão';
      }
    });
  }
}