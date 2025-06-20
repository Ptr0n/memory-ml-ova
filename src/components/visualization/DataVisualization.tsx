
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ScatterPlot, Scatter } from 'recharts';
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
  const [uploadedData, setUploadedData] = useState<TestResult[]>([]);
  const [dataSource, setDataSource] = useState<'tests' | 'uploaded' | 'combined'>('tests');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Cargar datos de tests realizados
    const storedResults = JSON.parse(localStorage.getItem('test_results') || '[]');
    setTestResults(storedResults);

    // Cargar datos subidos
    const uploadedResults = JSON.parse(localStorage.getItem('uploaded_dataset') || '[]');
    setUploadedData(uploadedResults);
  };

  const getCurrentData = (): TestResult[] => {
    switch (dataSource) {
      case 'tests':
        return testResults;
      case 'uploaded':
        return uploadedData;
      case 'combined':
        return [...testResults, ...uploadedData];
      default:
        return testResults;
    }
  };

  const currentData = getCurrentData();

  // Preparar datos para gráficos
  const getAgeDistribution = () => {
    const ageGroups = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '56-65': 0,
      '66+': 0
    };

    currentData.forEach(result => {
      const age = result.edad;
      if (age <= 25) ageGroups['18-25']++;
      else if (age <= 35) ageGroups['26-35']++;
      else if (age <= 45) ageGroups['36-45']++;
      else if (age <= 55) ageGroups['46-55']++;
      else if (age <= 65) ageGroups['56-65']++;
      else ageGroups['66+']++;
    });

    return Object.entries(ageGroups).map(([group, count]) => ({
      grupo: group,
      cantidad: count
    }));
  };

  const getMemoryScores = () => {
    return currentData.map(result => ({
      participante: result.participante_id.substring(0, 8),
      'M. Visual': result.memoria_visual,
      'M. Trabajo': result.memoria_trabajo,
      'M. Inmediata': result.memoria_inmediata,
      'Atención': result.atencion_sostenida
    }));
  };

  const getEducationDistribution = () => {
    const educationCounts = { 1: 0, 2: 0, 3: 0 };
    currentData.forEach(result => {
      educationCounts[result.nivel_educacion as keyof typeof educationCounts]++;
    });

    return [
      { name: 'Básico', value: educationCounts[1], color: '#8884d8' },
      { name: 'Medio', value: educationCounts[2], color: '#82ca9d' },
      { name: 'Superior', value: educationCounts[3], color: '#ffc658' }
    ];
  };

  const getPerformanceOverTime = () => {
    const sortedData = [...currentData].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    
    return sortedData.map((result, index) => ({
      sesion: index + 1,
      'Promedio General': (result.memoria_visual + result.memoria_trabajo + result.atencion_sostenida) / 3,
      fecha: new Date(result.fecha).toLocaleDateString()
    }));
  };

  const getCorrelationData = () => {
    return currentData.map(result => ({
      edad: result.edad,
      memoria_promedio: (result.memoria_visual + result.memoria_trabajo + result.atencion_sostenida) / 3,
      precision: result.precision_respuestas
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (currentData.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 mb-2">No hay datos disponibles para visualizar</p>
          <p className="text-sm text-gray-400">
            Complete algunas evaluaciones o cargue un dataset CSV para ver las visualizaciones.
          </p>
          <Button onClick={loadData} className="mt-4" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar Datos
          </Button>
        </CardContent>
      </Card>
    );
  }

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
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              onClick={() => setDataSource('tests')}
              variant={dataSource === 'tests' ? 'default' : 'outline'}
              size="sm"
            >
              Tests Realizados ({testResults.length})
            </Button>
            <Button
              onClick={() => setDataSource('uploaded')}
              variant={dataSource === 'uploaded' ? 'default' : 'outline'}
              size="sm"
            >
              Datos Cargados ({uploadedData.length})
            </Button>
            <Button
              onClick={() => setDataSource('combined')}
              variant={dataSource === 'combined' ? 'default' : 'outline'}
              size="sm"
            >
              Datos Combinados ({testResults.length + uploadedData.length})
            </Button>
            <Button onClick={loadData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Actualizar
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Mostrando datos de: <strong>{dataSource === 'tests' ? 'Tests Realizados' : dataSource === 'uploaded' ? 'Datos Cargados' : 'Datos Combinados'}</strong> ({currentData.length} registros)
          </p>
        </CardContent>
      </Card>

      {/* Estadísticas Generales */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{currentData.length}</p>
                <p className="text-sm text-gray-600">Total Evaluaciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {(currentData.reduce((sum, r) => sum + r.memoria_visual, 0) / currentData.length).toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">Memoria Visual Prom.</p>
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
                <p className="text-2xl font-bold">
                  {(currentData.reduce((sum, r) => sum + r.memoria_trabajo, 0) / currentData.length).toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">Memoria Trabajo Prom.</p>
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
                <p className="text-2xl font-bold">
                  {(currentData.reduce((sum, r) => sum + r.atencion_sostenida, 0) / currentData.length).toFixed(1)}
                </p>
                <p className="text-sm text-gray-600">Atención Prom.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principales */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Distribución por edad */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Grupos de Edad</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getAgeDistribution()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grupo" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución educativa */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Nivel Educativo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getEducationDistribution()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getEducationDistribution().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Puntuaciones de memoria */}
      <Card>
        <CardHeader>
          <CardTitle>Comparación de Puntuaciones de Memoria</CardTitle>
          <CardDescription>
            Puntuaciones individuales en diferentes tipos de memoria por participante.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={getMemoryScores().slice(0, 20)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="participante" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="M. Visual" fill="#8884d8" />
              <Bar dataKey="M. Trabajo" fill="#82ca9d" />
              <Bar dataKey="M. Inmediata" fill="#ffc658" />
              <Bar dataKey="Atención" fill="#ff7300" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Rendimiento a lo largo del tiempo */}
      {getPerformanceOverTime().length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Rendimiento</CardTitle>
            <CardDescription>
              Evolución del rendimiento promedio a lo largo del tiempo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getPerformanceOverTime()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sesion" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Promedio General" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Correlación edad vs rendimiento */}
      <Card>
        <CardHeader>
          <CardTitle>Correlación: Edad vs Rendimiento de Memoria</CardTitle>
          <CardDescription>
            Relación entre la edad de los participantes y su rendimiento promedio en memoria.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterPlot>
              <CartesianGrid />
              <XAxis type="number" dataKey="edad" name="Edad" />
              <YAxis type="number" dataKey="memoria_promedio" name="Memoria Promedio" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Participantes" data={getCorrelationData()} fill="#8884d8" />
            </ScatterPlot>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataVisualization;
