import React from 'react';
import { Header } from './Header';
import { Button } from '@/components/ui/button';
import { Download, Filter, SortAsc } from 'lucide-react';

export function HeaderExample() {
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = React.useState({
    category: 'all',
    difficulty: 'all',
    status: 'all'
  });

  const filterOptions = [
    {
      label: 'Categoria',
      value: 'category',
      options: [
        { label: 'Todas', value: 'all' },
        { label: 'Cardiologia', value: 'cardiology' },
        { label: 'Neurologia', value: 'neurology' },
        { label: 'Pediatria', value: 'pediatrics' }
      ],
      onChange: (value: string) => setFilters(prev => ({ ...prev, category: value }))
    },
    {
      label: 'Dificuldade',
      value: 'difficulty',
      options: [
        { label: 'Todas', value: 'all' },
        { label: 'Fácil', value: 'easy' },
        { label: 'Médio', value: 'medium' },
        { label: 'Difícil', value: 'hard' }
      ],
      onChange: (value: string) => setFilters(prev => ({ ...prev, difficulty: value }))
    },
    {
      label: 'Status',
      value: 'status',
      options: [
        { label: 'Todos', value: 'all' },
        { label: 'Não respondidas', value: 'unanswered' },
        { label: 'Respondidas', value: 'answered' },
        { label: 'Marcadas', value: 'bookmarked' }
      ],
      onChange: (value: string) => setFilters(prev => ({ ...prev, status: value }))
    }
  ];

  const handleSearch = (query: string) => {
    console.log('Pesquisando:', query);
  };

  const customActions = (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="sm" className="gap-2">
        <Filter className="h-4 w-4" />
        Filtros Avançados
      </Button>
      <Button variant="outline" size="sm" className="gap-2">
        <SortAsc className="h-4 w-4" />
        Ordenar
      </Button>
      <Button variant="outline" size="sm" className="gap-2">
        <Download className="h-4 w-4" />
        Exportar
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header com título e subtítulo */}
      <Header
        title="Questões"
        subtitle="Pratique com questões de residência médica"
        showSearch={true}
        showActions={true}
        onSearch={handleSearch}
        onToggleView={setViewMode}
        viewMode={viewMode}
        filters={filterOptions}
        actions={customActions}
      />

      {/* Header simples com breadcrumbs */}
      <Header
        showBreadcrumbs={true}
        showActions={false}
      />

      {/* Header com busca */}
      <Header
        title="Dashboard"
        showSearch={true}
        onSearch={handleSearch}
      />

      {/* Conteúdo de exemplo */}
      <div className="p-6 bg-card rounded-lg border">
        <h2 className="text-2xl font-bold mb-4">Exemplos de Headers</h2>
        <p className="text-muted-foreground mb-4">
          Este componente demonstra diferentes configurações do Header:
        </p>
        <ul className="space-y-2 text-sm">
          <li>• <strong>Header completo:</strong> Com título, busca, filtros, toggle de visualização e ações customizadas</li>
          <li>• <strong>Header simples:</strong> Apenas com breadcrumbs</li>
          <li>• <strong>Header com busca:</strong> Título e campo de busca</li>
        </ul>
      </div>
    </div>
  );
} 