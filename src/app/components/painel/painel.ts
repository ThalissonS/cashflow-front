import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Finance } from '../../services/finance';
import { ResumoMensalDTO } from '../../models/api.models';

interface BarItem  { label: string; valor: number; pct: number; color: string; }
interface DonutSlice { label: string; pct: number; dashArray: string; rotate: number; color: string; }
interface Insight   { type: 'ok' | 'warn' | 'danger' | 'info'; text: string; }

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

  readonly ano     = signal(new Date().getFullYear());
  readonly mes     = signal(new Date().getMonth() + 1);
  readonly resumo  = signal<ResumoMensalDTO | null>(null);
  readonly loading = signal(false);
  readonly erro    = signal<string | null>(null);

  readonly meses = [
    { value: 1,  label: 'Janeiro'   }, { value: 2,  label: 'Fevereiro' },
    { value: 3,  label: 'Março'     }, { value: 4,  label: 'Abril'     },
    { value: 5,  label: 'Maio'      }, { value: 6,  label: 'Junho'     },
    { value: 7,  label: 'Julho'     }, { value: 8,  label: 'Agosto'    },
    { value: 9,  label: 'Setembro'  }, { value: 10, label: 'Outubro'   },
    { value: 11, label: 'Novembro'  }, { value: 12, label: 'Dezembro'  },
  ];

  readonly anos = computed(() => {
    const a = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => a - 2 + i);
  });

  // ── Chart: breakdown bars ──────────────────────────────────────────────────
  readonly breakdownBars = computed((): BarItem[] => {
    const r = this.resumo();
    if (!r || r.totalReceitas <= 0) return [];
    const rec = r.totalReceitas;
    const items: BarItem[] = [
      { label: 'Gastos Fixos',     valor: r.totalGastosFixos,      pct: r.totalGastosFixos      / rec * 100, color: '#e05252' },
      { label: 'Gastos Variáveis', valor: r.totalGastosVariaveis,  pct: r.totalGastosVariaveis  / rec * 100, color: '#e0a033' },
      { label: 'Investimentos',    valor: r.totalInvestidoNoMes,   pct: r.totalInvestidoNoMes   / rec * 100, color: '#4a9eff' },
    ];
    if (r.saldo > 0) {
      items.push({ label: 'Saldo livre', valor: r.saldo, pct: r.saldo / rec * 100, color: '#4f8e3e' });
    }
    return items.filter(b => b.valor > 0);
  });

  // ── Chart: SVG donut slices ────────────────────────────────────────────────
  readonly donutSlices = computed((): DonutSlice[] => {
    const bars = this.breakdownBars();
    if (!bars.length) return [];
    const circ = 2 * Math.PI * 46;
    let cum = 0;
    return bars.map(b => {
      const pct  = Math.min(b.pct, 100);
      const dash = (pct / 100) * circ;
      const rot  = cum;
      cum += pct;
      return {
        label:     b.label,
        pct,
        dashArray: `${dash} ${circ - dash}`,
        rotate:    -90 + rot * 3.6,
        color:     b.color,
      };
    });
  });

  // ── Insights narrativos ───────────────────────────────────────────────────
  readonly insights = computed((): Insight[] => {
    const r = this.resumo();
    if (!r || r.totalReceitas <= 0) return [];
    const list: Insight[] = [];
    const gastosRatio   = (r.totalGastos         / r.totalReceitas) * 100;
    const investRatio   = (r.totalInvestidoNoMes / r.totalReceitas) * 100;
    const poupancaRatio = (r.saldo               / r.totalReceitas) * 100;

    // Saldo geral
    if (r.saldo < 0) {
      list.push({ type: 'danger', text: `Você gastou ${this.formatar(Math.abs(r.saldo))} além do que ganhou este mês.` });
    } else if (poupancaRatio >= 20) {
      list.push({ type: 'ok',   text: `Parabéns! Você guardou ${poupancaRatio.toFixed(0)}% da renda — acima dos 20% recomendados.` });
    } else if (poupancaRatio > 0) {
      list.push({ type: 'info', text: `Você guardou ${poupancaRatio.toFixed(0)}% da renda. Tente chegar em 20% para uma reserva sólida.` });
    }

    // Gastos totais
    if (gastosRatio > 80) {
      list.push({ type: 'warn',  text: `${gastosRatio.toFixed(0)}% da renda foi para gastos — muito acima do ideal de 80%.` });
    } else if (gastosRatio > 0) {
      list.push({ type: 'info',  text: `${gastosRatio.toFixed(0)}% da renda comprometida com gastos este mês.` });
    }

    // Investimentos
    if (investRatio >= 10) {
      list.push({ type: 'ok',   text: `Você investiu ${investRatio.toFixed(0)}% da renda — alinhado com a regra dos 10%.` });
    } else if (r.totalInvestidoNoMes > 0) {
      list.push({ type: 'info', text: `Você investiu ${investRatio.toFixed(0)}% da renda. O ideal é ao menos 10%.` });
    } else {
      list.push({ type: 'warn', text: `Nenhum investimento registrado este mês. Considere investir ao menos 10% da renda.` });
    }

    return list;
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  ngOnInit() { this.carregar(); }

  carregar() {
    this.loading.set(true);
    this.erro.set(null);
    this.finance.getResumoMensal(this.ano(), this.mes()).subscribe({
      next:  r  => { this.resumo.set(r);             this.loading.set(false); },
      error: () => { this.erro.set('Erro ao carregar resumo.'); this.loading.set(false); },
    });
  }

  formatar(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatarPct(valor: number): string { return `${valor.toFixed(2)}%`; }

  nomeMes(): string { return this.meses.find(m => m.value === this.mes())?.label ?? ''; }

  setMes(value: string) { this.mes.set(+value); this.carregar(); }
  setAno(value: string) { this.ano.set(+value); this.carregar(); }
}
