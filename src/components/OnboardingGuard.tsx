import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const location = useLocation();
  const [onboardingStatus, setOnboardingStatus] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile && typeof userProfile.onboarding_finalizado === 'boolean') {
      setOnboardingStatus(userProfile.onboarding_finalizado);
      setLoading(false);
      return;
    }
    // Se não tem userProfile, busca do banco
    const checkOnboardingStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profile')
          .select('onboarding_finalizado')
          .eq('user_id', user.id)
          .single();

        if (error) {
          // Se o perfil não existe, criar um novo
          if (error.code === 'PGRST116') {
            const { error: insertError } = await supabase
              .from('user_profile')
              .insert({
                user_id: user.id,
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
                email: user.email,
                avatar_url: user.user_metadata?.avatar_url,
                onboarding_finalizado: false
              });

            if (insertError) {
              console.error('Erro ao criar perfil:', insertError);
            }
            setOnboardingStatus(false);
          } else {
            console.error('Erro ao verificar status do onboarding:', error);
            setOnboardingStatus(false);
          }
        } else {
          setOnboardingStatus(data?.onboarding_finalizado || false);
        }
      } catch (error) {
        console.error('Erro ao verificar status do onboarding:', error);
        setOnboardingStatus(false);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkOnboardingStatus();
    }
  }, [user, userProfile, authLoading]);

  // Se ainda está carregando, mostra loading
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não há usuário, não faz nada (deixa o roteamento normal funcionar)
  if (!user) {
    return <>{children}</>;
  }

  // Se está na página de onboarding e o onboarding já foi finalizado, redireciona para dashboard
  if (location.pathname === '/onboarding' && onboardingStatus === true) {
    return <Navigate to="/dashboard" replace />;
  }

  // Se não está na página de onboarding e o onboarding não foi finalizado, redireciona para onboarding
  if (location.pathname !== '/onboarding' && onboardingStatus === false) {
    return <Navigate to="/onboarding" replace />;
  }

  // Se tudo está OK, renderiza os children normalmente
  return <>{children}</>;
};

export default OnboardingGuard; 