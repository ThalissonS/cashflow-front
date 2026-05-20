import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Finance {
  // 1. Injeção do HttpClient
  private http = inject(HttpClient);

 // 2. URL base da API
  private apiUrl = 'https://api-cashflow.onrender.com';

  atualizarCategorias$ = new Subject<void>();
  atualizarDespesas$ = new Subject<void>();

  // 3. Método para obter o total de despesas
  getTotalDespesas() {
    return this.http.get<number>(`${this.apiUrl}/despesas/total`);  
  }

  salvarCategoria(dadosCategoria: { nome: string, descricao: string }) {
    return this.http.post(`${this.apiUrl}/categorias`, dadosCategoria);
  }

  getCategorias() {
    return this.http.get<any[]>(`${this.apiUrl}/categorias`);
  }

  salvarDespesa(dadosDespesa: any) {
    return this.http.post(`${this.apiUrl}/despesas`, dadosDespesa);
  }

}