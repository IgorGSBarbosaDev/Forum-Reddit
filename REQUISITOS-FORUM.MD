# Módulo de Fórum — Requisitos Funcionais

## Postagens

| ID | Requisito |
|---|---|
| 1 | Usuários podem criar postagens com título e conteúdo. |
| 2 | Usuários podem editar suas próprias postagens. O sistema deve registrar quando e quantas vezes uma postagem foi editada. |
| 3 | Usuários podem excluir suas próprias postagens. A exclusão não apaga o registro — o conteúdo é removido e a postagem deixa de ser visível publicamente. |
| 4 | Postagens podem ser fixadas para aparecer com destaque no feed. |
| 5 | Postagens podem ter seu status alterado para ativo, bloqueado ou arquivado. Postagens bloqueadas não aceitam novos comentários. (Ação de moderação) |
| 6 | O sistema deve notificar automaticamente quando uma postagem é publicada por determinado usuário. A notificação é processada de forma assíncrona. |

## Comentários

| ID | Requisito |
|---|---|
| 7 | Usuários podem comentar em postagens. |
| 8 | Usuários podem responder a comentários existentes, formando conversas encadeadas com múltiplos níveis com limite máximo de profundidade. |
| 9 | Usuários podem editar seus próprios comentários. O sistema deve registrar quando e quantas vezes foi editado. |
| 10 | Usuários podem excluir seus próprios comentários. As respostas permanecem visíveis. O comentário aparece como removido, sem identificar o autor. |
| 11 | Não é possível comentar em postagens bloqueadas. |

## Curtidas

| ID | Requisito |
|---|---|
| 12 | Usuários podem curtir e descurtir postagens. Cada usuário pode curtir apenas uma vez. |
| 13 | Usuários podem curtir e descurtir comentários. Cada usuário pode curtir apenas uma vez. |
| 14 | O sistema deve indicar se o usuário atual já curtiu uma postagem ou comentário. |

## Salvos

| ID | Requisito |
|---|---|
| 15 | Usuários podem salvar e remover postagens dos seus salvos. Cada usuário pode salvar apenas uma vez. |
| 16 | Usuários podem visualizar a lista das suas postagens salvas. |

## Seguidores

| ID | Requisito |
|---|---|
| 17 | Usuários podem seguir e deixar de seguir outros usuários. Um usuário não pode seguir a si mesmo. |
| 18 | Usuários podem visualizar a lista de quem os segue e de quem eles seguem. |
| 19 | O sistema deve indicar se o usuário atual já segue um determinado usuário. |

## Regras Gerais

| ID | Requisito |
|---|---|
| 20 | Nenhuma ação destrutiva deve ser reversível pelo usuário. |
| 21 | O autor de uma postagem ou comentário excluído não deve ser identificável após a exclusão. |
| 22 | Se um usuário for removido do sistema, seus conteúdos devem ser desassociados da conta, preservando o histórico de discussões. |

