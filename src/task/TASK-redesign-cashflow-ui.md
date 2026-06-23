# TASK: Redesign completo da UI do CashFlow Pro

## Contexto
Aplicação Angular standalone que gerencia despesas financeiras pessoais.
A UI atual usa apenas `style=""` inline sem nenhum design system — precisa ser completamente redesenhada com visual de banco digital moderno.

## Paleta de cores (extraída do portfólio do desenvolvedor)
```
--color-bg-primary:    #232323   /* fundo principal / dark base */
--color-bg-elevated:   #2b2b2b   /* cards, modais, painéis elevados */
--color-border:        #3a3a3a   /* bordas sutis */
--color-accent:        #4f8e3e   /* verde — ação principal, sucesso, destaque */
--color-accent-hover:  #3d7030   /* verde escuro para hover */
--color-text-primary:  #ffffff   /* texto principal */
--color-text-secondary:#a0a0a0   /* texto secundário, placeholders */
--color-danger:        #e05252   /* erros, alertas negativos */
--color-warning:       #e0a033   /* avisos */
font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif
```

## Referência visual
Visual de **banco digital / fintech** (estilo Nubank, Inter, C6 Bank):
- Dark mode com fundos escuros
- Cards com bordas sutis e leve elevação (box-shadow)
- Sidebar de navegação fixa à esquerda
- Tipografia limpa e hierárquica
- Números/valores financeiros em destaque
- Formulários minimalistas com labels flutuantes ou bem posicionadas
- Feedback visual claro (loading, sucesso, erro)
- Ícones simples (pode usar unicode ou SVG inline simples)

---

## Arquivos a modificar

### 1. `src/index.html`
Adicionar Google Fonts (Inter como fallback moderno):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```
Mudar `<title>` para `CashFlow Pro`

---

### 2. `src/styles.css`
Substituir completamente pelo seguinte:

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --color-bg-primary:     #232323;
  --color-bg-elevated:    #2b2b2b;
  --color-bg-card:        #2f2f2f;
  --color-border:         #3a3a3a;
  --color-accent:         #4f8e3e;
  --color-accent-hover:   #3d7030;
  --color-accent-light:   rgba(79, 142, 62, 0.15);
  --color-text-primary:   #ffffff;
  --color-text-secondary: #a0a0a0;
  --color-danger:         #e05252;
  --color-danger-light:   rgba(224, 82, 82, 0.12);
  --color-warning:        #e0a033;
  --color-success:        #4f8e3e;
  --color-success-light:  rgba(79, 142, 62, 0.12);
  --radius-sm:  6px;
  --radius-md:  10px;
  --radius-lg:  16px;
  --shadow-card: 0 2px 12px rgba(0, 0, 0, 0.4);
  --transition: 0.2s ease;
}

html, body {
  height: 100%;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* Scrollbar customizada */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--color-bg-primary); }
::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }

/* Inputs globais */
input, select, textarea {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 0.9rem;
  padding: 10px 14px;
  width: 100%;
  transition: border-color var(--transition);
  outline: none;
}

input::placeholder, textarea::placeholder {
  color: var(--color-text-secondary);
}

input:focus, select:focus, textarea:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-light);
}

/* Opções do select com fundo escuro */
select option {
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
}

button {
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition);
}

button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
```

---

### 3. `src/app/app.html`
Substituir completamente. Criar layout com sidebar + área principal:

```html
<div class="app-shell">

  <!-- SIDEBAR -->
  <aside class="sidebar">
    <div class="sidebar__logo">
      <span class="sidebar__logo-icon">₿</span>
      <span class="sidebar__logo-text">CashFlow <strong>Pro</strong></span>
    </div>

    <nav class="sidebar__nav">
      <a class="sidebar__nav-item sidebar__nav-item--active" href="#">
        <span class="nav-icon">⊞</span>
        Dashboard
      </a>
      <a class="sidebar__nav-item" href="#">
        <span class="nav-icon">↓</span>
        Despesas
      </a>
      <a class="sidebar__nav-item" href="#">
        <span class="nav-icon">⊕</span>
        Categorias
      </a>
    </nav>

    <div class="sidebar__footer">
      <span class="sidebar__footer-text">v1.0.0</span>
    </div>
  </aside>

  <!-- CONTEÚDO PRINCIPAL -->
  <main class="main-content">

    <!-- HEADER -->
    <header class="page-header">
      <div>
        <h1 class="page-header__title">Dashboard</h1>
        <p class="page-header__subtitle">Bem-vindo de volta 👋</p>
      </div>
    </header>

    <!-- CARD DE TOTAL -->
    <section class="summary-section">
      <div class="summary-card">
        <div class="summary-card__label">Total em Despesas</div>
        <div class="summary-card__value">
          R$ <span class="value-number">{{ totalDespesas }}</span>
        </div>
        <div class="summary-card__hint">acumulado no período</div>
      </div>
    </section>

    <!-- FORMULÁRIOS LADO A LADO -->
    <section class="forms-section">
      <app-nova-categoria></app-nova-categoria>
      <app-nova-despesa></app-nova-despesa>
    </section>

  </main>
</div>
```

---

### 4. `src/app/app.css`
Substituir completamente:

```css
/* ── SHELL / LAYOUT ── */
.app-shell {
  display: flex;
  min-height: 100vh;
}

/* ── SIDEBAR ── */
.sidebar {
  width: 240px;
  min-width: 240px;
  background: var(--color-bg-elevated);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 100;
}

.sidebar__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px 28px;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 16px;
}

.sidebar__logo-icon {
  font-size: 1.6rem;
  color: var(--color-accent);
}

.sidebar__logo-text {
  font-size: 1.1rem;
  color: var(--color-text-primary);
  letter-spacing: 0.3px;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 12px;
  flex: 1;
}

.sidebar__nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all var(--transition);
}

.sidebar__nav-item:hover {
  background: var(--color-accent-light);
  color: var(--color-text-primary);
}

.sidebar__nav-item--active {
  background: var(--color-accent-light);
  color: var(--color-accent);
}

.nav-icon {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.sidebar__footer {
  padding: 16px 24px 0;
  border-top: 1px solid var(--color-border);
}

.sidebar__footer-text {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

/* ── CONTEÚDO PRINCIPAL ── */
.main-content {
  margin-left: 240px;
  flex: 1;
  padding: 32px 40px;
  max-width: 100%;
  background: var(--color-bg-primary);
  min-height: 100vh;
}

/* ── HEADER ── */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.page-header__title {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.3px;
}

.page-header__subtitle {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

/* ── CARD DE TOTAL ── */
.summary-section {
  margin-bottom: 32px;
}

.summary-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-accent);
  border-radius: var(--radius-md);
  padding: 24px 28px;
  max-width: 360px;
  box-shadow: var(--shadow-card);
}

.summary-card__label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--color-text-secondary);
  margin-bottom: 10px;
}

.summary-card__value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1;
}

.value-number {
  color: var(--color-accent);
}

.summary-card__hint {
  font-size: 0.78rem;
  color: var(--color-text-secondary);
  margin-top: 8px;
}

/* ── SEÇÃO DE FORMULÁRIOS ── */
.forms-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 900px) {
  .sidebar { display: none; }
  .main-content { margin-left: 0; padding: 20px; }
  .forms-section { grid-template-columns: 1fr; }
}
```

---

### 5. `src/app/components/nova-categoria/nova-categoria.html`
Substituir completamente:

```html
<div class="form-card">
  <div class="form-card__header">
    <div class="form-card__icon">⊕</div>
    <div>
      <h3 class="form-card__title">Nova Categoria</h3>
      <p class="form-card__subtitle">Organize suas despesas por tipo</p>
    </div>
  </div>

  <form [formGroup]="formCategoria" (ngSubmit)="enviarParaNuvem()" class="form-body">

    <div class="field-group">
      <label class="field-label">Nome da categoria</label>
      <input
        type="text"
        formControlName="nome"
        placeholder="Ex: Alimentação, Transporte..."
      >
    </div>

    <div class="field-group">
      <label class="field-label">Descrição <span class="field-optional">(opcional)</span></label>
      <input
        type="text"
        formControlName="descricao"
        placeholder="Ex: Gastos com refeições e mercado"
      >
    </div>

    <button type="submit" [disabled]="formCategoria.invalid" class="btn btn--primary btn--full">
      Salvar Categoria
    </button>

  </form>

  @if (mensagem) {
    <div class="form-feedback" [class.form-feedback--success]="mensagem.startsWith('✅')" [class.form-feedback--error]="mensagem.startsWith('❌')">
      {{ mensagem }}
    </div>
  }
</div>
```

---

### 6. `src/app/components/nova-categoria/nova-categoria.css`
Substituir completamente:

```css
/* Estilos compartilhados de card/form — usados por ambos os componentes */
.form-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 28px;
  box-shadow: var(--shadow-card);
}

.form-card__header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--color-border);
}

.form-card__icon {
  width: 42px;
  height: 42px;
  background: var(--color-accent-light);
  color: var(--color-accent);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.form-card__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.form-card__subtitle {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  letter-spacing: 0.2px;
}

.field-optional {
  font-weight: 400;
  font-size: 0.78rem;
  color: var(--color-text-secondary);
  opacity: 0.7;
}

/* Botões */
.btn {
  padding: 11px 20px;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  transition: all var(--transition);
}

.btn--primary {
  background: var(--color-accent);
  color: #fff;
}

.btn--primary:hover:not(:disabled) {
  background: var(--color-accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 142, 62, 0.35);
}

.btn--full {
  width: 100%;
  margin-top: 4px;
}

/* Feedback */
.form-feedback {
  margin-top: 14px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 500;
}

.form-feedback--success {
  background: var(--color-success-light);
  color: var(--color-success);
  border: 1px solid rgba(79, 142, 62, 0.25);
}

.form-feedback--error {
  background: var(--color-danger-light);
  color: var(--color-danger);
  border: 1px solid rgba(224, 82, 82, 0.25);
}
```

---

### 7. `src/app/components/nova-despesa/nova-despesa.html`
Substituir completamente:

```html
<div class="form-card">
  <div class="form-card__header">
    <div class="form-card__icon form-card__icon--blue">↓</div>
    <div>
      <h3 class="form-card__title">Nova Despesa</h3>
      <p class="form-card__subtitle">Registre um gasto ou conta a pagar</p>
    </div>
  </div>

  <form [formGroup]="formDespesa" (ngSubmit)="enviarParaNuvem()" class="form-body">

    <div class="field-group">
      <label class="field-label">Descrição</label>
      <input
        type="text"
        formControlName="descricao"
        placeholder="Ex: Conta de Luz"
      >
    </div>

    <div class="form-row">
      <div class="field-group">
        <label class="field-label">Valor (R$)</label>
        <input
          type="number"
          formControlName="valor"
          placeholder="0,00"
          step="0.01"
          min="0"
        >
      </div>

      <div class="field-group">
        <label class="field-label">Vencimento</label>
        <input
          type="date"
          formControlName="dataVencimento"
        >
      </div>
    </div>

    <div formGroupName="categoria" class="field-group">
      <label class="field-label">Categoria</label>
      <select formControlName="id">
        <option value="" disabled selected>Selecione uma categoria...</option>
        @for (cat of categorias; track cat.id) {
          <option [value]="cat.id">{{ cat.nome }}</option>
        }
      </select>
    </div>

    <button type="submit" [disabled]="formDespesa.invalid" class="btn btn--primary btn--full">
      Salvar Despesa
    </button>

  </form>

  @if (mensagem) {
    <div class="form-feedback" [class.form-feedback--success]="mensagem.startsWith('✅')" [class.form-feedback--error]="mensagem.startsWith('❌')">
      {{ mensagem }}
    </div>
  }
</div>
```

---

### 8. `src/app/components/nova-despesa/nova-despesa.css`
Substituir completamente:

```css
/* Herda os estilos base do nova-categoria.css via variáveis globais */
/* Estilos específicos deste componente */

.form-card__icon--blue {
  background: rgba(59, 130, 246, 0.12);
  color: #4a9eff;
}

/* Grid de 2 colunas para valor + data */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* Necessário redeclarar aqui pois Angular encapsula CSS por componente */
.form-card {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 28px;
  box-shadow: var(--shadow-card);
}

.form-card__header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--color-border);
}

.form-card__icon {
  width: 42px;
  height: 42px;
  background: var(--color-accent-light);
  color: var(--color-accent);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
}

.form-card__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.form-card__subtitle {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  letter-spacing: 0.2px;
}

.btn {
  padding: 11px 20px;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  transition: all var(--transition);
  cursor: pointer;
}

.btn--primary {
  background: var(--color-accent);
  color: #fff;
}

.btn--primary:hover:not(:disabled) {
  background: var(--color-accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 142, 62, 0.35);
}

.btn--primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn--full {
  width: 100%;
  margin-top: 4px;
}

.form-feedback {
  margin-top: 14px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 500;
}

.form-feedback--success {
  background: var(--color-success-light);
  color: var(--color-success);
  border: 1px solid rgba(79, 142, 62, 0.25);
}

.form-feedback--error {
  background: var(--color-danger-light);
  color: var(--color-danger);
  border: 1px solid rgba(224, 82, 82, 0.25);
}
```

---

## Checklist de validação (o agente deve verificar após aplicar)

- [ ] `ng serve` roda sem erros de compilação
- [ ] Sidebar aparece fixada à esquerda
- [ ] Card de total exibe o valor com cor accent verde
- [ ] Formulários aparecem lado a lado em telas > 900px
- [ ] Inputs ficam com borda verde ao receber foco
- [ ] Botões desabilitados ficam com opacity reduzida
- [ ] Mensagem de sucesso aparece com fundo verde translúcido
- [ ] Mensagem de erro aparece com fundo vermelho translúcido
- [ ] Em mobile (< 900px) sidebar some e forms empilham verticalmente

---

## Observações importantes

1. **ViewEncapsulation**: Os componentes Angular usam encapsulamento de CSS por padrão. Por isso os estilos de `.form-card`, `.btn`, etc. foram **duplicados** nos dois componentes (`nova-categoria.css` e `nova-despesa.css`). Isso é intencional — não remover.

2. **Variáveis CSS**: As variáveis `--color-*`, `--radius-*` etc. são definidas em `styles.css` no `:root` e funcionam globalmente mesmo com encapsulamento.

3. **Sem dependências novas**: Esta task não adiciona nenhuma biblioteca. Usa apenas CSS puro + variáveis globais.

4. **Imports Angular**: Não alterar nenhum arquivo `.ts` — a lógica permanece igual, apenas HTML e CSS mudam.
