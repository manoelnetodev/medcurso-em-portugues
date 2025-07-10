
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Filter, 
  Clock, 
  CheckCircle, 
  XCircle,
  RotateCcw,
  Target,
  Zap
} from 'lucide-react';

const QuestoesPage = () => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = {
    id: 1,
    number: 1,
    subject: "Cardiologia",
    difficulty: "Média",
    institution: "UNIFESP",
    year: "2024",
    question: "Um paciente de 65 anos, hipertenso e diabético, apresenta dor precordial típica há 2 horas. O ECG mostra supradesnivelamento do segmento ST em V2-V6. Qual a conduta mais adequada?",
    alternatives: [
      { id: 'a', text: 'Iniciar anticoagulação plena e observação clínica', correct: false },
      { id: 'b', text: 'Realizar angioplastia primária imediatamente', correct: true },
      { id: 'c', text: 'Administrar trombolítico e transferir para UTI', correct: false },
      { id: 'd', text: 'Solicitar ecocardiograma antes de qualquer intervenção', correct: false },
      { id: 'e', text: 'Prescrever AAS e clopidogrel apenas', correct: false }
    ],
    explanation: "O paciente apresenta quadro típico de infarto agudo do miocárdio com supradesnivelamento do segmento ST (IAMCSST). A angioplastia primária é o tratamento de escolha quando disponível em até 120 minutos do primeiro contato médico.",
    statistics: {
      totalAnswers: 1247,
      correctPercentage: 78,
      myAccuracy: 85
    }
  };

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
  };

  const handleSubmit = () => {
    setShowResult(true);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    // Lógica para próxima questão
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Questões</h1>
          <p className="text-muted-foreground">Pratique com questões selecionadas</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Target className="w-4 h-4 mr-2" />
            Modo Foco
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Progress */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progresso da Sessão</span>
                <span className="text-sm text-muted-foreground">1 de 20 questões</span>
              </div>
              <Progress value={5} className="mb-4" />
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    0 corretas
                  </div>
                  <div className="flex items-center text-red-600">
                    <XCircle className="w-4 h-4 mr-1" />
                    0 erradas
                  </div>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="w-4 h-4 mr-1" />
                  0:45
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">{currentQuestion.subject}</Badge>
                  <Badge variant="secondary">{currentQuestion.difficulty}</Badge>
                  <Badge variant="outline">{currentQuestion.institution} {currentQuestion.year}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Questão {currentQuestion.number}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Question Text */}
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground leading-relaxed">
                  {currentQuestion.question}
                </p>
              </div>

              {/* Alternatives */}
              <div className="space-y-3">
                {currentQuestion.alternatives.map((alt) => (
                  <button
                    key={alt.id}
                    onClick={() => handleAnswerSelect(alt.id)}
                    disabled={showResult}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedAnswer === alt.id
                        ? showResult
                          ? alt.correct
                            ? 'border-green-500 bg-green-50 text-green-800'
                            : 'border-red-500 bg-red-50 text-red-800'
                          : 'border-primary bg-primary/5 text-primary'
                        : showResult && alt.correct
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-border hover:border-muted-foreground bg-card hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-medium">
                        {alt.id.toUpperCase()}
                      </span>
                      <span className="flex-1">{alt.text}</span>
                      {showResult && selectedAnswer === alt.id && (
                        alt.correct ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )
                      )}
                      {showResult && alt.correct && selectedAnswer !== alt.id && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Explanation (shown after answer) */}
              {showResult && (
                <div className="border-t pt-6 space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Explicação</h4>
                    <p className="text-blue-800 text-sm leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                  
                  {/* Statistics */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="text-lg font-bold text-foreground">
                        {currentQuestion.statistics.totalAnswers}
                      </div>
                      <div className="text-xs text-muted-foreground">Total de respostas</div>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="text-lg font-bold text-green-600">
                        {currentQuestion.statistics.correctPercentage}%
                      </div>
                      <div className="text-xs text-muted-foreground">Taxa de acertos</div>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="text-lg font-bold text-primary">
                        {currentQuestion.statistics.myAccuracy}%
                      </div>
                      <div className="text-xs text-muted-foreground">Seu histórico</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pb-6">
            <Button variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Refazer
            </Button>
            
            <div className="flex items-center space-x-3">
              {!showResult ? (
                <Button 
                  onClick={handleSubmit}
                  disabled={!selectedAnswer}
                  className="bg-primary hover:bg-primary/90"
                >
                  Responder
                </Button>
              ) : (
                <Button onClick={handleNext} className="bg-primary hover:bg-primary/90">
                  Próxima Questão
                  <Zap className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestoesPage;
