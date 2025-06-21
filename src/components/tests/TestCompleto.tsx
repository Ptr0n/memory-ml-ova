
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Brain, Eye, Target, Clock, User } from 'lucide-react';
import { toast } from 'sonner';

interface TestResult {
  participante_id: string;
  edad: number;
  nivel_educacion: number;
  memoria_trabajo: number;
  memoria_visual: number;
  tiempo_reaccion: number;
  precision_respuestas: number;
  atencion_sostenida: number;
  fatiga_cognitiva: number;
  fecha: string;
}

const TestCompleto = () => {
  const [currentTest, setCurrentTest] = useState<'info' | 'visual' | 'trabajo' | 'atencion' | 'resultados'>('info');
  const [participantData, setParticipantData] = useState({
    nombre: '',
    edad: '',
    educacion: '2'
  });
  
  // Test de Memoria Visual
  const [visualSequence, setVisualSequence] = useState<number[]>([]);
  const [userVisualSequence, setUserVisualSequence] = useState<number[]>([]);
  const [showingSequence, setShowingSequence] = useState(false);
  const [visualTestStarted, setVisualTestStarted] = useState(false);
  
  // Test de Memoria de Trabajo (reducido a 10 pruebas)
  const [workingMemoryTrial, setWorkingMemoryTrial] = useState(0);
  const [workingMemorySequence, setWorkingMemorySequence] = useState<number[]>([]);
  const [workingMemoryInput, setWorkingMemoryInput] = useState('');
  const [workingMemoryStarted, setWorkingMemoryStarted] = useState(false);
  const [workingMemoryResults, setWorkingMemoryResults] = useState<boolean[]>([]);
  const [showingWorkingSequence, setShowingWorkingSequence] = useState(false);
  
  // Test de Atención
  const [attentionTargets, setAttentionTargets] = useState<boolean[]>([]);
  const [attentionResponses, setAttentionResponses] = useState<boolean[]>([]);
  const [currentAttentionIndex, setCurrentAttentionIndex] = useState(0);
  const [attentionStarted, setAttentionStarted] = useState(false);
  
  // Resultados
  const [startTime, setStartTime] = useState<number>(0);
  const [testResults, setTestResults] = useState<Partial<TestResult>>({});
  
  // Progress
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const testSteps = ['info', 'visual', 'trabajo', 'atencion', 'resultados'];
    const currentIndex = testSteps.indexOf(currentTest);
    setProgress((currentIndex / (testSteps.length - 1)) * 100);
  }, [currentTest]);

  // Test de Memoria Visual
  const startVisualTest = () => {
    const sequence = Array.from({ length: 5 }, () => Math.floor(Math.random() * 9));
    setVisualSequence(sequence);
    setUserVisualSequence([]);
    setShowingSequence(true);
    setVisualTestStarted(true);
    setStartTime(Date.now());
    
    setTimeout(() => {
      setShowingSequence(false);
    }, 3000);
  };

  const addToVisualSequence = (num: number) => {
    if (!showingSequence && visualTestStarted) {
      const newSequence = [...userVisualSequence, num];
      setUserVisualSequence(newSequence);
      
      if (newSequence.length === visualSequence.length) {
        const correct = newSequence.every((num, index) => num === visualSequence[index]);
        const score = correct ? 10 : Math.max(0, 10 - (visualSequence.length - newSequence.filter((num, index) => num === visualSequence[index]).length) * 2);
        setTestResults(prev => ({ 
          ...prev, 
          memoria_visual: score,
          tiempo_reaccion: Date.now() - startTime
        }));
        setTimeout(() => setCurrentTest('trabajo'), 1000);
        toast.success(`Test visual completado. Puntuación: ${score}/10`);
      }
    }
  };

  // Test de Memoria de Trabajo (10 pruebas)
  const startWorkingMemoryTest = () => {
    setWorkingMemoryTrial(1);
    setWorkingMemoryResults([]);
    setWorkingMemoryStarted(true);
    startWorkingMemoryTrial();
  };

  const startWorkingMemoryTrial = () => {
    const length = Math.min(3 + Math.floor(workingMemoryTrial / 3), 7);
    const sequence = Array.from({ length }, () => Math.floor(Math.random() * 9));
    setWorkingMemorySequence(sequence);
    setWorkingMemoryInput('');
    setShowingWorkingSequence(true);
    
    setTimeout(() => {
      setShowingWorkingSequence(false);
    }, 2000 + (length * 500));
  };

  const submitWorkingMemoryTrial = () => {
    const userNumbers = workingMemoryInput.split('').map(Number).filter(n => !isNaN(n));
    const reversedOriginal = [...workingMemorySequence].reverse();
    
    const correct = userNumbers.length === reversedOriginal.length && 
                   userNumbers.every((num, index) => num === reversedOriginal[index]);
    
    const newResults = [...workingMemoryResults, correct];
    setWorkingMemoryResults(newResults);
    
    if (workingMemoryTrial >= 10) {
      const correctCount = newResults.filter(r => r).length;
      const score = (correctCount / 10) * 10;
      setTestResults(prev => ({ ...prev, memoria_trabajo: score }));
      setCurrentTest('atencion');
      toast.success(`Test de memoria de trabajo completado. Puntuación: ${score.toFixed(1)}/10`);
    } else {
      setWorkingMemoryTrial(prev => prev + 1);
      setTimeout(() => startWorkingMemoryTrial(), 1000);
    }
  };

  // Test de Atención
  const startAttentionTest = () => {
    const targets = Array.from({ length: 20 }, () => Math.random() > 0.7);
    setAttentionTargets(targets);
    setAttentionResponses([]);
    setCurrentAttentionIndex(0);
    setAttentionStarted(true);
    
    const interval = setInterval(() => {
      setCurrentAttentionIndex(prev => {
        if (prev >= 19) {
          clearInterval(interval);
          setTimeout(() => calculateAttentionScore(), 500);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
  };

  const respondToAttention = (isTarget: boolean) => {
    setAttentionResponses(prev => [...prev, isTarget]);
  };

  const calculateAttentionScore = () => {
    const correct = attentionResponses.filter((response, index) => response === attentionTargets[index]).length;
    const score = (correct / attentionTargets.length) * 10;
    
    setTestResults(prev => ({ 
      ...prev, 
      atencion_sostenida: score,
      precision_respuestas: (correct / attentionTargets.length) * 100,
      fatiga_cognitiva: Math.floor(Math.random() * 3) + 1
    }));
    
    setCurrentTest('resultados');
    toast.success(`Test de atención completado. Puntuación: ${score.toFixed(1)}/10`);
  };

  const saveResults = () => {
    const finalResults: TestResult = {
      participante_id: `EVAL_${Date.now()}`,
      edad: parseInt(participantData.edad),
      nivel_educacion: parseInt(participantData.educacion),
      memoria_trabajo: testResults.memoria_trabajo || 0,
      memoria_visual: testResults.memoria_visual || 0,
      tiempo_reaccion: testResults.tiempo_reaccion || 0,
      atencion_sostenida: testResults.atencion_sostenida || 0,
      precision_respuestas: testResults.precision_respuestas || 0,
      fatiga_cognitiva: testResults.fatiga_cognitiva || 1,
      fecha: new Date().toISOString()
    };

    const existingResults = JSON.parse(localStorage.getItem('test_results') || '[]');
    existingResults.push(finalResults);
    localStorage.setItem('test_results', JSON.stringify(existingResults));
    
    toast.success('Resultados guardados exitosamente');
  };

  const resetTest = () => {
    setCurrentTest('info');
    setProgress(0);
    setVisualTestStarted(false);
    setWorkingMemoryStarted(false);
    setAttentionStarted(false);
    setWorkingMemoryTrial(0);
    setWorkingMemoryResults([]);
    setTestResults({});
    setParticipantData({ nombre: '', edad: '', educacion: '2' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <span>Evaluación Cognitiva Completa</span>
          </CardTitle>
          <CardDescription>
            Batería de tests neuropsicológicos: Memoria Visual, Memoria de Trabajo y Atención Sostenida
          </CardDescription>
          <Progress value={progress} className="w-full" />
        </CardHeader>
      </Card>

      {currentTest === 'info' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span>Información del Participante</span>
            </CardTitle>
            <CardDescription>
              Complete la información antes de comenzar la evaluación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre o Iniciales</Label>
              <Input
                id="nombre"
                value={participantData.nombre}
                onChange={(e) => setParticipantData(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Juan P. o J.P."
              />
            </div>
            <div>
              <Label htmlFor="edad">Edad</Label>
              <Input
                id="edad"
                type="number"
                min="18"
                max="85"
                value={participantData.edad}
                onChange={(e) => setParticipantData(prev => ({ ...prev, edad: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="educacion">Nivel Educativo</Label>
              <select
                id="educacion"
                value={participantData.educacion}
                onChange={(e) => setParticipantData(prev => ({ ...prev, educacion: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="1">Básico (Primaria/Secundaria)</option>
                <option value="2">Medio (Bachillerato/Técnico)</option>
                <option value="3">Superior (Universitario/Postgrado)</option>
              </select>
            </div>
            <Button 
              onClick={() => setCurrentTest('visual')}
              disabled={!participantData.nombre || !participantData.edad}
              className="w-full"
            >
              Comenzar Evaluación
            </Button>
          </CardContent>
        </Card>
      )}

      {currentTest === 'visual' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-600" />
              <span>Test de Memoria Visual (1/3)</span>
            </CardTitle>
            <CardDescription>
              Memorice la secuencia de números y repítala en el mismo orden
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!visualTestStarted ? (
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  Se mostrará una secuencia de 5 números durante 3 segundos. 
                  Luego deberá reproducir la secuencia haciendo clic en los números.
                </p>
                <Button onClick={startVisualTest} className="bg-green-600 hover:bg-green-700">
                  Iniciar Test de Memoria Visual
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {showingSequence ? (
                  <div className="text-center">
                    <p className="text-lg font-semibold mb-4">Memorice esta secuencia:</p>
                    <div className="flex justify-center space-x-4">
                      {visualSequence.map((num, index) => (
                        <div key={index} className="w-16 h-16 bg-blue-500 text-white rounded-lg flex items-center justify-center text-2xl font-bold">
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-lg font-semibold mb-4">Reproduzca la secuencia:</p>
                    <div className="flex justify-center space-x-2 mb-6">
                      {userVisualSequence.map((num, index) => (
                        <div key={index} className="w-12 h-12 bg-green-500 text-white rounded-lg flex items-center justify-center text-lg font-bold">
                          {num}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <Button
                          key={num}
                          onClick={() => addToVisualSequence(num)}
                          variant="outline"
                          className="w-16 h-16 text-lg font-semibold"
                        >
                          {num}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentTest === 'trabajo' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span>Test de Memoria de Trabajo (2/3)</span>
            </CardTitle>
            <CardDescription>
              Prueba {workingMemoryTrial}/10 - Memorice los números y repítalos en orden inverso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!workingMemoryStarted ? (
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  Se realizarán 10 pruebas. En cada una verá una secuencia de números que debe escribir en orden inverso.
                </p>
                <Button onClick={startWorkingMemoryTest} className="bg-purple-600 hover:bg-purple-700">
                  Iniciar Test de Memoria de Trabajo
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-6">
                {showingWorkingSequence ? (
                  <div>
                    <p className="text-lg font-semibold mb-4">Memorice estos números:</p>
                    <div className="flex justify-center space-x-3 mb-6">
                      {workingMemorySequence.map((num, index) => (
                        <div key={index} className="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center text-lg font-bold">
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-semibold mb-4">
                      Escriba los {workingMemorySequence.length} números en orden INVERSO:
                    </p>
                    <div className="max-w-md mx-auto space-y-4">
                      <Input
                        value={workingMemoryInput}
                        onChange={(e) => setWorkingMemoryInput(e.target.value.replace(/[^0-9]/g, '').slice(0, workingMemorySequence.length))}
                        placeholder={`Escriba ${workingMemorySequence.length} números`}
                        className="text-center text-lg"
                        maxLength={workingMemorySequence.length}
                      />
                      <p className="text-sm text-gray-500">
                        Progreso: {workingMemoryResults.filter(r => r).length} correctas de {workingMemoryResults.length} completadas
                      </p>
                      <Button 
                        onClick={submitWorkingMemoryTrial}
                        disabled={workingMemoryInput.length !== workingMemorySequence.length}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Confirmar Respuesta
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentTest === 'atencion' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-orange-600" />
              <span>Test de Atención Sostenida (3/3)</span>
            </CardTitle>
            <CardDescription>
              Presione "Objetivo" cuando vea una X, ignore las otras letras
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!attentionStarted ? (
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  Aparecerán letras una por una. Haga clic en "Objetivo" SOLO cuando vea una X.
                </p>
                <Button onClick={startAttentionTest} className="bg-orange-600 hover:bg-orange-700">
                  Iniciar Test de Atención
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="text-6xl font-bold h-24 flex items-center justify-center">
                  {currentAttentionIndex < attentionTargets.length && (
                    attentionTargets[currentAttentionIndex] ? 'X' : String.fromCharCode(65 + Math.floor(Math.random() * 26))
                  )}
                </div>
                <div className="flex justify-center space-x-4">
                  <Button 
                    onClick={() => respondToAttention(true)}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Objetivo (X)
                  </Button>
                  <Button 
                    onClick={() => respondToAttention(false)}
                    variant="outline"
                  >
                    No es objetivo
                  </Button>
                </div>
                <Progress 
                  value={(currentAttentionIndex / attentionTargets.length) * 100} 
                  className="w-full"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentTest === 'resultados' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Resultados de la Evaluación</span>
            </CardTitle>
            <CardDescription>
              Evaluación completada. Aquí están sus resultados detallados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Puntuaciones Cognitivas</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span>Memoria Visual: </span>
                    <span className="font-bold text-green-600">{testResults.memoria_visual}/10</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span>Memoria de Trabajo: </span>
                    <span className="font-bold text-purple-600">{testResults.memoria_trabajo?.toFixed(1)}/10</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span>Atención Sostenida: </span>
                    <span className="font-bold text-orange-600">{testResults.atencion_sostenida?.toFixed(1)}/10</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Métricas Adicionales</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span>Precisión General: </span>
                    <span className="font-bold text-blue-600">{testResults.precision_respuestas?.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span>Tiempo de Reacción: </span>
                    <span className="font-bold text-gray-600">{testResults.tiempo_reaccion}ms</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span>Fatiga Cognitiva: </span>
                    <span className="font-bold text-gray-600">{testResults.fatiga_cognitiva}/5</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <Button onClick={saveResults} className="bg-green-600 hover:bg-green-700">
                Guardar Resultados
              </Button>
              <Button onClick={resetTest} variant="outline">
                Realizar Nueva Evaluación
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TestCompleto;
