
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Target, 
  Clock, 
  TrendingUp, 
  Award, 
  Brain,
  FileText,
  Download,
  Users,
  Calendar
} from 'lucide-react';

const Dashboard = () => {
  const stats = [
    {
      title: "Questões Respondidas",
      value: "1,247",
      change: "+12% esta semana",
      icon: BookOpen,
      color: "text-blue-600"
    },
    {
      title: "Taxa de Acertos",
      value: "76%",
      change: "+4% este mês",
      icon: Target,
      color: "text-green-600"
    },
    {
      title: "Horas de Estudo",
      value: "89h",
      change: "Este mês",
      icon: Clock,
      color: "text-purple-600"
    },
    {
      title: "Ranking",
      value: "#127",
      change: "↑15 posições",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  const recentActivities = [
    { title: "Prova UNIFESP 2024", score: "85%", date: "Há 2 horas", type: "prova" },
    { title: "Lista Cardiologia", score: "92%", date: "Ontem", type: "lista" },
    { title: "Flashcards Anatomia", score: "78%", date: "2 dias atrás", type: "flashcard" },
  ];

  const studyPlan = [
    { subject: "Clínica Médica", progress: 85, total: 450, completed: 383 },
    { subject: "Cirurgia Geral", progress: 62, total: 320, completed: 198 },
    { subject: "Pediatria", progress: 45, total: 280, completed: 126 },
    { subject: "Ginecologia", progress: 71, total: 200, completed: 142 },
  ];

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Acompanhe seu progresso nos estudos</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="px-3 py-1">
            <Calendar className="w-4 h-4 mr-1" />
            R1 - 2025
          </Badge>
          <Button className="bg-primary hover:bg-primary/90">
            <Download className="w-4 h-4 mr-2" />
            Relatório Mensal
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Study Plan Progress */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2 text-primary" />
              Plano de Estudos
            </CardTitle>
            <CardDescription>
              Seu progresso por disciplina
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {studyPlan.map((subject, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{subject.subject}</span>
                  <span className="text-sm text-muted-foreground">
                    {subject.completed}/{subject.total} questões
                  </span>
                </div>
                <Progress value={subject.progress} className="h-2" />
                <div className="text-right">
                  <span className="text-sm font-medium text-primary">{subject.progress}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary" />
              Atividades Recentes
            </CardTitle>
            <CardDescription>
              Suas últimas sessões de estudo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <div className="flex-shrink-0">
                  {activity.type === 'prova' && <FileText className="w-8 h-8 text-blue-600" />}
                  {activity.type === 'lista' && <BookOpen className="w-8 h-8 text-green-600" />}
                  {activity.type === 'flashcard' && <Brain className="w-8 h-8 text-purple-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.date}</p>
                </div>
                <Badge variant={parseInt(activity.score) >= 80 ? "default" : "secondary"}>
                  {activity.score}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Continue seus estudos de onde parou</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200">
              <BookOpen className="w-6 h-6" />
              <span>Nova Prova</span>
            </Button>
            <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200">
              <Target className="w-6 h-6" />
              <span>Lista Personalizada</span>
            </Button>
            <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200">
              <Brain className="w-6 h-6" />
              <span>Flashcards</span>
            </Button>
            <Button className="h-20 flex flex-col items-center justify-center space-y-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200">
              <Download className="w-6 h-6" />
              <span>Materiais</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
