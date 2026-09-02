# RecapMe — Design System & Guia de Padrões Auditados

Este documento consolida a documentação técnica e viva do Design System implementado no **RecapMe**. Todas as diretrizes, tabelas e contratos descritos a seguir refletem **estritamente o que já existe no código-fonte**, com referências de arquivos e trechos verificáveis.

---

## 1. Princípios Visuais Observados

A análise minuciosa da árvore de componentes e folhas de estilo revela as seguintes intenções arquiteturais e visuais:

1. **Dark Canvas Imersivo & Efeito Grid Sutil:**
   - A interface adota um tema escuro profundo e cinematográfico baseado em `#050505` (`brand.dark`), complementado por uma malha quadriculada de 36x36px com 5% de opacidade branca no plano de fundo (`index.css:46-50`).
   - Superfícies elevadas operam em degraus de contraste: fundo base (`#050505`) → cartões estruturais (`#111116`) → caixas e inputs recuados (`#0d0d14`).

2. **Hierarquia por Cores de Ação Distintas (Roxo vs. Laranja):**
   - **Roxo (`#9d4edd` / `brand-purple`):** Utilizado como a cor de identidade e navegação (logo `recap.me`, links ativos, pílulas de filtro selecionadas, anéis de foco, realce de títulos em hover e o avatar flutuante da IA).
   - **Laranja (`#ff5500` / `brand.orange`):** Reservado para ações de alto impacto e chamadas para ação (CTA primário "Começar a recapitular E1", botão "Já vi tudo" para desativar travas e botão de revelação individual de spoiler).

3. **Efeitos Atmosféricos e Glassmorphism:**
   - Aplicação consistente de `backdrop-blur` (de `backdrop-blur-sm` a `backdrop-blur-2xl`) combinados com bordas translúcidas (`rgba(255, 255, 255, 0.08)` e `#1f1f2e`) em elementos flutuantes (Navbar fixa, dropdown de busca e gaveta lateral de chat).
   - Sombras brilhantes perimetrais (`.glow-active` e `.glow-active-orange` em `index.css:67-73`) para indicar foco e seleção ativa.

4. **Design Orientado a Anti-Spoiler e Proteção de Conteúdo:**
   - Elementos textuais que ultrapassam o progresso configurado pelo usuário recebem máscara visual com desfoque gaussiano (`filter blur-md select-none pointer-events-none opacity-30` em `EpisodeAccordionList.tsx:95`), com opção de revelação seletiva.

---

## 2. Guia de Uso de Componentes ("Quando Usar o Quê")

| Componente | Localização | Propósito / Quando Usar | Quando NÃO Usar |
| :--- | :--- | :--- | :--- |
| **`Button`** | `frontend/src/components/ui/button.tsx` | Botões de formulário, gatilhos de ação e diálogos com suporte a variantes (`default`, `destructive`, `outline`, `secondary`, `ghost`, `link`, `gradient`). | Não usar diretamente para links externos simples ou quando for necessária uma pílula de filtro com estado de glow customizado (onde hoje se usam tags `<button>` manuais). |
| **`Badge`** | `frontend/src/components/ui/badge.tsx` | Rótulos de estado, tipo de obra (`ANIME`, `SERIES`, `MOVIE`), ano de lançamento, total de temporadas ou status da trava (`success`, `warning`). | Não usar para ações clicáveis primárias com submit ou navegação. |
| **`Card`** (família) | `frontend/src/components/ui/card.tsx` | Estrutura padrão com borda e sombra para agrupamento de informações (Header, Title, Description, Content, Footer). | Não usar quando o card exigir uma proporção fixa de mídia como pôster 2:3 (usar `MediaCard`). |
| **`MediaCard`** | `frontend/src/components/media/MediaCard.tsx` | Exibição de pôsteres de mídia em grades e carrosséis com proporção 2:3, badge sobreposto, botão de bookmark e hover zoom. | Não usar para caixas de texto ou resumos narrativos sem pôster vertical. |
| **`SearchBar`** | `frontend/src/components/common/SearchBar.tsx` | Campo de busca global de séries/animes com autocompletar, debounce de 300ms, dropdown animado e glow perimetral. | Não usar como input comum de formulário simples (usar `Input`). |
| **`Input`** | `frontend/src/components/ui/input.tsx` | Campos textuais padrão de formulário e digitação. | Não usar quando precisar de busca assíncrona integrada com dropdown de resultados. |
| **`SpoilerLockController`**| `frontend/src/components/media/SpoilerLockController.tsx` | Barra de configuração do limite de temporada/episódio assistido pelo usuário. | Usar exclusivamente em páginas de detalhe de obra com recap. |
| **`EpisodeAccordionList`** | `frontend/src/components/recap/EpisodeAccordionList.tsx` | Listagem sanfonada de episódios com máscara blur anti-spoiler individual e badges de eventos-chave. | Não usar para resumos globais de temporadas inteiras (usar `SeasonRecapTab`). |
| **`SeasonRecapTab`** | `frontend/src/components/recap/SeasonRecapTab.tsx` | Apresentação do resumo narrativo geral da temporada e grade de pontos cruciais a lembrar ("key takeaways"). | Não usar para navegação episódio por episódio. |
| **`ChatDrawer`** | `frontend/src/components/chat/ChatDrawer.tsx` | Botão flutuante tipo avatar IA e gaveta lateral de conversa com streaming, histórico e feedback. | Usar em páginas de obra onde haja contexto de mídia para consulta. |
| **`TrendingPeekCarousel`** | `frontend/src/components/media/TrendingPeekCarousel.tsx` | Fileira horizontal de cartões de mídia com navegação por setas, snap-scroll e efeito peek na borda. | Não usar para listagens verticais densas. |
| **`FeaturedHeroBanner`** | `frontend/src/components/landing/FeaturedHeroBanner.tsx` | Destaque principal cinematográfico em formato de slider na Home. | Não usar em páginas internas secundárias. |

---

## 3. Convenções de Nomenclatura Observadas

1. **Tokens de Estilo no Tailwind:**
   - Prefixo `brand-*` para a identidade do produto: `brand-dark`, `brand-card`, `brand-border`, `brand-purple`, `brand-pink`, `brand-orange`, `brand-orangeHover` ([tailwind.config.js:23-31](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/frontend/tailwind.config.js#L23-L31)).
   - Nomes semânticos padrão shadcn/ui para primitivos: `background`, `foreground`, `primary`, `secondary`, `destructive`, `muted`, `accent`, `popover`, `card`, `border`, `input`, `ring` ([tailwind.config.js:32-65](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/frontend/tailwind.config.js#L32-L65)).

2. **Componentes e Variantes:**
   - Utilização de `cva` (Class Variance Authority) para primitivos desacoplados: padrão `buttonVariants` e `badgeVariants` ([button.tsx:6](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/frontend/src/components/ui/button.tsx#L6), [badge.tsx:5](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/frontend/src/components/ui/badge.tsx#L5)).
   - Sufixo explícito por tipo funcional: `*Section`, `*Banner`, `*Carousel`, `*Drawer`, `*Controller`, `*Tab`, `*List`.

3. **Arquivos e Pastas:**
   - PascalCase para componentes React (`MediaCard.tsx`, `ChatDrawer.tsx`, `HeroSection.tsx`).
   - camelCase com prefixo `use` para stores Zustand e hooks (`useSpoilerStore.ts`, `useChatStore.ts`, `useRecentStore.ts`).
   - kebab-case para configurações de infraestrutura (`tailwind.config.js`, `postcss.config.js`, `design-tokens.json`).

---

## 4. Contrato dos Componentes Mais Utilizados

### 4.1 `Button`
Arquivo: [button.tsx](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/frontend/src/components/ui/button.tsx)

```typescript
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}
```

### 4.2 `Badge`
Arquivo: [badge.tsx](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/frontend/src/components/ui/badge.tsx)

```typescript
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}
```

### 4.3 `MediaCard`
Arquivo: [media/MediaCard.tsx](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/frontend/src/components/media/MediaCard.tsx)

```typescript
interface MediaCardProps {
  media: MediaItem; // { externalId, type, source, title, originalTitle?, overview?, posterUrl?, backdropUrl?, releaseYear?, totalSeasons?, totalEpisodes? }
  className?: string;
}
```

### 4.4 `SpoilerLockController`
Arquivo: [media/SpoilerLockController.tsx](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/frontend/src/components/media/SpoilerLockController.tsx)

```typescript
interface SpoilerLockControllerProps {
  mediaKey: string;
  totalSeasons: number;
  episodesInCurrentSeason?: number;
  currentSeason: number;
  onSeasonChange: (season: number) => void;
}
```

### 4.5 `SearchBar`
Arquivo: [common/SearchBar.tsx](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/frontend/src/components/common/SearchBar.tsx)

```typescript
interface SearchBarProps {
  initialQuery?: string;
  onSelectMedia?: (media: MediaItem) => void;
  className?: string;
}
```

### 4.6 `ChatDrawer`
Arquivo: [chat/ChatDrawer.tsx](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/frontend/src/components/chat/ChatDrawer.tsx)

```typescript
interface ChatDrawerProps {
  mediaKey: string;
  mediaTitle: string;
  mediaType: MediaType; // 'MOVIE' | 'SERIES' | 'ANIME'
  externalId: string;
}
```

---

## 5. Notas de Acessibilidade (a11y)

### 5.1 Práticas Já Seguidas no Código
- **Rótulos Acessíveis em Botões de Ícone (`aria-label`):**
  - Presente no botão do menu mobile: `aria-label="Toggle menu"` ([Navbar.tsx:102](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/frontend/src/components/common/Navbar.tsx#L102)).
  - Presente no botão de limpar busca: `aria-label="Limpar busca"` ([SearchBar.tsx:102](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/frontend/src/components/common/SearchBar.tsx#L102)).
  - Presente no botão de bookmark em cards: `aria-label="Salvar obra"` ([MediaCard.tsx:69](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/frontend/src/components/media/MediaCard.tsx#L69)).
  - Presente nos controles de carrossel: `aria-label="Anterior"` e `aria-label="Próximo"` ([FeaturedHeroBanner.tsx:188,197](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/frontend/src/components/landing/FeaturedHeroBanner.tsx#L188), [TrendingPeekCarousel.tsx:157,168](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/frontend/src/components/media/TrendingPeekCarousel.tsx#L157)).
  - Presente nos dots indicadores de slide: `aria-label="Slide X"` ([FeaturedHeroBanner.tsx:175](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/frontend/src/components/landing/FeaturedHeroBanner.tsx#L175)).
- **Primitivos Radix UI com Suporte Nativo:**
  - O Acordeão (`@radix-ui/react-accordion`) e as Abas (`@radix-ui/react-tabs`) gerenciam nativamente `aria-expanded`, `aria-controls`, `role="tab"`, `role="tablist"` e navegação via setas do teclado ([tabs.tsx:5](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/frontend/src/components/ui/tabs.tsx#L5), [accordion.tsx:6](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/frontend/src/components/ui/accordion.tsx#L6)).
- **Contraste de Texto:**
  - Títulos principais em branco puro (`#ffffff`) sobre fundo `#050505` ou `#111116` atingem razão de contraste superior a 18:1 (muito acima do padrão WCAG AAA de 7:1).

### 5.2 Práticas de Acessibilidade Implementadas e Resolvidas
- **Anéis de foco acessível (`focus-visible`):**
  - O primitivo `Button` padroniza `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background`.
  - Pílulas de filtro (`HeroSection.tsx`), dots e controles de carrossel (`FeaturedHeroBanner.tsx`, `TrendingPeekCarousel.tsx`), bookmark buttons (`MediaCard.tsx`) e perguntas sugeridas (`ChatDrawer.tsx`) agora possuem anéis de foco visíveis em navegação via teclado.
- **Atributos de estado de validação em formulários:**
  - O componente `Input` em `input.tsx` possui suporte nativo a `aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive`.
- **Acessibilidade e Semântica no Drawer de Chat:**
  - O gatilho flutuante da IA em `ChatDrawer.tsx` opera com `role="button"`, `tabIndex={0}`, `aria-label` e suporte aos atalhos `Enter` e `Space`.
  - A gaveta lateral possui `role="dialog"`, `aria-modal="true"` e `aria-label` descritivo da obra em discussão.

---

## 6. Histórico de Decisões de Padronização (Auditoria Finalizada)

1. **Unificação da Paleta em Variáveis HSL:**
   - Variáveis `:root` padronizadas em HSL no [index.css](file:///C:/Users/guima/OneDrive/Documentos/projects/recapme/frontend/src/index.css).
   - `--primary` unificado para `hsl(273, 68%, 58%)`, alinhando perfeitamente a identidade visual ao componente primitivo `Button`.
2. **Eliminação de Bordas e Cores Hardcoded:**
   - Removidos literais `#2a2a35`, `#111116`, `#0d0d14`, `#ff5500` e `#ff7733` espalhados pelo código; substituídos por tokens semânticos `border-brand-border`, `bg-brand-card`, `bg-brand-inset`, `bg-brand-orange` e `hover:bg-brand-orangeHover`.
3. **Variantes Semânticas de Badge e Botão:**
   - `Badge`: incluídas as variantes oficiais `anime` (roxo translúcido com borda) e `series` / `movie` (laranja translúcido com borda), eliminando repetição de classes inline em 3 arquivos.
   - `Button`: incluídas as variantes oficiais `orange` (CTA vibrante com glow e active scale), `pill` e `gradient` unificado.
