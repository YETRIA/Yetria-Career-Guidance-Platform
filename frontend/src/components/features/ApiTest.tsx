/**
 * Yetria Career Guidance Platform - API Test Component
 * 
 * Bu component API entegrasyonunu test etmek için kullanılır.
 * Development aşamasında API bağlantısını doğrulamak için.
 */

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, CheckCircle, XCircle, RefreshCw, Brain, Heart, Zap, Shield, Calculator, Leaf, Users, Smartphone } from 'lucide-react';
import { useHealthCheck, useCareerPrediction, useConnectionTest } from '../../hooks/useApi';
import { PredictionRequest } from '../../types/api';

export function ApiTest() {
  const [testResults, setTestResults] = useState<{
    health: boolean | null;
    prediction: boolean | null;
    connection: boolean | null;
  }>({
    health: null,
    prediction: null,
    connection: null
  });

  const healthCheck = useHealthCheck();
  const careerPrediction = useCareerPrediction();
  const connectionTest = useConnectionTest();

  // Test Health Check
  const testHealth = async () => {
    try {
      await healthCheck.execute();
      setTestResults(prev => ({ ...prev, health: true }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, health: false }));
    }
  };

  // Test Connection
  const testConnection = async () => {
    try {
      const connected = await connectionTest.testConnection();
      setTestResults(prev => ({ ...prev, connection: connected }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, connection: false }));
    }
  };

  // Test Prediction
  const testPrediction = async () => {
    const testData: PredictionRequest = {
      scores: {
        analitik_dusunme: 8.5,
        sayisal_zeka: 7.2,
        stres_yonetimi: 6.8,
        empati: 5.5,
        takim_calismasi: 7.0,
        hizli_karar_alma: 6.5,
        duygusal_dayaniklilik: 7.8,
        teknoloji_adaptasyonu: 9.0
      },
      user_id: 'test_user'
    };

    try {
      const result = await careerPrediction.execute(testData);
      if (result) {
        setTestResults(prev => ({ ...prev, prediction: true }));
      } else {
        setTestResults(prev => ({ ...prev, prediction: false }));
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, prediction: false }));
    }
  };

  // Run All Tests
  const runAllTests = async () => {
    setTestResults({ health: null, prediction: null, connection: null });
    
    await testConnection();
    await testHealth();
    await testPrediction();
  };

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (status) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusBadge = (status: boolean | null, label: string) => {
    if (status === null) return <Badge variant="secondary">{label} - Testing...</Badge>;
    if (status) return <Badge variant="default" className="bg-green-500">{label} - Success</Badge>;
    return <Badge variant="destructive">{label} - Failed</Badge>;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6" />
            API Integration Test
          </CardTitle>
          <CardDescription>
            Backend API ile frontend entegrasyonunu test edin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Controls */}
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={runAllTests}
              disabled={healthCheck.loading || careerPrediction.loading || connectionTest.testing}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Run All Tests
            </Button>
            
            <Button 
              onClick={testConnection}
              disabled={connectionTest.testing}
              variant="outline"
            >
              Test Connection
            </Button>
            
            <Button 
              onClick={testHealth}
              disabled={healthCheck.loading}
              variant="outline"
            >
              Test Health
            </Button>
            
            <Button 
              onClick={testPrediction}
              disabled={careerPrediction.loading}
              variant="outline"
            >
              Test Prediction
            </Button>
          </div>

          {/* Test Results */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Connection</span>
                  {getStatusIcon(testResults.connection)}
                </div>
                {getStatusBadge(testResults.connection, "Connection")}
                {connectionTest.testing && (
                  <p className="text-sm text-muted-foreground mt-2">Testing connection...</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Health Check</span>
                  {getStatusIcon(testResults.health)}
                </div>
                {getStatusBadge(testResults.health, "Health")}
                {healthCheck.loading && (
                  <p className="text-sm text-muted-foreground mt-2">Checking health...</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Prediction</span>
                  {getStatusIcon(testResults.prediction)}
                </div>
                {getStatusBadge(testResults.prediction, "Prediction")}
                {careerPrediction.loading && (
                  <p className="text-sm text-muted-foreground mt-2">Testing prediction...</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Error Messages */}
          {(healthCheck.error || careerPrediction.error) && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  {healthCheck.error && (
                    <div>
                      <strong>Health Check Error:</strong> {healthCheck.error}
                    </div>
                  )}
                  {careerPrediction.error && (
                    <div>
                      <strong>Prediction Error:</strong> {careerPrediction.error}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Success Messages */}
          {careerPrediction.data && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div>
                    <strong>Prediction Success!</strong>
                  </div>
                  <div>
                    <strong>Predicted Persona:</strong> {careerPrediction.data.predicted_persona}
                  </div>
                  <div>
                    <strong>Confidence:</strong> {(careerPrediction.data.confidence * 100).toFixed(1)}%
                  </div>
                  <div>
                    <strong>Recommendation:</strong> {careerPrediction.data.recommendation}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Health Data */}
          {healthCheck.data && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Health Check Data</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                  {JSON.stringify(healthCheck.data, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Test Data Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test Data</CardTitle>
              <CardDescription>
                Kullanılan test verisi (8 yetkinlik skoru)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "Analitik Düşünme", score: 8.5, icon: Brain },
                  { name: "Sayısal Zeka", score: 7.2, icon: Calculator },
                  { name: "Stres Yönetimi", score: 6.8, icon: Leaf },
                  { name: "Empati", score: 5.5, icon: Heart },
                  { name: "Takım Çalışması", score: 7.0, icon: Users },
                  { name: "Hızlı Karar Alma", score: 6.5, icon: Zap },
                  { name: "Duygusal Dayanıklılık", score: 7.8, icon: Shield },
                  { name: "Teknoloji Adaptasyonu", score: 9.0, icon: Smartphone }
                ].map((skill) => {
                  const Icon = skill.icon;
                  return (
                    <div key={skill.name} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      <Icon className="w-4 h-4" />
                      <div>
                        <div className="text-sm font-medium">{skill.name}</div>
                        <div className="text-xs text-muted-foreground">{skill.score}/10</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
