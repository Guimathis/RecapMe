  ### 1. Os 3 Tipos de Documentos que ela gera

  A skill trabalha em cadeia progressiva ("Por quê?" → "Qual direção?" → "Como fazer?"):

   Documento                                | Pergunta Central                         | Quando Escolher
  ------------------------------------------|------------------------------------------|-------------------------------------------------------------------------------------------------
   Problem Framing                          | Por que fazer isso?                      | Fase de ideação inicial. Você quer validar se a dor existe antes de decidir construir.
   SRD (System/Strategic Requirements)      | Qual direção seguir?                     | Ideia aprovada. Precisa alinhar arquitetura, fases e visão de alto nível.
   PRD (Product Requirements Document)      | Como implementar exatamente?             | Pronto para desenvolver. Especificação detalhada de regras, fluxos, endpoints e casos de borda.
  ──────
  ### 2. Como o Processo Funciona (Fluxo da Skill)

  Quando ativada, a skill segue 6 fases estruturadas:

    [1. Escolha do Documento] ➔ [2. Perguntas em Camadas] ➔ [3. Ajuste do Escopo]
                                                                      ↓
    [6. Revisão Produto/Design/Dev] ➔ [5. Geração do MD em docs/] ➔ [4. Checagem de Completude]

  1. Confirmação da Fase: Identifica qual dos 3 documentos faz mais sentido.
  2. Questionamento em 3 Camadas (Sem interrogatório mecânico):
      • Camada 1 (Problema): Quem é o usuário? Qual a dor atual? Quando ocorre?
      • Camada 2 (Solução & Escopo): Qual a ideia de solução? O que entra na v1 e o que fica de fora (Out of Scope)?
      • Camada 3 (Métricas de Sucesso): Como saberemos que funcionou?
  3. Semáforo de Completude (Traffic Light):
      • 🟢 Verde: Pronto para gerar.
      • 🟡 Amarelo: Detalhes secundários pendentes (você decide se preenche ou deixa como TBD).
      • 🔴 Vermelho: Falta algo crítico para o código/arquitetura antes de gerar o documento.
  4. Geração do Markdown: Salva o documento formatado na pasta docs/ do projeto.
  5. Revisão sob 3 lentes: Analisa o documento gerado sob as perspectivas de Produto 🎯, Design 🎨 e Engenharia 🔧.
  ──────
  ### 3. Dicas de Ouro para Tirar o Melhor Proveito

  • Não se preocupe em formular o texto perfeitamente: Comece jogando a ideia de forma livre e informal (ex.: "Quero adicionar um sistema de empréstimo de livros com limite por usuário,
  mas ainda estou pensando nas regras").
  • Seja explícito sobre o que NÃO entra no escopo: Dizer o que você não quer construir agora (ex.: "não quero suporte a multas na v1") evita que o assistente gere complexidade
  desnecessária.
  • Se não souber uma resposta, apenas diga: Você pode responder "ainda não pensei nisso" ou "vamos deixar simples por enquanto". A skill marcará o ponto como ⚠️ TBD sem travar o
  processo.
  • Use o PRD como contrato de código: Depois que o documento estiver gerado em docs/, você poderá pedir para o assistente implementar o código usando o próprio arquivo como
  especificação técnica.
