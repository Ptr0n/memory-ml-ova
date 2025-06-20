
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Brain, Play, RotateCcw, AlertTriangle } from 'lucide-react';
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
  const [testCompleted, setTestCompleted] = useState(false);

  const maxTrials = 15; // Aumentado para más repeticiones
  const practiceTrials = 3; // Aumentado para mejor práctica

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
    setTestCompleted(false);
    generateNewTrial();
  };

  const startMainTest = () => {
    setTestPhase('test');
    setIsPractice(false);
    setCurrentTrial(0);
    setTrials([]);
    setSequenceLength(3);
    setTestCompleted(false);
    generateNewTrial();
  };

  const generateNewTrial = () => {
    const sequence = generateSequence(sequenceLength);
    setCurrentSequence(sequence);
    setUserInput('');
    setShowingSequence(true);
    setTimeRemaining(Math.max(2, sequenceLength)); // Tiempo mínimo de 2 segundos
  };

  const submitAnswer = () => {
    if (!userInput.trim()) {
      toast.error('Por favor ingrese su respuesta');
      return;
    }

    try {
      const reactionTime = Date.now() - startTime;
      const userNumbers = userInput.split('').map(Number).filter(n => !isNaN(n));
      const reversedSequence = [...currentSequence].reverse();
      
      const isCorrect = userNumbers.length === reversedSequence.length && 
                        userNumbers.every((num, index) => num === reversedSequence[index]);

      const newTrial: Trial = {
        sequence: currentSequence,
        userInput,
        isCorrect,
        reactionTime: Math.max(100, reactionTime) // Mínimo 100ms
      };

      const updatedTrials = [...trials, newTrial];
      setTrials(updatedTrials);

      if (isPractice) {
        if (currentTrial < practiceTrials - 1) {
          setCurrentTrial(currentTrial + 1);
          // Aumentar dificultad gradualmente en práctica
          if (currentTrial === 1) setSequenceLength(4);
          generateNewTrial();
          toast.success(isCorrect ? '¡Correcto!' : 'Incorrecto. Intente de nuevo.');
        } else {
          toast.success('Práctica completada. ¡Ahora comience el test real!');
        }
      } else {
        // Main test logic con dificultad progresiva
        if (isCorrect && sequenceLength < 8) {
          // Aumentar dificultad cada 3 respuestas correctas
          const correctCount = updatedTrials.filter(t => t.isCorrect).length;
          if (correctCount % 3 === 0) {
            setSequenceLength(Math.min(8, sequenceLength + 1));
          }
        }

        if (currentTrial < maxTrials - 1) {
          setCurrentTrial(currentTrial + 1);
          generateNewTrial();
          toast.success(isCorrect ? '¡Correcto!' : 'Incorrecto');
        } else {
          setTestCompleted(true);
          calculateResults(updatedTrials);
        }
      }
    } catch (error) {
      console.error('Error processing answer:', error);
      toast.error('Error al procesar la respuesta');
    }
  };

  const calculateResults = (finalTrials: Trial[]) => {
    try {
      if (finalTrials.length === 0) {
        toast.error('No hay datos suficientes para calcular resultados');
        return;
      }

      const correctAnswers = finalTrials.filter(t => t.isCorrect).length;
      const accuracy = (correctAnswers / finalTrials.length) * 100;
      const avgReactionTime = finalTrials.reduce((sum, t) => sum + (t.reactionTime || 1000), 0) / finalTrials.length;
      
      // Cálculo más robusto del puntaje de memoria
      let memoryScore = 0;
      if (accuracy >= 90) memoryScore = 9 + Math.min(1, (accuracy - 90) / 10);
      else if (accuracy >= 80) memoryScore = 8 + (accuracy - 80) / 10;
      else if (accuracy >= 70) memoryScore = 7 + (accuracy - 70) / 10;
      else if (accuracy >= 60) memoryScore = 6 + (accuracy - 60) / 10;
      else if (accuracy >= 50) memoryScore = 5 + (accuracy - 50) / 10;
      else memoryScore = Math.max(0, accuracy / 10);

      memoryScore = Math.min(10, Math.max(0, memoryScore));

      // Cálculo de atención sostenida basado en tiempo de reacción
      const normalizedReactionTime = Math.max(500, Math.min(3000, avgReactionTime));
      const attentionScore = Math.max(0, 10 - ((normalizedReactionTime - 500) / 250));

      // Save results con validaciones
      const result = {
        participante_id: `WM_${Date.now()}`,
        memoria_trabajo: parseFloat(memoryScore.toFixed(2)),
        precision_respuestas: parseFloat(accuracy.toFixed(2)),
        tiempo_reaccion: Math.round(avgReactionTime),
        memoria_inmediata: parseFloat((memoryScore * 0.9).toFixed(2)), // Related measure
        atencion_sostenida: parseFloat(attentionScore.toFixed(2)),
        fecha: new Date().toISOString(),
        // Default values for required fields
        edad: 25,
        nivel_educacion: 2,
        memoria_visual: 7.5,
        fatiga_cognitiva: Math.min(5, Math.max(1, Math.ceil(avgReactionTime / 600)))
      };

      const existingResults = JSON.parse(localStorage.getItem('test_results') || '[]');
      existingResults.push(result);
      localStorage.setItem('test_results', JSON.stringify(existingResults));

      setTestPhase('results');
      toast.success(`Test completado. Puntuación: ${memoryScore.toFixed(1)}/10`);
    } catch (error) {
      console.error('Error calculating results:', error);
      toast.error('Error al calcular resultados');
      setTestPhase('results'); // Mostrar resultados parciales
    }
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
    setTestCompleted(false);
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

  const calculateFinalStats = () => {
    if (trials.length === 0) return { correctAnswers: 0, accuracy: 0, avgReactionTime: 0, maxLength: 3 };
    
    const correctAnswers = trials.filter(t => t.isCorrect).length;
    const accuracy = (correctAnswers / trials.length) * 100;
    const avgReactionTime = trials.reduce((sum, t) => sum + (t.reactionTime || 1000), 0) / trials.length;
    const maxLength = Math.max(...trials.map((_, index) => Math.min(8, 3 + Math.floor(index / 3))));
    
    return { correctAnswers, accuracy, avgReactionTime, maxLength };
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
                <li>La dificultad aumentará gradualmente hasta 8 números</li>
                <li>Se realizarán {maxTrials} ensayos principales</li>
                <li>Se mide tanto la precisión como el tiempo de respuesta</li>
                <li>Primero realizará {practiceTrials} ensayos de práctica</li>
              </ul>

              <div className="bg-yellow-50 p-4 rounded-lg flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  <strong>Advertencia:</strong> Debe completar todos los tests para obtener resultados válidos.
                </p>
              </div>
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
                `Ejemplo: si vio ${currentSequence.join('-')}, escriba ${[...currentSequence].reverse().join('')}`
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
                  Memorice estos números: {timeRemaining}s
                </div>
                <Progress value={(timeRemaining / Math.max(2, sequenceLength)) * 100} className="w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="mb-4 font-semibold">Escriba en orden inverso:</p>
                  <Input
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder={`Ingrese ${sequenceLength} dígitos`}
                    className="text-center text-xl font-bold max-w-xs mx-auto"
                    maxLength={sequenceLength}
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && userInput.length === sequenceLength) {
                        submitAnswer();
                      }
                    }}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Ingrese exactamente {sequenceLength} dígitos
                  </p>
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
                Ahora comenzará el test real con {maxTrials} ensayos. ¡Haga su mejor esfuerzo!
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
              {testCompleted ? (
                <>
                  <div className="text-4xl font-bold text-purple-600">
                    {(() => {
                      const stats = calculateFinalStats();
                      const score = Math.min(10, Math.max(0, (stats.accuracy / 100) * 10));
                      return score.toFixed(1);
                    })()}/10
                  </div>
                  <p className="text-lg font-semibold">Puntuación de Memoria de Trabajo</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {(() => {
                      const stats = calculateFinalStats();
                      return (
                        <>
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Respuestas Correctas</p>
                            <p className="text-xl font-bold text-purple-600">
                              {stats.correctAnswers} de {trials.length}
                            </p>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Precisión</p>
                            <p className="text-xl font-bold text-blue-600">
                              {stats.accuracy.toFixed(1)}%
                            </p>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Tiempo Promedio</p>
                            <p className="text-xl font-bold text-green-600">
                              {Math.round(stats.avgReactionTime)}ms
                            </p>
                          </div>
                          <div className="bg-orange-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Longitud Máxima</p>
                            <p className="text-xl font-bold text-orange-600">
                              {stats.maxLength} números
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                    <p><strong>Interpretación:</strong></p>
                    <p>
                      {(() => {
                        const stats = calculateFinalStats();
                        const accuracy = stats.correctAnswers / trials.length;
                        if (accuracy >= 0.8) return 'Excelente capacidad de memoria de trabajo';
                        if (accuracy >= 0.6) return 'Buena capacidad de memoria de trabajo';
                        if (accuracy >= 0.4) return 'Capacidad de memoria de trabajo promedio';
                        return 'Se recomienda evaluación adicional';
                      })()}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-2xl font-bold text-yellow-600">Test Incompleto</div>
                  <p className="text-gray-600">
                    El test no se completó correctamente. Algunos resultados pueden no estar disponibles.
                  </p>
                  <div className="bg-yellow-50 p-4 rounded-lg flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      Para obtener resultados válidos, complete todos los tests requeridos.
                    </p>
                  </div>
                </div>
              )}
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
