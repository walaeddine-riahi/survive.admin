'use client';

import { useState, useEffect, useRef, ReactElement, createElement } from 'react';
import type { PDFDownloadLinkProps, DocumentProps } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Clock, AlertTriangle, Download } from 'lucide-react';
import { generateImpactAnalysis, type ImpactAnalysisResult } from '@/actions/bia/impact-analysis-actions';

type Analysis = NonNullable<ImpactAnalysisResult>;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type ImpactAnalysisButtonProps = {
  processData: any;
};

const getRiskColor = (riskLevel: string) => {
  switch (riskLevel) {
    case 'high':
      return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400', icon: AlertCircle };
    case 'medium':
      return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-400', icon: AlertTriangle };
    default:
      return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400', icon: CheckCircle2 };
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    default:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
  }
};

export function ImpactAnalysisButton({ processData }: ImpactAnalysisButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [analysis, setAnalysis] = useState<ImpactAnalysisResult | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateAnalysis = async () => {
    try {
      setIsLoading(true);
      const result = await generateImpactAnalysis(processData);
      setAnalysis(result);
      setIsOpen(true);
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      // Gérer l'erreur (afficher une notification, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour générer le document PDF
  const generatePdfDocument = async (analysis: ImpactAnalysisResult): Promise<ReactElement<DocumentProps>> => {
    const { Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer');
    
    // Créer un composant de document PDF
    const MyDocument = (): ReactElement => {
      // Définir les styles pour le PDF
      const styles = StyleSheet.create({
      page: {
        padding: 30,
        backgroundColor: '#ffffff',
      },
      section: {
        marginBottom: 20,
      },
      title: {
        fontSize: 24,
        marginBottom: 10,
        textAlign: 'center',
        fontWeight: 'bold',
      },
      subtitle: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
        color: '#333333',
      },
      header: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: 'bold',
        color: '#1a365d',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: 4,
      },
      subheader: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#2d3748',
      },
      text: {
        fontSize: 12,
        marginBottom: 8,
        lineHeight: 1.5,
        color: '#4a5568',
      },
      meta: {
        fontSize: 10,
        color: '#718096',
        fontStyle: 'italic',
      },
      recommendation: {
        marginBottom: 12,
        padding: 10,
        backgroundColor: '#f8fafc',
        borderRadius: 4,
        borderLeft: '3px solid #4299e1',
      },
      footer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 10,
        color: '#718096',
      },
    });
    
      return (
        <Document>
          <Page size="A4" style={styles.page}>
            <View style={styles.section}>
              <Text style={styles.title}>Analyse d'Impact Métier</Text>
              <Text style={styles.subtitle}>{processData.name}</Text>
              
              <View style={styles.section}>
                <Text style={styles.header}>Résumé</Text>
                <Text style={styles.text}>{analysis.summary}</Text>
              </View>
              
              <View style={styles.section}>
                <Text style={styles.header}>Niveau de risque</Text>
                <Text style={styles.text}>{analysis.riskLevel}</Text>
              </View>
              
              <View style={styles.section}>
                <Text style={styles.header}>Temps de récupération estimé</Text>
                <Text style={styles.text}>{analysis.estimatedRecoveryTime}</Text>
              </View>
              
              {analysis.recommendations?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.header}>Recommandations</Text>
                  {analysis.recommendations.map((rec: any, index: number) => (
                    <View key={index} style={styles.recommendation}>
                      <Text style={styles.subheader}>{rec.title}</Text>
                      <Text style={styles.text}>{rec.description}</Text>
                      <Text style={styles.meta}>Priorité: {rec.priority}</Text>
                      <Text style={styles.meta}>Temps estimé: {rec.estimatedTime}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              <View style={styles.footer}>
                <Text>Généré le {new Date().toLocaleDateString()}</Text>
              </View>
            </View>
          </Page>
        </Document>
      );
    };
    
    return <MyDocument />;
  };
  
  const handleDownloadPdf = async () => {
    if (!analysis) {
      console.error('Aucune analyse disponible pour la génération du PDF');
      return;
    }
    
    setIsGeneratingPdf(true);
    
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const pdfDoc = await generatePdfDocument(analysis);
      const blob = await pdf(pdfDoc).toBlob();
      
      // Créer un lien de téléchargement
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analyse-impact-${processData.name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      
      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsGeneratingPdf(false);
      }, 100);
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF :', error);
      alert('Une erreur est survenue lors de la génération du PDF : ' + (error as Error).message);
      setIsGeneratingPdf(false);
    }

  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          onClick={handleGenerateAnalysis}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Clock className="h-4 w-4 animate-pulse" />
              Génération en cours...
            </>
          ) : (
            'Analyse d\'impact IA'
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl font-bold">Analyse d'impact: {processData.name}</DialogTitle>
              <DialogDescription className="text-sm">
                Rapport généré automatiquement par IA - {new Date().toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </DialogDescription>
            </div>
            {analysis && (
              <Button 
                onClick={handleDownloadPdf} 
                disabled={isGeneratingPdf}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {isGeneratingPdf ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    Génération PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Télécharger le PDF
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogHeader>
        
        {analysis ? (
          <div className="space-y-6" ref={reportRef}>
            {/* En-tête avec métriques clés */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Niveau de risque</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-full ${getRiskColor(analysis.riskLevel).bg}`}>
                      {createElement(getRiskColor(analysis.riskLevel).icon, {
                        className: `h-5 w-5 ${getRiskColor(analysis.riskLevel).text}`
                      })}
                    </div>
                    <span className="text-lg font-semibold">
                      {analysis.riskLevel === 'high' ? 'Élevé' :
                       analysis.riskLevel === 'medium' ? 'Moyen' : 'Faible'}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Temps de récupération</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span className="text-lg font-semibold">{analysis.estimatedRecoveryTime}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Impact Financier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold line-clamp-2">
                    {analysis.financialImpact || 'Non spécifié'}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Résumé et impacts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Résumé de l'analyse</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{analysis.summary}</p>
                
                <div className="mt-6 space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Impact Opérationnel</h3>
                    <p className="text-sm text-muted-foreground">{analysis.operationalImpact}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Impact sur la Réputation</h3>
                    <p className="text-sm text-muted-foreground">{analysis.reputationImpact}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Risques clés */}
            {analysis.keyRisks?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Risques Clés</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {analysis.keyRisks.map((risk: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 mt-0.5 text-red-500 flex-shrink-0" />
                        <span className="text-sm">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            
            {/* Dépendances critiques */}
            {analysis.criticalDependencies?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dépendances Critiques</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.criticalDependencies.map((dep: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                        {dep}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            
            {/* Recommandations */}
            {analysis.recommendations?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recommandations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.recommendations.map((rec: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg bg-muted/10">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{rec.title}</h4>
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority === 'high' ? 'Haute' : 
                             rec.priority === 'medium' ? 'Moyenne' : 'Basse'} priorité
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{rec.description}</p>
                        {rec.estimatedTime && (
                          <div className="mt-2 flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>Temps estimé : {rec.estimatedTime}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Stratégie de reprise */}
            {analysis.recoveryStrategy && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Stratégie de Reprise</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{analysis.recoveryStrategy}</p>
                </CardContent>
              </Card>
            )}
            
            {/* Mesures d'urgence */}
            {analysis.contingencyMeasures && (
              <Card className="border-red-200 dark:border-red-900/50">
                <CardHeader className="bg-red-50 dark:bg-red-900/10 rounded-t-lg">
                  <CardTitle className="text-lg text-red-700 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Mesures d'Urgence
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">{analysis.contingencyMeasures}</p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
