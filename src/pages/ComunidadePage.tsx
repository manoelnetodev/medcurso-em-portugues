import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  MessageCircle, 
  Plus, 
  Search, 
  Heart, 
  Reply, 
  Trash2, 
  Edit, 
  Send,
  Filter,
  Clock,
  User,
  BookOpen
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ComunidadePost {
  id: number;
  titulo: string;
  descricao: string;
  comunidade_categoria: string;
  qtd_comentarios: number;
  user: string;
  created_at: string;
  // Dados do usuário (JOIN)
  user_profile?: {
    name: string;
    avatar_url?: string;
  } | any;
}

interface ComunidadeComentario {
  id: number;
  texto: string;
  user_id: string;
  post: number;
  created_at: string;
  // Dados do usuário (JOIN)
  user_profile?: {
    name: string;
    avatar_url?: string;
  } | any;
}

const categorias = [
  { value: 'avisos', label: '📢 Avisos' },
  { value: 'cirurgia', label: '🔪 Cirurgia' },
  { value: 'clinica_medica', label: '🩺 Clínica Médica' },
  { value: 'ginecologia_obstetricia', label: '👶 Ginecologia e Obstetrícia' },
  { value: 'pediatria', label: '🧸 Pediatria' },
  { value: 'preventiva', label: '🛡️ Medicina Preventiva' },
  { value: 'provas', label: '📝 Provas e Concursos' },
  { value: 'feedback', label: '💬 Feedback' },
];

export function ComunidadePage() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const [posts, setPosts] = useState<ComunidadePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ComunidadePost | null>(null);
  const [comentarios, setComentarios] = useState<ComunidadeComentario[]>([]);
  const [isCommentsDialogOpen, setIsCommentsDialogOpen] = useState(false);

  // Estado para novo post
  const [newPost, setNewPost] = useState({
    titulo: '',
    descricao: '',
    comunidade_categoria: 'avisos'
  });

  // Estado para novo comentário
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, searchTerm]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Buscar posts primeiro
      let query = supabase
        .from('comunidade_post')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'todas') {
        query = query.eq('comunidade_categoria', selectedCategory as any);
      }

      if (searchTerm) {
        query = query.or(`titulo.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%`);
      }

      const { data: postsData, error: postsError } = await query;

      if (postsError) {
        console.error('Erro ao buscar posts:', postsError);
        throw postsError;
      }

      // Buscar profiles dos usuários
      if (postsData && postsData.length > 0) {
        const userIds = [...new Set(postsData.map(post => post.user))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('user_profile')
          .select('user_id, name, avatar_url')
          .in('user_id', userIds);

        if (profilesError) {
          console.error('Erro ao buscar profiles:', profilesError);
        }

        // Combinar dados
        const postsWithProfiles = postsData.map(post => ({
          ...post,
          user_profile: profilesData?.find(profile => profile.user_id === post.user) || null
        }));

        setPosts(postsWithProfiles);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os posts da comunidade.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.titulo.trim() || !newPost.descricao.trim()) {
      toast({
        title: "Erro",
        description: "Título e descrição são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('comunidade_post')
        .insert({
          titulo: newPost.titulo,
          descricao: newPost.descricao,
          comunidade_categoria: newPost.comunidade_categoria as any,
          user: user?.id,
          qtd_comentarios: 0
        } as any)
        .select()
        .single();

      if (error) throw error;

      setNewPost({ titulo: '', descricao: '', comunidade_categoria: 'avisos' });
      setIsCreateDialogOpen(false);
      fetchPosts(); // Recarregar posts

      toast({
        title: "Sucesso",
        description: "Post criado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao criar post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o post.",
        variant: "destructive"
      });
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;

    try {
      // Primeiro deletar comentários associados
      await supabase
        .from('comunidade_comentario')
        .delete()
        .eq('post', postId);

      // Depois deletar o post
      const { error } = await supabase
        .from('comunidade_post')
        .delete()
        .eq('id', postId)
        .eq('user', user?.id); // Garantir que só o autor pode deletar

      if (error) throw error;

      fetchPosts(); // Recarregar posts
      toast({
        title: "Sucesso",
        description: "Post excluído com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o post.",
        variant: "destructive"
      });
    }
  };

  const openCommentsDialog = async (post: ComunidadePost) => {
    setSelectedPost(post);
    setIsCommentsDialogOpen(true);
    
    try {
      // Buscar comentários primeiro
      const { data: commentsData, error: commentsError } = await supabase
        .from('comunidade_comentario')
        .select('*')
        .eq('post', post.id)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // Buscar profiles dos usuários dos comentários
      if (commentsData && commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map(comment => comment.user_id))];
        const { data: profilesData, error: profilesError } = await supabase
          .from('user_profile')
          .select('user_id, name, avatar_url')
          .in('user_id', userIds);

        if (profilesError) {
          console.error('Erro ao buscar profiles dos comentários:', profilesError);
        }

        // Combinar dados
        const commentsWithProfiles = commentsData.map(comment => ({
          ...comment,
          user_profile: profilesData?.find(profile => profile.user_id === comment.user_id) || null
        }));

        setComentarios(commentsWithProfiles);
      } else {
        setComentarios([]);
      }
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim() || !selectedPost) return;

    try {
      const { error } = await supabase
        .from('comunidade_comentario')
        .insert({
          texto: newComment,
          user_id: user?.id,
          post: selectedPost.id
        });

      if (error) throw error;

      // Atualizar contador de comentários
      await supabase
        .from('comunidade_post')
        .update({ 
          qtd_comentarios: (selectedPost.qtd_comentarios || 0) + 1 
        })
        .eq('id', selectedPost.id);

      setNewComment('');
      openCommentsDialog(selectedPost); // Recarregar comentários
      fetchPosts(); // Recarregar posts para atualizar contador

      toast({
        title: "Sucesso",
        description: "Comentário enviado!",
      });
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o comentário.",
        variant: "destructive"
      });
    }
  };

  const getCategoryBadgeColor = (categoria: string) => {
    const colors: Record<string, string> = {
      'avisos': 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30',
      'cirurgia': 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30',
      'clinica_medica': 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30',
      'ginecologia_obstetricia': 'bg-pink-500/10 text-pink-600 border-pink-500/20 dark:bg-pink-500/20 dark:text-pink-400 dark:border-pink-500/30',
      'pediatria': 'bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30',
      'preventiva': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30',
      'provas': 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30',
      'feedback': 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30'
    };
    return colors[categoria] || 'bg-gray-500/10 text-gray-600 border-gray-500/20 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500/30';
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Botão Nova Publicação */}
      <div className="flex justify-end">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Publicação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Nova Publicação</DialogTitle>
              <DialogDescription>
                Compartilhe sua dúvida com a comunidade
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Título da sua publicação..."
                value={newPost.titulo}
                onChange={(e) => setNewPost(prev => ({ ...prev, titulo: e.target.value }))}
              />
              <Select
                value={newPost.comunidade_categoria}
                onValueChange={(value) => setNewPost(prev => ({ ...prev, comunidade_categoria: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Descreva sua dúvida em detalhes..."
                value={newPost.descricao}
                onChange={(e) => setNewPost(prev => ({ ...prev, descricao: e.target.value }))}
                rows={4}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreatePost}>
                  Publicar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar publicações..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            {categorias.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Posts */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 w-48 bg-muted rounded mb-2"></div>
                    <div className="h-3 w-24 bg-muted rounded"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-4 w-full bg-muted rounded mb-2"></div>
                <div className="h-4 w-3/4 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhuma publicação encontrada.' : 'Seja o primeiro a compartilhar uma dúvida!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.user_profile?.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {(post.user_profile?.name || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{post.user_profile?.name || 'Usuário'}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(post.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  {post.user === user?.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDeletePost(post.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{post.titulo}</h3>
                  <div 
                    className="text-muted-foreground text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: post.descricao }}
                  />
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 h-8"
                      onClick={() => openCommentsDialog(post)}
                    >
                      <Reply className="h-4 w-4" />
                      {post.qtd_comentarios || 0} comentários
                    </Button>
                  </div>
                  
                  <Badge variant="outline" className={getCategoryBadgeColor(post.comunidade_categoria || 'avisos')}>
                    {categorias.find(cat => cat.value === post.comunidade_categoria)?.label || post.comunidade_categoria}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de Comentários */}
      <Dialog open={isCommentsDialogOpen} onOpenChange={setIsCommentsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-left">{selectedPost?.titulo}</DialogTitle>
            <div className="text-left text-muted-foreground">
              <div 
                className="text-sm"
                dangerouslySetInnerHTML={{ __html: selectedPost?.descricao || '' }}
              />
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4">
            {comentarios.map((comentario) => (
              <div key={comentario.id} className="flex gap-3 p-3 rounded-lg bg-muted/30">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={comentario.user_profile?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {(comentario.user_profile?.name || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{comentario.user_profile?.name || 'Usuário'}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(comentario.created_at)}
                    </span>
                  </div>
                  <div 
                    className="text-sm text-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: comentario.texto }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 pt-4 border-t">
            <Textarea
              placeholder="Escreva seu comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="flex-1"
            />
            <Button onClick={handleSendComment} className="self-end">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 