import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Finance {
  // 1. Injeção do HttpClient
  private http = inject(HttpClient);

 // 2. URL base da API
  private apiUrl = 'https://api-cashflow.onrender.com';

  // 3. Método para obter o total de despesas
  getTotalDespesas() {
    return this.http.get<number>(`${this.apiUrl}/despesas/total`);
  }
}