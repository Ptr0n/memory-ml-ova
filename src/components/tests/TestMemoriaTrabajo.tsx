
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Brain, Play, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface Trial {
  sequence: number[];
  userInput: string;
  isCorrect: boolean;
  reactionTime: number;
}

const TestMemoriaTrabajo = () => {
  const [testPhase, setTestPhase] = useState<'instructions' | 'practice' | 'test' | 'results'>('instructions');
  const [currentTrial, setCurrentTrial] = useState(0);
  const [currentSequence, setCurrentSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState('');
  const [showingSequence, setShowingSequence] = useState(false);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [sequenceLength, setSequenceLength] = useState(3);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [isPractice, setIsPractice] = useState(false);

  const maxTrials = 10;
  const practiceTrials = 2;

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showingSequence && timeRemaining === 0) {
      setShowingSequence(false);
      setStartTime(Date.now());
    }
  }, [timeRemaining, showingSequence]);

  const generateSequence = (length: number): number[] => {
    return Array.from({ length }, () => Math.floor(Math.random() * 9));
  };

  const startPractice = () => {
    setTestPhase('practice');
    setIsPractice(true);
    setCurrentTrial(0);
    setTrials([]);
    setSequenceLength(3);
    generateNewTrial();
  };

  const startMainTest = () => {
    setTestPhase('test');
    setIsPractice(false);
    setCurrentTrial(0);
    setTrials([]);
    setSequenceLength(3);
    generateNewTrial();
  };

  const generateNewTrial = () => {
    const sequence = generateSequence(sequenceLength);
    setCurrentSequence(sequence);
    setUserInput('');
    setShowingSequence(true);
    setTimeRemaining(sequenceLength * 1000 / 1000); // 1 second per digit
  };

  const submitAnswer = () => {
    if (!userInput.trim()) {
      toast.error('Por favor ingrese su respuesta');
      return;
    }

    const reactionTime = Date.now() - startTime;
    const userNumbers = userInput.split('').map(Number);
    const reversedSequence = [...currentSequence].reverse();
    
    const isCorrect = userNumbers.length === reversedSequence.length && 
                      userNumbers.every((num, index) => num === reversedSequence[index]);

    const newTrial: Trial = {
      sequence: currentSequence,
      userInput,
      isCorrect,
      reactionTime
    };

    const updatedTrials = [...trials, newTrial];
    setTrials(updatedTrials);

    if (isPractice) {
      if (currentTrial < practiceTrials - 1) {
        setCurrentTrial(currentTrial + 1);
        generateNewTrial();
        toast.success(isCorrect ? '¡Correcto!' : 'Incorrecto. Intente de nuevo.');
      } else {
        toast.success('Práctica completada. ¡Ahora comience el test real!');
        // Don't move to results, let user start main test
      }
    } else {
      // Main test logic
      if (isCorrect && sequenceLength < 7) {
        // Increase difficulty every 2 correct answers
        if ((updatedTrials.filter(t => t.isCorrect).length) % 2 === 0) {
          setSequenceLength(sequenceLength + 1);
        }
      }

      if (currentTrial < maxTrials - 1) {
        setCurrentTrial(currentTrial + 1);
        generateNewTrial();
        toast.success(isCorrect ? '¡Correcto!' : 'Incorrecto');
      } else {
        calculateResults(updatedTrials);
      }
    }
  };

  const calculateResults = (finalTrials: Trial[]) => {
    const correctAnswers = finalTrials.filter(t => t.isCorrect).length;
    const accuracy = (correctAnswers / finalTrials.length) * 100;
    const avgReactionTime = finalTrials.reduce((sum, t) => sum + t.reactionTime, 0) / finalTrials.length;
    
    // Calculate working memory score based on performance
    let memoryScore = 0;
    if (accuracy >= 90) memoryScore = 9 + (accuracy - 90) / 10;
    else if (accuracy >= 80) memoryScore = 8 + (accuracy - 80) / 10;
    else if (accuracy >= 70) memoryScore = 7 + (accuracy - 70) / 10;
    else if (accuracy >= 60) memoryScore = 6 + (accuracy - 60) / 10;
    else if (accuracy >= 50) memoryScore = 5 + (accuracy - 50) / 10;
    else memoryScore = accuracy / 10;

    memoryScore = Math.min(10, Math.max(0, memoryScore));

    // Save results
    const result = {
      participante_id: `WM_${Date.now()}`,
      memoria_trabajo: memoryScore,
      precision_respuestas: accuracy,
      tiempo_reaccion: Math.round(avgReactionTime),
      memoria_inmediata: memoryScore * 0.9, // Related measure
      atencion_sostenida: Math.max(0, 10 - (avgReactionTime - 1000) / 200), // Attention score based on reaction time
      fecha: new Date().toISOString(),
      // Default values for required fields
      edad: 25,
      nivel_educacion: 2,
      memoria_visual: 7.5,
      fatiga_cognitiva: 2
    };

    const existingResults = JSON.parse(localStorage.getItem('test_results') || '[]');
    existingResults.push(result);
    localStorage.setItem('test_results', JSON.stringify(existingResults));

    setTestPhase('results');
    toast.success(`Test completado. Puntuación: ${memoryScore.toFixed(1)}/10`);
  };

  const resetTest = () => {
    setTestPhase('instructions');
    setCurrentTrial(0);
    setCurrentSequence([]);
    setUserInput('');
    setShowingSequence(false);
    setTrials([]);
    setSequenceLength(3);
    setTimeRemaining(0);
    setIsPractice(false);
  };

  const getProgress = () => {
    if (testPhase === 'practice') {
      return ((currentTrial + 1) / practiceTrials) * 100;
    } else if (testPhase === 'test') {
      return ((currentTrial + 1) / maxTrials) * 100;
    }
    return testPhase === 'results' ? 100 : 0;
  };

  const getCurrentTrialInfo = () => {
    if (testPhase === 'practice') {
      return `Práctica ${currentTrial + 1} de ${practiceTrials}`;
    } else if (testPhase === 'test') {
      return `Ensayo ${currentTrial + 1} de ${maxTrials} | Longitud: ${sequenceLength}`;
    }
    return '';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <span>Test de Memoria de Trabajo</span>
          </CardTitle>
          <CardDescription>
            Evaluación de la capacidad de mantener y manipular información en la memoria de trabajo
          </CardDescription>
          {(testPhase === 'practice' || testPhase === 'test') && (
            <div className="space-y-2">
              <Progress value={getProgress()} className="w-full" />
              <p className="text-sm text-gray-600">{getCurrentTrialInfo()}</p>
            </div>
          )}
        </CardHeader>
      </Card>

      {testPhase === 'instructions' && (
        <Card>
          <CardHeader>
            <CardTitle>Instrucciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <p><strong>¿Cómo funciona el test?</strong></p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Se mostrará una secuencia de números en la pantalla</li>
                <li>Memorice los números en el orden que aparecen</li>
                <li>Cuando termine la secuencia, escriba los números en <strong>orden inverso</strong></li>
                <li>Por ejemplo: si ve "3-7-1", debe escribir "173"</li>
              </ol>

              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>Importante:</strong> Este test evalúa su memoria de trabajo, que es la capacidad 
                  de mantener información activa en su mente mientras la manipula mentalmente.
                </p>
              </div>

              <p><strong>Características del test:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Comenzará con secuencias de 3 números</li>
                <li>La dificultad aumentará gradualmente</li>
                <li>Se mide tanto la precisión como el tiempo de respuesta</li>
                <li>Primero realizará 2 ensayos de práctica</li>
              </ul>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button onClick={startPractice} className="bg-purple-600 hover:bg-purple-700">
                <Play className="h-4 w-4 mr-2" />
                Comenzar Práctica
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(testPhase === 'practice' || testPhase === 'test') && (
        <Card>
          <CardHeader>
            <CardTitle>
              {showingSequence ? 'Memorice esta secuencia' : 'Escriba los números en orden INVERSO'}
            </CardTitle>
            <CardDescription>
              {showingSequence ? 
                `Longitud de secuencia: ${sequenceLength} números` :
                `Ejemplo: si vio 1-2-3, escriba 321`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {showingSequence ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center space-x-4">
                  {currentSequence.map((num, index) => (
                    <div key={index} className="w-16 h-16 bg-purple-500 text-white rounded-lg flex items-center justify-center text-2xl font-bold">
                      {num}
                    </div>
                  ))}
                </div>
                <div className="text-lg font-semibold text-purple-600">
                  Tiempo restante: {timeRemaining}s
                </div>
                <Progress value={(timeRemaining / (sequenceLength * 1)) * 100} className="w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="mb-4 text-gray-600">Secuencia vista: {currentSequence.join(' - ')}</p>
                  <p className="mb-4 font-semibold">Escriba en orden inverso:</p>
                  <Input
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Ej: 321"
                    className="text-center text-xl font-bold max-w-xs mx-auto"
                    maxLength={sequenceLength}
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        submitAnswer();
                      }
                    }}
                  />
                </div>
                <div className="flex justify-center">
                  <Button 
                    onClick={submitAnswer}
                    disabled={!userInput.trim() || userInput.length !== sequenceLength}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Confirmar Respuesta
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {testPhase === 'practice' && trials.length === practiceTrials && (
        <Card>
          <CardHeader>
            <CardTitle>Práctica Completada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p>¡Excelente! Ha completado los ensayos de práctica.</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm">
                  <strong>Resultados de práctica:</strong><br/>
                  Respuestas correctas: {trials.filter(t => t.isCorrect).length} de {trials.length}<br/>
                  Precisión: {((trials.filter(t => t.isCorrect).length / trials.length) * 100).toFixed(1)}%
                </p>
              </div>
              <p className="text-sm text-gray-600">
                Ahora comenzará el test real. ¡Haga su mejor esfuerzo!
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <Button onClick={startMainTest} className="bg-green-600 hover:bg-green-700">
                Comenzar Test Real
              </Button>
              <Button onClick={resetTest} variant="outline">
                Volver al Inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {testPhase === 'results' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span>Resultados del Test de Memoria de Trabajo</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-purple-600">
                {trials.length > 0 ? 
                  (((trials.filter(t => t.isCorrect).length / trials.length) * 100 / 10)).toFixed(1) : 
                  '0.0'
                }/10
              </div>
              <p className="text-lg font-semibold">Puntuación de Memoria de Trabajo</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Respuestas Correctas</p>
                  <p className="text-xl font-bold text-purple-600">
                    {trials.filter(t => t.isCorrect).length} de {trials.length}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Precisión</p>
                  <p className="text-xl font-bold text-blue-600">
                    {trials.length > 0 ? ((trials.filter(t => t.isCorrect).length / trials.length) * 100).toFixed(1) : '0'}%
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Tiempo Promedio</p>
                  <p className="text-xl font-bold text-green-600">
                    {trials.length > 0 ? Math.round(trials.reduce((sum, t) => sum + t.reactionTime, 0) / trials.length) : 0}ms
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Longitud Máxima</p>
                  <p className="text-xl font-bold text-orange-600">
                    {Math.max(...trials.map((_, index) => Math.min(7, 3 + Math.floor(index / 2))))} números
                  </p>
                </div>
              </div>

              <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                <p><strong>Interpretación:</strong></p>
                <p>
                  {trials.filter(t => t.isCorrect).length / trials.length >= 0.8 ? 
                    'Excelente capacidad de memoria de trabajo' :
                   trials.filter(t => t.isCorrect).length / trials.length >= 0.6 ? 
                    'Buena capacidad de memoria de trabajo' :
                   trials.filter(t => t.isCorrect).length / trials.length >= 0.4 ? 
                    'Capacidad de memoria de trabajo promedio' :
                    'Se recomienda evaluación adicional'
                  }
                </p>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button onClick={resetTest} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Repetir Test
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TestMemoriaTrabajo;
