
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import { BarChart3, TrendingUp, Users, RefreshCw } from 'lucide-react';

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
  const [csvDatasets, setCsvDatasets] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const storedTestResults = JSON.parse(localStorage.getItem('test_results') || '[]');
      const storedCsvDatasets = JSON.parse(localStorage.getItem('csv_datasets') || '[]');
      
      setTestResults(storedTestResults);
      setCsvDatasets(storedCsvDatasets);
    } catch (error) {
      console.error('Error loading data:', error);
      setTestResults([]);
      setCsvDatasets([]);
    }
  };

  const getMemoryDistribution = () => {
    if (testResults.length === 0) return [];

    try {
      const distribution = { bajo: 0, medio: 0, alto: 0 };
      
      testResults.forEach(result => {
        const avgMemory = (
          (result.memoria_inmediata || 0) + 
          (result.memoria_trabajo || 0) + 
          (result.memoria_visual || 0)
        ) / 3;
        
        if (avgMemory < 4.5) distribution.bajo++;
        else if (avgMemory <= 7.0) distribution.medio++;
        else distribution.alto++;
      });

      return [
        { name: 'Bajo (< 4.5)', value: distribution.bajo, fill: '#ef4444' },
        { name: 'Medio (4.5-7.0)', value: distribution.medio, fill: '#f59e0b' },
        { name: 'Alto (> 7.0)', value: distribution.alto, fill: '#10b981' }
      ];
    } catch (error) {
      console.error('Error calculating memory distribution:', error);
      return [];
    }
  };

  const getAgeGroupPerformance = () => {
    if (testResults.length === 0) return [];

    try {
      const ageGroups: { [key: string]: { total: number, count: number } } = {};
      
      testResults.forEach(result => {
        const age = result.edad || 25;
        let group = '';
        
        if (age < 30) group = '18-29';
        else if (age < 40) group = '30-39';
        else if (age < 50) group = '40-49';
        else if (age < 60) group = '50-59';
        else group = '60+';

        if (!ageGroups[group]) {
          ageGroups[group] = { total: 0, count: 0 };
        }

        const avgMemory = (
          (result.memoria_inmediata || 0) + 
          (result.memoria_trabajo || 0) + 
          (result.memoria_visual || 0)
        ) / 3;

        ageGroups[group].total += avgMemory;
        ageGroups[group].count++;
      });

      return Object.keys(ageGroups).map(group => ({
        grupo: group,
        promedio: ageGroups[group].count > 0 ? 
          (ageGroups[group].total / ageGroups[group].count).toFixed(1) : 0
      }));
    } catch (error) {
      console.error('Error calculating age group performance:', error);
      return [];
    }
  };

  const getEducationLevelComparison = () => {
    if (testResults.length === 0) return [];

    try {
      const educationGroups: { [key: number]: { total: number, count: number } } = {};
      
      testResults.forEach(result => {
        const level = result.nivel_educacion || 2;
        
        if (!educationGroups[level]) {
          educationGroups[level] = { total: 0, count: 0 };
        }

        const avgMemory = (
          (result.memoria_inmediata || 0) + 
          (result.memoria_trabajo || 0) + 
          (result.memoria_visual || 0)
        ) / 3;

        educationGroups[level].total += avgMemory;
        educationGroups[level].count++;
      });

      return Object.keys(educationGroups).map(level => {
        const levelNum = parseInt(level);
        const labelMap = { 1: 'Básico', 2: 'Medio', 3: 'Superior' };
        
        return {
          nivel: labelMap[levelNum as keyof typeof labelMap] || 'Desconocido',
          promedio: educationGroups[levelNum].count > 0 ? 
            parseFloat((educationGroups[levelNum].total / educationGroups[levelNum].count).toFixed(1)) : 0
        };
      });
    } catch (error) {
      console.error('Error calculating education level comparison:', error);
      return [];
    }
  };

  const getMemoryScoresComparison = () => {
    if (testResults.length === 0) return [];

    try {
      return testResults.slice(0, 10).map((result, index) => ({
        participante: `Persona ${index + 1}`,
        memoria_visual: result.memoria_visual || 0,
        memoria_trabajo: result.memoria_trabajo || 0,
        memoria_inmediata: result.memoria_inmediata || 0,
        atencion_sostenida: result.atencion_sostenida || 0
      }));
    } catch (error) {
      console.error('Error calculating memory scores comparison:', error);
      return [];
    }
  };

  const getCorrelationData = () => {
    if (testResults.length === 0) return [];

    try {
      return testResults.map(result => ({
        edad: result.edad || 25,
        memoria_promedio: (
          (result.memoria_inmediata || 0) + 
          (result.memoria_trabajo || 0) + 
          (result.memoria_visual || 0)
        ) / 3
      }));
    } catch (error) {
      console.error('Error calculating correlation data:', error);
      return [];
    }
  };

  const getPerformanceTrend = () => {
    if (testResults.length === 0) return [];

    try {
      const sortedResults = [...testResults]
        .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
        .slice(-30); // Últimos 30 resultados

      return sortedResults.map((result, index) => ({
        test: index + 1,
        memoria_promedio: (
          (result.memoria_inmediata || 0) + 
          (result.memoria_trabajo || 0) + 
          (result.memoria_visual || 0)
        ) / 3,
        precision: result.precision_respuestas || 0
      }));
    } catch (error) {
      console.error('Error calculating performance trend:', error);
      return [];
    }
  };

  const memoryDistribution = getMemoryDistribution();
  const ageGroupPerformance = getAgeGroupPerformance();
  const educationComparison = getEducationLevelComparison();
  const memoryScoresComparison = getMemoryScoresComparison();
  const correlationData = getCorrelationData();
  const performanceTrend = getPerformanceTrend();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <span>Visualización de Datos</span>
            </div>
            <Button onClick={loadData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </CardTitle>
          <CardDescription>
            Análisis visual de los resultados de las evaluaciones de memoria cognitiva.
            Datos actuales: {testResults.length} evaluaciones y {csvDatasets.length} datasets CSV.
          </CardDescription>
        </CardHeader>
      </Card>

      {testResults.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">No hay datos de evaluaciones disponibles</p>
            <p className="text-sm text-gray-400">
              Complete algunas evaluaciones o importe datos CSV para ver las visualizaciones.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {/* Distribución de Capacidades de Memoria */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Capacidades de Memoria</CardTitle>
              <CardDescription>
                Clasificación de participantes según su nivel de memoria promedio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={memoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {memoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Comparación de Puntuaciones de Memoria */}
          <Card>
            <CardHeader>
              <CardTitle>Comparación de Puntuaciones de Memoria</CardTitle>
              <CardDescription>
                Comparación de diferentes tipos de memoria por participante (primeros 10)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={memoryScoresComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="participante" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="memoria_visual" fill="#8884d8" name="Memoria Visual" />
                  <Bar dataKey="memoria_trabajo" fill="#82ca9d" name="Memoria de Trabajo" />
                  <Bar dataKey="memoria_inmediata" fill="#ffc658" name="Memoria Inmediata" />
                  <Bar dataKey="atencion_sostenida" fill="#ff7300" name="Atención Sostenida" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Rendimiento por Grupo de Edad */}
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento por Grupo de Edad</CardTitle>
              <CardDescription>
                Memoria promedio según diferentes grupos etarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageGroupPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="grupo" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="promedio" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Comparación por Nivel Educativo */}
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento por Nivel Educativo</CardTitle>
              <CardDescription>
                Comparación del rendimiento de memoria según el nivel educativo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={educationComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nivel" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="promedio" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tendencia de Rendimiento */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Rendimiento</CardTitle>
              <CardDescription>
                Evolución del rendimiento de memoria y precisión en el tiempo (últimos 30 tests)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="test" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="memoria_promedio" 
                    stroke="#8884d8" 
                    name="Memoria Promedio" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="precision" 
                    stroke="#82ca9d" 
                    name="Precisión (%)" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Correlación Edad vs Memoria */}
          <Card>
            <CardHeader>
              <CardTitle>Correlación: Edad vs Memoria</CardTitle>
              <CardDescription>
                Relación entre la edad de los participantes y su rendimiento de memoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid />
                  <XAxis type="number" dataKey="edad" name="Edad" />
                  <YAxis type="number" dataKey="memoria_promedio" name="Memoria Promedio" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Participantes" data={correlationData} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DataVisualization;
