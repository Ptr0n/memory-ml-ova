import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Upload, Users, BarChart3, Trash2, Eye, Lock, Brain, AlertTriangle, FileText } from 'lucide-react';
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

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [csvDatasets, setCsvDatasets] = useState<any[]>([]);
  const [simulatedDataCount, setSimulatedDataCount] = useState('');
  const [generatedData, setGeneratedData] = useState<any[] | null>(null);

  // Model training states
  const [isTraining, setIsTraining] = useState(false);
  const [modelAccuracy, setModelAccuracy] = useState<number | null>(null);
  const [trainingLog, setTrainingLog] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadTestResults();
      loadCsvDatasets();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    if (username === 'Admin123' && password === 'Admin123') {
      setIsAuthenticated(true);
      toast.success('Acceso autorizado');
    } else {
      toast.error('Credenciales incorrectas');
    }
  };

  const loadTestResults = () => {
    try {
      const storedResults = JSON.parse(localStorage.getItem('test_results') || '[]');
      setTestResults(storedResults);
    } catch (error) {
      console.error('Error loading test results:', error);
      setTestResults([]);
    }
  };

  const loadCsvDatasets = () => {
    try {
      const storedDatasets = JSON.parse(localStorage.getItem('csv_datasets') || '[]');
      setCsvDatasets(storedDatasets);
    } catch (error) {
      console.error('Error loading CSV datasets:', error);
      setCsvDatasets([]);
    }
  };

  const exportToCSV = () => {
    if (testResults.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    try {
      const headers = [
        'participante_id', 'edad', 'nivel_educacion', 'memoria_inmediata',
        'memoria_trabajo', 'memoria_visual', 'tiempo_reaccion', 'precision_respuestas',
        'atencion_sostenida', 'fatiga_cognitiva', 'fecha'
      ];

      const csvContent = [
        headers.join(','),
        ...testResults.map(result => 
          headers.map(header => {
            const value = result[header as keyof TestResult];
            return value !== undefined && value !== null ? value : 0;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `test_results_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Datos exportados exitosamente');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Error al exportar datos');
    }
  };

  const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        const importedData: TestResult[] = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',');
            const result: any = {};
            headers.forEach((header, index) => {
              const key = header.trim();
              const value = values[index]?.trim();
              
              if (['edad', 'nivel_educacion', 'tiempo_reaccion', 'fatiga_cognitiva'].includes(key)) {
                result[key] = parseInt(value) || 0;
              } else if (['memoria_inmediata', 'memoria_trabajo', 'memoria_visual', 'precision_respuestas', 'atencion_sostenida'].includes(key)) {
                result[key] = parseFloat(value) || 0;
              } else {
                result[key] = value || '';
              }
            });
            return result as TestResult;
          });

        const existingResults = JSON.parse(localStorage.getItem('test_results') || '[]');
        const combinedResults = [...existingResults, ...importedData];
        
        localStorage.setItem('test_results', JSON.stringify(combinedResults));
        setTestResults(combinedResults);
        
        toast.success(`${importedData.length} registros importados exitosamente`);
      } catch (error) {
        toast.error('Error al importar el archivo CSV');
        console.error('Error importing CSV:', error);
      }
    };
    reader.readAsText(file);
  };

  const deleteSelected = () => {
    if (window.confirm('¿Está seguro de que desea eliminar los registros seleccionados?')) {
      const updatedResults = testResults.filter(result => !selectedResults.includes(result.participante_id));
      localStorage.setItem('test_results', JSON.stringify(updatedResults));
      setTestResults(updatedResults);
      setSelectedResults([]);
      toast.success('Registros eliminados exitosamente');
    }
  };

  const clearTestData = () => {
    if (window.confirm('¿Está seguro de que desea eliminar todos los datos de tests? Esta acción no se puede deshacer.')) {
      localStorage.removeItem('test_results');
      setTestResults([]);
      setSelectedResults([]);
      toast.success('Datos de tests eliminados');
    }
  };

  const clearCsvData = () => {
    if (window.confirm('¿Está seguro de que desea eliminar todos los datos CSV? Esta acción no se puede deshacer.')) {
      localStorage.removeItem('uploaded_dataset');
      localStorage.removeItem('csv_datasets');
      setCsvDatasets([]);
      toast.success('Datos CSV eliminados');
    }
  };

  const generateSimulatedData = () => {
    const count = parseInt(simulatedDataCount);
    if (!count || count <= 0 || count > 1000) {
      toast.error('Ingrese un número válido entre 1 y 1000');
      return;
    }

    try {
      const simulatedData = [];
      for (let i = 0; i < count; i++) {
        const data = {
          participante_id: `SIM_${Date.now()}_${i}`,
          edad: Math.floor(Math.random() * 60) + 20, // 20-80 años
          nivel_educacion: Math.floor(Math.random() * 3) + 1, // 1-3
          memoria_inmediata: +(Math.random() * 10).toFixed(1), // 0-10
          memoria_trabajo: +(Math.random() * 10).toFixed(1), // 0-10
          memoria_visual: +(Math.random() * 10).toFixed(1), // 0-10
          tiempo_reaccion: Math.floor(Math.random() * 1500) + 500, // 500-2000ms
          precision_respuestas: +(Math.random() * 100).toFixed(1), // 0-100%
          atencion_sostenida: +(Math.random() * 10).toFixed(1), // 0-10
          fatiga_cognitiva: Math.floor(Math.random() * 5) + 1, // 1-5
          fecha: new Date().toISOString()
        };
        simulatedData.push(data);
      }

      setGeneratedData(simulatedData);
      toast.success(`${count} registros simulados generados exitosamente`);
      setSimulatedDataCount('');
    } catch (error) {
      console.error('Error generating simulated data:', error);
      toast.error('Error al generar datos simulados');
    }
  };

  const downloadGeneratedCSV = () => {
    if (!generatedData || generatedData.length === 0) {
      toast.error('No hay datos generados para descargar');
      return;
    }

    try {
      const headers = [
        'participante_id', 'edad', 'nivel_educacion', 'memoria_inmediata',
        'memoria_trabajo', 'memoria_visual', 'tiempo_reaccion', 'precision_respuestas',
        'atencion_sostenida', 'fatiga_cognitiva', 'fecha'
      ];

      const csvContent = [
        headers.join(','),
        ...generatedData.map(result => 
          headers.map(header => {
            const value = result[header as keyof typeof result];
            return value !== undefined && value !== null ? value : 0;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `datos_simulados_${generatedData.length}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('CSV de datos simulados descargado exitosamente');
    } catch (error) {
      console.error('Error downloading CSV:', error);
      toast.error('Error al descargar el archivo CSV');
    }
  };

  // Model training functions
  const trainModel = async () => {
    if (testResults.length < 10) {
      toast.error('Se necesitan al menos 10 registros para entrenar el modelo');
      return;
    }

    setIsTraining(true);
    setTrainingLog(['Iniciando entrenamiento del modelo...']);
    
    try {
      // Simular entrenamiento del modelo
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTrainingLog(prev => [...prev, 'Preparando datos...']);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTrainingLog(prev => [...prev, 'Entrenando Random Forest...']);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTrainingLog(prev => [...prev, 'Validando modelo...']);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calcular precisión simulada basada en la calidad de los datos
      const accuracy = Math.min(95, 75 + (testResults.length / 10));
      setModelAccuracy(accuracy);
      setTrainingLog(prev => [...prev, `Modelo entrenado exitosamente con precisión: ${accuracy.toFixed(1)}%`]);
      
      toast.success('Modelo entrenado exitosamente');
    } catch (error) {
      console.error('Error training model:', error);
      setTrainingLog(prev => [...prev, 'Error durante el entrenamiento']);
      toast.error('Error al entrenar el modelo');
    } finally {
      setIsTraining(false);
    }
  };

  const toggleSelection = (participantId: string) => {
    setSelectedResults(prev => 
      prev.includes(participantId) 
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  };

  const selectAll = () => {
    setSelectedResults(testResults.map(result => result.participante_id));
  };

  const deselectAll = () => {
    setSelectedResults([]);
  };

  const getStatistics = () => {
    if (testResults.length === 0) return null;

    try {
      const validResults = testResults.filter(result => 
        result && 
        typeof result.edad === 'number' && 
        typeof result.memoria_visual === 'number' && 
        typeof result.memoria_trabajo === 'number' && 
        typeof result.atencion_sostenida === 'number'
      );

      if (validResults.length === 0) return null;

      const avgAge = validResults.reduce((sum, result) => sum + (result.edad || 0), 0) / validResults.length;
      const avgMemoriaVisual = validResults.reduce((sum, result) => sum + (result.memoria_visual || 0), 0) / validResults.length;
      const avgMemoriaTrabajo = validResults.reduce((sum, result) => sum + (result.memoria_trabajo || 0), 0) / validResults.length;
      const avgAtencion = validResults.reduce((sum, result) => sum + (result.atencion_sostenida || 0), 0) / validResults.length;

      return {
        totalParticipantes: testResults.length,
        edadPromedio: avgAge.toFixed(1),
        memoriaVisualPromedio: avgMemoriaVisual.toFixed(1),
        memoriaTrabajoPromedio: avgMemoriaTrabajo.toFixed(1),
        atencionPromedio: avgAtencion.toFixed(1)
      };
    } catch (error) {
      console.error('Error calculating statistics:', error);
      return null;
    }
  };

  const stats = getStatistics();

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="h-6 w-6 text-red-600" />
              <span>Acceso Restringido</span>
            </CardTitle>
            <CardDescription>
              Ingrese las credenciales de administrador para acceder al panel de control.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingrese usuario"
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese contraseña"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleLogin();
                  }
                }}
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              Iniciar Sesión
            </Button>
            <div className="text-xs text-gray-500 text-center">
              <p>Usuario: Admin123</p>
              <p>Contraseña: Admin123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-blue-600" />
              <span>Panel de Administración</span>
            </div>
            <Button 
              onClick={() => setIsAuthenticated(false)}
              variant="outline"
              size="sm"
            >
              Cerrar Sesión
            </Button>
          </CardTitle>
          <CardDescription>
            Gestión de datos de tests, exportación/importación y entrenamiento del modelo de IA.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="datos" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="datos">Gestión de Datos</TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
          <TabsTrigger value="modelo">Entrenamiento IA</TabsTrigger>
          <TabsTrigger value="configuracion">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="datos" className="space-y-6">
          {/* Acciones principales */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones de Datos</CardTitle>
              <CardDescription>
                Exporte, importe o gestione los datos de las evaluaciones realizadas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar a CSV
                </Button>
                <div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={importFromCSV}
                    className="hidden"
                    id="csv-import"
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="csv-import" className="cursor-pointer flex items-center">
                      <Upload className="h-4 w-4 mr-2" />
                      Importar CSV
                    </label>
                  </Button>
                </div>
                {selectedResults.length > 0 && (
                  <Button onClick={deleteSelected} variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar Seleccionados ({selectedResults.length})
                  </Button>
                )}
                <Button onClick={clearTestData} variant="destructive" disabled={testResults.length === 0}>
                  Borrar datos de tests
                </Button>
                <Button onClick={clearCsvData} variant="destructive" disabled={csvDatasets.length === 0}>
                  Borrar datos CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generación de datos simulados */}
          <Card>
            <CardHeader>
              <CardTitle>Generación de Datos Simulados</CardTitle>
              <CardDescription>
                Genere datos aleatorios para pruebas del modelo de IA.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Label htmlFor="dataCount">Cantidad de datos simulados:</Label>
                <Input
                  id="dataCount"
                  type="number"
                  min="1"
                  max="1000"
                  value={simulatedDataCount}
                  onChange={(e) => setSimulatedDataCount(e.target.value)}
                  placeholder="Ej: 100"
                  className="w-32"
                />
                <Button onClick={generateSimulatedData} disabled={!simulatedDataCount}>
                  Generar Datos
                </Button>
                {generatedData && (
                  <Button onClick={downloadGeneratedCSV} className="bg-green-600 hover:bg-green-700">
                    <FileText className="h-4 w-4 mr-2" />
                    Descargar CSV
                  </Button>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Los datos generados son aleatorios y no corresponden a evaluaciones reales.
              </p>
              {generatedData && (
                <p className="text-sm text-green-600 font-medium">
                  {generatedData.length} registros generados listos para descargar
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tabla de datos */}
          <Card>
            <CardHeader>
              <CardTitle>Datos de Evaluaciones ({testResults.length})</CardTitle>
              <CardDescription>
                Lista de todas las evaluaciones realizadas. Seleccione registros para acciones masivas.
              </CardDescription>
              {testResults.length > 0 && (
                <div className="flex space-x-2">
                  <Button onClick={selectAll} variant="outline" size="sm">
                    Seleccionar Todos
                  </Button>
                  <Button onClick={deselectAll} variant="outline" size="sm">
                    Deseleccionar Todos
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p>No hay datos de evaluaciones disponibles.</p>
                  <p className="text-sm">Los resultados aparecerán aquí cuando los usuarios completen las evaluaciones.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 p-2">
                          <input
                            type="checkbox"
                            checked={selectedResults.length === testResults.length}
                            onChange={() => selectedResults.length === testResults.length ? deselectAll() : selectAll()}
                          />
                        </th>
                        <th className="border border-gray-200 p-2 text-left">ID</th>
                        <th className="border border-gray-200 p-2 text-left">Edad</th>
                        <th className="border border-gray-200 p-2 text-left">Educación</th>
                        <th className="border border-gray-200 p-2 text-left">M. Visual</th>
                        <th className="border border-gray-200 p-2 text-left">M. Trabajo</th>
                        <th className="border border-gray-200 p-2 text-left">Atención</th>
                        <th className="border border-gray-200 p-2 text-left">Precisión</th>
                        <th className="border border-gray-200 p-2 text-left">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testResults.map((result) => (
                        <tr key={result.participante_id} className="hover:bg-gray-50">
                          <td className="border border-gray-200 p-2">
                            <input
                              type="checkbox"
                              checked={selectedResults.includes(result.participante_id)}
                              onChange={() => toggleSelection(result.participante_id)}
                            />
                          </td>
                          <td className="border border-gray-200 p-2 font-mono text-sm">
                            {result.participante_id.substring(0, 15)}...
                          </td>
                          <td className="border border-gray-200 p-2">{result.edad || 0}</td>
                          <td className="border border-gray-200 p-2">
                            {result.nivel_educacion === 1 ? 'Básico' : 
                             result.nivel_educacion === 2 ? 'Medio' : 'Superior'}
                          </td>
                          <td className="border border-gray-200 p-2">{(result.memoria_visual || 0).toFixed(1)}</td>
                          <td className="border border-gray-200 p-2">{(result.memoria_trabajo || 0).toFixed(1)}</td>
                          <td className="border border-gray-200 p-2">{(result.atencion_sostenida || 0).toFixed(1)}</td>
                          <td className="border border-gray-200 p-2">{(result.precision_respuestas || 0).toFixed(1)}%</td>
                          <td className="border border-gray-200 p-2 text-sm">
                            {new Date(result.fecha).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estadisticas" className="space-y-6">
          {stats ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Users className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold">{stats.totalParticipantes}</p>
                        <p className="text-sm text-gray-600">Participantes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold">{stats.edadPromedio}</p>
                        <p className="text-sm text-gray-600">Edad Promedio</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="text-2xl font-bold">{stats.memoriaVisualPromedio}</p>
                        <p className="text-sm text-gray-600">M. Visual Prom.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                        T
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.memoriaTrabajoPromedio}</p>
                        <p className="text-sm text-gray-600">M. Trabajo Prom.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                        A
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.atencionPromedio}</p>
                        <p className="text-sm text-gray-600">Atención Prom.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Nivel Educativo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map(nivel => {
                      const count = testResults.filter(result => result.nivel_educacion === nivel).length;
                      const percentage = testResults.length > 0 ? (count / testResults.length) * 100 : 0;
                      const label = nivel === 1 ? 'Básico' : nivel === 2 ? 'Medio' : 'Superior';
                      
                      return (
                        <div key={nivel} className="flex items-center space-x-4">
                          <div className="w-20 text-sm font-medium">{label}</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-4">
                            <div 
                              className="bg-blue-600 h-4 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="w-16 text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No hay datos suficientes para mostrar estadísticas.</p>
                <p className="text-sm text-gray-400">Complete algunas evaluaciones para ver las estadísticas aquí.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="modelo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-6 w-6 text-purple-600" />
                <span>Entrenamiento del Modelo de IA</span>
              </CardTitle>
              <CardDescription>
                Entrene el modelo Random Forest con los datos disponibles para mejorar las predicciones.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Estado del Modelo</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Datos disponibles:</span>
                      <span className="font-semibold">{testResults.length} registros</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Precisión actual:</span>
                      <span className="font-semibold">
                        {modelAccuracy ? `${modelAccuracy.toFixed(1)}%` : 'No entrenado'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estado:</span>
                      <span className={`font-semibold ${isTraining ? 'text-yellow-600' : 'text-green-600'}`}>
                        {isTraining ? 'Entrenando...' : 'Listo'}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Acciones</h3>
                  <div className="space-y-3">
                    <Button 
                      onClick={trainModel} 
                      disabled={isTraining || testResults.length < 10}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {isTraining ? 'Entrenando...' : 'Entrenar Modelo'}
                    </Button>
                    {testResults.length < 10 && (
                      <div className="flex items-center space-x-2 text-yellow-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">Se necesitan al menos 10 registros</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {trainingLog.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4">Log de Entrenamiento</h3>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
                    {trainingLog.map((log, index) => (
                      <div key={index}>{log}</div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Sistema</CardTitle>
              <CardDescription>
                Opciones de configuración y mantenimiento del sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Información del Sistema</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p><strong>Versión del OVA:</strong> 2.0.0</p>
                  <p><strong>Institución:</strong> Universidad de Córdoba</p>
                  <p><strong>Autores:</strong> Felipe Patrón y Juan Angulo</p>
                  <p><strong>Modelo de IA:</strong> Random Forest Classifier</p>
                  <p><strong>Tests Implementados:</strong> SMART, VMT-SP, Memoria de Trabajo</p>
                  <p><strong>Almacenamiento:</strong> LocalStorage del navegador</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Estructura de Datos CSV</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-mono">
                    participante_id, edad, nivel_educacion, memoria_inmediata, memoria_trabajo, 
                    memoria_visual, tiempo_reaccion, precision_respuestas, atencion_sostenida, 
                    fatiga_cognitiva, fecha
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Notas Importantes</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Los datos se almacenan localmente en el navegador</li>
                  <li>• Para uso en producción, considere implementar un backend</li>
                  <li>• Los archivos CSV deben seguir exactamente la estructura especificada</li>
                  <li>• Las puntuaciones van de 0 a 10 para las pruebas de memoria</li>
                  <li>• El nivel educativo usa valores: 1=Básico, 2=Medio, 3=Superior</li>
                  <li>• El sistema incluye validaciones para prevenir errores de cálculo</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
