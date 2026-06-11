# Cash-Flow — Frontend (Angular 21)

Interface web do app de financas pessoais Cash-Flow. Consome a API Spring Boot
e cobre: login/cadastro com controle de acesso, painel do mes, lancamentos,
metas, simulador de investimentos e area de administracao.

---

## Stack

- **Angular 21** (standalone components, sem NgModules)
- **Signals** (`signal`, `computed`) para estado reativo
- **Reactive Forms** nos formularios
- **Novo control flow** nos templates: `@if`, `@for`, `@else`
- Router com **lazy loading** + **guards** (auth e admin)
- **HttpClient** com `withFetch()` e um **interceptor** que injeta o JWT
- TypeScript **strict** + **strictTemplates** (tudo tipado, sem `any`)

---

## Como rodar

Pre-requisito: Node.js 20+.

```bash
npm install
npm start         # http://localhost:4200
npm run build     # gera dist/cashflow-front (producao)
```

O app aponta para o backend de producao por padrao. Para usar um backend local,
edite o `baseUrl` em `src/app/services/cashflow-api.ts` e em
`src/app/services/auth.service.ts` (troque por `http://localhost:8080`).

> O backend gratuito na Render "hiberna" sem uso: a 1a chamada do dia pode
> levar ~30-50s. As telas mostram aviso e botao "tentar de novo".

---

## Estrutura

```
src/app/
├─ app.ts / app.html / app.css     # moldura: cabecalho, nav, area de pagina
├─ app.config.ts                   # providers (router, http, interceptor)
├─ app.routes.ts                   # rotas (lazy) + guards
├─ models/api.models.ts            # interfaces que espelham os DTOs do backend
├─ services/
│  ├─ cashflow-api.ts              # ponte com a API (todos os endpoints)
│  ├─ auth.service.ts              # login/cadastro/logout, token, ehAdmin
│  ├─ auth.interceptor.ts          # injeta o token; trata 401
│  └─ toast.service.ts             # avisos flutuantes
├─ guards/
│  ├─ auth.guard.ts                # exige login
│  └─ admin.guard.ts               # exige ROLE_ADMIN
├─ utils/format.ts                 # R$, %, datas, cores por tipo
└─ pages/
   ├─ login/        cadastro/      # autenticacao (publicas)
   ├─ dashboard/                   # painel do mes (+ regua de alocacao)
   ├─ lancamentos/                 # diario do dinheiro
   ├─ metas/                       # objetivos + projecao
   ├─ simulador/                   # simulador de investimentos
   └─ admin/                       # controle de acesso (so admin)
```

---

## Como a autenticacao funciona no front

1. Login chama `POST /auth/login`; o token e os dados do usuario vao para o
   `localStorage`, e o estado vira reativo via signals (`AuthService`).
2. O **interceptor** anexa `Authorization: Bearer <token>` em toda requisicao
   (menos login/cadastro) e, se receber **401**, desloga e manda pro `/entrar`.
3. As rotas internas tem **`authGuard`**; a rota `/admin` tem **`adminGuard`**.
4. O cadastro nasce **pendente** no backend, entao a tela mostra "aguarde
   aprovacao" em vez de entrar.

---

## Identidade visual

Estetica de app financeiro ("wealth statement"): faixa de marca escura
(verde-petroleo quase preto) ancorando cada tela, numero "heroi" em destaque
(saldo/resultado), densidade alta com linhas divididas, cores semanticas por
tipo (receita verde, gasto fixo ambar, variavel coral, investido azul) e o
dourado reservado a juros/CDI. Tipografia: **Space Grotesk** (titulos/numeros,
com `tabular-nums`) + **Inter** (texto).

O grafico do painel ("para onde foi o dinheiro") e uma **regua de alocacao**:
a receita e a barra cheia e cada fatia mostra para onde ela foi, sobrando o
saldo.

---

## Notas

- Sem `localStorage` proibido em artifacts aqui — o app real roda no navegador,
  entao o uso de `localStorage` para o token e normal e intencional.
- Para publicar (Vercel/Netlify) e transformar em PWA (icone na tela inicial),
  ver o guia de deploy (pendente).
