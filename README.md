# APIs REST: Sistema de Controle de Produção com Estoque e Relatórios

## Contexto

Uma indústria de peças automotivas quer controlar melhor sua produção e estoque diário por meio de uma API REST.

## Desafio

Crie uma API REST em JavaScript (por exemplo, usando Node.js + Express) para gerenciar múltiplas ordens de produção e gerar relatórios consolidados.

## Recursos da API

Considere um recurso principal:

- `/ordens` – representa as ordens de produção da indústria.

Cada ordem deve armazenar:

- `codigoOrdem` (string ou número, único).
- `codigoProduto` (string).
- `tipoProduto` (1 – Padrão, 2 – Premium, 3 – Sob encomenda).
- `quantidadeProduzida` (número).
- `custoUnitarioBase` (número).
- `estoqueInicial` (número).
- Campos calculados pela regra de negócio:
  - `custoUnitarioAjustado`.
  - `estoqueFinal`.
  - `custoTotal`.
  - `alertaEstoque` ("ALTO", "CRÍTICO" ou "NORMAL").

## Endpoints REST obrigatórios

### 1. `POST /ordens`

Cadastra uma nova ordem de produção.

**Corpo da requisição (JSON)** deve incluir:

- `codigoOrdem`, `codigoProduto`, `tipoProduto`, `quantidadeProduzida`, `custoUnitarioBase`, `estoqueInicial`.

**Validações:**

- `codigoOrdem` não pode se repetir (verificar se já existe).
- `tipoProduto` deve ser 1, 2 ou 3 (validar com lógica equivalente a switch + loop de validação).

**Regras de negócio aplicadas no servidor:**

- `estoqueFinal = estoqueInicial + quantidadeProduzida`.
- Ajuste de custo unitário:
  - Tipo 1 (Padrão): custo base.
  - Tipo 2 (Premium): +10% sobre custo base.
  - Tipo 3 (Sob encomenda): +20% sobre custo base.
- Alertas de estoque:
  - `estoqueFinal > 5000` → `alertaEstoque = "ALTO"`.
  - `estoqueFinal < 500` → `alertaEstoque = "CRITICO"`.
  - Caso contrário → `alertaEstoque = "NORMAL"`.
- `custoTotal = quantidadeProduzida * custoUnitarioAjustado`.

**Resposta:**

- JSON da ordem cadastrada, incluindo todos os campos calculados.
- Status adequado (ex.: 201 para criado, 400 para erro de validação).

### 2. `GET /ordens`

Retorna a lista de todas as ordens registradas.

**Opcional:** permitir filtros por:

- `tipoProduto` (ex.: `GET /ordens?tipo=2`).
- `alertaEstoque` (ex.: `GET /ordens?alerta=ALTO`).

**Resposta:**

- Array de objetos com os dados das ordens.

### 3. `GET /ordens/:codigoOrdem`

Retorna os dados de uma ordem específica.

**Parâmetro de rota:**

- `:codigoOrdem` (ex.: `/ordens/OP123`).

**Resposta:**

- Objeto da ordem correspondente.
- Se não encontrar, retornar 404.

### 4. `PUT /ordens/:codigoOrdem`

Atualiza uma ordem de produção já existente.

**Permitir atualizar campos como:**

- `codigoProduto`, `tipoProduto`, `quantidadeProduzida`, `custoUnitarioBase`, `estoqueInicial`.

**Regra:**

- Após qualquer alteração, recalcular:
  - `estoqueFinal`, `custoUnitarioAjustado`, `custoTotal`, `alertaEstoque`.

**Resposta:**

- Objeto atualizado da ordem.

### 5. `DELETE /ordens/:codigoOrdem`

Remove uma ordem de produção.

**Parâmetro de rota:**

- `:codigoOrdem`.

**Resposta:**

- Mensagem de sucesso ou erro.
- Após remoção, os relatórios não devem considerar essa ordem.

## Endpoints de Relatório (GET)

Crie pelo menos um endpoint dedicado a relatórios consolidados.

### 6. `GET /relatorios/ordens`

Gera um relatório com base em todas as ordens cadastradas.

O JSON de resposta deve conter:

- `totalOrdens`: total de ordens registradas.
- `estoquePorTipo`: objeto com estoque total final por tipo de produto, por exemplo:

  ```json
  {
      "padrao": 12345,
      "premium": 6789,
      "sobEncomenda": 2345
  }
  ```

- `mediaCustoTotalPorOrdem`: média do campo `custoTotal`.
- `ordemMaisCara`: objeto com `codigoOrdem` e `custoTotal`.
- `ordemMaisBarata`: objeto com `codigoOrdem` e `custoTotal`.
- `quantidadeAlertas`: objeto com contagem de ordens:

  ```json
  {
      "alto": 10,
      "critico": 3,
      "normal": 20
  }
  ```

- `porProduto`: lista ou objeto que consolide, para cada `codigoProduto`:
  - `estoqueFinalConsolidado` (soma dos estoques finais).
  - `valorTotalInvestido` (soma de `custoTotal`).
