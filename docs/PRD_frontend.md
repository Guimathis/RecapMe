# PRD — RecapMe Frontend

> **Projeto:** RecapMe — Interface Web  
> **Versão:** V0.1  
> **Data:** 27/08/2026  
> **Stack Principal:** Vite + React 18/19 + TypeScript + Tailwind CSS + Shadcn UI + Zustand + Zod + TanStack Query  
> **Status:** Aprovado para Desenvolvimento  

---

## 1. Histórico de Revisão

| Versão | Data | Autor | Descrição |
| :--- | :--- | :--- | :--- |
| V0.1 | 27/08/2026 | Frontend Architecture Team | Especificação técnica detalhada do frontend SPA |

---

## 2. Visão Geral e Arquitetura Frontend

### 2.1 Objetivos da Aplicação
Construir uma Single Page Application (SPA) moderna, ultra-rápida e responsiva, focada em fornecer resumos multimídia de obras audiovisuais (séries, animes e filmes) com controle estrito de spoilers em interface e chat com IA streaming em tempo real.

### 2.2 Estrutura do Monorepo
A aplicação frontend residirá no diretório `/frontend` na raiz do projeto:

```text
recapme/
├── frontend/                  # SPA React + Vite + TypeScript
│   ├── public/
│   ├── src/
│   │   ├── assets/            # Imagens, logos, ícones estáticos
│   │   ├── components/
│   │   │   ├── ui/            # Primitivos do Shadcn UI (Button, Card, Sheet, etc.)
│   │   │   ├── common/        # Navbar, Footer, SearchBar, SpoilerController, etc.
│   │   │   ├── media/         # MediaCard, MediaHeader, SeasonSelector, CharacterCard
│   │   │   ├── recap/         # SeasonRecapView, EpisodeList, EpisodeItem, SpoilerMask
│   │   │   └── chat/          # ChatDrawer, ChatMessageList, ChatInput, PromptSuggestions
│   │   ├── hooks/             # Custom hooks (useDebounce, useStreamingChat, useLocalStorage)
│   │   ├── layouts/           # MainLayout, MediaDetailLayout
│   │   ├── pages/             # HomePage, MediaDetailPage, NotFoundPage
│   │   ├── routes/            # Configuração do React Router
│   │   ├── schemas/           # Schemas de validação Zod (Request/Response validation)
│   │   ├── services/          # Clientes HTTP e SSE (apiClient, mediaService, chatService)
│   │   ├── stores/            # Stores Zustand (useSpoilerStore, useRecentStore, useChatStore)
│   │   ├── types/             # Tipagens TypeScript compartilhadas
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/                   # API Spring Boot
└── docs/                      # PRDs e Documentação
```

---

## 3. Stack Tecnológica e Ferramental

| Tecnologia | Finalidade / Justificativa |
| :--- | :--- |
| **Vite + React (TypeScript)** | Build tool ultrarrápida, DX moderna e tipagem estrita para segurança de dados |
| **Tailwind CSS** | Estilização utility-first com design tokens para temas escuro/claro |
| **Shadcn UI (Radix UI)** | Componentes acessíveis (WAI-ARIA), customizáveis e sem lock-in de biblioteca pesada |
| **Lucide React** | Pacote de ícones minimalista e consistente |
| **Zustand (`persist`)** | Gerenciamento de estado global leve para trava de spoilers, recentes e cache local |
| **Zod** | Validação de esquemas de dados em tempo de execução e tipagem inferida |
| **TanStack Query (React Query v5)** | Gerenciamento de estado do servidor, cacheamento de buscas e requisições HTTP |
| **React Router DOM v6/v7** | Roteamento client-side com URLs amigáveis (`/media/:type/:id`) |
| **EventSource / Fetch Streams** | Consumo de respostas da IA via Server-Sent Events (SSE) com digitação em tempo real |

---

## 4. Telas e Componentes Detalhados

### 4.1 Home Page (`/`)
* **Hero & Search Header:**
  * Título impactante: *"Nunca mais fique perdido ao começar uma nova temporada"*.
  * Barra de busca central com suporte a debounce (300ms) e dropdown de autocompletar com thumbnails.
  * Filtros de busca por chip: `Todos`, `Séries`, `Animes`, `Filmes`.
* **Seção "Continuar de Onde Parou" (Obras Recentes):**
  * Alimentada pela store do Zustand (`useRecentStore`).
  * Mostra as últimas obras acessadas e a posição exata da trava de spoiler (ex: *"T2 E4"*).
* **Seção "Em Alta / Populares":**
  * Carrossel ou Grid responsivo com pôsteres, nota média e número de temporadas disponíveis.

### 4.2 Página de Detalhes da Obra (`/media/:type/:id`)
* **Header Cinematográfico:**
  * Backdrop com overlay escuro degradê, pôster em alta resolução, título nacional e original, gêneros, ano e sinopse.
* **Barra de Controle de Spoiler (Spoiler Lock Controller - Componente Chave):**
  * Dropdown duplo ou Slider visual:
    * `[ Temporada: 1 ▾ ] [ Episódio: 5 ▾ ]`
    * Botão de atalho: `[ Marcar Tudo como Visto ]` / `[ Iniciar do Zero (Sem Spoilers) ]`.
  * Feedback visual em tempo real: Badge verde com ícone de escudo *"Trava Anti-Spoiler Ativa até T1 E5"*.
* **Área de Resumo por Abas (Tabs):**
  * **Aba 1: Resumo Geral da Temporada:** Visão condensada dos arcos principais, ganchos e eventos decisivos.
  * **Aba 2: Episódio por Episódio (Accordion):**
    * Cada item mostra número, título do episódio e resumo detalhado.
    * **Comportamento de Máscara de Spoiler:** Episódios posteriores à trava selecionada ficam com efeito de *blur* (desfocado) e exibem um aviso: *"Contém spoilers posteriores a T1 E5. [Clique para Revelar]"*.
  * **Aba 3: Personagens & Facções:** Cards visuais dos personagens principais e seus status conhecidos até o ponto travado.

### 4.3 Chat Drawer / Modal Conversacional com IA
* **Acionador Flutuante:** Botão fixo no canto inferior direito com badge de status do spoiler (ex: *"Perguntar à IA (até T1 E5)"*).
* **Painel Lateral Deslizante (Sheet / Drawer):**
  * **Cabeçalho:** Nome da obra + Tag de trava anti-spoiler + Botão de limpar histórico.
  * **Chips de Sugestão de Perguntas:** Chips clicáveis para dúvidas comuns.
  * **Lista de Mensagens:**
    * Balões estilizados (Usuário à direita, IA à esquerda).
    * Suporte a formatação rica em Markdown (negrito, listas, tópicos).
    * Indicador de digitação (*streaming cursor*) enquanto a IA responde.
    * Botões de avaliação de utilidade (👍 / 👎) no rodapé de cada resposta da IA.
  * **Campo de Entrada (Input):** Input com atalho para envio (`Enter`), botão de envio com estado de loading desabilitado.

---

## 5. Gerenciamento de Estado (Zustand Stores)

### 5.1 `useSpoilerStore`
Controla a trava de spoiler global e por obra com sincronização no `localStorage`:
```typescript
interface SpoilerState {
  progressByMedia: Record<string, { season: number; episode: number; allowAll: boolean }>;
  setSpoilerProgress: (mediaId: string, season: number, episode: number) => void;
  unlockAll: (mediaId: string) => void;
  getSpoilerProgress: (mediaId: string) => { season: number; episode: number; allowAll: boolean };
}
```

### 5.2 `useChatStore`
Armazena as mensagens e estado de streaming do chat por obra:
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  feedback?: 'positive' | 'negative';
}

interface ChatState {
  isOpen: boolean;
  activeMediaId: string | null;
  messagesByMedia: Record<string, ChatMessage[]>;
  isStreaming: boolean;
  openChat: (mediaId: string) => void;
  closeChat: () => void;
  addMessage: (mediaId: string, message: ChatMessage) => void;
  appendStreamChunk: (mediaId: string, messageId: string, chunk: string) => void;
  clearChat: (mediaId: string) => void;
}
```

### 5.3 `useRecentStore`
Mantém o histórico local de obras visualizadas:
```typescript
interface RecentMedia {
  id: string;
  type: 'movie' | 'tv' | 'anime';
  title: string;
  posterPath: string;
  lastViewedAt: string;
}

interface RecentStore {
  recents: RecentMedia[];
  addRecent: (media: RecentMedia) => void;
  removeRecent: (id: string) => void;
}
```

---

## 6. Comunicação com API e Streaming de Chat (SSE)

### 6.1 Serviços de Dados (TanStack Query)
* `useSearchMedia(query, type)` -> Busca com cache de 5 minutos (`staleTime: 1000 * 60 * 5`).
* `useMediaDetails(type, id)` -> Metadados da obra com cache de 30 minutos.
* `useMediaRecap(type, id, season)` -> Resumos com cache de 1 hora.

### 6.2 Streaming de Chat com Fetch Stream
O envio de mensagens utiliza `fetch` com leitor de stream para atualizar a UI token a token:
```typescript
export async function sendChatMessageStream({
  mediaId,
  mediaType,
  message,
  season,
  episode,
  history,
  onChunk,
  onComplete,
  onError
}: StreamChatParams) {
  const response = await fetch('/api/v1/chats/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mediaId,
      mediaType,
      message,
      seasonCutoff: season,
      episodeCutoff: episode,
      history
    })
  });

  if (!response.ok || !response.body) {
    throw new Error('Falha ao conectar com o assistente de IA');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let done = false;

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    if (value) {
      const chunk = decoder.decode(value, { stream: true });
      onChunk(chunk);
    }
  }
  onComplete();
}
```

---

## 7. Critérios de Aceite de Frontend

- [ ] **Responsividade:** Layout 100% fluido em resoluções de 320px (Mobile) a 2560px (Ultra-wide).
- [ ] **Performance:** Bundle inicial < 250KB gzipped; First Contentful Paint (FCP) < 1.0s.
- [ ] **Isolamento de Spoilers:** Qualquer alteração na trava de spoilers deve atualizar imediatamente a máscara nos cards de episódios sem recarregar a página.
- [ ] **Persistência Offline-first Local:** Fechar e reabrir o navegador deve restaurar exatamente a trava de spoilers e os favoritos do usuário.
- [ ] **Feedback de Erros e Carregamento:** Exibição de Skeletons animados durante o carregamento de resumos e toasts amigáveis em caso de falha de conexão.
- [ ] **Acessibilidade:** Navegação por teclado funcional no controle de spoiler, nas abas e no envio de mensagens do chat (`aria-live` para mensagens da IA).
