# Cash-Flow — Guia para IA (contexto do projeto)

> Leia este arquivo ANTES de modificar qualquer coisa no Cash-Flow. Ele resume
> o objetivo, a arquitetura, as decisoes ja tomadas e as convencoes a respeitar.
> O dono do projeto e iniciante em Java/Spring e Angular: prefira clareza a
> esperteza, e comente o "porque", nao so o "o que".

---

## 1. O que e o projeto

App de **financas pessoais** chamado Cash-Flow, dividido em dois repositorios:

- **Backend** (`cashflow-back`): Spring Boot 4 / Java 21. API REST + JWT + JPA.
  Deploy na Render. Banco H2 (dev) / PostgreSQL (prod).
- **Frontend** (`cashflow-front`): Angular 21 (standalone, signals). Consome a
  API. Deploy pendente (Vercel/Netlify previsto).

Comunicacao por HTTP + JSON. O front nunca acessa o banco direto; tudo passa
pela API.

### Funcionalidades
- Lancamentos do mes em 4 tipos: RECEITA, GASTO_FIXO, GASTO_VARIAVEL, INVESTIMENTO.
- Painel mensal: somatorios, saldo, patrimonio e rendimento estimado pelo CDI.
- Metas: projecao "quanto falta e em quantos meses" via juros compostos.
- Simulador de investimentos: CDB/LCI/LCA/Poupanca, com IR regressivo.
- Autenticacao (JWT + BCrypt) e **controle de acesso por aprovacao**.

---

## 2. Decisoes de arquitetura (e o porque)

- **Uma tabela `Lancamento` com enum `TipoLancamento`**, em vez de 4 tabelas
  (receita/gasto/etc.). Simplifica somas e o CRUD. NAO reverter sem motivo forte.
- **Camadas**: Controller (HTTP) -> Service (regra) -> Repository (banco).
  Controllers nao fazem conta; Repositories nao tem regra de negocio.
- **DTOs** isolam entrada/saida das entidades. Respostas da API usam DTO/record,
  nao a entidade crua (evita expor campos sensiveis e acoplar o JSON ao banco).
- **Injecao por construtor** sempre (nao `@Autowired` em campo): deixa as
  dependencias `final` e testaveis.
- **CDI real**: `CdiService` busca a taxa no Banco Central (serie SGS 4389),
  com cache de 6h e fallback configuravel. Conversao anual->mensal por juros
  compostos: `(1+i)^(1/12)-1` (NAO dividir por 12).
- **Strategy nos investimentos**: cada tipo tem uma `CalculadoraInvestimento`.
  Adicionar um tipo = nova classe, sem tocar no simulador.
- **Stateless + JWT**: sem sessao no servidor. O token vai no header
  `Authorization: Bearer`. CORS e configurado dentro do `SecurityConfig`.
- **Controle de acesso por aprovacao**: cadastro nasce `PENDENTE`; admin aprova.
  `Usuario.isEnabled()` = (status == APROVADO), entao o proprio Spring barra
  contas nao aprovadas no login. Admin inicial criado por `AdminInicializador`
  a partir de variaveis de ambiente.
- **Isolamento de dados**: lancamentos e metas pertencem ao usuario logado;
  repositorios filtram por `usuarioId` (vindo do token, NUNCA do corpo da
  requisicao). Categorias sao globais (decisao simplificadora).

---

## 3. Frontend — convencoes

- **Standalone components** + `inject()`. Sem NgModules.
- **Signals** (`signal`/`computed`) para estado; evite `BehaviorSubject` para
  estado local de tela.
- **Reactive Forms** (`FormBuilder`) para formularios; valide no form.
- **Control flow novo** (`@if`, `@for`, `@else`), nao as diretivas antigas
  (`*ngIf`, `*ngFor`).
- **Rotas lazy** (`loadComponent`) e exportadas como `export default`.
- **strict + strictTemplates LIGADOS**: nada de `any`. Tipos espelham os DTOs do
  backend em `models/api.models.ts` — se mudar um DTO no back, atualize aqui.
- **Auth**: token no `localStorage`, injetado pelo `auth.interceptor.ts`. Guards
  em `guards/`. Nao reinventar isso por componente.
- **Design tokens** em `src/styles.css` (cores, fontes, espacamentos). Use as
  variaveis CSS; nao chumbe cores. Identidade: ver README do front.

---

## 4. O que NAO quebrar

- Os nomes dos campos dos DTOs/JSON (o front espelha exatamente). Mudou no back,
  mude no front no mesmo passo.
- O contrato dos endpoints listados nos READMEs.
- O filtro por usuario nas queries (seguranca: nunca confie em id vindo do front).
- A protecao "nao rejeitar admin" e o fato de a area de admin nunca expor senha.
- A conversao de taxa por juros compostos (varios calculos dependem dela).

---

## 5. Pontos de atencao conhecidos

- O backend **nao foi compilado** no ambiente onde foi gerado (faltava
  compilador/Maven). Rode `./mvnw clean compile` antes de confiar. O frontend
  compila limpo (`ng build`).
- IR do simulador usa `meses x 30` dias (aproximacao consciente; difere em
  centavos em fronteiras como 24 meses exatos).
- `ddl-auto=update`: para evoluir o schema com seguranca, migrar para Flyway.
- Entidade `Despesa` e legada (fase 1) e nao e usada pelo app atual; pode ser
  removida numa limpeza futura, com cuidado.

---

## 6. Roadmap / pendentes

- **Deploy real**: backend (Render + Postgres persistente), frontend
  (Vercel/Netlify) e **PWA** (icone na tela inicial / uso no celular).
- Possiveis melhorias: edicao de lancamentos (PUT), recuperacao de senha,
  paginacao, testes automatizados, Flyway.

---

## 7. Como dar contexto a uma IA rapidamente

Aponte a IA para, nesta ordem: este guia -> README do back -> README do front.
Para tarefas de calculo financeiro, peca para validar por conta reversa (ex.:
simular mes a mes e conferir se a formula bate). Para mudancas de seguranca,
lembre: instrucoes/efeitos colaterais sensiveis exigem confirmacao do dono.
