import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Importar componentes de Avatar
import { CrownIcon } from 'lucide-react'; // Importar ícone de coroa

interface RankingEntry {
  rank: number;
  username: string;
  total_answered: number;
  user_id: string;
  avatar_url?: string | null; // Adicionado para a URL do avatar
}

const RankingPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('today');
  const [rankingData, setRankingData] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRanking = useCallback(async (timeframe: string) => {
    setLoading(true);
    let startDate: Date | null = null;
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset time to start of day for accurate date comparisons

    switch (timeframe) {
      case 'today':
        startDate = now;
        break;
      case '7days':
        startDate = new Date(now.setDate(now.getDate() - 6)); // Today - 6 days = last 7 days including today
        break;
      case '14days':
        startDate = new Date(now.setDate(now.getDate() - 13)); // Today - 13 days = last 14 days including today
        break;
      case '30days':
        startDate = new Date(now.setDate(now.getDate() - 29)); // Today - 29 days = last 30 days including today
        break;
      case 'alltime':
      default:
        startDate = null; // No start date for all time
        break;
    }

    try {
      // Querying the 'resposta_lista' table
      let query = supabase
        .from('resposta_lista')
        .select('user_id, data_resposta, respondeu')
        .eq('respondeu', true); // Only count questions that were actually answered

      if (startDate) {
        query = query.gte('data_resposta', startDate.toISOString());
      }

      const { data: responses, error: responsesError } = await query;

      if (responsesError) {
        throw responsesError;
      }

      // Aggregate responses by user_id
      const userResponseCounts = new Map<string, number>();
      responses.forEach(response => {
        if (response.user_id) { // Ensure user_id is not null
          userResponseCounts.set(response.user_id, (userResponseCounts.get(response.user_id) || 0) + 1);
        }
      });

      // Fetch user profiles for usernames and avatars from 'user_profile' table
      const userIds = Array.from(userResponseCounts.keys());
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profile')
        .select('user_id, name, avatar_url') // CORRIGIDO: Selecionar 'user_id', 'name' e 'avatar_url'
        .in('user_id', userIds);

      if (profilesError) {
        throw profilesError;
      }

      const profileMap = new Map<string, { name: string, avatar_url: string | null }>();
      profiles.forEach(profile => {
        if (profile.user_id && profile.name) {
          profileMap.set(profile.user_id, { name: profile.name, avatar_url: profile.avatar_url });
        }
      });

      // Combine and sort for ranking
      const rawRanking = Array.from(userResponseCounts.entries()).map(([userId, count]) => {
        const profileInfo = profileMap.get(userId);
        return {
          user_id: userId,
          username: profileInfo?.name || 'Usuário Desconhecido',
          total_answered: count,
          avatar_url: profileInfo?.avatar_url || null,
        };
      });

      rawRanking.sort((a, b) => b.total_answered - a.total_answered);

      // Take top 10 and add rank
      const top10Ranking = rawRanking.slice(0, 10).map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

      setRankingData(top10Ranking);

    } catch (error: any) {
      console.error('Erro ao buscar ranking:', error.message);
      toast({
        title: "Erro",
        description: `Não foi possível carregar o ranking: ${error.message}`,
        variant: "destructive",
      });
      setRankingData([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRanking(activeTab);
  }, [activeTab, fetchRanking]);

  return (
    <div className="flex flex-col h-full space-y-6">{/* Removido título redundante */}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="today">Hoje</TabsTrigger>
          <TabsTrigger value="7days">Últimos 7 Dias</TabsTrigger>
          <TabsTrigger value="14days">Últimos 14 Dias</TabsTrigger>
          <TabsTrigger value="30days">Últimos 30 Dias</TabsTrigger>
          <TabsTrigger value="alltime">Sempre</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Top 10 Alunos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Posição</TableHead>
                <TableHead className="w-[60px]">Foto</TableHead> {/* Nova coluna para foto */}
                <TableHead>Aluno</TableHead>
                <TableHead className="text-right">Questões Respondidas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell> {/* Skeleton para foto */}
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : rankingData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground"> {/* Colspan ajustado */}
                    Nenhum dado de ranking encontrado para este período.
                  </TableCell>
                </TableRow>
              ) : (
                rankingData.map((entry) => (
                  <TableRow key={entry.user_id}>
                    <TableCell className="font-medium">{entry.rank}º</TableCell>
                    <TableCell>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={entry.avatar_url || undefined} alt={entry.username} />
                        <AvatarFallback>{entry.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      {entry.rank === 1 && (
                        <CrownIcon className="h-5 w-5 text-yellow-400 fill-yellow-400" /> // Coroa para o 1º lugar
                      )}
                      {entry.username}
                    </TableCell>
                    <TableCell className="text-right">{entry.total_answered}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RankingPage;
