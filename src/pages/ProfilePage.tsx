import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  MapPin, 
  GraduationCap, 
  Target, 
  Building, 
  Calendar,
  Settings,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const ProfilePage = () => {
  const { userProfile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Erro ao carregar perfil</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-xl">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            Perfil Configurado! 🎉
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Seu perfil foi configurado com sucesso. Agora você pode começar seus estudos personalizados no UltraMeds!
          </p>
        </div>

        {/* Profile Card */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={userProfile.avatar_url || undefined} />
                <AvatarFallback className="bg-purple-600 text-white text-2xl">
                  {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 
                   (userProfile.email ? userProfile.email.charAt(0).toUpperCase() : 'U')}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {userProfile.name || 'Usuário'}
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              {userProfile.email}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Especialidade Principal */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  <GraduationCap className="w-4 h-4" />
                  Especialidade Principal
                </div>
                                 <Badge variant="secondary" className="text-sm px-3 py-1">
                   {(userProfile as any).especialidade_principal || 'Não definida'}
                 </Badge>
              </div>

              {/* Foco de Estudo */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  <Target className="w-4 h-4" />
                  Foco de Estudo
                </div>
                                 <Badge variant="secondary" className="text-sm px-3 py-1">
                   {(userProfile as any).foco || 'Não definido'}
                 </Badge>
              </div>

                             {/* Especialidades Secundárias */}
               {(userProfile as any).especialidades_secundarias && (userProfile as any).especialidades_secundarias.length > 0 && (
                 <div className="space-y-2 md:col-span-2">
                   <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                     <GraduationCap className="w-4 h-4" />
                     Especialidades Secundárias
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {(userProfile as any).especialidades_secundarias.slice(0, 5).map((esp: string, index: number) => (
                       <Badge key={index} variant="outline" className="text-xs">
                         {esp}
                       </Badge>
                     ))}
                     {(userProfile as any).especialidades_secundarias.length > 5 && (
                       <Badge variant="outline" className="text-xs">
                         +{(userProfile as any).especialidades_secundarias.length - 5} mais
                       </Badge>
                     )}
                   </div>
                 </div>
               )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex-1 h-12"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Ir para Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/settings')}
                className="flex-1 h-12"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 border-blue-200 dark:border-blue-700">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Pronto para Estudar</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">Seu perfil está configurado</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/50 border-green-200 dark:border-green-700">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">Cronograma Ativo</h3>
              <p className="text-sm text-green-700 dark:text-green-300">Seus estudos estão planejados</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/50 border-purple-200 dark:border-purple-700">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">Setup Completo</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">Tudo pronto para começar</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 