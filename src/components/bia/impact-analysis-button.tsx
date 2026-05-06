'use client';

import { useState, createElement } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Clock, AlertTriangle, Download, FileText } from 'lucide-react';
import { generateImpactAnalysis, type ImpactAnalysisResult } from '@/actions/bia/impact-analysis-actions';
import { BiaReportTemplate } from './reports/bia-report-template';
import { toast } from 'sonner';

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
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateAnalysis = async () => {
    try {
      setIsLoading(true);
      const result = await generateImpactAnalysis(processData);
      setAnalysis(result);
      setIsOpen(true);
      
      if (result.summary.includes("erreur")) {
        toast.warning("Analyse partielle générée (problème de connexion IA)");
      } else {
        toast.success("Analyse d'impact IA générée avec succès");
      }
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      toast.error("Impossible de générer l'analyse d'impact");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!analysis) {
      toast.error("Aucune analyse disponible pour le téléchargement");
      return;
    }
    
    setIsGeneratingPdf(true);
    const loadingToast = toast.loading("Génération du PDF en cours...");
    
    try {
      // Import dynamique de @react-pdf/renderer
      const { pdf } = await import('@react-pdf/renderer');
      
      // On s'assure d'importer BiaReportTemplate de manière stable
      const pdfDoc = <BiaReportTemplate data={processData} analysis={analysis} />;
      
      const blob = await pdf(pdfDoc).toBlob();
      
      if (!blob) throw new Error("Échec de la création du blob PDF");

      // Créer un lien de téléchargement
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bia-analyse-${processData.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().getTime()}.pdf`;
      
      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast.success("PDF téléchargé avec succès", { id: loadingToast });
    } catch (error) {
      console.error('Erreur lors de la génération du PDF :', error);
      toast.error("Erreur lors de la génération du PDF : " + (error as Error).message, { id: loadingToast });
    } finally {
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
          className="flex items-center gap-2 hover:bg-primary/5 border-primary/20 transition-all duration-300"
        >
          {isLoading ? (
            <>
              <Clock className="h-4 w-4 animate-spin" />
              Analyse en cours...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 text-primary" />
              Analyse d'impact IA
            </>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-none shadow-2xl bg-background/95 backdrop-blur-md">
        <DialogHeader className="pb-4 border-b border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Analyse d'impact : {processData.name}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 text-sm font-medium">
                <Badge variant="outline" className="bg-primary/5">S.U.R.V.I.V.E. AI CORE</Badge>
                • {new Date().toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </DialogDescription>
            </div>
            
            {analysis && (
              <Button 
                onClick={handleDownloadPdf} 
                disabled={isGeneratingPdf}
                className="flex items-center gap-2 shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
              >
                {isGeneratingPdf ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    Préparation...
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
          <div className="space-y-6 pt-4">
            {/* Métriques clés avec design premium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card/50 border-border/40 hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Risque Global</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${getRiskColor(analysis.riskLevel).bg} shadow-inner`}>
                      {createElement(getRiskColor(analysis.riskLevel).icon, {
                        className: `h-6 w-6 ${getRiskColor(analysis.riskLevel).text}`
                      })}
                    </div>
                    <span className="text-xl font-bold">
                      {analysis.riskLevel === 'high' ? 'Critique' :
                       analysis.riskLevel === 'medium' ? 'Moyen' : 'Faible'}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 border-border/40 hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Temps de Reprise (Est.)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 shadow-inner">
                      <Clock className="h-6 w-6" />
                    </div>
                    <span className="text-xl font-bold">{analysis.estimatedRecoveryTime}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 border-border/40 hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Criticité Métier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 shadow-inner">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <span className="text-xl font-bold capitalize">{processData.criticality || 'Standard'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Résumé et impacts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card/50 border-border/40 overflow-hidden">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Résumé Stratégique
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-sm leading-relaxed text-muted-foreground italic font-serif">
                    "{analysis.summary}"
                  </p>
                  
                  <div className="mt-8 space-y-6">
                    <div>
                      <h3 className="text-sm font-bold flex items-center gap-2 text-foreground mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Impact Opérationnel
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed pl-3.5 border-l border-primary/20">
                        {analysis.operationalImpact}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-bold flex items-center gap-2 text-foreground mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        Impact Réputationnel
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed pl-3.5 border-l border-blue-500/20">
                        {analysis.reputationImpact}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                {/* Risques clés */}
                <Card className="bg-card/50 border-border/40">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Points de Vigilance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {analysis.keyRisks?.map((risk: string, index: number) => (
                        <li key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                          <AlertCircle className="h-5 w-5 mt-0.5 text-red-500 flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Dépendances */}
                <Card className="bg-card/50 border-border/40">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Liens de Dépendance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysis.criticalDependencies?.length > 0 ? (
                        analysis.criticalDependencies.map((dep: string, index: number) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200/50">
                            {dep}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground italic">Aucune dépendance critique identifiée</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Recommandations */}
            <Card className="bg-card/50 border-primary/20 shadow-xl overflow-hidden border-t-4">
              <CardHeader className="bg-primary/5">
                <CardTitle className="text-lg">Recommandations & Plan d'Action</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.recommendations?.map((rec: any, index: number) => (
                    <div key={index} className="p-4 border border-border/50 rounded-xl bg-background/50 hover:bg-background transition-colors flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <h4 className="font-bold text-sm leading-tight">{rec.title}</h4>
                          <Badge className={`${getPriorityColor(rec.priority)} text-[10px] uppercase font-black`}>
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-4">{rec.description}</p>
                      </div>
                      {rec.estimatedTime && (
                        <div className="flex items-center text-[11px] font-bold text-primary bg-primary/5 self-start px-2 py-1 rounded">
                          <Clock className="h-3 w-3 mr-1.5" />
                          <span>{rec.estimatedTime}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <FileText className="h-6 w-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
            </div>
            <p className="text-sm font-black text-muted-foreground animate-pulse tracking-widest uppercase">Analyse IA Multicouche en cours...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

