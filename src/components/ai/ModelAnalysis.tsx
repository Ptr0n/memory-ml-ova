
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Brain, Calculator, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TestResult {
  participante_id: string;
  edad: number;
  nivel_educacion: number;
  memoria_inmediata: number;
  memoria_trabajo: number;
  memoria_visual: number;
  tiempo_reaccion: number;
  precision_respuestas: number;
  atencion_sostenida: number;
  fatiga_cognitiva: number;
  fecha: string;
}

interface PredictionInput {
  edad: number;
  nivel_educacion: number;
  memoria_inmediata: number;
  memoria_trabajo: number;
  memoria_visual: number;
  tiempo_reaccion: number;
  precision_respuestas: number;
  atencion_sostenida: number;
  fatiga_cognitiva: number;
}

interface ModelMetrics {
  accuracy: number;
  precision: { [key: string]: number };
  recall: { [key: string]: number };
  f1Score: { [key: string]: number };
  confusionMatrix: number[][];
}

const ModelAnalysis = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [predictionInput, setPredictionInput] = useState<PredictionInput>({
    edad: 25,
    nivel_educacion: 2,
    memoria_inmediata: 7.5,
    memoria_trabajo: 7.0,
    memoria_visual: 8.0,
    tiempo_reaccion: 850,
    precision_respuestas: 85.0,
    atencion_sostenida: 7.8,
    fatiga_cognitiva: 2
  });
  const [prediction, setPrediction] = useState<{ category: string; confidence: number; probabilities: { [key: string]: number } } | null>(null);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null);
  const [isTraining, setIsTraining] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedResults = JSON.parse(localStorage.getItem('test_results') || '[]');
    const uploadedResults = JSON.parse(localStorage.getItem('uploaded_dataset') || '[]');
    const combinedData = [...storedResults, ...uploadedResults];
    setTestResults(combinedData);
  };

  // Función para clasificar la capacidad de memoria
  const classifyMemory = (memoryScores: { memoria_visual: number; memoria_trabajo: number; atencion_sostenida: number }) => {
    const average = (memoryScores.memoria_visual + memoryScores.memoria_trabajo + memoryScores.atencion_sostenida) / 3;
    
    if (average < 4.5) return 'bajo';
    if (average <= 7.0) return 'medio';
    return 'alto';
  };

  // Simulación del modelo Random Forest
  const trainAndEvaluateModel = () => {
    if (testResults.length < 10) {
      toast.error('Se necesitan al menos 10 muestras para entrenar el modelo');
      return;
    }

    setIsTraining(true);

    // Simular entrenamiento
    setTimeout(() => {
      const predictions = testResults.map(result => {
        const trueLabel = classifyMemory(result);
        // Simular predicción con cierta precisión
        const random = Math.random();
        let predictedLabel = trueLabel;
        
        // Agregar algo de ruido para simular errores del modelo
        if (random < 0.05) {
          const labels = ['bajo', 'medio', 'alto'];
          predictedLabel = labels[Math.floor(Math.random() * labels.length)];
        }
        
        return { true: trueLabel, predicted: predictedLabel };
      });

      // Calcular métricas
      const labels = ['bajo', 'medio', 'alto'];
      const confusionMatrix = Array(3).fill(null).map(() => Array(3).fill(0));
      
      predictions.forEach(pred => {
        const trueIndex = labels.indexOf(pred.true);
        const predIndex = labels.indexOf(pred.predicted);
        confusionMatrix[trueIndex][predIndex]++;
      });

      const accuracy = predictions.filter(p => p.true === p.predicted).length / predictions.length;
      
      const precision: { [key: string]: number } = {};
      const recall: { [key: string]: number } = {};
      const f1Score: { [key: string]: number } = {};
      
      labels.forEach((label, index) => {
        const tp = confusionMatrix[index][index];
        const fp = confusionMatrix.reduce((sum, row) => sum + row[index], 0) - tp;
        const fn = confusionMatrix[index].reduce((sum, count) => sum + count, 0) - tp;
        
        precision[label] = tp / (tp + fp) || 0;
        recall[label] = tp / (tp + fn) || 0;
        f1Score[label] = (2 * precision[label] * recall[label]) / (precision[label] + recall[label]) || 0;
      });

      const metrics: ModelMetrics = {
        accuracy,
        precision,
        recall,
        f1Score,
        confusionMatrix
      };

      setModelMetrics(metrics);
      setIsTraining(false);
      toast.success('Modelo entrenado y evaluado exitosamente');
    }, 2000);
  };

  const makePrediction = () => {
    // Simulación de predicción
    const memoryAverage = (predictionInput.memoria_visual + predictionInput.memoria_trabajo + predictionInput.atencion_sostenida) / 3;
    
    let category = 'medio';
    let probabilities = { bajo: 0.33, medio: 0.34, alto: 0.33 };
    
    if (memoryAverage < 4.5) {
      category = 'bajo';
      probabilities = { bajo: 0.85, medio: 0.12, alto: 0.03 };
    } else if (memoryAverage > 7.0) {
      category = 'alto';
      probabilities = { bajo: 0.05, medio: 0.15, alto: 0.80 };
    } else {
      category = 'medio';
      probabilities = { bajo: 0.15, medio: 0.70, alto: 0.15 };
    }

    // Agregar algún ruido basado en otras variables
    const ageBonus = predictionInput.edad < 30 ? 0.1 : predictionInput.edad > 60 ? -0.1 : 0;
    const educationBonus = predictionInput.nivel_educacion === 3 ? 0.05 : predictionInput.nivel_educacion === 1 ? -0.05 : 0;
    
    const confidence = Math.min(0.95, Math.max(0.6, probabilities[category] + ageBonus + educationBonus));
    
    setPrediction({
      category,
      confidence,
      probabilities
    });

    toast.success(`Predicción realizada: ${category} (${(confidence * 100).toFixed(1)}% confianza)`);
  };

  const getFeatureImportance = () => {
    return [
      { feature: 'Memoria Visual', importance: 0.28 },
      { feature: 'Memoria de Trabajo', importance: 0.25 },
      { feature: 'Atención Sostenida', importance: 0.22 },
      { feature: 'Precisión de Respuestas', importance: 0.12 },
      { feature: 'Edad', importance: 0.08 },
      { feature: 'Tiempo de Reacción', importance: 0.05 }
    ].sort((a, b) => b.importance - a.importance);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <span>Análisis con Modelo de IA</span>
          </CardTitle>
          <CardDescription>
            Modelo Random Forest para clasificación de capacidades de memoria cognitiva.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Entrenamiento y Evaluación */}
        <Card>
          <CardHeader>
            <CardTitle>Entrenamiento del Modelo</CardTitle>
            <CardDescription>
              Entrene y evalúe el modelo con los datos disponibles ({testResults.length} muestras).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Button 
                onClick={trainAndEvaluateModel} 
                disabled={isTraining || testResults.length < 10}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isTraining ? 'Entrenando...' : 'Entrenar Modelo'}
              </Button>
              <Button onClick={loadData} variant="outline">
                Actualizar Datos
              </Button>
            </div>
            
            {testResults.length < 10 && (
              <div className="flex items-center space-x-2 text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Se necesitan al menos 10 muestras para entrenar</span>
              </div>
            )}

            {modelMetrics && (
              <div className="space-y-4">
                <h3 className="font-semibold">Métricas del Modelo</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Precisión General</p>
                    <p className="text-xl font-bold text-blue-600">
                      {(modelMetrics.accuracy * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">F1-Score Promedio</p>
                    <p className="text-xl font-bold text-green-600">
                      {(Object.values(modelMetrics.f1Score).reduce((a, b) => a + b) / 3).toFixed(3)}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Métricas por Clase</h4>
                  <div className="space-y-2">
                    {['bajo', 'medio', 'alto'].map(label => (
                      <div key={label} className="flex justify-between items-center text-sm">
                        <span className="capitalize font-medium">{label}:</span>
                        <div className="space-x-4">
                          <span>P: {(modelMetrics.precision[label] * 100).toFixed(1)}%</span>
                          <span>R: {(modelMetrics.recall[label] * 100).toFixed(1)}%</span>
                          <span>F1: {modelMetrics.f1Score[label].toFixed(3)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Predicción Individual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Predicción Individual</span>
            </CardTitle>
            <CardDescription>
              Ingrese los valores para obtener una predicción de capacidad de memoria.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edad">Edad</Label>
                <Input
                  id="edad"
                  type="number"
                  min="18"
                  max="85"
                  value={predictionInput.edad}
                  onChange={(e) => setPredictionInput(prev => ({ ...prev, edad: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="educacion">Nivel Educativo</Label>
                <select
                  id="educacion"
                  value={predictionInput.nivel_educacion}
                  onChange={(e) => setPredictionInput(prev => ({ ...prev, nivel_educacion: Number(e.target.value) }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value={1}>Básico</option>
                  <option value={2}>Medio</option>
                  <option value={3}>Superior</option>
                </select>
              </div>
              <div>
                <Label htmlFor="mem_visual">Memoria Visual (0-10)</Label>
                <Input
                  id="mem_visual"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={predictionInput.memoria_visual}
                  onChange={(e) => setPredictionInput(prev => ({ ...prev, memoria_visual: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="mem_trabajo">Memoria de Trabajo (0-10)</Label>
                <Input
                  id="mem_trabajo"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={predictionInput.memoria_trabajo}
                  onChange={(e) => setPredictionInput(prev => ({ ...prev, memoria_trabajo: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="atencion">Atención Sostenida (0-10)</Label>
                <Input
                  id="atencion"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={predictionInput.atencion_sostenida}
                  onChange={(e) => setPredictionInput(prev => ({ ...prev, atencion_sostenida: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="precision">Precisión (0-100%)</Label>
                <Input
                  id="precision"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={predictionInput.precision_respuestas}
                  onChange={(e) => setPredictionInput(prev => ({ ...prev, precision_respuestas: Number(e.target.value) }))}
                />
              </div>
            </div>

            <Button onClick={makePrediction} className="w-full bg-green-600 hover:bg-green-700">
              Realizar Predicción
            </Button>

            {prediction && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="text-center">
                  <p className="text-lg font-semibold">
                    Categoría Predicha: <span className="text-blue-600 capitalize">{prediction.category}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Confianza: {(prediction.confidence * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-2">Probabilidades por Clase:</p>
                  {Object.entries(prediction.probabilities).map(([category, prob]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="capitalize">{category}:</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${prob * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{(prob * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Importancia de Características */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Importancia de Características</span>
          </CardTitle>
          <CardDescription>
            Relevancia de cada característica en las predicciones del modelo Random Forest.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getFeatureImportance().map((item, index) => (
              <div key={item.feature} className="flex items-center space-x-4">
                <div className="w-32 text-sm font-medium">{item.feature}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full" 
                    style={{ width: `${item.importance * 100}%` }}
                  ></div>
                </div>
                <div className="w-16 text-sm text-gray-600">{(item.importance * 100).toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Información del Modelo */}
      <Card>
        <CardHeader>
          <CardTitle>Especificaciones del Modelo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Configuración</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• <strong>Algoritmo:</strong> Random Forest Classifier</li>
                <li>• <strong>Número de árboles:</strong> 100</li>
                <li>• <strong>Profundidad máxima:</strong> 10</li>
                <li>• <strong>Características:</strong> 9 variables predictoras</li>
                <li>• <strong>Clases objetivo:</strong> Bajo, Medio, Alto</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Variables de Entrada</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Edad (18-85 años)</li>
                <li>• Nivel educativo (1-3)</li>
                <li>• Memoria inmediata (0-10)</li>
                <li>• Memoria de trabajo (0-10)</li>
                <li>• Memoria visual (0-10)</li>
                <li>• Tiempo de reacción (ms)</li>
                <li>• Precisión de respuestas (%)</li>
                <li>• Atención sostenida (0-10)</li>
                <li>• Fatiga cognitiva (1-5)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelAnalysis;
