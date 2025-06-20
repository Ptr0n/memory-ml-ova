
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Eye, Play, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const TestMemoriaVisual = () => {
  const [testPhase, setTestPhase] = useState<'instructions' | 'study' | 'test' | 'results'>('instructions');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [studyImages, setStudyImages] = useState<string[]>([]);
  const [testImages, setTestImages] = useState<string[]>([]);
  const [userResponses, setUserResponses] = useState<boolean[]>([]);
  const [showingImage, setShowingImage] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [score, setScore] = useState(0);

  // Simulated image patterns (using emojis for demo)
  const imagePatterns = [
    '🔴', '🔵', '🟢', '🟡', '🟣', '🟠', '⚫', '⚪',
    '🔺', '🔸', '🔹', '🔶', '🔷', '⭐', '❤️', '💚'
  ];

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (testPhase === 'study' && timeRemaining === 0 && showingImage) {
      nextStudyImage();
    }
  }, [timeRemaining, testPhase, showingImage]);

  const startTest = () => {
    // Generate 8 study images
    const study = [];
    const shuffled = [...imagePatterns].sort(() => Math.random() - 0.5);
    for (let i = 0; i < 8; i++) {
      study.push(shuffled[i]);
    }
    setStudyImages(study);

    // Generate test images (4 from study + 4 new ones)
    const testSet = [];
    // Add 4 from study images
    const studySubset = study.slice(0, 4);
    testSet.push(...studySubset);
    
    // Add 4 new images
    const remaining = imagePatterns.filter(img => !study.includes(img));
    const newImages = remaining.slice(0, 4);
    testSet.push(...newImages);
    
    // Shuffle test images
    const shuffledTest = testSet.sort(() => Math.random() - 0.5);
    setTestImages(shuffledTest);

    setCurrentImageIndex(0);
    setUserResponses([]);
    setTestPhase('study');
    setShowingImage(true);
    setTimeRemaining(3); // 3 seconds per image
  };

  const nextStudyImage = () => {
    if (currentImageIndex < studyImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setTimeRemaining(3);
      setShowingImage(true);
    } else {
      // Study phase complete, start test phase
      setTestPhase('test');
      setCurrentImageIndex(0);
      setShowingImage(false);
    }
  };

  const handleTestResponse = (wasInStudy: boolean) => {
    const currentTestImage = testImages[currentImageIndex];
    const correctAnswer = studyImages.includes(currentTestImage);
    const isCorrect = wasInStudy === correctAnswer;
    
    const newResponses = [...userResponses, isCorrect];
    setUserResponses(newResponses);

    if (currentImageIndex < testImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      // Test complete
      const finalScore = (newResponses.filter(Boolean).length / newResponses.length) * 10;
      setScore(finalScore);
      setTestPhase('results');
      
      // Save results (simplified)
      const result = {
        participante_id: `VMT_${Date.now()}`,
        memoria_visual: finalScore,
        precision_respuestas: (newResponses.filter(Boolean).length / newResponses.length) * 100,
        fecha: new Date().toISOString()
      };
      
      const existingResults = JSON.parse(localStorage.getItem('test_results') || '[]');
      existingResults.push(result);
      localStorage.setItem('test_results', JSON.stringify(existingResults));
      
      toast.success(`Test completado. Puntuación: ${finalScore.toFixed(1)}/10`);
    }
  };

  const resetTest = () => {
    setTestPhase('instructions');
    setCurrentImageIndex(0);
    setStudyImages([]);
    setTestImages([]);
    setUserResponses([]);
    setShowingImage(false);
    setTimeRemaining(0);
    setScore(0);
  };

  const getProgress = () => {
    if (testPhase === 'study') {
      return ((currentImageIndex +

 1) / studyImages.length) * 50; // 50% for study phase
    } else if (testPhase === 'test') {
      return 50 + ((currentImageIndex + 1) / testImages.length) * 50; // 50-100% for test phase
    }
    return testPhase === 'results' ? 100 : 0;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-6 w-6 text-green-600" />
            <span>Test de Memoria Visual (VMT-SP)</span>
          </CardTitle>
          <CardDescription>
            Evaluación de memoria visual basada en el Visual Memory Test - Snodgrass Pictures
          </CardDescription>
          {testPhase !== 'instructions' && <Progress value={getProgress()} className="w-full" />}
        </CardHeader>
      </Card>

      {testPhase === 'instructions' && (
        <Card>
          <CardHeader>
            <CardTitle>Instrucciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <p><strong>Fase 1 - Estudio:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Se mostrarán 8 símbolos, uno por vez</li>
                <li>Cada símbolo aparecerá durante 3 segundos</li>
                <li>Memorice todos los símbolos que vea</li>
              </ul>
              
              <p><strong>Fase 2 - Reconocimiento:</strong></p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Se mostrarán símbolos uno por vez</li>
                <li>Algunos los vio en la fase de estudio, otros son nuevos</li>
                <li>Indique si cada símbolo lo vio antes o no</li>
              </ul>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Objetivo:</strong> Evaluar su capacidad de memoria visual a corto y largo plazo, 
                  así como su habilidad de reconocimiento visual.
                </p>
              </div>
            </div>
            
            <Button onClick={startTest} className="w-full bg-green-600 hover:bg-green-700">
              <Play className="h-4 w-4 mr-2" />
              Comenzar Test
            </Button>
          </CardContent>
        </Card>
      )}

      {testPhase === 'study' && (
        <Card>
          <CardHeader>
            <CardTitle>Fase de Estudio</CardTitle>
            <CardDescription>
              Memorice este símbolo - Imagen {currentImageIndex + 1} de {studyImages.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-8xl mb-4">
                {studyImages[currentImageIndex]}
              </div>
              <div className="text-lg font-semibold text-blue-600">
                Tiempo restante: {timeRemaining}s
              </div>
            </div>
            <Progress value={(timeRemaining / 3) * 100} className="w-full" />
          </CardContent>
        </Card>
      )}

      {testPhase === 'test' && (
        <Card>
          <CardHeader>
            <CardTitle>Fase de Reconocimiento</CardTitle>
            <CardDescription>
              ¿Vio este símbolo en la fase de estudio? - Pregunta {currentImageIndex + 1} de {testImages.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-8xl mb-6">
                {testImages[currentImageIndex]}
              </div>
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={() => handleTestResponse(true)}
                  className="bg-green-600 hover:bg-green-700 px-8"
                >
                  Sí, lo vi antes
                </Button>
                <Button 
                  onClick={() => handleTestResponse(false)}
                  variant="outline"
                  className="px-8"
                >
                  No, es nuevo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {testPhase === 'results' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-green-600" />
              <span>Resultados del Test VMT-SP</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-green-600">
                {score.toFixed(1)}/10
              </div>
              <p className="text-lg font-semibold">Puntuación de Memoria Visual</p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm space-y-2">
                  <p><strong>Respuestas correctas:</strong> {userResponses.filter(Boolean).length} de {userResponses.length}</p>
                  <p><strong>Precisión:</strong> {((userResponses.filter(Boolean).length / userResponses.length) * 100).toFixed(1)}%</p>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p><strong>Interpretación:</strong></p>
                <p>
                  {score >= 8 ? 'Excelente capacidad de memoria visual' :
                   score >= 6 ? 'Buena capacidad de memoria visual' :
                   score >= 4 ? 'Capacidad de memoria visual promedio' :
                   'Se recomienda evaluación adicional'}
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

export default TestMemoriaVisual;
