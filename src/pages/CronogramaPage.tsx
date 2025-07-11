import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  Target,
  Brain,
  FileText,
  MoreVertical,
  Edit,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Compromisso {
  id: number;
  nome: string;
  tipo: 'revisao_ia' | 'revisao_base' | 'tarefa';
  categoria?: number;
  subcategoria?: number;
  assunto?: number;
  data_sugerida: string;
  data_realizada?: string;
  finalizado: boolean;
  user: string;
  categoria_nome?: string;
  subcategoria_nome?: string;
  assunto_nome?: string;
}

interface StudyEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  duration: number; // em minutos
  type: 'revisao_ia' | 'revisao_base' | 'tarefa';
  subject?: string;
  color: string;
  compromisso_id?: number;
}

type ViewMode = 'month' | 'week' | 'day';

const CronogramaPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [events, setEvents] = useState<StudyEvent[]>([]);
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<StudyEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<Partial<StudyEvent>>({});
  const [newEvent, setNewEvent] = useState<Partial<StudyEvent>>({
    type: 'tarefa',
    color: 'bg-blue-500'
  });

  // Buscar compromissos do usuário
  const fetchCompromissos = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('compromissos_rev')
        .select('*')
        .eq('user', user.id)
        .order('data_sugerida', { ascending: true });

      if (error) throw error;

      setCompromissos(data || []);
      
      // Converter compromissos para eventos do calendário (apenas tipo tarefa)
      const eventsFromCompromissos = (data || [])
        .filter((comp: any) => comp.tipo === 'tarefa')
        .map((comp: any) => ({
          id: comp.id.toString(),
          title: comp.nome,
          description: 'Tarefa agendada',
          date: comp.data_sugerida,
          time: '09:00', // Horário padrão
          duration: 60, // Duração padrão
          type: 'tarefa' as const,
          subject: 'Tarefa',
          color: comp.finalizado ? 'bg-gray-400' : getEventTypeColor('tarefa'),
          compromisso_id: comp.id
        }));

      setEvents(eventsFromCompromissos);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar cronograma",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar compromissos ao montar o componente
  useEffect(() => {
    fetchCompromissos();
  }, [user]);

  // Função para obter os dias do mês atual
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Dias do mês anterior para completar a primeira semana
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }
    
    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Dias do próximo mês para completar a última semana
    const remainingDays = 42 - days.length; // 6 semanas * 7 dias
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days;
  };

  // Função para obter eventos de um dia específico
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  // Navegação do calendário
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        newDate.setDate(newDate.getDate() + 7);
      }
      return newDate;
    });
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 1);
      } else {
        newDate.setDate(newDate.getDate() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Função para adicionar novo evento
  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date || !user) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      // Salvar no Supabase
      const { data, error } = await supabase
        .from('compromissos_rev')
        .insert([
          {
            nome: newEvent.title,
            tipo: 'tarefa' as any,
            data_sugerida: newEvent.date,
            finalizado: false,
            user: user.id
          }
        ] as any)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tarefa adicionada ao cronograma",
        variant: "default"
      });

      // Recarregar compromissos
      await fetchCompromissos();
      
      setNewEvent({ type: 'tarefa', color: 'bg-blue-500' });
      setShowAddEvent(false);
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar tarefa",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Função para marcar/desmarcar tarefa como concluída
  const toggleTaskCompletion = async (compromissoId: number, currentStatus: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('compromissos_rev')
        .update({ finalizado: !currentStatus })
        .eq('id', compromissoId)
        .eq('user', user.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: currentStatus ? "Tarefa desmarcada como concluída" : "Tarefa marcada como concluída",
        variant: "default"
      });

      // Recarregar compromissos
      await fetchCompromissos();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Função para editar tarefa
  const handleEditEvent = async () => {
    if (!editingEvent.title || !editingEvent.date || !selectedEvent?.compromisso_id || !user) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('compromissos_rev')
        .update({
          nome: editingEvent.title,
          data_sugerida: editingEvent.date
        })
        .eq('id', selectedEvent.compromisso_id)
        .eq('user', user.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tarefa atualizada com sucesso",
        variant: "default"
      });

      // Recarregar compromissos
      await fetchCompromissos();
      
      setShowEditEvent(false);
      setSelectedEvent(null);
      setEditingEvent({});
    } catch (error: any) {
      toast({
        title: "Erro ao editar tarefa",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Função para deletar tarefa
  const handleDeleteEvent = async () => {
    if (!selectedEvent?.compromisso_id || !user) return;

    try {
      const { error } = await supabase
        .from('compromissos_rev')
        .delete()
        .eq('id', selectedEvent.compromisso_id)
        .eq('user', user.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Tarefa removida do cronograma",
        variant: "default"
      });

      // Recarregar compromissos
      await fetchCompromissos();
      
      setShowDeleteDialog(false);
      setSelectedEvent(null);
    } catch (error: any) {
      toast({
        title: "Erro ao remover tarefa",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Função para obter o compromisso original pelo ID
  const getCompromissoById = (compromissoId: number) => {
    return compromissos.find(comp => comp.id === compromissoId);
  };

  // Função para abrir dialog de edição
  const openEditDialog = (event: StudyEvent) => {
    setSelectedEvent(event);
    setEditingEvent({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time
    });
    setShowEditEvent(true);
  };

  // Função para abrir dialog de exclusão
  const openDeleteDialog = (event: StudyEvent) => {
    setSelectedEvent(event);
    setShowDeleteDialog(true);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long'
    });
  };

  const formatWeekRange = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return `${startOfWeek.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - ${endOfWeek.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  };

  const formatDayDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'tarefa': return <BookOpen className="w-3 h-3" />;
      case 'revisao_base': return <Brain className="w-3 h-3" />;
      case 'revisao_ia': return <Target className="w-3 h-3" />;
      default: return <CalendarIcon className="w-3 h-3" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'tarefa': return 'bg-blue-500';
      case 'revisao_base': return 'bg-purple-500';
      case 'revisao_ia': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Navegação de data */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (viewMode === 'month') navigateMonth('prev');
                else if (viewMode === 'week') navigateWeek('prev');
                else navigateDay('prev');
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" onClick={goToToday}>
              Hoje
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (viewMode === 'month') navigateMonth('next');
                else if (viewMode === 'week') navigateWeek('next');
                else navigateDay('next');
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Título da data */}
          <div className="text-2xl font-bold text-foreground">
            {viewMode === 'month' && formatDate(currentDate)}
            {viewMode === 'week' && formatWeekRange(currentDate)}
            {viewMode === 'day' && formatDayDate(currentDate)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Seletor de visualização */}
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className="rounded-r-none"
            >
              Mês
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className="rounded-none"
            >
              Semana
            </Button>
            <Button
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('day')}
              className="rounded-l-none"
            >
              Dia
            </Button>
          </div>

          {/* Botão adicionar evento */}
          <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
            <DialogTrigger asChild>
              <Button className="medcurso-gradient">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar evento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Evento de Estudo</DialogTitle>
                <DialogDescription>
                  Crie um novo evento no seu cronograma de estudos.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newEvent.title || ''}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Estudo de Cardiologia"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description || ''}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detalhes do estudo..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEvent.date || ''}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Horário</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newEvent.time || ''}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Input value="Tarefa" disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Apenas tarefas podem ser adicionadas manualmente. Revisões são geradas automaticamente.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddEvent(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddEvent}>
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendário */}
      <Card className="rounded-lg border bg-card">
        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Carregando cronograma...</span>
          </div>
        )}
        {!loading && viewMode === 'month' && (
          <div>
            {/* Cabeçalho dos dias da semana */}
            <div className="grid grid-cols-7 border-b">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Grade do calendário */}
            <div className="grid grid-cols-7">
              {getDaysInMonth(currentDate).map(({ date, isCurrentMonth }, index) => {
                const dayEvents = getEventsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={index}
                    className={cn(
                      "min-h-[120px] p-2 border-r border-b last:border-r-0",
                      !isCurrentMonth && "bg-muted/50 text-muted-foreground",
                      isToday && "bg-primary/5"
                    )}
                  >
                    <div className={cn(
                      "text-sm font-medium mb-1",
                      isToday && "text-primary font-bold"
                    )}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => {
                        const compromisso = event.compromisso_id ? getCompromissoById(event.compromisso_id) : null;
                        const isCompleted = compromisso?.finalizado || false;
                        
                        return (
                          <div key={event.id} className="group relative">
                            <div
                              className={cn(
                                "text-xs p-1 rounded text-white truncate cursor-pointer transition-all hover:shadow-md flex items-center justify-between",
                                event.color,
                                isCompleted && "opacity-60 line-through"
                              )}
                              title={`${event.title} - ${event.time}${isCompleted ? ' (Concluída)' : ''}`}
                              onClick={() => {
                                if (event.compromisso_id) {
                                  toggleTaskCompletion(event.compromisso_id, isCompleted);
                                }
                              }}
                            >
                              <span className="truncate flex-1">{event.title}</span>
                              {isCompleted && <Check className="w-3 h-3 ml-1 flex-shrink-0" />}
                            </div>
                            
                            {/* Menu de ações - aparece no hover */}
                            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 w-6 p-0 bg-white/90 hover:bg-white text-gray-700"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (event.compromisso_id) {
                                        toggleTaskCompletion(event.compromisso_id, isCompleted);
                                      }
                                    }}
                                  >
                                    {isCompleted ? (
                                      <>
                                        <X className="w-4 h-4 mr-2" />
                                        Desmarcar
                                      </>
                                    ) : (
                                      <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Concluir
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditDialog(event);
                                    }}
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openDeleteDialog(event);
                                    }}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Remover
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayEvents.length - 3} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!loading && viewMode === 'week' && (
          <div>
            {/* Cabeçalho da semana */}
            <div className="grid grid-cols-8 border-b">
              <div className="p-3"></div>
              {getWeekDays(currentDate).map((day, index) => {
                const isToday = day.toDateString() === new Date().toDateString();
                return (
                  <div key={index} className="p-3 text-center border-r last:border-r-0">
                    <div className="text-xs text-muted-foreground mb-1">
                      {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </div>
                    <div className={cn(
                      "text-lg font-medium",
                      isToday && "text-primary font-bold"
                    )}>
                      {day.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Grade horária */}
            <div className="grid grid-cols-8">
              {Array.from({ length: 12 }, (_, hour) => {
                const hourTime = hour + 8; // 8h às 19h
                return (
                  <React.Fragment key={hour}>
                    <div className="p-3 text-xs text-muted-foreground border-r border-b">
                      {hourTime.toString().padStart(2, '0')}:00
                    </div>
                    {getWeekDays(currentDate).map((day, dayIndex) => {
                      const dayEvents = getEventsForDate(day).filter(event => {
                        const eventHour = parseInt(event.time.split(':')[0]);
                        return eventHour === hourTime;
                      });
                      
                      return (
                        <div key={dayIndex} className="min-h-[60px] p-1 border-r border-b last:border-r-0">
                          {dayEvents.map((event) => {
                            const compromisso = event.compromisso_id ? getCompromissoById(event.compromisso_id) : null;
                            const isCompleted = compromisso?.finalizado || false;
                            
                            return (
                              <div key={event.id} className="group relative">
                                <div
                                  className={cn(
                                    "text-xs p-1 rounded text-white mb-1 cursor-pointer transition-all hover:shadow-md",
                                    event.color,
                                    isCompleted && "opacity-60 line-through"
                                  )}
                                  onClick={() => {
                                    if (event.compromisso_id) {
                                      toggleTaskCompletion(event.compromisso_id, isCompleted);
                                    }
                                  }}
                                >
                                  <div className="font-medium truncate flex items-center justify-between">
                                    <span className="truncate">{event.title}</span>
                                    {isCompleted && <Check className="w-3 h-3 ml-1 flex-shrink-0" />}
                                  </div>
                                  <div className="opacity-75">{event.time}</div>
                                </div>
                                
                                {/* Menu de ações */}
                                <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-5 w-5 p-0 bg-white/90 hover:bg-white text-gray-700"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <MoreVertical className="w-3 h-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                      <DropdownMenuItem 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (event.compromisso_id) {
                                            toggleTaskCompletion(event.compromisso_id, isCompleted);
                                          }
                                        }}
                                      >
                                        {isCompleted ? (
                                          <>
                                            <X className="w-4 h-4 mr-2" />
                                            Desmarcar
                                          </>
                                        ) : (
                                          <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Concluir
                                          </>
                                        )}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openEditDialog(event);
                                        }}
                                      >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Editar
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openDeleteDialog(event);
                                        }}
                                        className="text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Remover
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {!loading && viewMode === 'day' && (
          <div className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 12 }, (_, hour) => {
                const hourTime = hour + 8; // 8h às 19h
                const timeString = `${hourTime.toString().padStart(2, '0')}:00`;
                const dayEvents = getEventsForDate(currentDate).filter(event => {
                  const eventHour = parseInt(event.time.split(':')[0]);
                  return eventHour === hourTime;
                });

                return (
                  <div key={hour} className="flex gap-4">
                    <div className="w-16 text-sm text-muted-foreground pt-1">
                      {timeString}
                    </div>
                    <div className="flex-1 min-h-[60px] border-l-2 border-border pl-4">
                      {dayEvents.map((event) => {
                        const compromisso = event.compromisso_id ? getCompromissoById(event.compromisso_id) : null;
                        const isCompleted = compromisso?.finalizado || false;
                        
                        return (
                          <div key={event.id} className="group relative">
                            <div
                              className={cn(
                                "p-3 rounded-lg mb-2 text-white cursor-pointer transition-all hover:shadow-lg",
                                event.color,
                                isCompleted && "opacity-60"
                              )}
                              onClick={() => {
                                if (event.compromisso_id) {
                                  toggleTaskCompletion(event.compromisso_id, isCompleted);
                                }
                              }}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                {getEventTypeIcon(event.type)}
                                <span className={cn("font-medium flex-1", isCompleted && "line-through")}>
                                  {event.title}
                                </span>
                                {isCompleted && <Check className="w-4 h-4" />}
                                <Badge variant="secondary" className="text-xs">
                                  {event.duration}min
                                </Badge>
                              </div>
                              {event.description && (
                                <div className={cn("text-sm opacity-90", isCompleted && "line-through")}>
                                  {event.description}
                                </div>
                              )}
                              {event.subject && (
                                <div className="text-xs opacity-75 mt-1">{event.subject}</div>
                              )}
                            </div>
                            
                            {/* Menu de ações */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30 text-white"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (event.compromisso_id) {
                                        toggleTaskCompletion(event.compromisso_id, isCompleted);
                                      }
                                    }}
                                  >
                                    {isCompleted ? (
                                      <>
                                        <X className="w-4 h-4 mr-2" />
                                        Desmarcar
                                      </>
                                    ) : (
                                      <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Concluir
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEditDialog(event);
                                    }}
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openDeleteDialog(event);
                                    }}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Remover
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Dialog para editar evento */}
      <Dialog open={showEditEvent} onOpenChange={setShowEditEvent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
            <DialogDescription>
              Faça as alterações necessárias na sua tarefa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Título</Label>
              <Input
                id="edit-title"
                value={editingEvent.title || ''}
                onChange={(e) => setEditingEvent(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Estudo de Cardiologia"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={editingEvent.description || ''}
                onChange={(e) => setEditingEvent(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detalhes do estudo..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-date">Data</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editingEvent.date || ''}
                  onChange={(e) => setEditingEvent(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-time">Horário</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={editingEvent.time || ''}
                  onChange={(e) => setEditingEvent(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditEvent(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditEvent}>
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação para deletar */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Tarefa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover a tarefa "{selectedEvent?.title}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteEvent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CronogramaPage; 