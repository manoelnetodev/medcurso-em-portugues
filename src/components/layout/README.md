# Componentes de Layout Melhorados

Este diretório contém os componentes de layout melhorados para o projeto MedCurso, incluindo menu lateral, header e navegação móvel.

## Componentes

### Layout.tsx
O componente principal de layout que integra todos os outros componentes.

**Características:**
- Menu lateral responsivo (desktop)
- Navegação móvel integrada
- Header com breadcrumbs
- Toggle de tema escuro/claro
- Notificações
- Menu de usuário
- Ações rápidas

**Uso:**
```tsx
import { Layout } from '@/components/layout';

function App() {
  return (
    <Layout>
      {/* Conteúdo da aplicação */}
    </Layout>
  );
}
```

### Header.tsx
Componente de header reutilizável e configurável.

**Props:**
- `title?: string` - Título da página
- `subtitle?: string` - Subtítulo da página
- `showSearch?: boolean` - Mostrar campo de busca
- `showActions?: boolean` - Mostrar ações rápidas
- `showBreadcrumbs?: boolean` - Mostrar breadcrumbs
- `actions?: React.ReactNode` - Ações customizadas
- `onSearch?: (query: string) => void` - Callback de busca
- `onToggleView?: (view: 'grid' | 'list') => void` - Toggle de visualização
- `viewMode?: 'grid' | 'list'` - Modo de visualização atual
- `filters?: Filter[]` - Filtros configuráveis

**Exemplo de uso:**
```tsx
import { Header } from '@/components/layout';

function QuestoesPage() {
  const handleSearch = (query: string) => {
    // Lógica de busca
  };

  return (
    <Header
      title="Questões"
      subtitle="Pratique com questões de residência médica"
      showSearch={true}
      onSearch={handleSearch}
      filters={[
        {
          label: 'Categoria',
          value: 'category',
          options: [
            { label: 'Todas', value: 'all' },
            { label: 'Cardiologia', value: 'cardiology' }
          ],
          onChange: (value) => console.log(value)
        }
      ]}
    />
  );
}
```

### MobileNav.tsx
Navegação móvel com drawer lateral.

**Características:**
- Drawer lateral responsivo
- Menu de navegação completo
- Busca integrada
- Perfil do usuário
- Projetos ativos com progresso

**Uso:**
```tsx
import { MobileNav } from '@/components/layout';

function MobileLayout() {
  return (
    <MobileNav>
      {/* Conteúdo da aplicação */}
    </MobileNav>
  );
}
```

## Melhorias Implementadas

### Menu Lateral
- ✅ Design mais moderno com gradientes e sombras
- ✅ Melhor organização dos itens de navegação
- ✅ Descrições para cada item do menu
- ✅ Indicadores de progresso para projetos
- ✅ Badges para notificações
- ✅ Melhor responsividade

### Header
- ✅ Breadcrumbs automáticos baseados na rota
- ✅ Campo de busca integrado
- ✅ Filtros configuráveis
- ✅ Toggle de visualização (grid/list)
- ✅ Ações customizadas
- ✅ Toggle de tema escuro/claro
- ✅ Notificações com indicador
- ✅ Menu de usuário melhorado

### Navegação Móvel
- ✅ Drawer lateral responsivo
- ✅ Menu completo com todas as funcionalidades
- ✅ Busca integrada
- ✅ Perfil do usuário
- ✅ Projetos com progresso visual

### Responsividade
- ✅ Menu lateral oculto em dispositivos móveis
- ✅ Header adaptativo
- ✅ Navegação móvel dedicada
- ✅ Breakpoints otimizados

## Funcionalidades

### Tema Escuro/Claro
O sistema suporta alternância automática entre temas claro e escuro.

### Breadcrumbs
Navegação automática baseada na estrutura de rotas atual.

### Busca
Campo de busca integrado com callback customizável.

### Filtros
Sistema de filtros configurável com múltiplas opções.

### Notificações
Sistema de notificações com indicadores visuais.

### Ações Rápidas
Menu de ações rápidas para criação de conteúdo.

## Estrutura de Arquivos

```
src/components/layout/
├── Layout.tsx          # Layout principal
├── Header.tsx          # Header configurável
├── MobileNav.tsx       # Navegação móvel
├── Sidebar.tsx         # Sidebar legado (mantido para compatibilidade)
├── HeaderExample.tsx   # Exemplos de uso
├── index.ts           # Exportações
└── README.md          # Documentação
```

## Como Usar

1. **Layout Principal**: Use o `Layout` como wrapper principal da aplicação
2. **Headers Customizados**: Use o `Header` em páginas específicas que precisam de funcionalidades adicionais
3. **Navegação Móvel**: Automaticamente integrada no `Layout`

## Personalização

### Cores e Temas
As cores são definidas através das variáveis CSS no arquivo `src/index.css`.

### Ícones
Todos os ícones são do Lucide React. Para adicionar novos ícones, importe do `lucide-react`.

### Animações
As animações são baseadas no Tailwind CSS e podem ser customizadas no `tailwind.config.ts`. 