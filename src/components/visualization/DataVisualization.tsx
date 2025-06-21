
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, Users, Brain, Trash2 } from 'lucide-react';
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

const DataVisualization = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [uploadedData, setUploadedData] = useState<TestResult[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadData = () => {
    try {
      // Cargar datos de tests realizados
      const testData = JSON.parse(localStorage.getItem('test_results') || '[]');
      console.log('Test data loaded:', testData);
      
      // Cargar datos subidos por CSV
      const csvData = JSON.parse(localStorage.getItem('uploaded_dataset') || '[]');
      console.log('CSV data loaded:', csvData);
      
      setTestResults(testData);
      setUploadedData(csvData);
    } catch (error) {
      console.error('Error loading data:', error);
      setTestResults([]);
      setUploadedData([]);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  // Combinar todos los datos disponibles
  const allData = useMemo(() => {
    const combined = [...testResults, ...uploadedData];
    console.log('Combined data:', combined);
    return combined;
  }, [testResults, uploadedData]);

  const clearCSVData = () => {
    try {
      localStorage.removeItem('uploaded_dataset');
      localStorage.removeItem('dataset_upload_time');
      setUploadedData([]);
      setRefreshTrigger(prev => prev + 1);
      toast.success('Datos CSV eliminados exitosamente');
    } catch (error) {
      console.error('Error clearing CSV data:', error);
      toast.error('Error al eliminar datos CSV');
    }
  };

  if (allData.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <span>Visualización de Datos</span>
            </CardTitle>
            <CardDescription>
              Análisis visual de resultados de evaluaciones cognitivas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay datos disponibles</h3>
              <p className="text-gray-500 mb-4">
                Realice evaluaciones o cargue datos CSV para ver las visualizaciones
              </p>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => setRefreshTrigger(prev => prev + 1)} variant="outline">
                  Actualizar Datos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Preparar datos para visualización con nombres anónimos
  const chartData = allData.map((result, index) => ({
    ...result,
    nombre: `Persona ${index + 1}`,
    memoria_promedio: (result.memoria_inmediata + result.memoria_trabajo + result.memoria_visual) / 3
  }));

  // Estadísticas descriptivas
  const stats = {
    total: allData.length,
    edad_promedio: allData.reduce((sum, r) => sum + r.edad, 0) / allData.length,
    memoria_trabajo_prom: allData.reduce((sum, r) => sum + (r.memoria_trabajo || 0), 0) / allData.length,
    atencion_prom: allData.reduce((sum, r) => sum + (r.atencion_sostenida || 0), 0) / allData.length,
    precision_prom: allData.reduce((sum, r) => sum + (r.precision_respuestas || 0), 0) / allData.length
  };

  // Datos para gráfico de distribución por edad
  const edadDistribution = allData.reduce((acc: any, result) => {
    const grupo = result.edad < 30 ? '18-29' : result.edad < 50 ? '30-49' : result.edad < 65 ? '50-64' : '65+';
    acc[grupo] = (acc[grupo] || 0) + 1;
    return acc;
  }, {});

  const edadData = Object.entries(edadDistribution).map(([grupo, count]) => ({ grupo, count }));

  // Datos para gráfico de nivel educativo
  const nivelEducativoData = allData.reduce((acc: any, result) => {
    const nivel = result.nivel_educacion === 1 ? 'Básico' : result.nivel_educacion === 2 ? 'Medio' : 'Superior';
    acc[nivel] = (acc[nivel] || 0) + 1;
    return acc;
  }, {});

  const educacionData = Object.entries(nivelEducativoData).map(([nivel, count]) => ({ nivel, count }));

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <span>Visualización de Datos</span>
          </CardTitle>
          <CardDescription>
            Análisis visual de {allData.length} evaluaciones cognitivas
          </CardDescription>
          {uploadedData.length > 0 && (
            <div className="flex justify-end">
              <Button onClick={clearCSVData} variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar Datos CSV
              </Button>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Estadísticas Generales */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Evaluaciones</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Edad Promedio</p>
                <p className="text-2xl font-bold text-green-600">{stats.edad_promedio.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Memoria Trabajo Prom.</p>
                <p className="text-2xl font-bold text-purple-600">{stats.memoria_trabajo_prom.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Atención Prom.</p>
                <p className="text-2xl font-bold text-orange-600">{stats.atencion_prom.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparación de Puntuaciones de Memoria */}
      <Card>
        <CardHeader>
          <CardTitle>Comparación de Puntuaciones de Memoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="memoria_inmediata" fill="#3B82F6" name="Memoria Inmediata" />
                <Bar dataKey="memoria_trabajo" fill="#10B981" name="Memoria de Trabajo" />
                <Bar dataKey="memoria_visual" fill="#F59E0B" name="Memoria Visual" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Distribución por Edad */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Grupos de Edad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={edadData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    nameKey="grupo"
                  >
                    {edadData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Nivel Educativo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={educacionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nivel" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Correlación Edad vs Rendimiento */}
      <Card>
        <CardHeader>
          <CardTitle>Relación entre Edad y Rendimiento Cognitivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="edad" name="Edad" />
                <YAxis dataKey="memoria_promedio" name="Memoria Promedio" domain={[0, 10]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Participantes" dataKey="memoria_promedio" fill="#3B82F6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tendencias de Tiempo de Reacción */}
      <Card>
        <CardHeader>
          <CardTitle>Tiempo de Reacción por Participante</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="tiempo_reaccion" stroke="#F59E0B" name="Tiempo de Reacción (ms)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataVisualization;
