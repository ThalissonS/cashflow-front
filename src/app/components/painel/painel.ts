import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Finance } from '../../services/finance';
import { ResumoMensalDTO } from '../../models/api.models';

interface MesData {
  ano: number; mes: number; label: string;
  receitas: number; gastos: number; saldo: number; investido: number;
}
interface ChartPt { x: number; y: number; }
interface ChartSeries { label: string; color: string; fill: string; line: string; area: string; pts: ChartPt[]; }
interface BarItem { label: string; valor: number; pct: number; color: string; }
interface DonutSlice { label: string; pct: number; dashArray: string; rotate: number; color: string; }
interface HealthRow { label: string; desc: string; value: string; status: 'ok' | 'warn' | 'danger' | 'info'; }

@Component({
  selector: 'app-painel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './painel.html',
  styleUrl: './painel.css',
})
export class PainelComponent implements OnInit {
  protected readonly Math = Math;
  private finance = inject(Finance);

  // ── Período principal (KPIs + composição) ─────────────────────────────────
  readonly ano    = signal(new Date().getFullYear());
  readonly mes    = signal(new Date().getMonth() + 1);
  readonly resumo = signal<ResumoMensalDTO | null>(null);

  // ── Período do gráfico (De → Até) ─────────────────────────────────────────
  readonly chartDeAno  = signal(new Date().getFullYear());
  readonly chartDeMes  = signal(new Date().getMonth() + 1);
  readonly chartAteAno = signal(new Date().getFullYear());
  readonly chartAteMes = signal(new Date().getMonth() + 1);

  readonly historico   = signal<MesData[]>([]);
  readonly loading     = signal(false);
  readonly erro        = signal<string | null>(null);

  readonly mesesNomes = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
  ];
  readonly meses       = this.mesesNomes.map((label, i) => ({ value: i + 1, label }));
  readonly mesesCurtos = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
                           .map((label, i) => ({ value: i + 1, label }));
  readonly anos  = computed(() => {
    const a = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => a - 3 + i);
  });

  // ── Breakdown bars ────────────────────────────────────────────────────────
  readonly breakdownBars = computed((): BarItem[] => {
    const r = this.resumo();
    if (!r || r.totalReceitas <= 0) return [];
    const rec = r.totalReceitas;
    const raw: BarItem[] = [
      { label: 'Gastos Fixos',     valor: r.totalGastosFixos,     pct: r.totalGastosFixos     / rec * 100, color: '#e05252' },
      { label: 'Gastos Variáveis', valor: r.totalGastosVariaveis, pct: r.totalGastosVariaveis / rec * 100, color: '#e0a033' },
      { label: 'Investimentos',    valor: r.totalInvestidoNoMes,  pct: r.totalInvestidoNoMes  / rec * 100, color: '#4a9eff' },
    ];
    if (r.saldo > 0) raw.push({ label: 'Saldo Livre', valor: r.saldo, pct: r.saldo / rec * 100, color: '#4f8e3e' });
    return raw.filter(b => b.valor > 0);
  });

  // ── Donut slices ──────────────────────────────────────────────────────────
  readonly donutSlices = computed((): DonutSlice[] => {
    const bars = this.breakdownBars();
    if (!bars.length) return [];
    const circ = 2 * Math.PI * 54;
    let cum = 0;
    return bars.map(b => {
      const pct = Math.min(b.pct, 100);
      const dash = (pct / 100) * circ;
      const rot = cum; cum += pct;
      return { label: b.label, pct, dashArray: `${dash} ${circ - dash}`, rotate: -90 + rot * 3.6, color: b.color };
    });
  });

  // ── Coordinate constants ──────────────────────────────────────────────────
  private static readonly CX0 = 65;
  private static readonly CX1 = 610;
  private static readonly CY0 = 12;
  private static readonly CY1 = 122;

  readonly chartMaxVal = computed((): number => {
    const all = this.historico().flatMap(m => [m.receitas, m.gastos]);
    return (Math.max(...all) || 5000) * 1.2;
  });

  readonly chartYTicks = computed((): { y: number; label: string }[] => {
    const mv = this.chartMaxVal();
    const { CY0, CY1 } = PainelComponent;
    const H = CY1 - CY0;
    return [1.0, 0.75, 0.5, 0.25].map(t => ({
      y: CY1 - t * H,
      label: this.abreviar(t * mv),
    }));
  });

  readonly chartSeries = computed((): ChartSeries[] => {
    const h = this.historico();
    if (h.length < 2) return [];
    const maxVal = this.chartMaxVal();
    const { CX0, CX1, CY0, CY1 } = PainelComponent;
    const n = h.length, W = CX1 - CX0, H = CY1 - CY0;
    const toX = (i: number) => CX0 + (i / (n - 1)) * W;
    const toY = (v: number) => CY1 - (v / maxVal) * H;

    const mk = (vals: number[], label: string, color: string, fill: string): ChartSeries => {
      const pts = vals.map((v, i) => ({ x: toX(i), y: toY(v) }));
      let line = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i], mx = ((a.x + b.x) / 2).toFixed(1);
        line += ` C${mx},${a.y.toFixed(1)} ${mx},${b.y.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`;
      }
      const area = `${line} L${pts[pts.length-1].x.toFixed(1)},${CY1} L${pts[0].x.toFixed(1)},${CY1} Z`;
      return { label, color, fill, line, area, pts };
    };

    return [
      mk(h.map(m => m.receitas), 'Receitas', '#4f8e3e', 'rgba(79,142,62,0.14)'),
      mk(h.map(m => m.gastos),   'Gastos',   '#e05252', 'rgba(224,82,82,0.10)'),
    ];
  });

  readonly chartLabels = computed(() => {
    const h = this.historico();
    const n = h.length;
    const { CX0, CX1 } = PainelComponent;
    return h.map((m, i) => ({
      x: CX0 + (i / Math.max(n - 1, 1)) * (CX1 - CX0),
      text: n > 8 ? m.label : `${m.label} ${String(m.ano).slice(2)}`,
    }));
  });

  readonly hasTrendData = computed(() =>
    this.historico().some(m => m.receitas > 0 || m.gastos > 0)
  );

  // ── Mês anterior (para delta dos KPIs) ────────────────────────────────────
  readonly mesAnteriorData = computed(() => {
    const h = this.historico();
    if (h.length < 2) return null;
    return h[h.length - 2];
  });

  readonly nomeMesAnterior = computed(() => {
    const m = this.mesAnteriorData();
    if (!m) return 'mês anterior';
    return this.mesesNomes[m.mes - 1];
  });

  readonly deltaReceitas = computed((): number | null => {
    const p = this.mesAnteriorData(), r = this.resumo();
    if (!p || !r || p.receitas <= 0) return null;
    return ((r.totalReceitas - p.receitas) / p.receitas) * 100;
  });

  readonly deltaGastos = computed((): number | null => {
    const p = this.mesAnteriorData(), r = this.resumo();
    if (!p || !r || p.gastos <= 0) return null;
    return ((r.totalGastos - p.gastos) / p.gastos) * 100;
  });

  // ── Saúde financeira ──────────────────────────────────────────────────────
  readonly healthRows = computed((): HealthRow[] => {
    const r = this.resumo();
    if (!r) return [];
    const rows: HealthRow[] = [];
    const mn = this.nomeMes();

    if (r.totalReceitas > 0) {
      const rec = r.totalReceitas;
      const poupPct = (r.saldo / rec) * 100;
      const gasPct  = (r.totalGastos / rec) * 100;
      const invPct  = (r.totalInvestidoNoMes / rec) * 100;
      const fixPct  = (r.totalGastosFixos / rec) * 100;
      const varPct  = (r.totalGastosVariaveis / rec) * 100;

      rows.push(
        {
          label: 'Taxa de Poupança', value: `${poupPct.toFixed(1)}%`,
          status: poupPct >= 20 ? 'ok' : poupPct > 0 ? 'warn' : 'danger',
          desc: poupPct >= 20
            ? `${this.formatar(r.saldo)} guardados em ${mn} — parabéns, acima dos 20% recomendados`
            : `${this.formatar(r.saldo)} guardados — faltam ${this.formatar((0.2 * rec) - r.saldo)} para atingir a meta de 20%`,
        },
        {
          label: 'Comprometimento da Renda', value: `${gasPct.toFixed(1)}%`,
          status: gasPct <= 80 ? 'ok' : gasPct <= 95 ? 'warn' : 'danger',
          desc: gasPct <= 80
            ? `${this.formatar(r.totalGastos)} em gastos de ${this.formatar(rec)} de receitas — dentro do limite`
            : `${this.formatar(r.totalGastos)} em gastos — acima do teto de 80% (${this.formatar(0.8 * rec)})`,
        },
        {
          label: 'Taxa de Investimento', value: `${invPct.toFixed(1)}%`,
          status: invPct >= 10 ? 'ok' : invPct > 0 ? 'warn' : 'danger',
          desc: invPct >= 10
            ? `${this.formatar(r.totalInvestidoNoMes)} investidos em ${mn} — alinhado com a regra dos 10%`
            : invPct > 0
              ? `${this.formatar(r.totalInvestidoNoMes)} investidos — meta de 10% requer ${this.formatar(0.1 * rec)}/mês`
              : `Nenhum investimento registrado em ${mn} — meta: ${this.formatar(0.1 * rec)}/mês`,
        },
        {
          label: 'Gastos Fixos', value: `${fixPct.toFixed(1)}%`,
          status: fixPct <= 50 ? 'ok' : fixPct <= 65 ? 'warn' : 'danger',
          desc: fixPct <= 50
            ? `${this.formatar(r.totalGastosFixos)} em despesas fixas — controlado, abaixo de 50% da renda`
            : `${this.formatar(r.totalGastosFixos)} em fixos — alto comprometimento (limite sugerido: ${this.formatar(0.5 * rec)})`,
        },
        {
          label: 'Gastos Variáveis', value: `${varPct.toFixed(1)}%`,
          status: varPct <= 30 ? 'ok' : varPct <= 40 ? 'warn' : 'danger',
          desc: varPct <= 30
            ? `${this.formatar(r.totalGastosVariaveis)} em despesas variáveis — dentro do intervalo saudável`
            : `${this.formatar(r.totalGastosVariaveis)} em variáveis — revise gastos discricionários`,
        },
      );
    }

    rows.push({
      label: 'Patrimônio Investido', value: this.formatar(r.patrimonioInvestido),
      status: 'info',
      desc: `Rendimento estimado de ${this.formatar(r.rendimentoEstimadoMes)}/mês com CDI em ${r.cdiAnual.toFixed(1)}% ao ano`,
    });
    return rows;
  });

  // ── Chart subtitle ─────────────────────────────────────────────────────────
  readonly chartSubtitle = computed((): string => {
    const h = this.historico();
    if (!h.length) return '';
    const first = h[0], last = h[h.length - 1];
    const de  = `${this.mesesNomes[first.mes - 1]} ${first.ano}`;
    const ate = `${this.mesesNomes[last.mes - 1]} ${last.ano}`;
    return de === ate ? de : `${de} a ${ate}`;
  });

  // ── Load ──────────────────────────────────────────────────────────────────
  ngOnInit() {
    const de = this.getLastNMonths(6, this.ano(), this.mes())[0];
    this.chartDeAno.set(de.ano);
    this.chartDeMes.set(de.mes);
    this.chartAteAno.set(this.ano());
    this.chartAteMes.set(this.mes());
    this.carregarTudo();
  }

  carregar() { this.carregarTudo(); }
  setMes(v: string) { this.mes.set(+v); this.carregarResumoComHistorico(); }
  setAno(v: string) { this.ano.set(+v); this.carregarResumoComHistorico(); }

  setChartDeMes(v: string) { this.chartDeMes.set(+v); this.carregarHistorico(); }
  setChartDeAno(v: string) { this.chartDeAno.set(+v); this.carregarHistorico(); }
  setChartAteMes(v: string) { this.chartAteMes.set(+v); this.carregarHistorico(); }
  setChartAteAno(v: string) { this.chartAteAno.set(+v); this.carregarHistorico(); }

  private carregarTudo() {
    this.loading.set(true);
    this.erro.set(null);
    const abr = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const periods = this.getMonthRange(this.chartDeAno(), this.chartDeMes(), this.chartAteAno(), this.chartAteMes());
    const empty = (p: { ano: number; mes: number }): ResumoMensalDTO => ({
      ano: p.ano, mes: p.mes, totalReceitas: 0, totalGastosFixos: 0,
      totalGastosVariaveis: 0, totalInvestidoNoMes: 0, totalGastos: 0,
      saldo: 0, patrimonioInvestido: 0, cdiAnual: 0, rendimentoEstimadoMes: 0,
    });
    forkJoin(
      periods.map(p => this.finance.getResumoMensal(p.ano, p.mes).pipe(catchError(() => of(empty(p)))))
    ).subscribe({
      next: results => {
        this.historico.set(results.map((r, i) => ({
          ano: periods[i].ano, mes: periods[i].mes, label: abr[periods[i].mes - 1],
          receitas: r.totalReceitas, gastos: r.totalGastos,
          saldo: r.saldo, investido: r.totalInvestidoNoMes,
        })));
        // resumo = mês selecionado no period selector principal
        const idx = periods.findIndex(p => p.ano === this.ano() && p.mes === this.mes());
        this.resumo.set(idx >= 0 ? results[idx] : results[results.length - 1]);
        this.loading.set(false);
      },
      error: () => { this.erro.set('Erro ao carregar dados.'); this.loading.set(false); },
    });
  }

  private carregarHistorico() {
    const abr = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const periods = this.getMonthRange(this.chartDeAno(), this.chartDeMes(), this.chartAteAno(), this.chartAteMes());
    if (!periods.length) return;
    const empty = (p: { ano: number; mes: number }): ResumoMensalDTO => ({
      ano: p.ano, mes: p.mes, totalReceitas: 0, totalGastosFixos: 0,
      totalGastosVariaveis: 0, totalInvestidoNoMes: 0, totalGastos: 0,
      saldo: 0, patrimonioInvestido: 0, cdiAnual: 0, rendimentoEstimadoMes: 0,
    });
    forkJoin(
      periods.map(p => this.finance.getResumoMensal(p.ano, p.mes).pipe(catchError(() => of(empty(p)))))
    ).subscribe({
      next: results => {
        this.historico.set(results.map((r, i) => ({
          ano: periods[i].ano, mes: periods[i].mes, label: abr[periods[i].mes - 1],
          receitas: r.totalReceitas, gastos: r.totalGastos,
          saldo: r.saldo, investido: r.totalInvestidoNoMes,
        })));
      },
    });
  }

  private carregarResumoComHistorico() {
    // Garante que o período "Até" do gráfico acompanha o mês selecionado
    this.chartAteAno.set(this.ano());
    this.chartAteMes.set(this.mes());
    const de = this.getLastNMonths(6, this.ano(), this.mes())[0];
    this.chartDeAno.set(de.ano);
    this.chartDeMes.set(de.mes);
    this.carregarTudo();
  }

  private getMonthRange(deAno: number, deMes: number, ateAno: number, ateMes: number, max = 24) {
    const result: { ano: number; mes: number }[] = [];
    let a = deAno, m = deMes;
    while ((a < ateAno || (a === ateAno && m <= ateMes)) && result.length < max) {
      result.push({ ano: a, mes: m });
      if (++m > 12) { m = 1; a++; }
    }
    return result.length >= 2 ? result : result;
  }

  private getLastNMonths(n: number, ano: number, mes: number) {
    return Array.from({ length: n }, (_, i) => {
      let m = mes - (n - 1 - i), a = ano;
      while (m <= 0) { m += 12; a--; }
      return { ano: a, mes: m };
    });
  }

  formatar(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
  nomeMes() { return this.mesesNomes[this.mes() - 1] ?? ''; }
  private abreviar(v: number): string {
    if (v >= 10000) return `${(v / 1000).toFixed(0)}k`;
    if (v >= 1000)  return `${(v / 1000).toFixed(1).replace('.0', '')}k`;
    return v > 0 ? v.toFixed(0) : '0';
  }
}
