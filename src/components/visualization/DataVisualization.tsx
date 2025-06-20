
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, Users, Eye } from 'lucide-react';
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
  const [testData, setTestData] = useState<TestResult[]>([]);
  const [selectedChart, setSelectedChart] = useState<'bar' | 'line' | 'scatter' | 'pie'>('bar');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const testResults = JSON.parse(localStorage.getItem('test_results') || '[]');
      const uploadedData = JSON.parse(localStorage.getItem('uploaded_dataset') || '[]');
      const combinedData = [...testResults, ...uploadedData];
      
      // Filtrar datos válidos
      const validData = combinedData.filter(item => 
        item && 
        typeof item.memoria_visual === 'number' && 
        typeof item.memoria_trabajo === 'number' &&
        typeof item.atencion_sostenida === 'number' &&
        !isNaN(item.memoria_visual) && 
        !isNaN(item.memoria_trabajo) &&
        !isNaN(item.atencion_sostenida)
      );
      
      setTestData(validData);
      
      if (validData.length === 0) {
        toast.info('No hay datos válidos para visualizar. Complete algunas evaluaciones primero.');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setTestData([]);
      toast.error('Error al cargar datos para visualización');
    }
  };

  const processDataForBarChart = () => {
    if (testData.length === 0) return [];
    
    return testData.slice(0, 10).map((result, index) => ({
      name: `Persona ${index + 1}`,
      'Memoria Visual': +(result.memoria_visual || 0).toFixed(1),
      'Memoria Trabajo': +(result.memoria_trabajo || 0).toFixed(1),
      'Atención Sostenida': +(result.atencion_sostenida || 0).toFixed(1),
      'Memoria Inmediata': +(result.memoria_inmediata || 0).toFixed(1)
    }));
  };

  const processDataForLineChart = () => {
    if (testData.length === 0) return [];
    
    const sortedData = [...testData]
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .slice(0, 15);
    
    return sortedData.map((result, index) => ({
      evaluacion: index + 1,
      'Promedio Memoria': +((
        (result.memoria_visual || 0) + 
        (result.memoria_trabajo || 0) + 
        (result.atencion_sostenida || 0) + 
        (result.memoria_inmediata || 0)
      ) / 4).toFixed(1),
      'Precisión': +(result.precision_respuestas || 0).toFixed(1)
    }));
  };

  const processDataForScatterChart = () => {
    if (testData.length === 0) return [];
    
    return testData.slice(0, 20).map((result, index) => ({
      x: result.edad || 0,
      y: +((result.memoria_visual + result.memoria_trabajo + result.atencion_sostenida) / 3 || 0).toFixed(1),
      name: `Participante ${index + 1}`
    }));
  };

  const processDataForPieChart = () => {
    if (testData.length === 0) return [];
    
    const educationLevels = testData.reduce((acc, result) => {
      const level = result.nivel_educacion || 1;
      const levelName = level === 1 ? 'Básico' : level === 2 ? 'Medio' : 'Superior';
      acc[levelName] = (acc[levelName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(educationLevels).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / testData.length) * 100).toFixed(1)
    }));
  };

  const getAverageScores = () => {
    if (testData.length === 0) return null;
    
    const validResults = testData.filter(result => 
      !isNaN(result.memoria_visual) && 
      !isNaN(result.memoria_trabajo) && 
      !isNaN(result.atencion_sostenida) &&
      !isNaN(result.memoria_inmediata)
    );
    
    if (validResults.length === 0) return null;

    return {
      memoria_visual: +(validResults.reduce((sum, r) => sum + (r.memoria_visual || 0), 0) / validResults.length).toFixed(1),
      memoria_trabajo: +(validResults.reduce((sum, r) => sum + (r.memoria_trabajo || 0), 0) / validResults.length).toFixed(1),
      atencion_sostenida: +(validResults.reduce((sum, r) => sum + (r.atencion_sostenida || 0), 0) / validResults.length).toFixed(1),
      memoria_inmediata: +(validResults.reduce((sum, r) => sum + (r.memoria_inmediata || 0), 0) / validResults.length).toFixed(1),
      precision_promedio: +(validResults.reduce((sum, r) => sum + (r.precision_respuestas || 0), 0) / validResults.length).toFixed(1)
    };
  };

  const barData = processDataForBarChart();
  const lineData = processDataForLineChart();
  const scatterData = processDataForScatterChart();
  const pieData = processDataForPieChart();
  const averages = getAverageScores();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <span>Visualización de Datos</span>
          </CardTitle>
          <CardDescription>
            Análisis visual de los resultados de evaluaciones de memoria cognitiva.
          </CardDescription>
        </CardHeader>
      </Card>

      {testData.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Eye className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-2">No hay datos disponibles para visualizar.</p>
            <p className="text-sm text-gray-400">
              Complete algunas evaluaciones o cargue un dataset CSV para ver las visualizaciones.
            </p>
            <Button onClick={loadData} className="mt-4">
              Recargar Datos
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Statistics Cards */}
          {averages && (
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{testData.length}</p>
                      <p className="text-sm text-gray-600">Evaluaciones</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                      V
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{averages.memoria_visual}</p>
                      <p className="text-sm text-gray-600">M. Visual Prom.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      T
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{averages.memoria_trabajo}</p>
                      <p className="text-sm text-gray-600">M. Trabajo Prom.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                      A
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{averages.atencion_sostenida}</p>
                      <p className="text-sm text-gray-600">Atención Prom.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                      P
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{averages.precision_promedio}%</p>
                      <p className="text-sm text-gray-600">Precisión Prom.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Chart Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Seleccionar Tipo de Gráfico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setSelectedChart('bar')}
                  variant={selectedChart === 'bar' ? 'default' : 'outline'}
                  className="flex items-center space-x-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Barras</span>
                </Button>
                <Button
                  onClick={() => setSelectedChart('line')}
                  variant={selectedChart === 'line' ? 'default' : 'outline'}
                  className="flex items-center space-x-2"
                >
                  <LineChartIcon className="h-4 w-4" />
                  <span>Líneas</span>
                </Button>
                <Button
                  onClick={() => setSelectedChart('scatter')}
                  variant={selectedChart === 'scatter' ? 'default' : 'outline'}
                  className="flex items-center space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span>Dispersión</span>
                </Button>
                <Button
                  onClick={() => setSelectedChart('pie')}
                  variant={selectedChart === 'pie' ? 'default' : 'outline'}
                  className="flex items-center space-x-2"
                >
                  <PieChartIcon className="h-4 w-4" />
                  <span>Circular</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedChart === 'bar' && 'Comparación de Puntuaciones de Memoria'}
                {selectedChart === 'line' && 'Tendencia de Rendimiento'}
                {selectedChart === 'scatter' && 'Relación Edad vs Promedio de Memoria'}
                {selectedChart === 'pie' && 'Distribución por Nivel Educativo'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: '400px' }}>
                <ResponsiveContainer>
                  {selectedChart === 'bar' && (
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Memoria Visual" fill="#8884d8" />
                      <Bar dataKey="Memoria Trabajo" fill="#82ca9d" />
                      <Bar dataKey="Atención Sostenida" fill="#ffc658" />
                      <Bar dataKey="Memoria Inmediata" fill="#ff7300" />
                    </BarChart>
                  )}
                  
                  {selectedChart === 'line' && (
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="evaluacion" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Promedio Memoria" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="Precisión" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  )}
                  
                  {selectedChart === 'scatter' && (
                    <ScatterChart data={scatterData}>
                      <CartesianGrid />
                      <XAxis type="number" dataKey="x" name="Edad" unit=" años" />
                      <YAxis type="number" dataKey="y" name="Promedio Memoria" unit="/10" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter name="Participantes" data={scatterData} fill="#8884d8" />
                    </ScatterChart>
                  )}
                  
                  {selectedChart === 'pie' && (
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} (${percentage}%)`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DataVisualization;
