import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Categoria,
  CategoriaRequest,
  LancamentoRequest,
  Lancamento,
  Meta,
  MetaRequest,
  ProjecaoMeta,
  ResumoMensalDTO,
  TipoInvestimentoInfo,
  OfertaInvestimento,
  SimulacaoRequest,
  SimulacaoResultado,
  TipoInvestimento,
  Usuario,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class Finance {
  private http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  atualizarCategorias$ = new Subject<void>();
  atualizarLancamentos$ = new Subject<void>();

  // ─── Categorias (globais) ──────────────────────────────────────────────────
  getCategorias() {
    return this.http.get<Categoria[]>(`${this.api}/categorias`);
  }

  salvarCategoria(req: CategoriaRequest) {
    return this.http.post<Categoria>(`${this.api}/categorias`, req);
  }

  // ─── Lançamentos ──────────────────────────────────────────────────────────
  getLancamentos() {
    return this.http.get<Lancamento[]>(`${this.api}/lancamentos`);
  }

  getLancamentosMes(ano: number, mes: number) {
    return this.http.get<Lancamento[]>(
      `${this.api}/lancamentos/mes/${ano}/${mes}`
    );
  }

  salvarLancamento(req: LancamentoRequest) {
    return this.http.post<Lancamento>(`${this.api}/lancamentos`, req);
  }

  deletarLancamento(id: number) {
    return this.http.delete<void>(`${this.api}/lancamentos/${id}`);
  }

  // ─── Resumo Mensal ─────────────────────────────────────────────────────────
  getResumoMensal(ano: number, mes: number) {
    return this.http.get<ResumoMensalDTO>(`${this.api}/resumo/${ano}/${mes}`);
  }

  // ─── Metas ─────────────────────────────────────────────────────────────────
  getMetas() {
    return this.http.get<Meta[]>(`${this.api}/metas`);
  }

  salvarMeta(req: MetaRequest) {
    return this.http.post<Meta>(`${this.api}/metas`, req);
  }

  deletarMeta(id: number) {
    return this.http.delete<void>(`${this.api}/metas/${id}`);
  }

  getProjecaoMeta(id: number) {
    return this.http.get<ProjecaoMeta>(`${this.api}/metas/${id}/projecao`);
  }

  // ─── Simulador de Investimentos ────────────────────────────────────────────
  getTiposInvestimento() {
    return this.http.get<TipoInvestimentoInfo[]>(
      `${this.api}/investimentos/tipos`
    );
  }

  getOfertas(tipo: TipoInvestimento) {
    return this.http.get<OfertaInvestimento[]>(
      `${this.api}/investimentos/ofertas`,
      { params: { tipo } }
    );
  }

  simular(req: SimulacaoRequest) {
    return this.http.post<SimulacaoResultado>(
      `${this.api}/investimentos/simular`,
      req
    );
  }

  // ─── Admin ─────────────────────────────────────────────────────────────────
  getUsuarios() {
    return this.http.get<Usuario[]>(`${this.api}/admin/usuarios`);
  }

  aprovarUsuario(id: number) {
    return this.http.post<void>(`${this.api}/admin/usuarios/${id}/aprovar`, {});
  }
}
