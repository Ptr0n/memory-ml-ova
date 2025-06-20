
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ExternalLink, FileText, Users, Brain, Target } from 'lucide-react';

const ResourcesSection = () => {
  const tests = [
    {
      name: "SMART (Survey for Memory, Attention and Reaction Time)",
      description: "Evaluación cognitiva breve, autoaplicada y basada en web que mide memoria visual, atención/velocidad de procesamiento y funcionamiento ejecutivo.",
      validation: "Validado con 69 adultos mayores",
      domains: ["Memoria Visual", "Atención", "Velocidad de Procesamiento", "Funcionamiento Ejecutivo"],
      icon: Brain,
      color: "blue"
    },
    {
      name: "UDS (Uniform Data Set) - Batería Neuropsicológica",
      description: "Utilizada mundialmente para homogeneizar las investigaciones de enfermedad de Alzheimer. Incluye subtests específicos de memoria inmediata y diferida.",
      validation: "Precisión diagnóstica adecuada para detectar deterioro cognitivo leve y demencia tipo Alzheimer",
      domains: ["Memoria Inmediata", "Memoria Diferida", "Función Ejecutiva", "Lenguaje"],
      icon: FileText,
      color: "green"
    },
    {
      name: "VMT-SP (Visual Memory Test based on Snodgrass Pictures)",
      description: "Dataset específico para evaluación de memoria visual, especialmente útil en la evaluación de niños con dificultades de aprendizaje.",
      validation: "Validado para población infantil y adulta",
      domains: ["Memoria Visual a Corto Plazo", "Memoria Visual a Largo Plazo", "Reconocimiento Visual"],
      icon: Target,
      color: "purple"
    },
    {
      name: "NCPT (NeuroCognitive Performance Test)",
      description: "Uno de los datasets más masivos disponibles, conteniendo aproximadamente 5.5 millones de puntuaciones de subtests de más de 750,000 adultos.",
      validation: "Validación masiva con 750,000+ participantes",
      domains: ["Memoria de Trabajo", "Atención Visual", "Razonamiento Abstracto", "Velocidad de Procesamiento"],
      icon: Users,
      color: "orange"
    }
  ];

  const datasets = [
    {
      name: "Dataset de EEG para Carga Cognitiva",
      description: "Contiene registros de EEG que miden carga cognitiva en individuos realizando tareas aritméticas y tests de Stroop.",
      size: "15 sujetos, múltiples niveles de estrés cognitivo",
      format: "EEG signals, CSV metadata"
    },
    {
      name: "Cognitive Load Assessment Dataset",
      description: "Datos de evaluación de carga cognitiva usando múltiples métricas fisiológicas y de rendimiento.",
      size: "200+ participantes",
      format: "JSON, CSV"
    }
  ];

  const models = [
    {
      name: "Support Vector Machine (SVM)",
      accuracy: "92% en MySQL, 90% en PostgreSQL",
      description: "Especialmente efectivo para clasificar niveles de capacidad de memoria basándose en múltiples variables.",
      useCases: ["Clasificación binaria", "Datos de alta dimensionalidad"]
    },
    {
      name: "Random Forest Classifier",
      accuracy: "Hasta 96% en detección de deterioro cognitivo",
      description: "Meta-estimador que ajusta varios árboles de decisión. Excelente para identificar importancia de características.",
      useCases: ["Clasificación multiclase", "Interpretabilidad", "Datos tabulares"]
    },
    {
      name: "Redes Neuronales Profundas",
      accuracy: "96%+ en detección de deterioro cognitivo",
      description: "Especialmente efectivas cuando se utilizan arquitecturas como LeNet para análisis de datos neuropsicológicos.",
      useCases: ["Datos complejos", "Patrones no lineales"]
    },
    {
      name: "Algoritmos Bayesianos",
      accuracy: "Mayor precisión en algunos contextos específicos",
      description: "Los modelos Naive Bayes han demostrado alta precisión en clasificación de problemas cognitivos.",
      useCases: ["Datos categóricos", "Probabilidades explicitas"]
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      orange: "bg-orange-100 text-orange-600"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <span>Recursos Educativos</span>
          </CardTitle>
          <CardDescription>
            Información detallada sobre tests neuropsicológicos, datasets y modelos de IA utilizados en el OVA.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Tests Neuropsicológicos */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Tests Neuropsicológicos Implementados</h2>
        <div className="grid lg:grid-cols-2 gap-6">
          {tests.map((test, index) => {
            const IconComponent = test.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getColorClasses(test.color)}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <span className="text-lg">{test.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm">{test.description}</p>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-sm text-gray-800 mb-2">Validación:</p>
                    <p className="text-sm text-gray-600">{test.validation}</p>
                  </div>

                  <div>
                    <p className="font-medium text-sm text-gray-800 mb-2">Dominios Evaluados:</p>
                    <div className="flex flex-wrap gap-2">
                      {test.domains.map((domain, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {domain}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Datasets Disponibles */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Datasets de Investigación</h2>
        <div className="grid lg:grid-cols-2 gap-6">
          {datasets.map((dataset, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span>{dataset.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-600 text-sm">{dataset.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Tamaño:</span>
                  <span className="text-gray-600">{dataset.size}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Formato:</span>
                  <span className="text-gray-600">{dataset.format}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Modelos de IA */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Modelos de Inteligencia Artificial</h2>
        <div className="space-y-4">
          {models.map((model, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{model.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{model.description}</p>
                  </div>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium ml-4">
                    {model.accuracy}
                  </div>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-800 mb-2">Casos de Uso Recomendados:</p>
                  <div className="flex flex-wrap gap-2">
                    {model.useCases.map((useCase, idx) => (
                      <span key={idx} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                        {useCase}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Metodología */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Metodología Pedagógica</h2>
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Fases de Aprendizaje</h3>
                <ol className="space-y-3 text-sm">
                  <li className="flex items-start space-x-3">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                    <div>
                      <strong>Fase de Introducción:</strong> Utilizar la sección de recursos para establecer fundamentos teóricos
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                    <div>
                      <strong>Fase de Experimentación:</strong> Realizar tests interactivos para generar datos
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                    <div>
                      <strong>Fase de Análisis:</strong> Interpretar resultados y métricas del modelo con supervisión docente
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</span>
                    <div>
                      <strong>Fase de Aplicación:</strong> Generar nuevos datos o cargar datasets propios
                    </div>
                  </li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3">Objetivos de Aprendizaje</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Comprender los fundamentos de la memoria cognitiva</li>
                  <li>• Familiarizarse con tests neuropsicológicos validados</li>
                  <li>• Experimentar con técnicas de machine learning</li>
                  <li>• Interpretar métricas de evaluación de modelos</li>
                  <li>• Analizar la importancia de características en predicciones</li>
                  <li>• Aplicar conocimientos en casos prácticos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Referencias */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Referencias y Enlaces</h2>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Publicaciones Científicas</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• SMART Assessment: Web-based cognitive evaluation tool (Journal of Neuropsychology, 2023)</li>
                  <li>• Uniform Data Set for Alzheimer's Disease Research (Alzheimer's & Dementia, 2022)</li>
                  <li>• Machine Learning in Cognitive Assessment: A Systematic Review (NeuroImage, 2023)</li>
                  <li>• Random Forest Classification for Memory Disorders (IEEE Transactions on Biomedical Engineering, 2023)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Recursos Técnicos</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Implementación: JavaScript, React, Chart.js, ml.js</li>
                  <li>• Formato de datos: CSV con estructura estandarizada</li>
                  <li>• Modelo: Random Forest con 100 estimadores</li>
                  <li>• Visualizaciones: Gráficos interactivos responsivos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default ResourcesSection;
