
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, Cell, PieChart, Pie } from 'recharts';
import { BarChart3, TrendingUp, Users, Brain, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const DataVisualization = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = () => {
    try {
      // Load test results
      const savedResults = localStorage.getItem('test_results');
      const results = savedResults ? JSON.parse(savedResults) : [];
      
      // Load CSV data
      const savedCsvData = localStorage.getItem('uploaded_dataset');
      const csvResults = savedCsvData ? JSON.parse(savedCsvData) : [];
      
      setTestResults(results);
      setCsvData(csvResults);
    } catch (error) {
      console.error('Error loading data:', error);
      setTestResults([]);
      setCsvData([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      loadData();
      setLoading(false);
      toast.success('Datos actualizados');
    }, 500);
  };

  const allData = [...testResults, ...csvData];

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
              Análisis gráfico y estadístico de los resultados de evaluaciones de memoria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <BarChart3 className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay datos disponibles</h3>
              <p className="text-gray-500 mb-4">
                Para ver las visualizaciones, primero debe:
              </p>
              <ul className="text-sm text-gray-500 space-y-1 mb-6">
                <li>• Realizar tests de evaluación, o</li>
                <li>• Cargar un archivo CSV con datos</li>
              </ul>
              <Button onClick={refreshData} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Preparar datos para gráficos
  const memoryData = allData.map((item, index) => ({
    nombre: `Persona ${index + 1}`,
    memoria_inmediata: parseFloat(item.memoria_inmediata) || 0,
    memoria_trabajo: parseFloat(item.memoria_trabajo) || 0,
    memoria_visual: parseFloat(item.memoria_visual) || 0,
    atencion_sostenida: parseFloat(item.atencion_sostenida) || 0
  }));

  const ageDistribution = allData.reduce((acc: any, item) => {
    if (!item.edad) return acc;
    const ageGroup = item.edad < 30 ? '18-29' : 
                     item.edad < 40 ? '30-39' : 
                     item.edad < 50 ? '40-49' : 
                     item.edad < 60 ? '50-59' : '60+';
    acc[ageGroup] = (acc[ageGroup] || 0) + 1;
    return acc;
  }, {});

  const ageData = Object.entries(ageDistribution).map(([age, count]) => ({
    edad: age,
    cantidad: count
  }));

  const avgScores = {
    memoria_inmediata: allData.reduce((sum, item) => sum + (parseFloat(item.memoria_inmediata) || 0), 0) / allData.length,
    memoria_trabajo: allData.reduce((sum, item) => sum + (parseFloat(item.memoria_trabajo) || 0), 0) / allData.length,
    memoria_visual: allData.reduce((sum, item) => sum + (parseFloat(item.memoria_visual) || 0), 0) / allData.length,
    atencion_sostenida: allData.reduce((sum, item) => sum + (parseFloat(item.atencion_sostenida) || 0), 0) / allData.length
  };

  const downloadData = (format: 'csv' | 'json') => {
    try {
      let content = '';
      let filename = '';
      let mimeType = '';

      if (format === 'csv') {
        const headers = ['participante_id', 'edad', 'nivel_educacion', 'memoria_inmediata', 'memoria_trabajo', 'memoria_visual', 'tiempo_reaccion', 'precision_respuestas', 'atencion_sostenida', 'fatiga_cognitiva', 'fecha'];
        content = [
          headers.join(','),
          ...allData.map(item => 
            headers.map(header => item[header] || '').join(',')
          )
        ].join('\n');
        filename = `resultados_memoria_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv;charset=utf-8;';
      } else {
        content = JSON.stringify(allData, null, 2);
        filename = `resultados_memoria_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json;charset=utf-8;';
      }

      const blob = new Blob([content], { type: mimeType });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Datos descargados como ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error downloading data:', error);
      toast.error('Error al descargar los datos');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <span>Visualización de Datos</span>
            </div>
            <div className="flex space-x-2">
              <Button onClick={refreshData} disabled={loading} variant="outline" size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              <Button onClick={() => downloadData('csv')} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button onClick={() => downloadData('json')} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                JSON
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Análisis gráfico de {allData.length} registros de evaluaciones de memoria
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Estadísticas Generales */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Evaluaciones</p>
                <p className="text-2xl font-bold text-blue-600">{allData.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Memoria Inmediata Prom.</p>
                <p className="text-2xl font-bold text-green-600">{avgScores.memoria_inmediata.toFixed(1)}</p>
              </div>
              <Brain className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Memoria Trabajo Prom.</p>
                <p className="text-2xl font-bold text-purple-600">{avgScores.memoria_trabajo.toFixed(1)}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Atención Prom.</p>
                <p className="text-2xl font-bold text-orange-600">{avgScores.atencion_sostenida.toFixed(1)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Comparación de Puntuaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Comparación de Puntuaciones de Memoria</CardTitle>
          <CardDescription>
            Puntuaciones individuales por tipo de memoria evaluada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={memoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="memoria_inmediata" fill="#10b981" name="Memoria Inmediata" />
              <Bar dataKey="memoria_trabajo" fill="#8b5cf6" name="Memoria de Trabajo" />
              <Bar dataKey="memoria_visual" fill="#3b82f6" name="Memoria Visual" />
              <Bar dataKey="atencion_sostenida" fill="#f59e0b" name="Atención Sostenida" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribución por Edad */}
      {ageData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Grupos de Edad</CardTitle>
            <CardDescription>
              Cantidad de participantes por rango etario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ageData}
                  dataKey="cantidad"
                  nameKey="edad"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={({ edad, cantidad }) => `${edad}: ${cantidad}`}
                >
                  {ageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Tendencias de Rendimiento */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencias de Rendimiento Promedio</CardTitle>
          <CardDescription>
            Comparación de puntuaciones promedio por tipo de memoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[
              { tipo: 'Memoria Inmediata', puntuacion: avgScores.memoria_inmediata },
              { tipo: 'Memoria de Trabajo', puntuacion: avgScores.memoria_trabajo },
              { tipo: 'Memoria Visual', puntuacion: avgScores.memoria_visual },
              { tipo: 'Atención Sostenida', puntuacion: avgScores.atencion_sostenida }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tipo" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Line type="monotone" dataKey="puntuacion" stroke="#8884d8" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataVisualization;
