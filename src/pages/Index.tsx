import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, BarChart3, Database, Settings, Play, Eye, Target, Clock } from "lucide-react";
import TestSmart from "@/components/tests/TestSmart";
import TestMemoriaVisual from "@/components/tests/TestMemoriaVisual";
import TestMemoriaTrabajo from "@/components/tests/TestMemoriaTrabajo";
import TestCompleto from "@/components/tests/TestCompleto";
import DataVisualization from "@/components/visualization/DataVisualization";
import AdminPanel from "@/components/admin/AdminPanel";
import ModelAnalysis from "@/components/ai/ModelAnalysis";
import ResourcesSection from "@/components/resources/ResourcesSection";
const Index = () => {
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img src="/lovable-uploads/3a80f066-44d4-45c4-bff5-bd2214d6ff72.png" alt="Universidad de Córdoba" className="h-12 w-auto max-w-[150px] md:max-w-[200px] object-contain" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sistema de Evaluación Cognitiva</h1>
                <p className="text-sm text-gray-600">Plataforma integral para tests neuropsicológicos</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Evaluación Neuropsicológica Digital
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Plataforma académica desarrollada para la evaluación de funciones cognitivas mediante tests 
            validados científicamente. Incluye análisis de memoria, atención y procesamiento cognitivo.
          </p>
        </div>

        <Tabs defaultValue="inicio" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-6">
            <TabsTrigger value="inicio">Inicio</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
            <TabsTrigger value="datos">Datos</TabsTrigger>
            <TabsTrigger value="ia">IA</TabsTrigger>
            <TabsTrigger value="recursos">Recursos</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          <TabsContent value="inicio">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Play className="h-5 w-5 text-green-600" />
                    <span>Evaluación Completa</span>
                  </CardTitle>
                  <CardDescription>
                    Batería completa de tests neuropsicológicos en secuencia ordenada
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Incluye Test SMART, Memoria Visual, Memoria de Trabajo y Atención Sostenida 
                    en un flujo continuo y validado.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">SMART</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Visual</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Trabajo</span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">Atención</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-green-600" />
                    <span>Memoria Visual</span>
                  </CardTitle>
                  <CardDescription>
                    Test de reconocimiento visual basado en VMT-SP
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Evaluación específica de memoria visual a corto plazo mediante 
                    reconocimiento de patrones y símbolos.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">8 min</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Individual</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    <span>Memoria de Trabajo</span>
                  </CardTitle>
                  <CardDescription>
                    Test de dígitos inversos con dificultad adaptativa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Evaluación de memoria de trabajo mediante secuencias numéricas 
                    que deben reproducirse en orden inverso.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">10 min</span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Adaptativo</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    <span>Test SMART</span>
                  </CardTitle>
                  <CardDescription>
                    Survey for Memory, Attention and Reaction Time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Evaluación integral de memoria inmediata, atención y velocidad 
                    de procesamiento cognitivo.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">15 min</span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Completo</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <span>Análisis de Datos</span>
                  </CardTitle>
                  <CardDescription>
                    Visualización y análisis estadístico de resultados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Gráficos interactivos, estadísticas descriptivas y análisis 
                    comparativo de rendimiento cognitivo.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Gráficos</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Estadísticas</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="my-0">
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-indigo-600" />
                    <span>Gestión de Datos</span>
                  </CardTitle>
                  <CardDescription>
                    Administración y exportación de resultados
                  </CardDescription>
                </CardHeader>
                <CardContent className="my-0">
                  <p className="text-sm text-gray-600 mb-4">
                    Herramientas para gestionar participantes, exportar datos 
                    y mantener la base de datos de resultados.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">CSV</span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">Gestión</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4">Información del Proyecto</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Objetivo Académico</h4>
                  <p className="text-sm text-gray-600">
                    Esta plataforma fue desarrollada como herramienta de investigación en el campo de la 
                    neuropsicología cognitiva, proporcionando tests validados para la evaluación de 
                    diferentes dominios cognitivos en población adulta.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Validación Científica</h4>
                  <p className="text-sm text-gray-600">
                    Los tests implementados están basados en instrumentos neuropsicológicos reconocidos 
                    internacionalmente, adaptados para su administración digital con mantenimiento 
                    de sus propiedades psicométricas.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tests">
            <TestCompleto />
          </TabsContent>

          <TabsContent value="datos">
            <DataVisualization />
          </TabsContent>

          <TabsContent value="ia">
            <ModelAnalysis />
          </TabsContent>

          <TabsContent value="recursos">
            <ResourcesSection />
          </TabsContent>

          <TabsContent value="admin">
            <AdminPanel />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center md:items-start">
              <img src="/lovable-uploads/3a80f066-44d4-45c4-bff5-bd2214d6ff72.png" alt="Unicordoba" className="h-16 w-auto max-w-[150px] object-contain mb-4" />
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-600">Universidad de Córdoba</p>
                <p className="text-sm text-gray-600">Facultad de Educación</p>
                <p className="text-sm text-gray-600">Licenciatura en Informática</p>
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-4">

Autores</h3>
              <p className="text-sm text-gray-600">Felipe Patrón
Juan Angulo</p>
              <p className="text-sm text-gray-600">Licenciatura en Informática</p>
            </div>
            <div className="text-center md:text-right">
              <h3 className="font-semibold text-gray-900 mb-4">

Año</h3>
              <p className="text-sm text-gray-600">2025</p>
              <p className="text-sm text-gray-600">Proyecto Académico</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center">
            <p className="text-xs text-gray-500">© 2025 Universidad de Córdoba - Facultad de Educación - Licenciatura en Informática. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;