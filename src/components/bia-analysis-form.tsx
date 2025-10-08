"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Trash2,
  Save,
  FileText,
  AlertTriangle,
  Shield,
  Users,
  Server,
  TrendingUp,
} from "lucide-react";
import type {
  BiaAnalysisResult,
  BiaImpact,
  BiaDependency,
  BiaSpof,
} from "@/lib/bia-ai-analyzer";

interface BiaAnalysisFormProps {
  initialData?: BiaAnalysisResult;
  onSave: (data: BiaAnalysisResult) => void;
  onCancel?: () => void;
}

export function BiaAnalysisForm({
  initialData,
  onSave,
  onCancel,
}: BiaAnalysisFormProps) {
  const [formData, setFormData] = useState<BiaAnalysisResult>(
    initialData || getDefaultFormData()
  );

  const updateFormData = (field: keyof BiaAnalysisResult, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Impacts
  const addImpact = () => {
    updateFormData("impacts", [
      ...formData.impacts,
      {
        type: "Opérationnel",
        description: "",
        severity: "moyen" as const,
        operationalImpact: "",
        reputationalImpact: "",
      },
    ]);
  };

  const updateImpact = (
    index: number,
    field: keyof BiaImpact,
    value: unknown
  ) => {
    const impacts = [...formData.impacts];
    impacts[index] = { ...impacts[index], [field]: value };
    updateFormData("impacts", impacts);
  };

  const removeImpact = (index: number) => {
    updateFormData(
      "impacts",
      formData.impacts.filter((_, i) => i !== index)
    );
  };

  // Dependencies
  const addDependency = () => {
    updateFormData("dependencies", [
      ...formData.dependencies,
      {
        name: "",
        type: "système" as const,
        criticality: "normal" as const,
        description: "",
        impact: "",
      },
    ]);
  };

  const updateDependency = (
    index: number,
    field: keyof BiaDependency,
    value: unknown
  ) => {
    const dependencies = [...formData.dependencies];
    dependencies[index] = { ...dependencies[index], [field]: value };
    updateFormData("dependencies", dependencies);
  };

  const removeDependency = (index: number) => {
    updateFormData(
      "dependencies",
      formData.dependencies.filter((_, i) => i !== index)
    );
  };

  // SPOF
  const addSpof = () => {
    updateFormData("spof", [
      ...formData.spof,
      {
        name: "",
        description: "",
        impact: "",
        riskLevel: "moyen" as const,
        mitigation: [],
      },
    ]);
  };

  const updateSpof = (index: number, field: keyof BiaSpof, value: unknown) => {
    const spof = [...formData.spof];
    spof[index] = { ...spof[index], [field]: value };
    updateFormData("spof", spof);
  };

  const removeSpof = (index: number) => {
    updateFormData(
      "spof",
      formData.spof.filter((_, i) => i !== index)
    );
  };

  const addMitigation = (spofIndex: number, mitigation: string) => {
    if (!mitigation.trim()) return;
    const spof = [...formData.spof];
    spof[spofIndex].mitigation = [...spof[spofIndex].mitigation, mitigation];
    updateFormData("spof", spof);
  };

  const removeMitigation = (spofIndex: number, mitigationIndex: number) => {
    const spof = [...formData.spof];
    spof[spofIndex].mitigation = spof[spofIndex].mitigation.filter(
      (_, i) => i !== mitigationIndex
    );
    updateFormData("spof", spof);
  };

  // Process
  const addProcess = (process: string) => {
    if (!process.trim()) return;
    updateFormData("criticality", {
      ...formData.criticality,
      processes: [...formData.criticality.processes, process],
    });
  };

  const removeProcess = (index: number) => {
    updateFormData("criticality", {
      ...formData.criticality,
      processes: formData.criticality.processes.filter((_, i) => i !== index),
    });
  };

  // Continuity Measures
  const addMeasure = (measure: string) => {
    if (!measure.trim()) return;
    updateFormData("continuityLevel", {
      ...formData.continuityLevel,
      measures: [...formData.continuityLevel.measures, measure],
    });
  };

  const removeMeasure = (index: number) => {
    updateFormData("continuityLevel", {
      ...formData.continuityLevel,
      measures: formData.continuityLevel.measures.filter((_, i) => i !== index),
    });
  };

  // Recommendations
  const addRecommendation = (recommendation: string) => {
    if (!recommendation.trim()) return;
    updateFormData("continuityLevel", {
      ...formData.continuityLevel,
      recommendations: [
        ...formData.continuityLevel.recommendations,
        recommendation,
      ],
    });
  };

  const removeRecommendation = (index: number) => {
    updateFormData("continuityLevel", {
      ...formData.continuityLevel,
      recommendations: formData.continuityLevel.recommendations.filter(
        (_, i) => i !== index
      ),
    });
  };

  // Continuity Needs
  const addContinuityNeed = (
    category: keyof typeof formData.continuityNeeds,
    need: string
  ) => {
    if (!need.trim()) return;
    updateFormData("continuityNeeds", {
      ...formData.continuityNeeds,
      [category]: [...formData.continuityNeeds[category], need],
    });
  };

  const removeContinuityNeed = (
    category: keyof typeof formData.continuityNeeds,
    index: number
  ) => {
    updateFormData("continuityNeeds", {
      ...formData.continuityNeeds,
      [category]: formData.continuityNeeds[category].filter(
        (_, i) => i !== index
      ),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="metrics">Métriques</TabsTrigger>
          <TabsTrigger value="impacts">Impacts</TabsTrigger>
          <TabsTrigger value="dependencies">Dépendances</TabsTrigger>
          <TabsTrigger value="spof">SPOF</TabsTrigger>
          <TabsTrigger value="continuity">Continuité</TabsTrigger>
        </TabsList>

        {/* GÉNÉRAL */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informations Générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="resume">Résumé Exécutif</Label>
                <Textarea
                  id="resume"
                  value={formData.resume}
                  onChange={(e) => updateFormData("resume", e.target.value)}
                  rows={4}
                  placeholder="Résumé de l'analyse BIA..."
                />
              </div>

              <div>
                <Label htmlFor="confidence">Niveau de Confiance (0-100)</Label>
                <Input
                  id="confidence"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.confidence}
                  onChange={(e) =>
                    updateFormData("confidence", parseInt(e.target.value))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Criticité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="criticalityLevel">Niveau</Label>
                  <Select
                    value={formData.criticality.level}
                    onValueChange={(value) =>
                      updateFormData("criticality", {
                        ...formData.criticality,
                        level: value as "haut" | "moyen" | "bas",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="haut">Haut</SelectItem>
                      <SelectItem value="moyen">Moyen</SelectItem>
                      <SelectItem value="bas">Bas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="criticalityScore">Score (1-100)</Label>
                  <Input
                    id="criticalityScore"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.criticality.score}
                    onChange={(e) =>
                      updateFormData("criticality", {
                        ...formData.criticality,
                        score: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="criticalityJustification">Justification</Label>
                <Textarea
                  id="criticalityJustification"
                  value={formData.criticality.justification}
                  onChange={(e) =>
                    updateFormData("criticality", {
                      ...formData.criticality,
                      justification: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label>Responsable du Processus</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <Input
                    placeholder="Nom"
                    value={formData.criticality.processOwner || ""}
                    onChange={(e) =>
                      updateFormData("criticality", {
                        ...formData.criticality,
                        processOwner: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Fonction"
                    value={formData.criticality.ownerRole || ""}
                    onChange={(e) =>
                      updateFormData("criticality", {
                        ...formData.criticality,
                        ownerRole: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Contact"
                    value={formData.criticality.ownerContact || ""}
                    onChange={(e) =>
                      updateFormData("criticality", {
                        ...formData.criticality,
                        ownerContact: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Processus Identifiés</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Ajouter un processus..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addProcess(e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.criticality.processes.map((process, index) => (
                    <Badge key={index} variant="secondary">
                      {process}
                      <button
                        type="button"
                        onClick={() => removeProcess(index)}
                        className="ml-2"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MÉTRIQUES */}
        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Métriques BIA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rto">RTO (heures)</Label>
                  <Input
                    id="rto"
                    type="number"
                    min="0"
                    value={formData.metrics.rto}
                    onChange={(e) =>
                      updateFormData("metrics", {
                        ...formData.metrics,
                        rto: parseInt(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recovery Time Objective
                  </p>
                </div>

                <div>
                  <Label htmlFor="rpo">RPO (heures)</Label>
                  <Input
                    id="rpo"
                    type="number"
                    min="0"
                    value={formData.metrics.rpo || 0}
                    onChange={(e) =>
                      updateFormData("metrics", {
                        ...formData.metrics,
                        rpo: parseInt(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recovery Point Objective
                  </p>
                </div>

                <div>
                  <Label htmlFor="mtpd">MTPD (heures)</Label>
                  <Input
                    id="mtpd"
                    type="number"
                    min="0"
                    value={formData.metrics.mtpd}
                    onChange={(e) =>
                      updateFormData("metrics", {
                        ...formData.metrics,
                        mtpd: parseInt(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum Tolerable Period of Disruption
                  </p>
                </div>

                <div>
                  <Label htmlFor="mbco">MBCO (heures)</Label>
                  <Input
                    id="mbco"
                    type="number"
                    min="0"
                    value={formData.metrics.mbco}
                    onChange={(e) =>
                      updateFormData("metrics", {
                        ...formData.metrics,
                        mbco: parseInt(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum Business Continuity Objective
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IMPACTS */}
        <TabsContent value="impacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Impacts
                </span>
                <Button type="button" onClick={addImpact} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.impacts.map((impact, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="grid grid-cols-2 gap-3 flex-1">
                        <div>
                          <Label>Type</Label>
                          <Input
                            value={impact.type}
                            onChange={(e) =>
                              updateImpact(index, "type", e.target.value)
                            }
                            placeholder="Financier, Opérationnel..."
                          />
                        </div>
                        <div>
                          <Label>Sévérité</Label>
                          <Select
                            value={impact.severity}
                            onValueChange={(value) =>
                              updateImpact(index, "severity", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="haut">Haut</SelectItem>
                              <SelectItem value="moyen">Moyen</SelectItem>
                              <SelectItem value="bas">Bas</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeImpact(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={impact.description}
                        onChange={(e) =>
                          updateImpact(index, "description", e.target.value)
                        }
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Impact Financier (€)</Label>
                        <Input
                          type="number"
                          value={impact.financialImpact || ""}
                          onChange={(e) =>
                            updateImpact(
                              index,
                              "financialImpact",
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined
                            )
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Impact Opérationnel</Label>
                      <Input
                        value={impact.operationalImpact || ""}
                        onChange={(e) =>
                          updateImpact(
                            index,
                            "operationalImpact",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <Label>Impact Réputationnel</Label>
                      <Input
                        value={impact.reputationalImpact || ""}
                        onChange={(e) =>
                          updateImpact(
                            index,
                            "reputationalImpact",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* DÉPENDANCES */}
        <TabsContent value="dependencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Dépendances
                </span>
                <Button type="button" onClick={addDependency} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.dependencies.map((dep, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="grid grid-cols-3 gap-3 flex-1">
                        <div>
                          <Label>Nom</Label>
                          <Input
                            value={dep.name}
                            onChange={(e) =>
                              updateDependency(index, "name", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Select
                            value={dep.type}
                            onValueChange={(value) =>
                              updateDependency(index, "type", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="système">Système</SelectItem>
                              <SelectItem value="fournisseur">
                                Fournisseur
                              </SelectItem>
                              <SelectItem value="infrastructure">
                                Infrastructure
                              </SelectItem>
                              <SelectItem value="personnel">
                                Personnel
                              </SelectItem>
                              <SelectItem value="données">Données</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Criticité</Label>
                          <Select
                            value={dep.criticality}
                            onValueChange={(value) =>
                              updateDependency(index, "criticality", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="critique">Critique</SelectItem>
                              <SelectItem value="important">
                                Important
                              </SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDependency(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={dep.description}
                        onChange={(e) =>
                          updateDependency(index, "description", e.target.value)
                        }
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>Impact</Label>
                      <Textarea
                        value={dep.impact}
                        onChange={(e) =>
                          updateDependency(index, "impact", e.target.value)
                        }
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SPOF */}
        <TabsContent value="spof" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Points de Défaillance Unique (SPOF)
                </span>
                <Button type="button" onClick={addSpof} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.spof.map((spofItem, index) => (
                <Card key={index} className="border-2 border-red-200">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="grid grid-cols-2 gap-3 flex-1">
                        <div>
                          <Label>Nom</Label>
                          <Input
                            value={spofItem.name}
                            onChange={(e) =>
                              updateSpof(index, "name", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label>Niveau de Risque</Label>
                          <Select
                            value={spofItem.riskLevel}
                            onValueChange={(value) =>
                              updateSpof(index, "riskLevel", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="critique">Critique</SelectItem>
                              <SelectItem value="élevé">Élevé</SelectItem>
                              <SelectItem value="moyen">Moyen</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSpof(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={spofItem.description}
                        onChange={(e) =>
                          updateSpof(index, "description", e.target.value)
                        }
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>Impact</Label>
                      <Textarea
                        value={spofItem.impact}
                        onChange={(e) =>
                          updateSpof(index, "impact", e.target.value)
                        }
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>Mesures d&apos;Atténuation</Label>
                      <Input
                        placeholder="Ajouter une mesure..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addMitigation(index, e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {spofItem.mitigation.map((mit, mitIndex) => (
                          <Badge key={mitIndex} variant="outline">
                            {mit}
                            <button
                              type="button"
                              onClick={() => removeMitigation(index, mitIndex)}
                              className="ml-2"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONTINUITÉ */}
        <TabsContent value="continuity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Niveau de Continuité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Niveau</Label>
                  <Select
                    value={formData.continuityLevel.level}
                    onValueChange={(value) =>
                      updateFormData("continuityLevel", {
                        ...formData.continuityLevel,
                        level: value as "vert" | "jaune" | "rouge",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vert">Vert</SelectItem>
                      <SelectItem value="jaune">Jaune</SelectItem>
                      <SelectItem value="rouge">Rouge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Score (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.continuityLevel.score}
                    onChange={(e) =>
                      updateFormData("continuityLevel", {
                        ...formData.continuityLevel,
                        score: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.continuityLevel.description}
                  onChange={(e) =>
                    updateFormData("continuityLevel", {
                      ...formData.continuityLevel,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label>Mesures Existantes</Label>
                <Input
                  placeholder="Ajouter une mesure..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addMeasure(e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.continuityLevel.measures.map((measure, index) => (
                    <Badge key={index} variant="secondary">
                      {measure}
                      <button
                        type="button"
                        onClick={() => removeMeasure(index)}
                        className="ml-2"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Recommandations</Label>
                <Input
                  placeholder="Ajouter une recommandation..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addRecommendation(e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.continuityLevel.recommendations.map(
                    (rec, index) => (
                      <Badge key={index} variant="outline">
                        {rec}
                        <button
                          type="button"
                          onClick={() => removeRecommendation(index)}
                          className="ml-2"
                        >
                          ×
                        </button>
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Besoins en Continuité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(formData.continuityNeeds).map(
                ([category, needs]) => (
                  <div key={category}>
                    <Label className="capitalize">
                      {getCategoryLabel(category)}
                    </Label>
                    <Input
                      placeholder={`Ajouter ${getCategoryLabel(
                        category
                      ).toLowerCase()}...`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addContinuityNeed(
                            category as keyof typeof formData.continuityNeeds,
                            e.currentTarget.value
                          );
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {needs.map((need: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {need}
                          <button
                            type="button"
                            onClick={() =>
                              removeContinuityNeed(
                                category as keyof typeof formData.continuityNeeds,
                                index
                              )
                            }
                            className="ml-2"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Enregistrer l&apos;Analyse
        </Button>
      </div>
    </form>
  );
}

function getDefaultFormData(): BiaAnalysisResult {
  return {
    impacts: [],
    criticality: {
      level: "moyen",
      score: 50,
      justification: "",
      processes: [],
    },
    metrics: {
      rto: 8,
      mtpd: 24,
      mbco: 4,
      rpo: 2,
    },
    continuityLevel: {
      level: "jaune",
      score: 5,
      description: "",
      measures: [],
      recommendations: [],
    },
    dependencies: [],
    resume: "",
    continuityNeeds: {
      equipment: [],
      material: [],
      personnel: [],
      infrastructure: [],
      technology: [],
      supplyChain: [],
      other: [],
    },
    spof: [],
    analysisDate: new Date(),
    confidence: 75,
  };
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    equipment: "Équipements",
    material: "Matériel",
    personnel: "Personnel",
    infrastructure: "Infrastructure",
    technology: "Technologie",
    supplyChain: "Chaîne d'Approvisionnement",
    other: "Autres",
  };
  return labels[category] || category;
}
