
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface CSVData {
  headers: string[];
  data: any[][];
  isValid: boolean;
  errors: string[];
}

const DatasetUploader = () => {
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [simulatedDataCount, setSimulatedDataCount] = useState('');
  const [generatedData, setGeneratedData] = useState<any[] | null>(null);

  const expectedHeaders = [
    'participante_id', 'edad', 'nivel_educacion', 'memoria_inmediata',
    'memoria_trabajo', 'memoria_visual', 'tiempo_reaccion', 'precision_respuestas',
    'atencion_sostenida', 'fatiga_cognitiva', 'fecha'
  ];

  const validateCSV = (headers: string[], data: any[][]): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    const missingHeaders = expectedHeaders.filter(header => !headers.includes(header));
    if (missingHeaders.length > 0) {
      errors.push(`Headers faltantes: ${missingHeaders.join(', ')}`);
    }

    if (data.length === 0) {
      errors.push('El archivo no contiene datos');
    }

    if (data.length > 0) {
      const sampleRows = data.slice(0, Math.min(5, data.length));
      sampleRows.forEach((row, index) => {
        const edadIndex = headers.indexOf('edad');
        const nivelEducacionIndex = headers.indexOf('nivel_educacion');
        
        if (edadIndex !== -1 && (isNaN(Number(row[edadIndex])) || Number(row[edadIndex]) < 18 || Number(row[edadIndex]) > 85)) {
          errors.push(`Fila ${index + 1}: Edad debe ser un número entre 18 y 85`);
        }
        
        if (nivelEducacionIndex !== -1 && ![1, 2, 3].includes(Number(row[nivelEducacionIndex]))) {
          errors.push(`Fila ${index + 1}: Nivel educación debe ser 1, 2 o 3`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Por favor seleccione un archivo CSV');
      return;
    }

    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
          throw new Error('El archivo está vacío');
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const data = lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));

        const validation = validateCSV(headers, data);
        
        const csvData: CSVData = {
          headers,
          data,
          isValid: validation.isValid,
          errors: validation.errors
        };

        setCsvData(csvData);
        
        if (validation.isValid) {
          toast.success(`Archivo cargado exitosamente: ${data.length} registros`);
        } else {
          toast.error('El archivo tiene errores de validación');
        }
      } catch (error) {
        toast.error('Error al procesar el archivo CSV');
        console.error('Error processing CSV:', error);
      } finally {
        setIsLoading(false);
      }
    };

    reader.readAsText(file);
  };

  const clearUploadedData = () => {
    setCsvData(null);
    localStorage.removeItem('uploaded_dataset');
    localStorage.removeItem('dataset_upload_time');
    toast.success('Datos CSV eliminados exitosamente');
    
    // Reset file input
    const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
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
          edad: Math.floor(Math.random() * 60) + 20,
          nivel_educacion: Math.floor(Math.random() * 3) + 1,
          memoria_inmediata: +(Math.random() * 10).toFixed(1),
          memoria_trabajo: +(Math.random() * 10).toFixed(1),
          memoria_visual: +(Math.random() * 10).toFixed(1),
          tiempo_reaccion: Math.floor(Math.random() * 1500) + 500,
          precision_respuestas: +(Math.random() * 100).toFixed(1),
          atencion_sostenida: +(Math.random() * 10).toFixed(1),
          fatiga_cognitiva: Math.floor(Math.random() * 5) + 1,
          fecha: new Date().toISOString()
        };
        simulatedData.push(data);
      }

      setGeneratedData(simulatedData);
      toast.success(`${count} registros simulados generados exitosamente`);
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
      const headers = expectedHeaders;
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

  const loadDataToAnalysis = () => {
    if (!csvData || !csvData.isValid) return;

    const processedData = csvData.data.map(row => {
      const result: any = {};
      csvData.headers.forEach((header, index) => {
        const value = row[index];
        
        if (['edad', 'nivel_educacion', 'tiempo_reaccion', 'fatiga_cognitiva'].includes(header)) {
          result[header] = parseInt(value) || 0;
        } else if (['memoria_inmediata', 'memoria_trabajo', 'memoria_visual', 'precision_respuestas', 'atencion_sostenida'].includes(header)) {
          result[header] = parseFloat(value) || 0;
        } else {
          result[header] = value || '';
        }
      });
      
      return result;
    });

    localStorage.setItem('uploaded_dataset', JSON.stringify(processedData));
    localStorage.setItem('dataset_upload_time', new Date().toISOString());
    
    toast.success(`${processedData.length} registros cargados para análisis`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-6 w-6 text-blue-600" />
            <span>Carga de Dataset CSV</span>
          </CardTitle>
          <CardDescription>
            Cargue archivos CSV con datos de evaluaciones de memoria para análisis con el modelo de IA.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
              disabled={isLoading}
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">
                {isLoading ? 'Procesando archivo...' : 'Seleccionar archivo CSV'}
              </p>
              <p className="text-sm text-gray-500">
                Haga clic aquí o arrastre un archivo CSV
              </p>
            </label>
          </div>

          {/* Clear uploaded data button */}
          {csvData && (
            <div className="flex justify-center">
              <Button onClick={clearUploadedData} variant="destructive" className="bg-red-600 hover:bg-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar Datos CSV
              </Button>
            </div>
          )}

          {/* Simulated Data Generation */}
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
              </div>
              {generatedData && (
                <div className="flex justify-center">
                  <Button onClick={downloadGeneratedCSV} className="bg-green-600 hover:bg-green-700">
                    <FileText className="h-4 w-4 mr-2" />
                    Descargar CSV ({generatedData.length} registros)
                  </Button>
                </div>
              )}
              <p className="text-sm text-gray-600">
                Los datos generados son aleatorios y no corresponden a evaluaciones reales.
              </p>
            </CardContent>
          </Card>

          {/* Validation Results */}
          {csvData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {csvData.isValid ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span>Resultado de Validación</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Headers encontrados: {csvData.headers.length}</p>
                    <p className="text-sm text-gray-600">Registros: {csvData.data.length}</p>
                  </div>
                  <div>
                    <p className="font-medium">
                      Estado: 
                      <span className={csvData.isValid ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                        {csvData.isValid ? 'Válido' : 'Con errores'}
                      </span>
                    </p>
                  </div>
                </div>

                {csvData.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="font-medium text-red-800 mb-2">Errores encontrados:</p>
                    <ul className="text-sm text-red-700 space-y-1">
                      {csvData.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {csvData.isValid && (
                  <div className="flex justify-center">
                    <Button onClick={loadDataToAnalysis} className="bg-green-600 hover:bg-green-700">
                      Cargar Datos para Análisis
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Expected Format */}
          <Card>
            <CardHeader>
              <CardTitle>Formato Esperado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  El archivo CSV debe incluir las siguientes columnas en cualquier orden:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-2 text-sm font-mono">
                    {expectedHeaders.map(header => (
                      <div key={header} className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span>{header}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Notas importantes:</strong></p>
                  <ul className="space-y-1 ml-4">
                    <li>• edad: número entre 18 y 85</li>
                    <li>• nivel_educacion: 1 (Básico), 2 (Medio), 3 (Superior)</li>
                    <li>• puntuaciones de memoria: valores decimales entre 0 y 10</li>
                    <li>• tiempo_reaccion: en milisegundos</li>
                    <li>• precision_respuestas: porcentaje (0-100)</li>
                    <li>• fatiga_cognitiva: escala 1-5</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatasetUploader;
