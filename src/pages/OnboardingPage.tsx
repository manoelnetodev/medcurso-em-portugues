import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RippleButton } from "@/components/ui/ripple-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Calendar,
  MapPin,
  Target,
  CheckCircle,
  Users,
  Clock,
  Sparkles,
  Search,
  Stethoscope,
  Heart,
  Brain,
  Building,
  CalendarDays,
  Phone,
  Camera,
  Shield,
  Instagram,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingData {
  // Dados pessoais
  name?: string;
  whatsapp?: string;
  instagram?: string;
  dt_nascimento?: string;
  avatar_url?: string;
  
  // Dados acadêmicos
  especialidade_principal?: string;
  especialidades_secundarias?: string[];
  foco?: string;
  instituicao_principal?: number;
  instituicoes_secundarias?: number[];
  cronograma_semanal?: {
    domingo: number;
    segunda: number;
    terca: number;
    quarta: number;
    quinta: number;
    sexta: number;
    sabado: number;
  };
  dias_ativos?: {
    domingo: boolean;
    segunda: boolean;
    terca: boolean;
    quarta: boolean;
    quinta: boolean;
    sexta: boolean;
    sabado: boolean;
  };
  data_inicio?: string;
  data_fim?: string;
}

interface Instituicao {
  id: number;
  nome: string;
  nome_g: string;
  uf: string;
}

const ESPECIALIDADES = [
  "Acupuntura", "Administração Hospitalar", "Alergia e Imunologia", "Anestesiologia", 
  "Angiologia", "Broncoesofagologia", "Cancerologia", "Cancerologia Cirúrgica", 
  "Cancerologia Pediatrica", "Cardiologia", "Cirurgia Cardiovascular", "Cirurgia da Mão",
  "Cirurgia de Cabeça e Pescoço", "Cirurgia do Aparelho Digestivo", "Cirurgia Geral",
  "Cirurgia Oncológica", "Cirurgia Pediatrica", "Cirurgia Plástica", "Cirurgia Torácica",
  "Cirurgia Vascular", "Citopatologia", "Clinica Médica", "Coloproctologia", "Dermatologia",
  "Diagnóstico por Imagem Radiologia Intervencionista", "Diagnóstico por Imagem Ultrassonografia Geral",
  "Doenças Infecciosas e Parasitárias", "Eletroencelografia", "Endocrinologia", 
  "Endocrinologia e Metabologia", "Endoscopia", "Endoscopia Digestiva", "Fisiatria",
  "Foniatria", "Gastroenterologia", "Genética Clínica", "Genética Laboratorial", 
  "Genética Médica", "Geriatria", "Geriatria e Gerontologia", "Ginecologia", 
  "Ginecologia e Obstetrícia", "Hansenologia", "Hematologia", "Hematologia e Hemoterapia",
  "Hemoterapia", "Homeopatia", "Infectologia", "Mastologia", "Medicina de Emergência",
  "Medicina da Família e Comunidade", "Medicina de Tráfego", "Medicina do Trabalho",
  "Medicina Esportiva", "Medicina Física e Reabilitação", "Medicina Geral e Comunitária",
  "Medicina Intensiva", "Medicina Interna ou Clínica Médica", "Medicina Legal",
  "Medicina Legal e Perícia Médica", "Medicina Nuclear", "Medicina Preventiva e Social",
  "Medicina Sanitária", "Nefrologia", "Neurocirurgia", "Neurofisiologia Clínica",
  "Neurologia", "Neurologia Pediatrica", "Obstétrica", "Oftalmologia", "Oncologia Clínica",
  "Ortopedia e Traumatologia", "Otorrinolaringologia", "Patologia", "Patologia Clínica",
  "Patologia Clínica/Medicina Laboratorial", "Pediatria", "Pneumologia", "Proctologia",
  "Psiquiatria", "Radiologia", "Radioterapia", "Reumatologia", "Sexologia",
  "Terapia Intensiva", "Tisiologia", "Ultrassonografia Geral", "Urologia"
];

const FOCOS = [
  { 
    id: "R1", 
    title: "R1", 
    description: "Primeiro ano de residência",
    icon: <GraduationCap className="w-6 h-6" />,
    color: "from-blue-500 to-blue-600"
  },
  { 
    id: "R+ CIRURGIA GERAL", 
    title: "R+ Cirurgia Geral", 
    description: "Especialização em Cirurgia Geral",
    icon: <Stethoscope className="w-6 h-6" />,
    color: "from-red-500 to-red-600"
  },
  { 
    id: "R+ CLÍNICA MÉDICA", 
    title: "R+ Clínica Médica", 
    description: "Especialização em Clínica Médica",
    icon: <Heart className="w-6 h-6" />,
    color: "from-green-500 to-green-600"
  },
  { 
    id: "R+ GINECOLOGIA E OBSTETRÍCIA", 
    title: "R+ Gineco e Obstetrícia", 
    description: "Especialização em Ginecologia e Obstetrícia",
    icon: <Users className="w-6 h-6" />,
    color: "from-pink-500 to-pink-600"
  },
  { 
    id: "R+ PEDIATRIA", 
    title: "R+ Pediatria", 
    description: "Especialização em Pediatria",
    icon: <Brain className="w-6 h-6" />,
          color: "from-primary to-primary/80"
  }
];

const FUNCIONALIDADES = [
  {
    icon: <BookOpen className="w-8 h-8" />,
    title: "Questões Inteligentes",
    description: "Acesso a milhares de questões de residência organizadas por especialidade e instituição com análise de desempenho"
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: "Cronograma Personalizado",
    description: "Sistema de cronograma adaptado ao seu foco e tempo disponível, com metas semanais e acompanhamento de progresso"
  },
  {
    icon: <GraduationCap className="w-8 h-8" />,
    title: "Revisões Inteligentes",
    description: "Sistema de revisão espaçada baseado em algoritmos para otimizar sua retenção e memorização"
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Comunidade Médica",
    description: "Interaja com outros residentes, tire dúvidas, compartilhe conhecimento e acompanhe rankings"
  }
];

const DIAS_SEMANA = [
  { key: 'segunda', label: 'Segunda-feira', short: 'Seg' },
  { key: 'terca', label: 'Terça-feira', short: 'Ter' },
  { key: 'quarta', label: 'Quarta-feira', short: 'Qua' },
  { key: 'quinta', label: 'Quinta-feira', short: 'Qui' },
  { key: 'sexta', label: 'Sexta-feira', short: 'Sex' },
  { key: 'sabado', label: 'Sábado', short: 'Sáb' },
  { key: 'domingo', label: 'Domingo', short: 'Dom' }
];

const OnboardingPage = () => {
  const { user, userProfile, setUserProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [filteredInstituicoes, setFilteredInstituicoes] = useState<Instituicao[]>([]);
  const [searchInstituicao, setSearchInstituicao] = useState('');
  const [searchInstituicaoSecundaria, setSearchInstituicaoSecundaria] = useState('');
  const [searchEspecialidade, setSearchEspecialidade] = useState('');
  const [searchEspecialidadeSecundaria, setSearchEspecialidadeSecundaria] = useState('');
  const [data, setData] = useState<OnboardingData>({
    especialidades_secundarias: [],
    instituicoes_secundarias: [],
    cronograma_semanal: {
      domingo: 0,
      segunda: 0,
      terca: 0,
      quarta: 0,
      quinta: 0,
      sexta: 0,
      sabado: 0
    },
    dias_ativos: {
      domingo: false,
      segunda: false,
      terca: false,
      quarta: false,
      quinta: false,
      sexta: false,
      sabado: false
    }
  });

  const totalSteps = 8;

  // Carregar instituições
  useEffect(() => {
    const fetchInstituicoes = async () => {
      try {
        const { data: instituicoesData, error } = await supabase
          .from('instituicoes')
          .select('id, nome, nome_g, uf')
          .eq('desabilitada', false)
          .order('nome');

        if (error) throw error;
        setInstituicoes(instituicoesData || []);
        setFilteredInstituicoes(instituicoesData || []);
      } catch (error: any) {
        toast({
          title: "Erro ao carregar instituições",
          description: error.message,
          variant: "destructive"
        });
      }
    };

    fetchInstituicoes();
  }, []);

  // Filtrar instituições principais
  useEffect(() => {
    const filtered = instituicoes.filter(inst =>
      inst.nome.toLowerCase().includes(searchInstituicao.toLowerCase()) ||
      inst.uf.toLowerCase().includes(searchInstituicao.toLowerCase())
    );
    setFilteredInstituicoes(filtered);
  }, [searchInstituicao, instituicoes]);

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleEspecialidadeSecundariaToggle = (especialidade: string, checked: boolean) => {
    setData(prev => ({
      ...prev,
      especialidades_secundarias: checked
        ? [...(prev.especialidades_secundarias || []), especialidade]
        : (prev.especialidades_secundarias || []).filter(esp => esp !== especialidade)
    }));
  };

  const handleInstituicaoSecundariaToggle = (instituicaoId: number, checked: boolean) => {
    setData(prev => ({
      ...prev,
      instituicoes_secundarias: checked
        ? [...(prev.instituicoes_secundarias || []), instituicaoId]
        : (prev.instituicoes_secundarias || []).filter(id => id !== instituicaoId)
    }));
  };

  const handleCronogramaChange = (dia: string, valor: number) => {
    setData(prev => ({
      ...prev,
      cronograma_semanal: {
        ...prev.cronograma_semanal!,
        [dia]: valor
      }
    }));
  };

  const handleDiaAtivoChange = (dia: string, ativo: boolean) => {
    setData(prev => ({
      ...prev,
      dias_ativos: {
        ...prev.dias_ativos!,
        [dia]: ativo
      },
      // Se desativar o dia, zera os minutos
      cronograma_semanal: {
        ...prev.cronograma_semanal!,
        [dia]: ativo ? (prev.cronograma_semanal?.[dia as keyof typeof prev.cronograma_semanal] || 0) : 0
      }
    }));
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro",
          description: "Por favor, selecione apenas arquivos de imagem.",
          variant: "destructive"
        });
        return;
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB.",
          variant: "destructive"
        });
        return;
      }

      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não encontrado.",
          variant: "destructive"
        });
        return;
      }

      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `fotos_de_perfil/${fileName}`;

      // Upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('comum')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('comum')
        .getPublicUrl(filePath);

      // Atualizar estado local
      setData(prev => ({ ...prev, avatar_url: publicUrl }));

      toast({
        title: "Sucesso!",
        description: "Foto de perfil enviada com sucesso.",
        variant: "default"
      });

    } catch (error: any) {
      toast({
        title: "Erro ao enviar foto",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setData(prev => ({ ...prev, avatar_url: undefined }));
  };

  const finalizarOnboarding = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Atualizar user_profile
      const { error: profileError } = await supabase
        .from('user_profile')
        .update({
          // Dados pessoais
          name: data.name,
          avatar_url: data.avatar_url || null,
          whatsapp: data.whatsapp || null,
          instagram: data.instagram || null,
          dt_nascimento: data.dt_nascimento || null,
          
          // Dados acadêmicos
          especialidade_principal: data.especialidade_principal as any,
          especialidades_secundarias: data.especialidades_secundarias as any,
          foco: data.foco as any,
          instituicao_principal: data.instituicao_principal,
          instituicoes_secundarias: data.instituicoes_secundarias,
          onboarding_finalizado: true
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Criar/atualizar preset de cronograma
      if (data.cronograma_semanal && data.data_inicio && data.data_fim) {
        const presetData = {
          user: user.id,
          domingo: data.cronograma_semanal.domingo,
          segunda: data.cronograma_semanal.segunda,
          terca: data.cronograma_semanal.terca,
          quarta: data.cronograma_semanal.quarta,
          quinta: data.cronograma_semanal.quinta,
          sexta: data.cronograma_semanal.sexta,
          sabado: data.cronograma_semanal.sabado,
          data_inicio: data.data_inicio,
          data_fim: data.data_fim
        };

        // Usar upsert com onConflict para resolver automaticamente duplicatas
        const { error: presetError } = await supabase
          .from('preset')
          .upsert(presetData, {
            onConflict: 'user'
          });

        if (presetError) throw presetError;
      }

      // Atualizar userProfile local imediatamente
      const { data: updatedProfile } = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (updatedProfile) setUserProfile(updatedProfile);

      toast({
        title: "Bem-vindo(a) ao UltraMeds! 🎉",
        description: "Seu perfil foi configurado com sucesso. Vamos começar seus estudos!",
        variant: "default"
      });

      // Espera ativa até userProfile.onboarding_finalizado ser true
      let tentativas = 0;
      while (tentativas < 10) {
        await new Promise(res => setTimeout(res, 150));
        if (userProfile && userProfile.onboarding_finalizado) break;
        tentativas++;
      }
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Erro ao finalizar onboarding",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true; // Welcome
      case 1: return data.name && data.name.trim().length > 0; // Dados pessoais - nome obrigatório
      case 2: return data.especialidade_principal; // Especialidade principal
      case 3: return true; // Especialidades secundárias (opcional)
      case 4: return data.foco; // Foco
      case 5: return data.instituicao_principal; // Instituição principal
      case 6: return true; // Instituições secundárias (opcional)
      case 7: return data.data_inicio && data.data_fim; // Cronograma
      default: return false;
    }
  };

  const getInstituicoesSecundariasFiltered = () => {
    return instituicoes
      .filter(inst => inst.id !== data.instituicao_principal)
      .filter(inst =>
        inst.nome.toLowerCase().includes(searchInstituicaoSecundaria.toLowerCase()) ||
        inst.uf.toLowerCase().includes(searchInstituicaoSecundaria.toLowerCase())
      );
  };

  // Função para aplicar máscara de WhatsApp
  const formatWhatsApp = (value: string) => {
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, '');
    
    // Aplica a máscara (62) 99644-1006
    if (digits.length <= 2) {
      return `(${digits}`;
    } else if (digits.length <= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length <= 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    } else {
      // Limita a 11 dígitos
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }
  };

  // Função para aplicar máscara de Instagram (sempre com @)
  const formatInstagram = (value: string) => {
    // Remove @ do início se já existe
    let cleanValue = value.replace(/^@+/, '');
    
    // Remove caracteres especiais, mantém apenas letras, números, _ e .
    cleanValue = cleanValue.replace(/[^a-zA-Z0-9_.]/g, '');
    
    return cleanValue;
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value);
    setData(prev => ({ ...prev, whatsapp: formatted }));
  };

  const handleInstagramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInstagram(e.target.value);
    setData(prev => ({ ...prev, instagram: formatted }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-8 md:space-y-12">
            <div className="space-y-4 md:space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-full flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-white" />
                </div>
              </div>
                              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Bem-vindo ao UltraMeds! 
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
                Sua plataforma completa para estudos médicos e preparação para residência. 
                Vamos configurar seu perfil para uma experiência totalmente personalizada.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto px-4">
              {FUNCIONALIDADES.map((func, index) => (
                <Card key={index} className="group p-6 md:p-8 bg-gray-800/60 backdrop-blur-sm border border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-purple-500/50">
                  <div className="flex items-start gap-4 md:gap-6">
                    <div className="text-purple-400 group-hover:scale-110 transition-transform duration-300 group-hover:text-purple-300">
                      {func.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg md:text-xl font-bold text-gray-100 mb-2 md:mb-3">{func.title}</h3>
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed">{func.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-center mt-8 md:mt-12 px-4">
              <RippleButton 
                onClick={nextStep}
                size="lg"
                rippleColor="rgba(255, 255, 255, 0.4)"
                duration={600}
                                  className="relative bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white px-6 md:px-8 py-3 md:py-4 text-lg md:text-xl font-semibold flex items-center gap-2 md:gap-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-primary/30 rounded-xl"
              >
                <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                <span className="relative z-10">Iniciar Configuração</span>
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
              </RippleButton>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-100">
                  Dados Pessoais
                </h2>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                  Personalize sua experiência fornecendo algumas informações básicas sobre você.
                </p>
              </div>
            </div>

            {/* Form Content */}
            <div className="max-w-4xl mx-auto">
              <Card className="p-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-xl">
                <div className="space-y-8">
                  {/* Foto de Perfil Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-700">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/60 rounded-lg flex items-center justify-center">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-100">Foto de Perfil</h3>
                      <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded-full">Opcional</span>
                    </div>
                    
                    <div className="flex flex-col lg:flex-row items-center gap-6">
                      <div className="relative">
                        {data.avatar_url ? (
                          <div className="relative">
                            <img
                              src={data.avatar_url}
                              alt="Foto de perfil"
                              className="w-32 h-32 rounded-2xl object-cover border-4 border-purple-500 shadow-xl"
                            />
                            <button
                              onClick={handleRemoveAvatar}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm transition-all duration-200 hover:scale-110 shadow-lg"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 border-4 border-gray-600 flex items-center justify-center shadow-lg">
                            <Users className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-center lg:items-start space-y-3">
                        <input
                          type="file"
                          id="avatar-upload"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          disabled={uploadingAvatar}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                          disabled={uploadingAvatar}
                          className="bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600 hover:border-primary transition-all duration-200 px-6 py-3"
                        >
                          {uploadingAvatar ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Camera className="w-4 h-4 mr-2" />
                              {data.avatar_url ? 'Alterar Foto' : 'Escolher Foto'}
                            </>
                          )}
                        </Button>
                        <p className="text-sm text-gray-400 text-center lg:text-left">
                          Máximo 5MB • JPG, PNG, GIF
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Informações Básicas Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-700">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-100">Informações Básicas</h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Nome Completo */}
                      <div className="lg:col-span-2 space-y-3">
                        <Label htmlFor="name" className="text-base font-medium text-gray-200 flex items-center gap-2">
                          Nome Completo
                          <span className="text-red-400 text-sm">*</span>
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Digite seu nome completo"
                          value={data.name || ''}
                          onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
                          className="h-12 text-base bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400 focus:border-primary focus:ring-primary focus-visible:ring-primary transition-all duration-200"
                          autoComplete="off"
                          autoCorrect="off"
                          spellCheck="false"
                        />
                        {(!data.name || data.name.trim().length === 0) && (
                          <p className="text-sm text-amber-400 flex items-center gap-1">
                            <span className="w-1 h-1 bg-amber-400 rounded-full"></span>
                            Campo obrigatório
                          </p>
                        )}
                      </div>

                      {/* Data de Nascimento */}
                      <div className="space-y-3">
                        <Label htmlFor="dt_nascimento" className="text-base font-medium text-gray-200 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Data de Nascimento
                          <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded-full">Opcional</span>
                        </Label>
                        <DatePicker
                          id="dt_nascimento"
                          date={data.dt_nascimento ? new Date(data.dt_nascimento) : undefined}
                          onDateChange={(date) => setData(prev => ({ 
                            ...prev, 
                            dt_nascimento: date ? date.toISOString().split('T')[0] : undefined 
                          }))}
                          placeholder="Selecione sua data de nascimento"
                          className="h-12"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contato Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-700">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-100">Contato</h3>
                      <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded-full">Opcional</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* WhatsApp */}
                      <div className="space-y-3">
                        <Label htmlFor="whatsapp" className="text-base font-medium text-gray-200 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-green-400" />
                          WhatsApp
                        </Label>
                        <Input
                          id="whatsapp"
                          type="tel"
                          placeholder="(00) 0 0000-0000"
                          value={data.whatsapp || ''}
                          onChange={handleWhatsAppChange}
                          className="h-12 text-base bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500 focus-visible:ring-purple-500 transition-all duration-200"
                          autoComplete="off"
                          autoCorrect="off"
                          spellCheck="false"
                          maxLength={15}
                        />
                      </div>

                      {/* Instagram */}
                      <div className="space-y-3">
                        <Label htmlFor="instagram" className="text-base font-medium text-gray-200 flex items-center gap-2">
                          <Instagram className="w-4 h-4 text-pink-400" />
                          Instagram
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-base font-medium">@</span>
                          <Input
                            id="instagram"
                            type="text"
                            placeholder="seu_usuario"
                            value={data.instagram || ''}
                            onChange={handleInstagramChange}
                            className="h-12 text-base bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500 focus-visible:ring-purple-500 pl-8 transition-all duration-200"
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                            maxLength={30}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info Card */}
                  <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-100 mb-2">
                          Seus dados estão seguros
                        </h4>
                        <p className="text-gray-300 leading-relaxed">
                          Todas as informações fornecidas são criptografadas e utilizadas apenas para personalizar sua experiência de estudos. Você pode atualizar ou remover seus dados a qualquer momento.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Continue Button */}
            {canProceed() && (
              <div className="flex justify-center">
                <RippleButton
                  onClick={nextStep}
                  rippleColor="rgba(139, 92, 246, 0.3)"
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 text-lg font-semibold flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-purple-500/30 rounded-xl"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-5 h-5" />
                </RippleButton>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                <Stethoscope className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-100 px-4">
                Qual sua especialidade principal?
              </h2>
              <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto px-4">
                Escolha a especialidade que é seu foco principal de estudos. Isso nos ajudará a personalizar todo o conteúdo para você.
              </p>
            </div>

            <div className="max-w-6xl mx-auto space-y-6 px-4">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                <Input
                  placeholder="Buscar especialidade..."
                  value={searchEspecialidade}
                  onChange={(e) => setSearchEspecialidade(e.target.value)}
                  className="pl-8 md:pl-10 text-base md:text-lg h-10 md:h-12 bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500 focus-visible:ring-purple-500"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 max-h-[400px] md:max-h-[520px] overflow-y-auto custom-scrollbar p-2">
                {ESPECIALIDADES
                  .filter(esp => esp.toLowerCase().includes(searchEspecialidade.toLowerCase()))
                  .map((esp) => (
                    <Card 
                      key={esp}
                      className={`p-2 md:p-3 cursor-pointer transition-all duration-300 hover:shadow-lg border-2 min-h-[70px] md:min-h-[80px] flex items-center justify-center ${
                        data.especialidade_principal === esp 
                          ? 'border-purple-500 bg-purple-900/50 shadow-lg transform scale-[1.02] z-10' 
                          : 'border-gray-600 hover:border-purple-400 bg-gray-800/50 hover:scale-[1.01]'
                      }`}
                      onClick={() => setData(prev => ({ ...prev, especialidade_principal: esp }))}
                    >
                      <div className="text-center space-y-1 md:space-y-2 w-full">
                        {data.especialidade_principal === esp ? (
                          <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-purple-400 mx-auto" />
                        ) : (
                          <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-gray-500 rounded-full mx-auto" />
                        )}
                        <p className="text-[10px] md:text-xs font-medium text-gray-200 leading-tight px-1">{esp}</p>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
            
            {/* Botão Continuar */}
            {canProceed() && (
              <div className="flex justify-center mt-8 px-4">
                <RippleButton
                  onClick={nextStep}
                  rippleColor="rgba(139, 92, 246, 0.3)"
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 md:px-8 py-2 md:py-3 text-base md:text-lg font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-purple-500/40 rounded-lg"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </RippleButton>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-100 px-4">
                Especialidades Secundárias
              </h2>
              <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto px-4">
                Selecione outras especialidades que também são importantes para seus estudos (opcional).
              </p>
            </div>

            <div className="max-w-6xl mx-auto space-y-6 px-4">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                <Input
                  placeholder="Buscar especialidades secundárias..."
                  value={searchEspecialidadeSecundaria}
                  onChange={(e) => setSearchEspecialidadeSecundaria(e.target.value)}
                  className="pl-8 md:pl-10 text-base md:text-lg h-10 md:h-12 bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500 focus-visible:ring-purple-500"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3 max-h-[350px] md:max-h-[450px] overflow-y-auto custom-scrollbar">
                {ESPECIALIDADES
                  .filter(esp => esp !== data.especialidade_principal)
                  .filter(esp => esp.toLowerCase().includes(searchEspecialidadeSecundaria.toLowerCase()))
                  .map((esp) => {
                    const checked = (data.especialidades_secundarias || []).includes(esp);
                    return (
                      <div
                        key={esp}
                        className={`flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg border border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 transition-colors cursor-pointer select-none`}
                        onClick={() => handleEspecialidadeSecundariaToggle(esp, !checked)}
                        tabIndex={0}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleEspecialidadeSecundariaToggle(esp, !checked); }}
                        role="button"
                        aria-pressed={checked}
                      >
                        <Checkbox
                          id={`esp-${esp}`}
                          checked={checked}
                          onCheckedChange={(checked) => handleEspecialidadeSecundariaToggle(esp, checked as boolean)}
                          className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 border-gray-500"
                          onClick={e => e.stopPropagation()}
                        />
                        <Label
                          htmlFor={`esp-${esp}`}
                          className="text-xs md:text-sm cursor-pointer flex-1 leading-tight text-gray-200"
                          onClick={e => e.stopPropagation()}
                        >
                          {esp}
                        </Label>
                      </div>
                    );
                  })}
              </div>
              
              {(data.especialidades_secundarias?.length || 0) > 0 && (
                <div className="mt-6 p-3 md:p-4 bg-purple-900/30 rounded-xl border border-purple-700">
                  <p className="text-center text-purple-300 font-medium text-sm md:text-base">
                    <strong>{data.especialidades_secundarias?.length}</strong> especialidades secundárias selecionadas
                  </p>
                </div>
              )}
            </div>
            
            {/* Botão Continuar */}
            {canProceed() && (
              <div className="flex justify-center mt-8 px-4">
                <RippleButton
                  onClick={nextStep}
                  rippleColor="rgba(139, 92, 246, 0.3)"
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 md:px-8 py-2 md:py-3 text-base md:text-lg font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-purple-500/40 rounded-lg"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </RippleButton>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-100 px-4">
                Qual é o seu foco de estudo?
              </h2>
              <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto px-4">
                Escolha o tipo de residência ou especialização que você está focando atualmente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto p-2 px-4">
              {FOCOS.map((foco) => (
                <Card 
                  key={foco.id}
                  className={`p-4 md:p-6 cursor-pointer transition-all duration-300 hover:shadow-xl border-2 group ${
                    data.foco === foco.id 
                      ? 'border-purple-500 bg-purple-900/50 shadow-lg transform scale-[1.02] z-10' 
                      : 'border-gray-600 hover:border-purple-400 bg-gray-800/50 hover:-translate-y-1 hover:scale-[1.01]'
                  }`}
                  onClick={() => setData(prev => ({ ...prev, foco: foco.id }))}
                >
                  <div className="text-center space-y-3 md:space-y-4">
                    <div className={`w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br ${foco.color} rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform`}>
                      <div className="text-white">
                        {foco.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-gray-100 mb-1 md:mb-2">{foco.title}</h3>
                      <p className="text-xs md:text-sm text-gray-300">{foco.description}</p>
                    </div>
                    {data.foco === foco.id && (
                      <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-purple-400 mx-auto" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
            
            {/* Botão Continuar */}
            {canProceed() && (
              <div className="flex justify-center mt-8 px-4">
                <RippleButton
                  onClick={nextStep}
                  rippleColor="rgba(139, 92, 246, 0.3)"
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 md:px-8 py-2 md:py-3 text-base md:text-lg font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-purple-500/40 rounded-lg"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </RippleButton>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto">
                <Building className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-100 px-4">
                Instituição Principal
              </h2>
              <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto px-4">
                Selecione a instituição que é seu foco principal de estudos.
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6 px-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                <Input
                  placeholder="Buscar instituição..."
                  value={searchInstituicao}
                  onChange={(e) => setSearchInstituicao(e.target.value)}
                  className="pl-8 md:pl-10 text-base md:text-lg h-10 md:h-12 bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500 focus-visible:ring-purple-500"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 max-h-[350px] md:max-h-[450px] overflow-y-auto custom-scrollbar">
                {filteredInstituicoes.map((inst) => (
                  <Card 
                    key={inst.id}
                    className={`p-3 md:p-4 cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                      data.instituicao_principal === inst.id 
                        ? 'border-blue-500 bg-blue-900/50 shadow-lg' 
                        : 'border-gray-600 hover:border-blue-400 bg-gray-800/50'
                    }`}
                    onClick={() => setData(prev => ({ ...prev, instituicao_principal: inst.id }))}
                  >
                    <div className="flex items-center space-x-2 md:space-x-3">
                      {data.instituicao_principal === inst.id ? (
                        <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-blue-400 flex-shrink-0" />
                      ) : (
                        <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-gray-500 rounded-full flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-100 text-sm md:text-base">{inst.nome}</p>
                        <p className="text-xs md:text-sm text-gray-400">{inst.uf}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Botão Continuar */}
            {canProceed() && (
              <div className="flex justify-center mt-8 px-4">
                <RippleButton
                  onClick={nextStep}
                  rippleColor="rgba(139, 92, 246, 0.3)"
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 md:px-8 py-2 md:py-3 text-base md:text-lg font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-purple-500/40 rounded-lg"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </RippleButton>
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-100 px-4">
                Instituições Secundárias
              </h2>
              <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto px-4">
                Selecione outras instituições que também são importantes para seus estudos (opcional).
              </p>
            </div>

            <div className="max-w-6xl mx-auto space-y-6 px-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                <Input
                  placeholder="Buscar instituições secundárias..."
                  value={searchInstituicaoSecundaria}
                  onChange={(e) => setSearchInstituicaoSecundaria(e.target.value)}
                  className="pl-8 md:pl-10 text-base md:text-lg h-10 md:h-12 bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500 focus-visible:ring-purple-500"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3 max-h-[350px] md:max-h-[450px] overflow-y-auto custom-scrollbar">
                {getInstituicoesSecundariasFiltered().map((inst) => {
                  const checked = (data.instituicoes_secundarias || []).includes(inst.id);
                  return (
                    <div
                      key={inst.id}
                      className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg border border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 transition-colors cursor-pointer select-none"
                      onClick={() => handleInstituicaoSecundariaToggle(inst.id, !checked)}
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleInstituicaoSecundariaToggle(inst.id, !checked); }}
                      role="button"
                      aria-pressed={checked}
                    >
                      <Checkbox
                        id={`inst-${inst.id}`}
                        checked={checked}
                        onCheckedChange={(checked) => handleInstituicaoSecundariaToggle(inst.id, checked as boolean)}
                        className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 border-gray-500"
                        onClick={e => e.stopPropagation()}
                      />
                      <Label
                        htmlFor={`inst-${inst.id}`}
                        className="text-xs md:text-sm cursor-pointer flex-1"
                        onClick={e => e.stopPropagation()}
                      >
                        <div>
                          <p className="font-medium text-gray-200">{inst.nome}</p>
                          <p className="text-[10px] md:text-xs text-gray-400">{inst.uf}</p>
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </div>
              
              {(data.instituicoes_secundarias?.length || 0) > 0 && (
                <div className="mt-6 p-3 md:p-4 bg-purple-900/30 rounded-xl border border-purple-700">
                  <p className="text-center text-purple-300 font-medium text-sm md:text-base">
                    <strong>{data.instituicoes_secundarias?.length}</strong> instituições secundárias selecionadas
                  </p>
                </div>
              )}
            </div>
            
            {/* Botão Continuar */}
            {canProceed() && (
              <div className="flex justify-center mt-8 px-4">
                <RippleButton
                  onClick={nextStep}
                  rippleColor="rgba(139, 92, 246, 0.3)"
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 md:px-8 py-2 md:py-3 text-base md:text-lg font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-purple-500/40 rounded-lg"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </RippleButton>
              </div>
            )}
          </div>
        );

      case 7:
        return (
          <div className="space-y-6 md:space-y-8">
            <div className="text-center space-y-4 md:space-y-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                <CalendarDays className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-100 px-4">
                Configure seu Cronograma Semanal
              </h2>
              <p className="text-sm md:text-lg text-gray-300 max-w-2xl mx-auto px-4">
                Defina quantos minutos você quer estudar em cada dia da semana e o período dos seus estudos.
              </p>
            </div>

            <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 px-4">
              {/* Cronograma Semanal */}
              <div className="space-y-4 md:space-y-6">
                <div className="text-center space-y-2 md:space-y-3">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-100">Tempo de Estudo por Dia</h3>
                  <div className="flex flex-col items-center space-y-1 md:space-y-2">
                    <p className="text-xs md:text-sm text-purple-300">
                      💡 Mínimo recomendado: 30 minutos por dia
                    </p>
                    <p className="text-xs text-gray-400">
                      ✨ Fique tranquilo! Você pode alterar essas configurações a qualquer momento depois
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4 lg:gap-5">
                  {DIAS_SEMANA.map((dia) => {
                    const isDiaAtivo = data.dias_ativos?.[dia.key as keyof typeof data.dias_ativos] || false;
                    const minutosEsseDia = data.cronograma_semanal?.[dia.key as keyof typeof data.cronograma_semanal] || 0;
                    
                    return (
                      <Card key={dia.key} className={`p-3 md:p-4 lg:p-5 border transition-all duration-200 bg-gray-800/60 ${isDiaAtivo ? 'border-gray-500' : 'border-gray-700 opacity-60'}`}> 
                        <div className="flex flex-col gap-2 md:gap-3 items-center">
                          <div className="flex items-center gap-1 md:gap-2 lg:gap-3 w-full justify-between">
                            <div className="text-center md:text-left">
                              <p className={`font-semibold text-sm md:text-base lg:text-lg ${isDiaAtivo ? 'text-gray-100' : 'text-gray-400'}`}>{dia.short}</p>
                            </div>
                            <Switch
                              checked={isDiaAtivo}
                              onCheckedChange={(checked) => handleDiaAtivoChange(dia.key, checked)}
                              className="data-[state=checked]:bg-purple-600 scale-75 md:scale-90 lg:scale-100"
                            />
                          </div>
                          {isDiaAtivo && (
                            <div className="flex items-center gap-1 md:gap-2 lg:gap-3 w-full mt-1 md:mt-2">
                              <Input
                                type="number"
                                min="0"
                                max="720"
                                step="30"
                                placeholder="0"
                                value={minutosEsseDia || ''}
                                onChange={(e) => handleCronogramaChange(dia.key, parseInt(e.target.value) || 0)}
                                className="w-12 md:w-16 lg:w-20 text-center text-xs md:text-sm lg:text-base font-semibold bg-gray-700 border-gray-600 text-gray-100 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus-visible:ring-purple-500 p-1 md:p-2"
                                autoComplete="off"
                                autoCorrect="off"
                                spellCheck="false"
                              />
                              <span className="text-[10px] md:text-xs lg:text-sm text-gray-400">min</span>
                              {minutosEsseDia > 0 && minutosEsseDia < 30 && (
                                <span className="text-[10px] md:text-xs text-amber-400 hidden lg:inline">Mín: 30</span>
                              )}
                            </div>
                          )}
                          {!isDiaAtivo && (
                            <div className="h-6 md:h-8 lg:h-10 flex items-center justify-center w-full">
                              <span className="text-[10px] md:text-xs lg:text-sm text-gray-500">Inativo</span>
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
                
                {/* Total Semanal */}
                <div className="text-center p-4 md:p-5 lg:p-6 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl border border-purple-700">
                  <p className="text-base md:text-lg lg:text-xl font-semibold text-gray-100">
                    Total Semanal: <span className="text-purple-400">
                      {Object.entries(data.cronograma_semanal || {})
                        .filter(([dia, _]) => data.dias_ativos?.[dia as keyof typeof data.dias_ativos])
                        .reduce((total, [_, minutos]) => total + minutos, 0)} minutos
                    </span>
                    {Object.entries(data.cronograma_semanal || {})
                      .filter(([dia, _]) => data.dias_ativos?.[dia as keyof typeof data.dias_ativos])
                      .reduce((total, [_, minutos]) => total + minutos, 0) > 0 && (
                      <span className="text-gray-300 ml-2 text-sm md:text-base lg:text-lg">
                        ({Math.round(Object.entries(data.cronograma_semanal || {})
                          .filter(([dia, _]) => data.dias_ativos?.[dia as keyof typeof data.dias_ativos])
                          .reduce((total, [_, minutos]) => total + minutos, 0) / 60)} horas)
                      </span>
                    )}
                  </p>
                  <p className="text-xs md:text-sm lg:text-base text-gray-400 mt-1 md:mt-2">
                    Dias ativos: {Object.values(data.dias_ativos || {}).filter(Boolean).length} de 7
                  </p>
                </div>
              </div>

              {/* Período de Estudos */}
              <div className="space-y-4 md:space-y-6">
                <h3 className="text-lg md:text-xl lg:text-2xl font-semibold text-gray-100 text-center">Período de Estudos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 max-w-4xl mx-auto">
                  <div className="space-y-2 md:space-y-3">
                    <Label htmlFor="data-inicio" className="text-sm md:text-lg lg:text-xl font-medium text-gray-200">Data de início</Label>
                    <DatePicker
                      id="data-inicio"
                      date={data.data_inicio ? new Date(data.data_inicio) : undefined}
                      onDateChange={(date) => setData(prev => ({ 
                        ...prev, 
                        data_inicio: date ? date.toISOString().split('T')[0] : undefined 
                      }))}
                      placeholder="Selecione a data de início"
                      className="h-10 md:h-12 lg:h-14"
                      minDate={new Date()}
                    />
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <Label htmlFor="data-fim" className="text-sm md:text-lg lg:text-xl font-medium text-gray-200">Data fim</Label>
                    <DatePicker
                      id="data-fim"
                      date={data.data_fim ? new Date(data.data_fim) : undefined}
                      onDateChange={(date) => setData(prev => ({ 
                        ...prev, 
                        data_fim: date ? date.toISOString().split('T')[0] : undefined 
                      }))}
                      placeholder="Selecione a data fim"
                      className="h-10 md:h-12 lg:h-14"
                      minDate={data.data_inicio ? new Date(data.data_inicio) : new Date()}
                    />
                  </div>
                </div>

                {data.data_inicio && data.data_fim && (
                  <div className="p-3 md:p-4 lg:p-5 bg-green-900/30 rounded-xl border border-green-700 max-w-2xl mx-auto">
                    <p className="text-center text-green-300 font-medium text-sm md:text-base lg:text-lg">
                      <Clock className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 inline mr-2" />
                      Período de estudos: <strong>
                        {Math.ceil((new Date(data.data_fim).getTime() - new Date(data.data_inicio).getTime()) / (1000 * 60 * 60 * 24))} dias
                      </strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-center mt-8 md:mt-12 px-4">
              {canProceed() ? (
                <div className="relative animate-float">
                  {/* Efeito de pulso/brilho ao redor do botão - só quando pode prosseguir */}
                  <div className="absolute -inset-3 bg-gradient-to-r from-purple-600/40 via-pink-600/40 to-purple-600/40 rounded-2xl blur-lg opacity-60 animate-pulse"></div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-400/30 via-pink-400/30 to-purple-400/30 rounded-xl animate-ping opacity-30"></div>
                  
                  <RippleButton
                    onClick={finalizarOnboarding}
                    disabled={!canProceed() || loading}
                    size="lg"
                    rippleColor="rgba(255, 255, 255, 0.6)"
                    duration={700}
                    className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white px-8 md:px-10 lg:px-12 py-3 md:py-4 lg:py-5 text-base md:text-lg lg:text-xl font-semibold flex items-center gap-2 md:gap-3 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 border border-white/20 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(45deg, #8b5cf6, #ec4899, #8b5cf6)',
                      backgroundSize: '200% 200%',
                      animation: 'gradient 3s ease infinite'
                    }}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-white mr-2"></div>
                        Finalizando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
                        <span className="relative z-10">Finalizar Configuração</span>
                        <Sparkles className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                      </>
                    )}
                  </RippleButton>
                </div>
              ) : (
                <RippleButton
                  onClick={finalizarOnboarding}
                  disabled={!canProceed() || loading}
                  size="lg"
                  rippleColor="rgba(139, 92, 246, 0.3)"
                  duration={500}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-8 md:px-10 lg:px-12 py-3 md:py-4 lg:py-5 text-base md:text-lg lg:text-xl font-semibold flex items-center gap-2 md:gap-3 shadow-lg transition-all duration-300 border border-gray-500/30 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-white mr-2"></div>
                      Finalizando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
                      <span className="relative z-10">Finalizar Configuração</span>
                      <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                    </>
                  )}
                </RippleButton>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/10 to-indigo-600/20"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-6">
        {/* Progress Bar */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <span className="text-xs md:text-sm font-medium text-gray-300">
              Passo {currentStep + 1} de {totalSteps}
            </span>
            <span className="text-xs md:text-sm font-medium text-gray-300">
              {Math.round(((currentStep + 1) / totalSteps) * 100)}% concluído
            </span>
          </div>
          <div className="w-full bg-gray-800/50 rounded-full h-2 md:h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Navigation Top */}
        <div className="flex justify-between mb-6 md:mb-8 gap-2">
          <RippleButton 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === 0}
            rippleColor="rgba(139, 92, 246, 0.4)"
            className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 text-xs md:text-sm bg-gray-800/80 hover:bg-gray-700 border-2 border-gray-600 hover:border-purple-400 text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Anterior</span>
          </RippleButton>

          {currentStep === totalSteps - 1 ? (
            <RippleButton 
              onClick={finalizarOnboarding}
              disabled={!canProceed() || loading}
              rippleColor="rgba(255, 255, 255, 0.7)"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 md:px-6 py-2 text-xs md:text-sm flex items-center gap-1 md:gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed animate-gentle-pulse"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">Finalizando...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Finalizar Setup</span>
                  <span className="sm:hidden">Finalizar</span>
                  <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />
                </>
              )}
            </RippleButton>
          ) : (
            <RippleButton 
              onClick={nextStep}
              disabled={!canProceed()}
              rippleColor="rgba(255, 255, 255, 0.7)"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-3 md:px-4 py-2 text-xs md:text-sm flex items-center gap-1 md:gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">Próximo</span>
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
            </RippleButton>
          )}
        </div>

        {/* Step Content */}
        <Card className="min-h-[500px] md:min-h-[700px] p-4 md:p-8 bg-gray-900/90 backdrop-blur-sm border border-gray-700 shadow-2xl rounded-xl md:rounded-2xl">
          <CardContent className="p-0">
            {renderStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingPage; 