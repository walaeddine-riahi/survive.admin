"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { generateBcmDocumentContent, GenerateDocParams } from "@/actions/bcm/generate-docs-actions";
import { BCMSection } from "@/lib/bcm/docx-formatter";
import { Loader2, FileText, Download, CheckCircle, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export function DocumentGenerator() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [docType, setDocType] = useState<GenerateDocParams["docType"]>("POLICY");
  const [orgName, setOrgName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSections, setGeneratedSections] = useState<BCMSection[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const handleGenerate = async () => {
    if (!orgName.trim()) {
      toast.error("Veuillez saisir le nom de l'organisation.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateBcmDocumentContent({
        docType,
        organizationInfo: { name: orgName },
      });

      if (result.success && result.data) {
        setGeneratedSections(result.data);
        setStep(2);
        toast.success("Document généré avec succès. Veuillez vérifier le contenu.");
      } else {
        toast.error("Erreur lors de la génération: " + result.error);
      }
    } catch (error) {
      toast.error("Une erreur inattendue est survenue.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/bcm/export/${docType.toLowerCase()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization: orgName,
          sections: generatedSections,
        }),
      });

      if (!response.ok) throw new Error("Erreur serveur lors de l'export.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${docType}_${orgName.replace(/\\s+/g, "_")}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      setStep(3);
      toast.success("Document téléchargé avec succès !");
    } catch (error) {
      toast.error("Erreur lors de l'export: " + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSectionContentChange = (index: number, contentIndex: number, newValue: string) => {
    const updatedSections = [...generatedSections];
    updatedSections[index].content[contentIndex] = newValue;
    setGeneratedSections(updatedSections);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-gray-800 bg-gray-900/50">
        <CardHeader>
          <CardTitle>Générateur de Livrables BCM (ISO 22301)</CardTitle>
          <CardDescription>
            Créez automatiquement vos documents de continuité d'activité grâce à l'IA Azure et aux données de la plateforme.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-8">
            <div className={`flex flex-col items-center \${step >= 1 ? 'text-teal-500' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 \${step >= 1 ? 'border-teal-500 bg-teal-500/20' : 'border-gray-600'}`}>1</div>
              <span className="text-sm">Configuration</span>
            </div>
            <div className={`flex-1 h-px mx-4 \${step >= 2 ? 'bg-teal-500' : 'bg-gray-700'}`} />
            <div className={`flex flex-col items-center \${step >= 2 ? 'text-teal-500' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 \${step >= 2 ? 'border-teal-500 bg-teal-500/20' : 'border-gray-600'}`}>2</div>
              <span className="text-sm">Validation</span>
            </div>
            <div className={`flex-1 h-px mx-4 \${step >= 3 ? 'bg-teal-500' : 'bg-gray-700'}`} />
            <div className={`flex flex-col items-center \${step >= 3 ? 'text-teal-500' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 \${step >= 3 ? 'border-teal-500 bg-teal-500/20' : 'border-gray-600'}`}>3</div>
              <span className="text-sm">Export</span>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all \${docType === 'POLICY' ? 'border-teal-500 bg-teal-900/20' : 'border-gray-800 hover:border-gray-700'}`}
                  onClick={() => setDocType('POLICY')}
                >
                  <FileText className="h-6 w-6 mb-2 text-teal-400" />
                  <h3 className="font-medium text-gray-200">Politique BCM</h3>
                  <p className="text-sm text-gray-500 mt-1">Gouvernance, directives, budget</p>
                </div>
                <div
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all \${docType === 'PCA' ? 'border-teal-500 bg-teal-900/20' : 'border-gray-800 hover:border-gray-700'}`}
                  onClick={() => setDocType('PCA')}
                >
                  <FileText className="h-6 w-6 mb-2 text-teal-400" />
                  <h3 className="font-medium text-gray-200">PCA (Métier)</h3>
                  <p className="text-sm text-gray-500 mt-1">Processus BIA, stratégies, locaux</p>
                </div>
                <div
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all \${docType === 'PGC' ? 'border-teal-500 bg-teal-900/20' : 'border-gray-800 hover:border-gray-700'}`}
                  onClick={() => setDocType('PGC')}
                >
                  <FileText className="h-6 w-6 mb-2 text-teal-400" />
                  <h3 className="font-medium text-gray-200">Plan de Gestion de Crise</h3>
                  <p className="text-sm text-gray-500 mt-1">Cellule de crise, annuaire, comm.</p>
                </div>
                <div
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all \${docType === 'PRI' ? 'border-teal-500 bg-teal-900/20' : 'border-gray-800 hover:border-gray-700'}`}
                  onClick={() => setDocType('PRI')}
                >
                  <FileText className="h-6 w-6 mb-2 text-teal-400" />
                  <h3 className="font-medium text-gray-200">PRI (IT / DRP)</h3>
                  <p className="text-sm text-gray-500 mt-1">Basculement IT, RTO technique</p>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Label htmlFor="orgName">Nom de l'organisation</Label>
                <Input 
                  id="orgName" 
                  placeholder="Ex: Société Générale, Acme Corp..." 
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !orgName.trim()} 
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération IA en cours (1-2 min)...
                  </>
                ) : (
                  <>
                    Générer le Document <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 text-sm text-blue-200">
                L'IA a généré les sections suivantes basées sur vos données BIA. Vous pouvez éditer les paragraphes avant l'export Word.
              </div>
              
              <Tabs defaultValue="sec-0" className="w-full">
                <TabsList className="flex flex-wrap h-auto bg-gray-800 border-gray-700">
                  {generatedSections.map((sec, idx) => (
                    <TabsTrigger key={idx} value={`sec-\${idx}`} className="data-[state=active]:bg-teal-600">
                      {sec.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {generatedSections.map((sec, idx) => (
                  <TabsContent key={idx} value={`sec-\${idx}`} className="space-y-4 pt-4">
                    <h3 className="text-xl font-bold text-gray-100">{sec.title}</h3>
                    
                    {sec.content && sec.content.map((para, contentIdx) => (
                      <div key={contentIdx}>
                        <Textarea 
                          value={para}
                          onChange={(e) => handleSectionContentChange(idx, contentIdx, e.target.value)}
                          className="min-h-[100px] bg-gray-800 border-gray-700 text-gray-200 leading-relaxed"
                        />
                      </div>
                    ))}

                    {sec.listItems && sec.listItems.length > 0 && (
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 mt-4">
                        <h4 className="text-sm font-semibold text-gray-400 mb-2">Liste à puces (lecture seule)</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-300">
                          {sec.listItems.map((item, itemIdx) => (
                            <li key={itemIdx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>

              <div className="flex gap-4 pt-4 border-t border-gray-800">
                <Button variant="outline" onClick={() => setStep(1)} className="border-gray-700 text-gray-300">
                  Retour
                </Button>
                <Button 
                  onClick={handleExport} 
                  disabled={isExporting} 
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                >
                  {isExporting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création du Word...</>
                  ) : (
                    <><Download className="mr-2 h-4 w-4" /> Exporter en Word (.docx)</>
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-12 space-y-4 animate-in fade-in zoom-in">
              <div className="w-20 h-20 mx-auto bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-100">Export Réussi !</h3>
              <p className="text-gray-400">
                Le document <strong>{docType}_{orgName.replace(/\\s+/g, "_")}.docx</strong> a été téléchargé. Il est mis en forme et prêt à être partagé.
              </p>
              <div className="pt-8">
                <Button variant="outline" onClick={() => setStep(1)} className="border-gray-700 text-gray-300">
                  Générer un autre document
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
