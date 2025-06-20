
import React, { useState } from 'react';
import { Brain, BarChart3, Users, Settings, FileText, Play, Eye, Target, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TestSmart from '@/components/tests/TestSmart';
import TestMemoriaVisual from '@/components/tests/TestMemoriaVisual';
import TestMemoriaTrabajo from '@/components/tests/TestMemoriaTrabajo';
import DatasetUploader from '@/components/admin/DatasetUploader';
import AdminPanel from '@/components/admin/AdminPanel';
import DataVisualization from '@/components/visualization/DataVisualization';
import ModelAnalysis from '@/components/ai/ModelAnalysis';
import ResourcesSection from '@/components/resources/ResourcesSection';

const Index = () => {
  const [activeTab, setActiveTab] = useState('inicio');
  const [activeTestTab, setActiveTestTab] = useState('smart');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-blue-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 p-3 rounded-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">OVA Memoria Cognitiva</h1>
                <p className="text-sm text-gray-600">Evaluación y Análisis con Inteligencia Artificial</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-blue-100 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-blue-800">Plataforma Educativa</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 mb-8 bg-white shadow-sm">
            <TabsTrigger value="inicio" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Inicio</span>
            </TabsTrigger>
            <TabsTrigger value="tests" className="flex items-center space-x-2">
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">Tests</span>
            </TabsTrigger>
            <TabsTrigger value="datos" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Datos</span>
            </TabsTrigger>
            <TabsTrigger value="analisis" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">IA</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </TabsTrigger>
            <TabsTrigger value="recursos" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Recursos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inicio">
            <div className="space-y-8">
              {/* Hero Section */}
              <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 text-white">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-3xl font-bold mb-4">Bienvenido al OVA de Memoria Cognitiva</h2>
                    <p className="text-lg mb-6 text-blue-100">
                      Plataforma educativa integral que combina tests neuropsicológicos validados con 
                      análisis de inteligencia artificial para la evaluación de capacidades de memoria.
                    </p>
                    <Button 
                      onClick={() => setActiveTab('tests')} 
                      className="bg-white text-blue-600 hover:bg-blue-50"
                    >
                      Comenzar Evaluación
                    </Button>
                  </div>
                  <div className="hidden md:block">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold">4</div>
                          <div className="text-sm text-blue-100">Tests Disponibles</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">AI</div>
                          <div className="text-sm text-blue-100">Análisis Inteligente</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">CSV</div>
                          <div className="text-sm text-blue-100">Export/Import</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">+</div>
                          <div className="text-sm text-blue-100">Visualizaciones</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
                  <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
                    <Play className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Tests Interactivos</h3>
                  <p className="text-gray-600">
                    Implementación de tests neuropsicológicos validados: SMART, UDS, VMT-SP y Memoria de Trabajo.
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-green-100">
                  <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
                    <Brain className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Análisis con IA</h3>
                  <p className="text-gray-600">
                    Modelo Random Forest para clasificar capacidades de memoria en tiempo real.
                  </p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
                  <div className="bg-purple-100 p-3 rounded-lg w-fit mb-4">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Visualización</h3>
                  <p className="text-gray-600">
                    Gráficos interactivos para análisis de resultados y tendencias.
                  </p>
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-6 text-center">Fundamentos Científicos</h3>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">5.5M+</div>
                    <div className="text-sm text-gray-600">Puntuaciones NCPT</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">750K+</div>
                    <div className="text-sm text-gray-600">Adultos Evaluados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-2">96%</div>
                    <div className="text-sm text-gray-600">Precisión del Modelo</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-2">4</div>
                    <div className="text-sm text-gray-600">Tests Validados</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tests">
            <div className="space-y-6">
              {/* Test Selection */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold mb-4">Seleccione una Evaluación</h2>
                <p className="text-gray-600 mb-6">
                  Elija el test neuropsicológico que desea realizar. Cada evaluación mide aspectos específicos de la memoria cognitiva.
                </p>
                
                <Tabs value={activeTestTab} onValueChange={setActiveTestTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-6">
                    <TabsTrigger value="smart" className="flex items-center space-x-2">
                      <Brain className="h-4 w-4" />
                      <span>Test SMART</span>
                    </TabsTrigger>
                    <TabsTrigger value="visual" className="flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>Memoria Visual</span>
                    </TabsTrigger>
                    <TabsTrigger value="trabajo" className="flex items-center space-x-2">
                      <Calculator className="h-4 w-4" />
                      <span>Memoria de Trabajo</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="smart">
                    <TestSmart />
                  </TabsContent>

                  <TabsContent value="visual">
                    <TestMemoriaVisual />
                  </TabsContent>

                  <TabsContent value="trabajo">
                    <TestMemoriaTrabajo />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="datos">
            <div className="space-y-6">
              <DatasetUploader />
              <DataVisualization />
            </div>
          </TabsContent>

          <TabsContent value="analisis">
            <ModelAnalysis />
          </TabsContent>

          <TabsContent value="admin">
            <AdminPanel />
          </TabsContent>

          <TabsContent value="recursos">
            <ResourcesSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
