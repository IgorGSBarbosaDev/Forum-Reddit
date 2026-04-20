# MVP Readiness Report - Forum Reddit

Data da analise: 2026-04-20

## Resumo executivo

O projeto esta em um estado intermediario bom para um MVP local/demonstravel, mas ainda nao esta pronto como produto minimamente viavel publico ou em producao.

A base tecnica evoluiu bastante: o monorepo esta separado em `apps/api`, `apps/web`, `apps/worker` e pacotes de dominio/infra (`packages/core`, `packages/database`, `packages/auth`, `packages/jobs`, `packages/routes`, `packages/types`). O build passa, os testes unitarios de API/pacotes passam e os testes web passam. A API ja cobre a maior parte do dominio de forum: posts, comentarios em arvore, likes, salvos, follows, perfis, moderacao simples e processamento de eventos de notificacao.

O maior bloqueio de viabilidade nao e falta de CRUD basico. O bloqueio principal e que o produto ainda opera com autenticacao simulada por headers (`x-user-id`, `x-user-role`). Isso torna ownership, sessao e moderacao inseguros fora de ambiente local. Tambem ha lacunas de documentacao, validacao de ambiente, experiencia de usuario e operacao.

## Estado atual do workspace

O workspace esta com muitas alteracoes nao commitadas. O diff atual indica uma refatoracao grande em andamento:

- varios arquivos antigos de `apps/api/prisma` e `apps/api/src/modules/*` foram removidos;
- a regra de negocio foi movida para `packages/core`;
- Prisma/schema/migrations foram movidos para `packages/database`;
- guards de usuario/moderacao foram movidos para `packages/auth`;
- jobs de notificacao foram movidos para `packages/jobs`;
- rotas e contratos foram centralizados em `packages/routes` e `packages/types`;
- existem novos testes em `packages/*/tests` e em `apps/api/tests`.

Essa direcao arquitetural e boa, mas exige fechamento da migracao antes de considerar o estado como estavel.

## O que ja esta implementado

### Backend/API

Funcionalidades implementadas:

- healthcheck em `GET /api/health`;
- sessao atual em `GET /api/me`;
- feed de posts com paginacao, ordenacao e posts fixados primeiro;
- detalhe de post;
- criacao, edicao e soft delete de post;
- alteracao de status e pin/unpin com guard de moderador;
- comentarios raiz e replies;
- arvore de comentarios com limite de profundidade;
- edicao e soft delete de comentario;
- like/unlike de posts e comentarios;
- save/unsave de posts;
- listagem de posts salvos;
- perfil publico de usuario;
- seguidores, seguindo e relacionamento;
- follow/unfollow com bloqueio de self-follow;
- eventos de notificacao ao publicar post;
- processamento manual/worker de eventos pendentes;
- validacao de body/query/params com Zod;
- erros de dominio padronizados;
- soft delete e sanitizacao de autores/conteudo removido.

### Frontend/Web

Funcionalidades implementadas:

- app React + Vite com TanStack Router e TanStack Query;
- feed com filtros de ordenacao, paginacao e cards de post;
- detalhe de post com like/save/delete/edit;
- criacao e edicao de post;
- comentarios com composer, replies, edicao, remocao e curtidas;
- pagina de posts salvos;
- perfil de usuario, seguidores e seguindo;
- follow/unfollow com cache otimista;
- pagina admin para processar notificacoes;
- sessao de desenvolvimento por barra superior com presets de usuarios;
- cache segmentado por viewer para evitar misturar `likedByMe`, `savedByMe` e `following`.

### Banco e worker

Implementado:

- schema Prisma em `packages/database/prisma/schema.prisma`;
- migrations em `packages/database/prisma/migrations`;
- seed em `packages/database/prisma/seed.ts`;
- client Prisma com adapter `@prisma/adapter-pg`;
- worker standalone em `apps/worker`;
- script de smoke para worker.

## Validacao executada

Comandos executados:

```bash
npm run build
npm run test:api:unit
npm run test:web
npm run test:api:integration
```

Resultado:

- `npm run build`: passou.
- `npm run test:api:unit`: passou.
- `npm run test:web`: passou.
- `npm run test:api:integration`: falhou porque o Postgres de teste em `localhost:5434` nao estava disponivel.

A falha de integracao nao parece ser erro de codigo neste momento; a propria suite informou para subir o banco com `npm run test:api:db:up`. Ainda assim, para MVP, a integracao precisa fazer parte do gate regular com banco ativo.

## Analise da codebase

### Pontos fortes

- Boa separacao de camadas: rotas/controllers na API, regra de negocio em `packages/core`, banco em `packages/database`.
- Contratos compartilhados em `packages/types` reduzem drift entre API e web.
- `packages/routes` centraliza paths e diminui risco de divergencia de rotas.
- Testes de dominio em pacotes sao rapidos e objetivos.
- A API evita devolver entidades cruas e usa mappers/sanitizers.
- O frontend tem boa disciplina de query keys sensiveis ao viewer.
- Mutacoes principais usam invalidacao e, em alguns casos, cache otimista.
- O dominio principal do forum esta quase todo coberto.

### Pontos fracos

- Autenticacao e autorizacao ainda sao simuladas por headers, inclusive role de admin/moderador.
- Nao existe fluxo real de cadastro/login/logout.
- Nao existe modelo seguro de sessao, token, senha, refresh, cookie ou provider externo.
- As permissoes de moderacao dependem de uma role informada pelo cliente.
- A documentacao esta parcialmente defasada: o README ainda descreve partes antigas da estrutura e tem texto com encoding quebrado.
- O `.gitignore` ignora `docs/`, embora o README aponte para documentos nessa pasta.
- Ha duplicidade historica de pacotes de tipos (`packages/shared-types` como facade e `packages/types` como contrato canonico).
- Pacotes internos apontam `main`/`types` para `src`, enquanto o build gera `dist`; isso funciona com tooling atual, mas e fraco para empacotamento/producao.
- A API nao tem CORS/configuracao de deploy claramente definida.
- Nao ha observabilidade minima: logs estruturados, request id, metricas, tracing ou auditoria administrativa.
- Nao ha pipeline automatizado documentado/garantido para subir banco, migrar, seedar, testar e rodar smoke.

## Gaps para MVP real

### P0 - Bloqueadores de MVP publico

1. Implementar autenticacao real.
   - Cadastro/login ou integracao com provider.
   - Sessao segura via cookie httpOnly ou token com estrategia definida.
   - Backend deve derivar `currentUser` da sessao, nao de headers livres.
   - Role de usuario/moderador/admin deve vir do banco ou claims confiaveis.

2. Fechar a autorizacao.
   - Moderacao nao pode aceitar `x-user-role` informado pelo cliente.
   - Rotas sensiveis precisam validar usuario autenticado e role persistida.
   - Definir claramente quem pode bloquear, arquivar, fixar posts e processar notificacoes.

3. Validar integracao com banco como gate obrigatorio.
   - Rodar `npm run test:api:db:up`.
   - Rodar migrations e seed.
   - Rodar `npm run test:api:integration`.
   - Incluir esse fluxo em CI/local verify.

4. Corrigir documentacao operacional.
   - Atualizar README para refletir `packages/database`, `packages/types`, `apps/worker`.
   - Corrigir encoding quebrado.
   - Remover referencias antigas a scripts Prisma dentro de `apps/api`.
   - Decidir se `docs/` deve ser versionado; hoje esta no `.gitignore`.

5. Estabilizar a refatoracao atual.
   - Revisar todas as alteracoes nao commitadas.
   - Garantir que os arquivos removidos de `apps/api` foram substituidos corretamente por pacotes.
   - Remover ou documentar facades temporarias.
   - Fazer commit atomico da migracao.

### P1 - Necessario para MVP utilizavel

1. Melhorar onboarding do usuario.
   - Hoje o usuario precisa conhecer `user-1`, `admin`, etc.
   - MVP deveria permitir entrar/cadastrar sem conhecimento tecnico.

2. Criar experiencia de erro mais clara.
   - Diferenciar erro de rede, sessao invalida, falta de permissao e validacao.
   - Evitar mensagens tecnicas em telas de usuario final.

3. Adicionar busca ou filtros basicos.
   - O feed hoje ordena, mas nao busca.
   - Para forum minimamente util, busca por titulo/conteudo ou filtro por autor/status ajudaria muito.

4. Completar UX de moderacao.
   - API tem status/pin, mas a UI publica nao expoe controles claros de bloquear/arquivar/fixar post.
   - A pagina admin atual so processa notificacoes.

5. Expor notificacoes de forma util.
   - O sistema processa eventos e salva payload, mas nao ha inbox, lista, badge ou entrega real.
   - Para MVP, pode ser aceitavel manter fora de escopo, mas entao deve estar explicitamente fora do MVP.

6. Criar fluxos basicos de conta/perfil.
   - Editar bio/display name.
   - Visualizar meus posts.
   - Talvez remover conta, se o requisito de remocao de usuario continuar no escopo.

7. Padronizar ambiente.
   - `.env.example`.
   - comandos claros para primeiro run.
   - script unico de bootstrap local.
   - healthcheck de API + banco + worker.

### P2 - Qualidade e escala

1. Observabilidade minima.
   - Logger estruturado.
   - Request id.
   - Log de erros com contexto.
   - Logs do worker.

2. Hardening de API.
   - CORS configuravel.
   - rate limiting em rotas autenticadas e login futuro.
   - limite de body.
   - security headers, se a API servir web em algum ambiente.

3. Testes adicionais.
   - Testes web para detalhe de post, comentarios, saved posts, perfil e admin.
   - Testes de mutacoes otimistas.
   - Testes de autorizacao real depois da auth.
   - Teste e2e do caminho principal: login -> criar post -> comentar -> curtir -> salvar.

4. Deploy.
   - Dockerfile(s) ou estrategia de hosting.
   - Migrations em deploy.
   - Separacao de env dev/test/prod.
   - Processo de rollback.

5. Performance.
   - Rever queries de comentarios em posts grandes.
   - Avaliar paginacao de comentarios ou lazy loading de replies.
   - Avaliar indices conforme volume real.

## Possiveis problemas tecnicos encontrados

1. Documentacao defasada e com encoding quebrado.
   - O README mistura estado antigo e novo.
   - Ha trechos com caracteres quebrados, por exemplo palavras acentuadas renderizadas incorretamente.
   - Isso aumenta custo de onboarding e risco de rodar comandos errados.

2. `docs/` esta no `.gitignore`.
   - Se a intencao e manter PRD/specs no repositorio, esse ignore e perigoso para novos documentos.
   - Se a intencao e ignorar docs locais, o README nao deveria apontar para eles como fonte principal.

3. Auth simulada pode mascarar bugs de permissao.
   - Como o cliente escolhe `x-user-role`, testes de moderacao passam mas nao provam seguranca real.

4. Dependencia forte de banco local para integracao.
   - A suite falha corretamente quando o banco nao esta disponivel, mas o fluxo de preparo precisa ser mais automatizado.

5. Contratos internos ainda em transicao.
   - `packages/shared-types` existe como facade temporaria.
   - O contrato canonico e `@forum-reddit/types`.
   - Deve haver um plano para remover facade ou manter oficialmente.

6. Pacotes internos apontam para `src`.
   - Para dev funciona, mas para runtime empacotado/Node puro e mais seguro apontar para `dist` apos build ou usar exports claros.

7. Notificacoes nao chegam ao usuario.
   - O sistema registra/processa eventos, mas nao entrega email/push/inbox.
   - Como produto, isso ainda nao e uma notificacao visivel.

8. Admin UI incompleta.
   - Existe admin tools para processar eventos.
   - Nao existe tela para moderar posts, fixar/desafixar, bloquear/arquivar ou revisar conteudo.

9. Falta de `.env.example`.
   - O README descreve env, mas um arquivo versionado reduz erro de setup.

10. Nenhum CI observado no workspace.
    - Nao foi encontrado workflow nesta analise.
    - Sem CI, o gate de build/test/integracao depende de disciplina local.

## O que falta para considerar "minimamente viavel"

Para um MVP local/demonstravel:

- subir Postgres;
- rodar migrations/seed;
- garantir `npm run test:api:integration` verde;
- atualizar README;
- estabilizar e commitar a refatoracao;
- opcionalmente adicionar `.env.example`.

Para um MVP publico:

- autenticacao real;
- autorizacao baseada em dados confiaveis;
- fluxo de login/cadastro;
- controles reais de moderacao;
- documentacao operacional corrigida;
- CI com build, unit, web e integracao;
- deploy com migrations;
- tratamento minimo de seguranca e observabilidade.

## Backlog recomendado

### Semana 1 - Fechar estabilidade local

1. Rodar banco, migrations, seed e integracao ate ficar verde.
2. Atualizar README e corrigir encoding.
3. Criar `.env.example`.
4. Corrigir decisao de `docs/` no `.gitignore`.
5. Revisar refatoracao e fazer commit atomico.

### Semana 2 - Auth e autorizacao

1. Definir estrategia de auth.
2. Persistir roles no banco.
3. Trocar headers por sessao/token.
4. Adaptar `resolveCurrentUser` e guards.
5. Atualizar frontend para login/logout.
6. Cobrir auth com testes.

### Semana 3 - MVP UX

1. Tela de moderacao de posts.
2. Perfil editavel.
3. Busca/filtro simples no feed.
4. Inbox simples ou remover notificacoes do escopo de MVP.
5. E2E do fluxo principal.

### Semana 4 - Operacao

1. CI.
2. Docker/deploy.
3. Logs estruturados.
4. CORS/envs por ambiente.
5. Smoke test pos-deploy.

## Decisao de MVP sugerida

Minha recomendacao: tratar o estado atual como "MVP tecnico local quase completo", nao como "MVP de produto".

O produto ja demonstra o dominio principal de forum. Para ficar minimamente viavel para usuarios reais, a proxima entrega deve ser autenticacao/autorizacao real e estabilizacao operacional, antes de adicionar features novas grandes.
