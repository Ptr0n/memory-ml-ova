
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, Users, Brain, Trash2, Upload, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface TestResult {
  participante_id: string;
  edad: number;
  nivel_educacion: number;
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
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadData = () => {
    try {
      const testData = JSON.parse(localStorage.getItem('test_results') || '[]');
      const csvData = JSON.parse(localStorage.getItem('uploaded_dataset') || '[]');
      
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

  const allData = useMemo(() => {
    return [...testResults, ...uploadedData];
  }, [testResults, uploadedData]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvText = e.target?.result as string;
          const lines = csvText.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          
          const csvData: TestResult[] = [];
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
              const values = lines[i].split(',').map(v => v.trim());
              const record: any = {};
              
              headers.forEach((header, index) => {
                const value = values[index];
                if (header.includes('edad') || header.includes('nivel') || header.includes('memoria') || 
                    header.includes('tiempo') || header.includes('precision') || header.includes('atencion') || 
                    header.includes('fatiga')) {
                  record[header] = parseFloat(value) || 0;
                } else {
                  record[header] = value || '';
                }
              });
              
              if (record.participante_id || record.edad) {
                csvData.push(record as TestResult);
              }
            }
          }
          
          localStorage.setItem('uploaded_dataset', JSON.stringify(csvData));
          localStorage.setItem('dataset_upload_time', new Date().toISOString());
          setUploadedData(csvData);
          toast.success(`Archivo CSV cargado exitosamente. ${csvData.length} registros importados.`);
        } catch (error) {
          console.error('Error parsing CSV:', error);
          toast.error('Error al procesar el archivo CSV');
        }
      };
      reader.readAsText(file);
    } else {
      toast.error('Por favor seleccione un archivo CSV válido');
    }
  };

  const clearCSVData = () => {
    try {
      localStorage.removeItem('uploaded_dataset');
      localStorage.removeItem('dataset_upload_time');
      setUploadedData([]);
      setCsvFile(null);
      setRefreshTrigger(prev => prev + 1);
      toast.success('Datos CSV eliminados exitosamente');
    } catch (error) {
      console.error('Error clearing CSV data:', error);
      toast.error('Error al eliminar datos CSV');
    }
  };

  const generateSampleData = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const sampleData: TestResult[] = [];
      const nombres = ['Ana García', 'Carlos López', 'María Rodríguez', 'Juan Pérez', 'Laura Martín'];
      
      for (let i = 0; i < 50; i++) {
        const edad = Math.floor(Math.random() * 50) + 20;
        const nivelEd = Math.floor(Math.random() * 3) + 1;
        
        sampleData.push({
          participante_id: `SAMPLE_${i + 1}`,
          edad: edad,
          nivel_educacion: nivelEd,
          memoria_trabajo: Math.random() * 4 + 6,
          memoria_visual: Math.random() * 4 + 6,
          tiempo_reaccion: Math.floor(Math.random() * 1000) + 500,
          precision_respuestas: Math.random() * 30 + 70,
          atencion_sostenida: Math.random() * 4 + 6,
          fatiga_cognitiva: Math.floor(Math.random() * 3) + 1,
          fecha: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
      
      localStorage.setItem('uploaded_dataset', JSON.stringify(sampleData));
      setUploadedData(sampleData);
      setIsGenerating(false);
      toast.success('50 registros de muestra generados exitosamente');
    }, 2000);
  };

  const downloadCSV = () => {
    if (allData.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    const headers = [
      'participante_id', 'edad', 'nivel_educacion', 'memoria_trabajo', 'memoria_visual',
      'tiempo_reaccion', 'precision_respuestas', 'atencion_sostenida', 'fatiga_cognitiva', 'fecha'
    ];
    
    let csvContent = headers.join(',') + '\n';
    
    allData.forEach(row => {
      const values = headers.map(header => {
        const value = (row as any)[header];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      csvContent += values.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `evaluaciones_cognitivas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Archivo CSV descargado exitosamente');
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
              <p className="text-gray-500 mb-6">
                Realice evaluaciones, cargue datos CSV o genere datos de muestra para ver las visualizaciones
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="space-y-3">
                  <Label htmlFor="csv-upload" className="text-sm font-medium">Cargar CSV</Label>
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                
                <div className="flex flex-col justify-end">
                  <Button 
                    onClick={generateSampleData} 
                    disabled={isGenerating}
                    className="w-full"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {isGenerating ? 'Generando...' : 'Generar Muestra'}
                  </Button>
                </div>
                
                <div className="flex flex-col justify-end">
                  <Button onClick={() => setRefreshTrigger(prev => prev + 1)} variant="outline" className="w-full">
                    Actualizar Datos
                  </Button>
                </div>
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
    memoria_promedio: (result.memoria_trabajo + result.memoria_visual) / 2
  }));

  const stats = {
    total: allData.length,
    edad_promedio: allData.reduce((sum, r) => sum + r.edad, 0) / allData.length,
    memoria_trabajo_prom: allData.reduce((sum, r) => sum + (r.memoria_trabajo || 0), 0) / allData.length,
    atencion_prom: allData.reduce((sum, r) => sum + (r.atencion_sostenida || 0), 0) / allData.length,
    precision_prom: allData.reduce((sum, r) => sum + (r.precision_respuestas || 0), 0) / allData.length
  };

  const edadDistribution = allData.reduce((acc: any, result) => {
    const grupo = result.edad < 30 ? '18-29' : result.edad < 50 ? '30-49' : result.edad < 65 ? '50-64' : '65+';
    acc[grupo] = (acc[grupo] || 0) + 1;
    return acc;
  }, {});

  const edadData = Object.entries(edadDistribution).map(([grupo, count]) => ({ grupo, count }));

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
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="csv-upload-main" className="text-sm font-medium">Cargar nuevo CSV</Label>
              <Input
                id="csv-upload-main"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="mt-1 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700"
              />
            </div>
            <div className="flex gap-2 items-end">
              <Button onClick={generateSampleData} disabled={isGenerating} size="sm">
                <FileText className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generando...' : 'Generar Muestra'}
              </Button>
              <Button onClick={downloadCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Descargar CSV
              </Button>
              {uploadedData.length > 0 && (
                <Button onClick={clearCSVData} variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpiar CSV
                </Button>
              )}
            </div>
          </div>
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
                <Bar dataKey="memoria_trabajo" fill="#10B981" name="Memoria de Trabajo" />
                <Bar dataKey="memoria_visual" fill="#F59E0B" name="Memoria Visual" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

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
