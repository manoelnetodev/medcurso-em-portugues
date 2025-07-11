export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      alternativas: {
        Row: {
          alternativa_txt: string | null
          comentario: string | null
          comentario_validado: boolean | null
          correta: boolean | null
          created_at: string
          id: number
          imagens: string[] | null
          questao: number | null
        }
        Insert: {
          alternativa_txt?: string | null
          comentario?: string | null
          comentario_validado?: boolean | null
          correta?: boolean | null
          created_at?: string
          id?: number
          imagens?: string[] | null
          questao?: number | null
        }
        Update: {
          alternativa_txt?: string | null
          comentario?: string | null
          comentario_validado?: boolean | null
          correta?: boolean | null
          created_at?: string
          id?: number
          imagens?: string[] | null
          questao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "alternativas_questao_fkey"
            columns: ["questao"]
            isOneToOne: false
            referencedRelation: "comentarios_pendentes_validacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alternativas_questao_fkey"
            columns: ["questao"]
            isOneToOne: false
            referencedRelation: "questoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alternativas_questao_fkey"
            columns: ["questao"]
            isOneToOne: false
            referencedRelation: "questoes_sem_classificacao"
            referencedColumns: ["id"]
          },
        ]
      }
      assunto: {
        Row: {
          categoria: number | null
          created_at: string
          id: number
          nome: string | null
          subcategoria: number | null
          tempo_de_aula: number | null
        }
        Insert: {
          categoria?: number | null
          created_at?: string
          id: number
          nome?: string | null
          subcategoria?: number | null
          tempo_de_aula?: number | null
        }
        Update: {
          categoria?: number | null
          created_at?: string
          id?: number
          nome?: string | null
          subcategoria?: number | null
          tempo_de_aula?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assunto_categoria_fkey"
            columns: ["categoria"]
            isOneToOne: false
            referencedRelation: "categoria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assunto_subcategoria_fkey"
            columns: ["subcategoria"]
            isOneToOne: false
            referencedRelation: "subcategoria"
            referencedColumns: ["id"]
          },
        ]
      }
      categoria: {
        Row: {
          abrev: string | null
          cor_background: string | null
          created_at: string
          id: number
          nome: string | null
        }
        Insert: {
          abrev?: string | null
          cor_background?: string | null
          created_at?: string
          id?: number
          nome?: string | null
        }
        Update: {
          abrev?: string | null
          cor_background?: string | null
          created_at?: string
          id?: number
          nome?: string | null
        }
        Relationships: []
      }
      compromissos_rev: {
        Row: {
          assunto: number | null
          categoria: number | null
          created_at: string
          data_realizada: string | null
          data_sugerida: string | null
          finalizado: boolean | null
          id: number
          nome: string | null
          revisao_espacada:
            | Database["public"]["Enums"]["revisao_espacada"]
            | null
          subcategoria: number | null
          tipo: Database["public"]["Enums"]["tipo_de_revisao"] | null
          user: string | null
        }
        Insert: {
          assunto?: number | null
          categoria?: number | null
          created_at?: string
          data_realizada?: string | null
          data_sugerida?: string | null
          finalizado?: boolean | null
          id?: number
          nome?: string | null
          revisao_espacada?:
            | Database["public"]["Enums"]["revisao_espacada"]
            | null
          subcategoria?: number | null
          tipo?: Database["public"]["Enums"]["tipo_de_revisao"] | null
          user?: string | null
        }
        Update: {
          assunto?: number | null
          categoria?: number | null
          created_at?: string
          data_realizada?: string | null
          data_sugerida?: string | null
          finalizado?: boolean | null
          id?: number
          nome?: string | null
          revisao_espacada?:
            | Database["public"]["Enums"]["revisao_espacada"]
            | null
          subcategoria?: number | null
          tipo?: Database["public"]["Enums"]["tipo_de_revisao"] | null
          user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compromissos_rev_assunto_fkey"
            columns: ["assunto"]
            isOneToOne: false
            referencedRelation: "assunto"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compromissos_rev_assunto_fkey"
            columns: ["assunto"]
            isOneToOne: false
            referencedRelation: "v_qtd_questoes_por_assunto"
            referencedColumns: ["assunto_id"]
          },
          {
            foreignKeyName: "compromissos_rev_categoria_fkey"
            columns: ["categoria"]
            isOneToOne: false
            referencedRelation: "categoria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compromissos_rev_subcategoria_fkey"
            columns: ["subcategoria"]
            isOneToOne: false
            referencedRelation: "subcategoria"
            referencedColumns: ["id"]
          },
        ]
      }
      comunidade_comentario: {
        Row: {
          created_at: string
          id: number
          post: number | null
          texto: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          post?: number | null
          texto?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          post?: number | null
          texto?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comentario_post_fkey"
            columns: ["post"]
            isOneToOne: false
            referencedRelation: "comunidade_post"
            referencedColumns: ["id"]
          },
        ]
      }
      comunidade_post: {
        Row: {
          comunidade_categoria:
            | Database["public"]["Enums"]["comunidade_categoria"]
            | null
          created_at: string
          descricao: string | null
          id: number
          id_flashcard: number | null
          id_questao: number | null
          qtd_comentarios: number | null
          titulo: string | null
          titulo_questao: string | null
          user: string | null
        }
        Insert: {
          comunidade_categoria?:
            | Database["public"]["Enums"]["comunidade_categoria"]
            | null
          created_at?: string
          descricao?: string | null
          id?: number
          id_flashcard?: number | null
          id_questao?: number | null
          qtd_comentarios?: number | null
          titulo?: string | null
          titulo_questao?: string | null
          user?: string | null
        }
        Update: {
          comunidade_categoria?:
            | Database["public"]["Enums"]["comunidade_categoria"]
            | null
          created_at?: string
          descricao?: string | null
          id?: number
          id_flashcard?: number | null
          id_questao?: number | null
          qtd_comentarios?: number | null
          titulo?: string | null
          titulo_questao?: string | null
          user?: string | null
        }
        Relationships: []
      }
      cronograma_base: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      disciplinas: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      instituicoes: {
        Row: {
          created_at: string
          desabilitada: boolean | null
          id: number
          nome: string | null
          nome_g: string | null
          uf: Database["public"]["Enums"]["UF"] | null
        }
        Insert: {
          created_at?: string
          desabilitada?: boolean | null
          id?: number
          nome?: string | null
          nome_g?: string | null
          uf?: Database["public"]["Enums"]["UF"] | null
        }
        Update: {
          created_at?: string
          desabilitada?: boolean | null
          id?: number
          nome?: string | null
          nome_g?: string | null
          uf?: Database["public"]["Enums"]["UF"] | null
        }
        Relationships: []
      }
      lista: {
        Row: {
          criado_em: string | null
          finalizada: boolean | null
          id: number
          nome: string | null
          porcentagem_acertos: number | null
          porcentagem_estudada: number | null
          prova: number | null
          qtd_acertos: number | null
          qtd_erros: number | null
          tipo_lista: Database["public"]["Enums"]["tipo_lista"] | null
          total_questoes: number | null
          total_respondidas: number | null
          user: string | null
        }
        Insert: {
          criado_em?: string | null
          finalizada?: boolean | null
          id?: never
          nome?: string | null
          porcentagem_acertos?: number | null
          porcentagem_estudada?: number | null
          prova?: number | null
          qtd_acertos?: number | null
          qtd_erros?: number | null
          tipo_lista?: Database["public"]["Enums"]["tipo_lista"] | null
          total_questoes?: number | null
          total_respondidas?: number | null
          user?: string | null
        }
        Update: {
          criado_em?: string | null
          finalizada?: boolean | null
          id?: never
          nome?: string | null
          porcentagem_acertos?: number | null
          porcentagem_estudada?: number | null
          prova?: number | null
          qtd_acertos?: number | null
          qtd_erros?: number | null
          tipo_lista?: Database["public"]["Enums"]["tipo_lista"] | null
          total_questoes?: number | null
          total_respondidas?: number | null
          user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lista_prova_fkey"
            columns: ["prova"]
            isOneToOne: false
            referencedRelation: "estatisticas_provas"
            referencedColumns: ["prova_id"]
          },
          {
            foreignKeyName: "lista_prova_fkey"
            columns: ["prova"]
            isOneToOne: false
            referencedRelation: "provas"
            referencedColumns: ["id"]
          },
        ]
      }
      mural_de_informacoes: {
        Row: {
          created_at: string
          data: string | null
          id: number
          info: string | null
        }
        Insert: {
          created_at?: string
          data?: string | null
          id?: number
          info?: string | null
        }
        Update: {
          created_at?: string
          data?: string | null
          id?: number
          info?: string | null
        }
        Relationships: []
      }
      notificacao: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      preset: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string | null
          domingo: number | null
          id: number
          quarta: number | null
          quinta: number | null
          sabado: number | null
          segunda: number | null
          sexta: number | null
          terca: number | null
          user: string | null
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          domingo?: number | null
          id?: number
          quarta?: number | null
          quinta?: number | null
          sabado?: number | null
          segunda?: number | null
          sexta?: number | null
          terca?: number | null
          user?: string | null
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string | null
          domingo?: number | null
          id?: number
          quarta?: number | null
          quinta?: number | null
          sabado?: number | null
          segunda?: number | null
          sexta?: number | null
          terca?: number | null
          user?: string | null
        }
        Relationships: []
      }
      provas: {
        Row: {
          ano: number | null
          banca_id: number | null
          bloqueada: boolean | null
          created_at: string | null
          id: number
          id_qs: number[] | null
          instituicao: number | null
          nome: string | null
          qtd_questoes: number | null
          tipo_de_foco: Database["public"]["Enums"]["tipo_de_foco"] | null
          uf: Database["public"]["Enums"]["UF"] | null
        }
        Insert: {
          ano?: number | null
          banca_id?: number | null
          bloqueada?: boolean | null
          created_at?: string | null
          id?: number
          id_qs?: number[] | null
          instituicao?: number | null
          nome?: string | null
          qtd_questoes?: number | null
          tipo_de_foco?: Database["public"]["Enums"]["tipo_de_foco"] | null
          uf?: Database["public"]["Enums"]["UF"] | null
        }
        Update: {
          ano?: number | null
          banca_id?: number | null
          bloqueada?: boolean | null
          created_at?: string | null
          id?: number
          id_qs?: number[] | null
          instituicao?: number | null
          nome?: string | null
          qtd_questoes?: number | null
          tipo_de_foco?: Database["public"]["Enums"]["tipo_de_foco"] | null
          uf?: Database["public"]["Enums"]["UF"] | null
        }
        Relationships: [
          {
            foreignKeyName: "provas_instituicao_fkey"
            columns: ["instituicao"]
            isOneToOne: false
            referencedRelation: "instituicoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provas_instituicao_fkey"
            columns: ["instituicao"]
            isOneToOne: false
            referencedRelation: "instituicoes_with_provas_count"
            referencedColumns: ["id"]
          },
        ]
      }
      questoes: {
        Row: {
          alternativa_Correta: number | null
          ano: Database["public"]["Enums"]["ano"] | null
          anulada: boolean | null
          assunto: number | null
          categoria: number | null
          comentario: string | null
          comentario_validado: boolean | null
          created_at: string
          dif_q: Database["public"]["Enums"]["dif_q"] | null
          discursiva: boolean | null
          enunciado: string | null
          foco: Database["public"]["Enums"]["tipo_de_foco"] | null
          id: number
          imagens_enunciado: string[] | null
          instituicao: number | null
          numero: number | null
          percentual_acertos: number | null
          prova: number | null
          subcategoria: number | null
          updated_at: string | null
        }
        Insert: {
          alternativa_Correta?: number | null
          ano?: Database["public"]["Enums"]["ano"] | null
          anulada?: boolean | null
          assunto?: number | null
          categoria?: number | null
          comentario?: string | null
          comentario_validado?: boolean | null
          created_at?: string
          dif_q?: Database["public"]["Enums"]["dif_q"] | null
          discursiva?: boolean | null
          enunciado?: string | null
          foco?: Database["public"]["Enums"]["tipo_de_foco"] | null
          id: number
          imagens_enunciado?: string[] | null
          instituicao?: number | null
          numero?: number | null
          percentual_acertos?: number | null
          prova?: number | null
          subcategoria?: number | null
          updated_at?: string | null
        }
        Update: {
          alternativa_Correta?: number | null
          ano?: Database["public"]["Enums"]["ano"] | null
          anulada?: boolean | null
          assunto?: number | null
          categoria?: number | null
          comentario?: string | null
          comentario_validado?: boolean | null
          created_at?: string
          dif_q?: Database["public"]["Enums"]["dif_q"] | null
          discursiva?: boolean | null
          enunciado?: string | null
          foco?: Database["public"]["Enums"]["tipo_de_foco"] | null
          id?: number
          imagens_enunciado?: string[] | null
          instituicao?: number | null
          numero?: number | null
          percentual_acertos?: number | null
          prova?: number | null
          subcategoria?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questoes_instituicao_fkey"
            columns: ["instituicao"]
            isOneToOne: false
            referencedRelation: "instituicoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questoes_instituicao_fkey"
            columns: ["instituicao"]
            isOneToOne: false
            referencedRelation: "instituicoes_with_provas_count"
            referencedColumns: ["id"]
          },
        ]
      }
      resposta_lista: {
        Row: {
          acertou: boolean | null
          alternativa_select: number | null
          anulada: boolean | null
          assunto: number | null
          categoria: number | null
          created_at: string
          data_resposta: string | null
          dificuldade: Database["public"]["Enums"]["dif_q"] | null
          discursiva: boolean | null
          estudou: boolean | null
          id: number
          lista: number | null
          motivo_erro: Database["public"]["Enums"]["motivo_erro"] | null
          numero: number | null
          questao: number | null
          respondeu: boolean | null
          resposta_txt: string | null
          subcategoria: number | null
          user_id: string | null
        }
        Insert: {
          acertou?: boolean | null
          alternativa_select?: number | null
          anulada?: boolean | null
          assunto?: number | null
          categoria?: number | null
          created_at?: string
          data_resposta?: string | null
          dificuldade?: Database["public"]["Enums"]["dif_q"] | null
          discursiva?: boolean | null
          estudou?: boolean | null
          id?: number
          lista?: number | null
          motivo_erro?: Database["public"]["Enums"]["motivo_erro"] | null
          numero?: number | null
          questao?: number | null
          respondeu?: boolean | null
          resposta_txt?: string | null
          subcategoria?: number | null
          user_id?: string | null
        }
        Update: {
          acertou?: boolean | null
          alternativa_select?: number | null
          anulada?: boolean | null
          assunto?: number | null
          categoria?: number | null
          created_at?: string
          data_resposta?: string | null
          dificuldade?: Database["public"]["Enums"]["dif_q"] | null
          discursiva?: boolean | null
          estudou?: boolean | null
          id?: number
          lista?: number | null
          motivo_erro?: Database["public"]["Enums"]["motivo_erro"] | null
          numero?: number | null
          questao?: number | null
          respondeu?: boolean | null
          resposta_txt?: string | null
          subcategoria?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resposta_lista_lista_fkey"
            columns: ["lista"]
            isOneToOne: false
            referencedRelation: "lista"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resposta_lista_questao_fkey"
            columns: ["questao"]
            isOneToOne: false
            referencedRelation: "comentarios_pendentes_validacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resposta_lista_questao_fkey"
            columns: ["questao"]
            isOneToOne: false
            referencedRelation: "questoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resposta_lista_questao_fkey"
            columns: ["questao"]
            isOneToOne: false
            referencedRelation: "questoes_sem_classificacao"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategoria: {
        Row: {
          categoria: number | null
          created_at: string
          id: number
          nome: string | null
        }
        Insert: {
          categoria?: number | null
          created_at?: string
          id: number
          nome?: string | null
        }
        Update: {
          categoria?: number | null
          created_at?: string
          id?: number
          nome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subcategoria_categoria_fkey"
            columns: ["categoria"]
            isOneToOne: false
            referencedRelation: "categoria"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profile: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          dt_nascimento: string | null
          email: string | null
          especialidade_principal:
            | Database["public"]["Enums"]["especialidades"]
            | null
          especialidades_secundarias:
            | Database["public"]["Enums"]["especialidades"][]
            | null
          foco: Database["public"]["Enums"]["tipo_de_foco"] | null
          id: number
          instagram: string | null
          instituicao_principal: number | null
          instituicoes_secundarias: number[] | null
          name: string | null
          onboarding_finalizado: boolean | null
          tipo_de_user: Database["public"]["Enums"]["tipo_de_user"] | null
          uid_gc: string | null
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          dt_nascimento?: string | null
          email?: string | null
          especialidade_principal?:
            | Database["public"]["Enums"]["especialidades"]
            | null
          especialidades_secundarias?:
            | Database["public"]["Enums"]["especialidades"][]
            | null
          foco?: Database["public"]["Enums"]["tipo_de_foco"] | null
          id?: never
          instagram?: string | null
          instituicao_principal?: number | null
          instituicoes_secundarias?: number[] | null
          name?: string | null
          onboarding_finalizado?: boolean | null
          tipo_de_user?: Database["public"]["Enums"]["tipo_de_user"] | null
          uid_gc?: string | null
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          dt_nascimento?: string | null
          email?: string | null
          especialidade_principal?:
            | Database["public"]["Enums"]["especialidades"]
            | null
          especialidades_secundarias?:
            | Database["public"]["Enums"]["especialidades"][]
            | null
          foco?: Database["public"]["Enums"]["tipo_de_foco"] | null
          id?: never
          instagram?: string | null
          instituicao_principal?: number | null
          instituicoes_secundarias?: number[] | null
          name?: string | null
          onboarding_finalizado?: boolean | null
          tipo_de_user?: Database["public"]["Enums"]["tipo_de_user"] | null
          uid_gc?: string | null
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profile_instituicao_principal_fkey"
            columns: ["instituicao_principal"]
            isOneToOne: false
            referencedRelation: "instituicoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profile_instituicao_principal_fkey"
            columns: ["instituicao_principal"]
            isOneToOne: false
            referencedRelation: "instituicoes_with_provas_count"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      comentarios_pendentes_validacao: {
        Row: {
          alternativa_Correta: number | null
          ano: Database["public"]["Enums"]["ano"] | null
          anulada: boolean | null
          assunto: number | null
          categoria: number | null
          comentario: string | null
          comentario_validado: boolean | null
          created_at: string | null
          dif_q: Database["public"]["Enums"]["dif_q"] | null
          discursiva: boolean | null
          enunciado: string | null
          foco: Database["public"]["Enums"]["tipo_de_foco"] | null
          id: number | null
          imagens_enunciado: string[] | null
          instituicao: number | null
          numero: number | null
          percentual_acertos: number | null
          prova: number | null
          subcategoria: number | null
        }
        Relationships: [
          {
            foreignKeyName: "provas_instituicao_fkey"
            columns: ["instituicao"]
            isOneToOne: false
            referencedRelation: "instituicoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provas_instituicao_fkey"
            columns: ["instituicao"]
            isOneToOne: false
            referencedRelation: "instituicoes_with_provas_count"
            referencedColumns: ["id"]
          },
        ]
      }
      comentarios_validados: {
        Row: {
          total_comentarios_nao_validados: number | null
          total_comentarios_validados: number | null
        }
        Relationships: []
      }
      estatisticas_provas: {
        Row: {
          inconsistencia: boolean | null
          prova: string | null
          prova_id: number | null
          qtd_alternativas: number | null
          qtd_discursivas: number | null
          qtd_objetivas: number | null
          qtd_q_total: number | null
        }
        Relationships: []
      }
      instituicoes_with_provas_count: {
        Row: {
          created_at: string | null
          desabilitada: boolean | null
          id: number | null
          nome: string | null
          nome_g: string | null
          provas_count: number | null
          uf: Database["public"]["Enums"]["UF"] | null
        }
        Relationships: []
      }
      questoes_sem_classificacao: {
        Row: {
          alternativa_correta: string | null
          alternativas_texto: string | null
          assunto: number | null
          categoria: number | null
          enunciado: string | null
          id: number | null
          subcategoria: number | null
        }
        Relationships: []
      }
      v_qtd_questoes_por_assunto: {
        Row: {
          assunto_id: number | null
          assunto_nome: string | null
          categoria: number | null
          subcategoria: number | null
          total_questoes: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assunto_categoria_fkey"
            columns: ["categoria"]
            isOneToOne: false
            referencedRelation: "categoria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assunto_subcategoria_fkey"
            columns: ["subcategoria"]
            isOneToOne: false
            referencedRelation: "subcategoria"
            referencedColumns: ["id"]
          },
        ]
      }
      v_qtd_questoes_por_assunto_bruto: {
        Row: {
          assunto_id: number | null
          assunto_nome: string | null
          total_questoes: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      acertos_por_categoria: {
        Args: { lista_id: number }
        Returns: {
          categoria: string
          acertos: number
          total: number
        }[]
      }
      analise_por_assunto_por_lista: {
        Args: { lista_id: number }
        Returns: {
          assunto_id: number
          nome: string
          acertos: number
          erros: number
          total: number
          percentual_acertos: number
          categoria: string
          subcategoria: string
        }[]
      }
      analise_por_assunto_por_usuario: {
        Args: { user_uid: string }
        Returns: {
          assunto_id: number
          nome: string
          acertos: number
          erros: number
          total: number
          percentual_acertos: number
          categoria: string
          subcategoria: string
        }[]
      }
      analise_questoes_por_assunto: {
        Args: { instituicoes: number[]; provas?: number[] }
        Returns: {
          assunto_id: number
          nome: string
          quantidade_questoes: number
          prevalencia_percentual: number
          categoria_nome: string
          subcategoria_nome: string
        }[]
      }
      get_complete_schema: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_posts_comunidade_paginated: {
        Args:
          | { p_limit?: number; p_offset?: number }
          | {
              p_limit?: number
              p_offset?: number
              p_comunidade_categoria?: string
            }
        Returns: Json
      }
      get_posts_comunidade_por_questao: {
        Args: { q_id: number }
        Returns: Json
      }
      get_prova_completa: {
        Args: { id_prova: number }
        Returns: Json
      }
      resumo_lista: {
        Args: { lista_id: number }
        Returns: {
          acertos: number
          erros: number
        }[]
      }
      teste_user_profile_insert: {
        Args: {
          p_user_id: string
          p_name: string
          p_avatar: string
          p_email: string
        }
        Returns: undefined
      }
    }
    Enums: {
      ano:
        | "2025"
        | "2024"
        | "2023"
        | "2022"
        | "2021"
        | "2020"
        | "2019"
        | "2018"
        | "2017"
        | "0"
        | "2016"
        | "2015"
        | "2014"
        | "2013"
        | "2012"
        | "2011"
        | "2010"
      comunidade_categoria:
        | "avisos"
        | "cirurgia"
        | "clinica_medica"
        | "ginecologia_obstetricia"
        | "pediatria"
        | "preventiva"
        | "provas"
        | "feedback"
      dif_q: "f" | "m" | "d"
      especialidades:
        | "Acupuntura"
        | "Administração Hospitalar"
        | "Alergia e Imunologia"
        | "Anestesiologia"
        | "Angiologia"
        | "Broncoesofagologia"
        | "Cancerologia"
        | "Cancerologia Cirúrgica"
        | "Cancerologia Pediatrica"
        | "Cardiologia"
        | "Cirurgia Cardiovascular"
        | "Cirurgia da Mão"
        | "Cirurgia de Cabeça e Pescoço"
        | "Cirurgia do Aparelho Digestivo"
        | "Cirurgia Geral"
        | "Cirurgia Oncológica"
        | "Cirurgia Pediatrica"
        | "Cirurgia Plástica"
        | "Cirurgia Torácica"
        | "Cirurgia Vascular"
        | "Citopatologia"
        | "Clinica Médica"
        | "Coloproctologia"
        | "Dermatologia"
        | "Diagnóstico por Imagem Radiologia Intervencionista"
        | "Diagnóstico por Imagem Ultrassonografia Geral"
        | "Doenças Infecciosas e Parasitárias"
        | "Eletroencelografia"
        | "Endocrinologia"
        | "Endocrinologia e Metabologia"
        | "Endoscopia"
        | "Endoscopia Digestiva"
        | "Fisiatria"
        | "Foniatria"
        | "Gastroenterologia"
        | "Genética Clínica"
        | "Genética Laboratorial"
        | "Genética Médica"
        | "Geriatria"
        | "Geriatria e Gerontologia"
        | "Ginecologia"
        | "Ginecologia e Obstetrícia"
        | "Hansenologia"
        | "Hematologia"
        | "Hematologia e Hemoterapia"
        | "Hemoterapia"
        | "Homeopatia"
        | "Infectologia"
        | "Mastologia"
        | "Medicina de Emergência"
        | "Medicina da Família e Comunidade"
        | "Medicina de Tráfego"
        | "Medicina do Trabalho"
        | "Medicina Esportiva"
        | "Medicina Física e Reabilitação"
        | "Medicina Geral e Comunitária"
        | "Medicina Intensiva"
        | "Medicina Interna ou Clínica Médica"
        | "Medicina Legal"
        | "Medicina Legal e Perícia Médica"
        | "Medicina Nuclear"
        | "Medicina Preventiva e Social"
        | "Medicina Sanitária"
        | "Nefrologia"
        | "Neurocirurgia"
        | "Neurofisiologia Clínica"
        | "Neurologia"
        | "Neurologia Pediatrica"
        | "Obstétrica"
        | "Oftalmologia"
        | "Oncologia Clínica"
        | "Ortopedia e Traumatologia"
        | "Otorrinolaringologia"
        | "Patologia"
        | "Patologia Clínica"
        | "Patologia Clínica/Medicina Laboratorial"
        | "Pediatria"
        | "Pneumologia"
        | "Proctologia"
        | "Psiquiatria"
        | "Radiologia"
        | "Radioterapia"
        | "Reumatologia"
        | "Sexologia"
        | "Terapia Intensiva"
        | "Tisiologia"
        | "Ultrassonografia Geral"
        | "Urologia"
      motivo_erro: "FC" | "FA" | "FR" | "CA" | "ANULADA"
      revisao_espacada: "D0" | "D7" | "D15" | "D30" | "D45" | "EXTRA"
      tipo_de_foco:
        | "R1"
        | "R+ CIRURGIA GERAL"
        | "R+ CLÍNICA MÉDICA"
        | "R+ GINECOLOGIA E OBSTETRÍCIA"
        | "R+ PEDIATRIA"
        | "PROVA PRÁTICA"
        | "PROVA TEÓRICA"
        | "PROVA COMPLEMENTAR"
        | "REVALIDA"
      tipo_de_revisao: "revisao_ia" | "revisao_base" | "tarefa"
      tipo_de_user: "admin" | "aluno"
      tipo_lista: "prova" | "lista"
      uf:
        | "AC"
        | "AL"
        | "AP"
        | "AM"
        | "BA"
        | "CE"
        | "DF"
        | "ES"
        | "GO"
        | "MA"
        | "MT"
        | "MS"
        | "MG"
        | "PA"
        | "PB"
        | "PR"
        | "PE"
        | "PI"
        | "RJ"
        | "RN"
        | "RS"
        | "RO"
        | "RR"
        | "SC"
        | "SP"
        | "SE"
        | "TO"
      UF:
        | "AC"
        | "AL"
        | "AM"
        | "AP"
        | "BA"
        | "CE"
        | "DF"
        | "ES"
        | "GO"
        | "MA"
        | "MG"
        | "MS"
        | "MT"
        | "PA"
        | "PB"
        | "PE"
        | "PI"
        | "PR"
        | "RJ"
        | "RN"
        | "RO"
        | "RR"
        | "RS"
        | "SC"
        | "SE"
        | "SP"
        | "TO"
        | "BRASIL"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ano: [
        "2025",
        "2024",
        "2023",
        "2022",
        "2021",
        "2020",
        "2019",
        "2018",
        "2017",
        "0",
        "2016",
        "2015",
        "2014",
        "2013",
        "2012",
        "2011",
        "2010",
      ],
      comunidade_categoria: [
        "avisos",
        "cirurgia",
        "clinica_medica",
        "ginecologia_obstetricia",
        "pediatria",
        "preventiva",
        "provas",
        "feedback",
      ],
      dif_q: ["f", "m", "d"],
      especialidades: [
        "Acupuntura",
        "Administração Hospitalar",
        "Alergia e Imunologia",
        "Anestesiologia",
        "Angiologia",
        "Broncoesofagologia",
        "Cancerologia",
        "Cancerologia Cirúrgica",
        "Cancerologia Pediatrica",
        "Cardiologia",
        "Cirurgia Cardiovascular",
        "Cirurgia da Mão",
        "Cirurgia de Cabeça e Pescoço",
        "Cirurgia do Aparelho Digestivo",
        "Cirurgia Geral",
        "Cirurgia Oncológica",
        "Cirurgia Pediatrica",
        "Cirurgia Plástica",
        "Cirurgia Torácica",
        "Cirurgia Vascular",
        "Citopatologia",
        "Clinica Médica",
        "Coloproctologia",
        "Dermatologia",
        "Diagnóstico por Imagem Radiologia Intervencionista",
        "Diagnóstico por Imagem Ultrassonografia Geral",
        "Doenças Infecciosas e Parasitárias",
        "Eletroencelografia",
        "Endocrinologia",
        "Endocrinologia e Metabologia",
        "Endoscopia",
        "Endoscopia Digestiva",
        "Fisiatria",
        "Foniatria",
        "Gastroenterologia",
        "Genética Clínica",
        "Genética Laboratorial",
        "Genética Médica",
        "Geriatria",
        "Geriatria e Gerontologia",
        "Ginecologia",
        "Ginecologia e Obstetrícia",
        "Hansenologia",
        "Hematologia",
        "Hematologia e Hemoterapia",
        "Hemoterapia",
        "Homeopatia",
        "Infectologia",
        "Mastologia",
        "Medicina de Emergência",
        "Medicina da Família e Comunidade",
        "Medicina de Tráfego",
        "Medicina do Trabalho",
        "Medicina Esportiva",
        "Medicina Física e Reabilitação",
        "Medicina Geral e Comunitária",
        "Medicina Intensiva",
        "Medicina Interna ou Clínica Médica",
        "Medicina Legal",
        "Medicina Legal e Perícia Médica",
        "Medicina Nuclear",
        "Medicina Preventiva e Social",
        "Medicina Sanitária",
        "Nefrologia",
        "Neurocirurgia",
        "Neurofisiologia Clínica",
        "Neurologia",
        "Neurologia Pediatrica",
        "Obstétrica",
        "Oftalmologia",
        "Oncologia Clínica",
        "Ortopedia e Traumatologia",
        "Otorrinolaringologia",
        "Patologia",
        "Patologia Clínica",
        "Patologia Clínica/Medicina Laboratorial",
        "Pediatria",
        "Pneumologia",
        "Proctologia",
        "Psiquiatria",
        "Radiologia",
        "Radioterapia",
        "Reumatologia",
        "Sexologia",
        "Terapia Intensiva",
        "Tisiologia",
        "Ultrassonografia Geral",
        "Urologia",
      ],
      motivo_erro: ["FC", "FA", "FR", "CA", "ANULADA"],
      revisao_espacada: ["D0", "D7", "D15", "D30", "D45", "EXTRA"],
      tipo_de_foco: [
        "R1",
        "R+ CIRURGIA GERAL",
        "R+ CLÍNICA MÉDICA",
        "R+ GINECOLOGIA E OBSTETRÍCIA",
        "R+ PEDIATRIA",
        "PROVA PRÁTICA",
        "PROVA TEÓRICA",
        "PROVA COMPLEMENTAR",
        "REVALIDA",
      ],
      tipo_de_revisao: ["revisao_ia", "revisao_base", "tarefa"],
      tipo_de_user: ["admin", "aluno"],
      tipo_lista: ["prova", "lista"],
      uf: [
        "AC",
        "AL",
        "AP",
        "AM",
        "BA",
        "CE",
        "DF",
        "ES",
        "GO",
        "MA",
        "MT",
        "MS",
        "MG",
        "PA",
        "PB",
        "PR",
        "PE",
        "PI",
        "RJ",
        "RN",
        "RS",
        "RO",
        "RR",
        "SC",
        "SP",
        "SE",
        "TO",
      ],
      UF: [
        "AC",
        "AL",
        "AM",
        "AP",
        "BA",
        "CE",
        "DF",
        "ES",
        "GO",
        "MA",
        "MG",
        "MS",
        "MT",
        "PA",
        "PB",
        "PE",
        "PI",
        "PR",
        "RJ",
        "RN",
        "RO",
        "RR",
        "RS",
        "SC",
        "SE",
        "SP",
        "TO",
        "BRASIL",
      ],
    },
  },
} as const
