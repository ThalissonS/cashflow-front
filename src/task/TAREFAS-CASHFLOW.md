# Cash-Flow — Tarefas para concluir o projeto

> Documento gerado a partir da comparação dos ZIPs enviados (front e back, versões
> antigas e novas) contra o que o `GUIA-PARA-IA.md` promete. Use este arquivo como
> backlog de execução. Leia também, nesta ordem: `GUIA-PARA-IA.md` → README do back →
> README do front → `BACKEND-FASES-0-3.md` → `SIMULADOR-INVESTIMENTOS.md`.

---

## 0. Versões a usar como base (IMPORTANTE)

Foram enviados 4 zips. Use SEMPRE as versões mais novas e descarte as antigas:

- **Backend:** usar `cashflow-back-com-simulador` (tem Lançamentos, Metas, Resumo,
  Simulador de investimentos). **Descartar** `cashflow-back-main__1_` (versão fase 1,
  só tinha Despesa/Categoria/Usuário).
- **Frontend:** as duas versões de front são praticamente idênticas e ambas estão
  cruas (só "total de despesas" + 2 formulários). Use `cashflow-front` como base.
  O `GUIA-PARA-IA.md` só existe na versão `-main__1`; **copie esse guia para a base**
  antes de começar, pois ele é o contrato do projeto.

---

## 1. Diagnóstico — estado real vs. prometido

### Backend (`cashflow-back-com-simulador`)
**Já existe e funciona (provavelmente — não foi compilado no ambiente de origem):**
- CRUD de Categorias (`/categorias`).
- Lançamentos (`/lancamentos`, `/lancamentos/mes/{ano}/{mes}`, delete).
- Metas (`/metas`, `/metas/{id}/projecao`, delete).
- Resumo mensal (`/resumo/{ano}/{mes}`) com CDI real do Banco Central.
- Simulador (`/investimentos/tipos`, `/ofertas`, `/simular`) com CDB/LCI/LCA/Poupança e IR regressivo.
- Despesa legada (`/despesas`) — mantida só para não quebrar o front atual.

**FALTA (o GUIA promete, mas NÃO existe no código):**
- ❌ **Spring Security** — não há nenhuma config de segurança. Todos os endpoints estão abertos.
- ❌ **JWT** — sem geração/validação de token, sem `Authorization: Bearer`.
- ❌ **BCrypt** — `Usuario.senha` é salva em **texto plano** (`UserController.criar` faz `save` direto).
- ❌ **Endpoint de login/registro** — só existe `GET/POST /usuarios` cru, sem autenticação.
- ❌ **Status de aprovação** (`PENDENTE`/`APROVADO`) e `AdminInicializador` — não existem.
- ❌ **`UserDetails` / `isEnabled()`** no `Usuario` — não implementado.
- ❌ **Isolamento de dados por usuário** — `LancamentoRepository` e `MetaRepository`
  **não filtram por `usuarioId`**. O campo `usuario` em `Lancamento` existe mas está
  marcado como opcional e nunca é preenchido a partir do token.

### Frontend (`cashflow-front`)
**Já existe:**
- `Finance` service só com: `getTotalDespesas`, `salvarCategoria`, `getCategorias`, `salvarDespesa`.
- Componentes `nova-categoria` e `nova-despesa`.
- `app.html` cru (um botão "Buscar Total na Nuvem" + os 2 formulários).

**FALTA praticamente tudo o que o GUIA descreve:**
- ❌ `app.routes.ts` está **VAZIO** (`export const routes: Routes = []`). Nenhuma rota.
- ❌ Sem `models/api.models.ts` (tipos espelhando os DTOs).
- ❌ Sem auth: nada de `auth.interceptor.ts`, `guards/`, tela de login/registro, `localStorage` de token.
- ❌ Sem tela de **Painel mensal** (consumir `/resumo/{ano}/{mes}`).
- ❌ Sem tela de **Lançamentos** (consumir `/lancamentos`).
- ❌ Sem tela de **Metas** (consumir `/metas` + projeção).
- ❌ Sem tela de **Simulador de investimentos**.
- ❌ Sem **design tokens** reais em `styles.css` (cores/fontes/espaçamentos como variáveis CSS).
- ❌ Sem **PWA** (manifest + service worker / `@angular/pwa`).
- ❌ O front ainda aponta para `/despesas` (legado) em vez de `/lancamentos`.

---

## 2. Tarefas — BACKEND

### B1. Segurança e autenticação (JWT + BCrypt) — PRIORIDADE ALTA
- [ ] Adicionar dependências no `pom.xml`: `spring-boot-starter-security` e uma lib JWT (ex.: `io.jsonwebtoken:jjwt`).
- [ ] Fazer `Usuario` implementar `UserDetails`; mapear `isEnabled()` para `status == APROVADO`.
- [ ] Criar enum `StatusUsuario` (`PENDENTE`, `APROVADO`) e enum/campo de papel (`ROLE_USER`, `ROLE_ADMIN`).
- [ ] Hashear senha com `BCryptPasswordEncoder` no registro. **Nunca** salvar/retornar senha em texto plano.
- [ ] Criar `SecurityConfig` (stateless, filtro JWT, regras de rota). Mover a configuração de **CORS para dentro do `SecurityConfig`** e remover/ajustar o `CorsConfig` atual (hoje libera `*`; em prod restringir à origem do front).
- [ ] Criar filtro JWT (`OncePerRequestFilter`) que lê `Authorization: Bearer`, valida e popula o `SecurityContext`.
- [ ] Endpoints de auth:
  - `POST /auth/registrar` — cria usuário `PENDENTE`, senha com BCrypt.
  - `POST /auth/login` — valida credenciais, retorna `{ token, nome, papel }`. Login deve falhar para `PENDENTE` (via `isEnabled`).
- [ ] `AdminInicializador` (`CommandLineRunner`): cria admin inicial a partir de variáveis de ambiente (`ADMIN_EMAIL`, `ADMIN_SENHA`) se não existir.
- [ ] Endpoints de admin: `GET /admin/usuarios` (lista, **sem expor senha**), `POST /admin/usuarios/{id}/aprovar`. Proteger com papel ADMIN; **nunca** permitir rejeitar/expor o admin.

### B2. Isolamento de dados por usuário — PRIORIDADE ALTA
- [ ] Tornar `Lancamento.usuario` e `Meta` (dono) **obrigatórios**, preenchidos a partir do **usuário do token**, nunca do corpo da requisição.
- [ ] `LancamentoRepository` e `MetaRepository`: adicionar `usuarioId` em **todas** as queries/somatórios (incluindo `somarPorTipoNoPeriodo`, `totalAcumuladoPorTipo`, etc.).
- [ ] `ResumoMensalService` e `MetaService` devem receber o `usuarioId` do contexto de segurança e repassar ao repositório.
- [ ] Decisão a manter: **Categorias permanecem globais** (conforme GUIA). Documentar isso.

### B3. Limpeza e robustez
- [ ] Trocar `@Autowired` em campo por **injeção via construtor** (o `UserController` ainda usa `@Autowired` em campo — contraria o GUIA).
- [ ] Rodar `./mvnw clean compile` e `./mvnw test` — **o backend nunca foi compilado na origem**. Corrigir o que não compilar.
- [ ] Confirmar `application-prod.properties` (Postgres por env vars) e que o perfil `prod` sobe na Render.
- [ ] (Opcional, recomendado no roadmap) Migrar `ddl-auto=update` → **Flyway** para versionar o schema.
- [ ] (Opcional) Remover entidade/endpoints `Despesa` legados **só depois** que o front migrar para `/lancamentos`.

---

## 3. Tarefas — FRONTEND

### F0. Fundação
- [ ] Copiar `GUIA-PARA-IA.md` para a raiz do front (só existe na versão antiga).
- [ ] Criar `src/app/models/api.models.ts` espelhando os DTOs do back (ver seção 4 — contratos).
- [ ] Definir `apiUrl` por ambiente (`environment.ts` / `environment.prod.ts`) em vez de hardcode no service.
- [ ] Preencher `app.routes.ts` com **rotas lazy** (`loadComponent`, `export default`), com guard de auth.

### F1. Autenticação
- [ ] Tela de **Login** e **Registro** (Reactive Forms).
- [ ] `auth.service.ts`: login/registro/logout; guardar token no `localStorage`; expor `isLoggedIn`/papel via signals.
- [ ] `auth.interceptor.ts`: injeta `Authorization: Bearer` automaticamente; tratar 401 (redirect p/ login) e 403 (conta pendente).
- [ ] `guards/auth.guard.ts` (e `admin.guard.ts`) protegendo as rotas internas.
- [ ] Tela de **Admin** (aprovação de usuários) visível só para ADMIN; **nunca** exibir senha.

### F2. Telas principais (consumindo o back que já existe)
- [ ] **Painel mensal** — consome `GET /resumo/{ano}/{mes}`; mostra receitas, gastos fixos/variáveis, saldo, patrimônio investido, CDI e rendimento estimado. Seletor de ano/mês.
- [ ] **Lançamentos** — listar (`GET /lancamentos/mes/{ano}/{mes}`), criar (`POST /lancamentos`), excluir (`DELETE /lancamentos/{id}`). Formulário com os 4 tipos (RECEITA, GASTO_FIXO, GASTO_VARIAVEL, INVESTIMENTO) + categoria opcional.
- [ ] **Metas** — listar/criar/excluir (`/metas`) e mostrar projeção (`GET /metas/{id}/projecao`: quanto falta e em quantos meses).
- [ ] **Simulador** — fluxo tipo → banco → resultado: `GET /investimentos/tipos`, `GET /investimentos/ofertas?tipo=`, `POST /investimentos/simular`. Exibir resultado bruto/líquido e IR.
- [ ] Migrar o uso de `/despesas` (legado) para `/lancamentos` e remover a tela crua de "Buscar Total na Nuvem".

### F3. Convenções (obrigatórias pelo GUIA — não quebrar)
- [ ] Standalone components + `inject()`, **sem NgModules**.
- [ ] **Signals** (`signal`/`computed`) para estado de tela; evitar `BehaviorSubject` para estado local.
- [ ] **Control flow novo** (`@if`/`@for`/`@else`), não `*ngIf`/`*ngFor`.
- [ ] `strict` + `strictTemplates` ligados — **nada de `any`** (os tipos vêm de `api.models.ts`).
- [ ] **Design tokens** em `src/styles.css` (cores/fontes/espaçamentos como variáveis CSS) — não chumbar cores.

### F4. PWA + Deploy
- [ ] Adicionar PWA (`ng add @angular/pwa`): manifest, ícones, service worker (uso no celular / ícone na tela inicial).
- [ ] Configurar deploy do front (Vercel ou Netlify) e apontar `apiUrl` de produção para a Render.

---

## 4. Contratos de API (para `api.models.ts` e os serviços)

> Espelhar EXATAMENTE estes nomes de campo. Mudou no back → mude no front no mesmo passo.

**ResumoMensalDTO** (`GET /resumo/{ano}/{mes}`)
```
ano:int, mes:int, totalReceitas, totalGastosFixos, totalGastosVariaveis,
totalInvestidoNoMes, totalGastos, saldo, patrimonioInvestido,
cdiAnual, rendimentoEstimadoMes   (todos BigDecimal -> number)
```

**LancamentoRequest** (`POST /lancamentos`)
```
descricao:string (obrig), valor:number (>0), tipo: RECEITA|GASTO_FIXO|GASTO_VARIAVEL|INVESTIMENTO,
ano:int (>=2000), mes:int (1-12), categoriaId?:number
```
Outras rotas: `GET /lancamentos`, `GET /lancamentos/mes/{ano}/{mes}`, `DELETE /lancamentos/{id}`.

**MetaRequest** (`POST /metas`)
```
nome:string (obrig), valorAlvo:number (>0), aporteMensal:number (>=0), valorInicial?:number
```
Outras rotas: `GET /metas`, `GET /metas/{id}/projecao`, `DELETE /metas/{id}`.

**SimulacaoRequest** (`POST /investimentos/simular`)
```
tipo: CDB|LCI|LCA|POUPANCA, valorInicial:number (>=0), aporteMensal?:number (>=0),
prazoMeses:int (>=1), percentualCdi?:number (>0), bancoId?:string
```
Outras rotas: `GET /investimentos/tipos`, `GET /investimentos/ofertas?tipo={tipo}`.

**Categoria** (`/categorias`): `{ id, nome, descricao }` — global, GET e POST.

**Auth** (a CRIAR no back): `POST /auth/registrar`, `POST /auth/login` → `{ token, nome, papel }`.

---

## 5. Ordem de execução sugerida

1. **B1 + B2** (segurança e isolamento no back) — é o maior buraco e bloqueia o resto.
2. **B3** (compilar, testar, limpar).
3. **F0 + F1** (fundação do front + auth ligada ao back novo).
4. **F2** (telas: painel → lançamentos → metas → simulador).
5. **F3** (garantir convenções/lint/strict).
6. **F4** (PWA + deploy de front e back).

## 6. Pontos de atenção (do GUIA — não esquecer)
- Conversão de taxa anual→mensal é por **juros compostos** `(1+i)^(1/12)-1`, nunca dividir por 12.
- `usuarioId` sempre vem do **token**, nunca do corpo da requisição.
- Área de admin **nunca** expõe senha e **nunca** rejeita o admin.
- IR do simulador usa aproximação `meses × 30` dias (consciente; difere em centavos em fronteiras como 24 meses).
- Mudanças sensíveis de segurança / efeitos colaterais exigem confirmação do dono.
