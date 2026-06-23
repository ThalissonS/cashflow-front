// ─── Enums ─────────────────────────────────────────────────────────────────────
export type TipoLancamento =
  | 'RECEITA'
  | 'GASTO_FIXO'
  | 'GASTO_VARIAVEL'
  | 'INVESTIMENTO';

export type TipoInvestimento = 'CDB' | 'LCI' | 'LCA' | 'POUPANCA';
export type PapelUsuario = 'ROLE_USER' | 'ROLE_ADMIN';
export type StatusUsuario = 'PENDENTE' | 'APROVADO';

// ─── Categoria ─────────────────────────────────────────────────────────────────
export interface Categoria {
  id: number;
  nome: string;
  descricao: string;
}

export interface CategoriaRequest {
  nome: string;
  descricao: string;
}

// ─── Resumo Mensal ──────────────────────────────────────────────────────────────
export interface ResumoMensalDTO {
  ano: number;
  mes: number;
  totalReceitas: number;
  totalGastosFixos: number;
  totalGastosVariaveis: number;
  totalInvestidoNoMes: number;
  totalGastos: number;
  saldo: number;
  patrimonioInvestido: number;
  cdiAnual: number;
  rendimentoEstimadoMes: number;
}

// ─── Lançamento ────────────────────────────────────────────────────────────────
export interface Lancamento {
  id: number;
  descricao: string;
  valor: number;
  tipo: TipoLancamento;
  ano: number;
  mes: number;
  categoria?: Categoria;
}

export interface LancamentoRequest {
  descricao: string;
  valor: number;
  tipo: TipoLancamento;
  ano: number;
  mes: number;
  categoriaId?: number;
}

// ─── Meta ──────────────────────────────────────────────────────────────────────
export interface Meta {
  id: number;
  nome: string;
  valorAlvo: number;
  aporteMensal: number;
  valorInicial?: number;
}

export interface MetaRequest {
  nome: string;
  valorAlvo: number;
  aporteMensal: number;
  valorInicial?: number;
}

export interface ProjecaoMeta {
  metaId: number;
  nome: string;
  valorAlvo: number;
  valorAtual: number;
  falta: number;
  mesesRestantes: number;
}

// ─── Investimentos ─────────────────────────────────────────────────────────────
export interface TipoInvestimentoInfo {
  tipo: TipoInvestimento;
  descricao: string;
}

export interface OfertaInvestimento {
  bancoId: string;
  banco: string;
  tipo: TipoInvestimento;
  percentualCdi: number;
}

export interface SimulacaoRequest {
  tipo: TipoInvestimento;
  valorInicial: number;
  aporteMensal?: number;
  prazoMeses: number;
  percentualCdi?: number;
  bancoId?: string;
}

export interface SimulacaoResultado {
  valorBruto: number;
  valorLiquido: number;
  ir: number;
  rendimento: number;
  aliquotaIr: number;
}

// ─── Auth ──────────────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegistroRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface AuthResponse {
  token: string;
  nome: string;
  papel: PapelUsuario;
}

// ─── Usuário (admin) ───────────────────────────────────────────────────────────
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  status: StatusUsuario;
  papel: PapelUsuario;
}
