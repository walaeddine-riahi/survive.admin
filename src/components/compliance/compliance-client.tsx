"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Building2, 
  Search,
  Plus,
  ArrowRight,
  ClipboardCheck,
  Scale
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface Factory {
  id: string;
  name: string;
  code: string;
  certifications: string[];
  complianceStandards: string[];
}

interface Process {
  id: string;
  name: string;
  department: string;
  legalObligations: string | null;
  legalRequirements: {
    id: string;
    name: string;
    description: string | null;
  }[];
}

interface ComplianceClientProps {
  factories: Factory[];
  processes: Process[];
}

export function ComplianceClient({ factories, processes }: ComplianceClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const totalCerts = factories.reduce((acc, f) => acc + f.certifications.length, 0);
  const totalStandards = factories.reduce((acc, f) => acc + f.complianceStandards.length, 0);
  const processesWithObligations = processes.filter(p => p.legalObligations || p.legalRequirements.length > 0).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-5 mb-4">
              <div className="p-4 bg-[var(--accent)] rounded-2xl shadow-lg">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight text-[var(--text-primary)]">Gestion de la Conformité</h1>
                <p className="text-[var(--text-muted)] text-lg font-medium mt-1">
                  Suivi des certifications, normes et obligations légales
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
               <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest">
                  ISO 22301 Conforme
               </Badge>
               <Badge className="bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20 px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest">
                  85% Global
               </Badge>
            </div>
          </div>
          <Button className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-[12px] px-6 h-12 font-bold shadow-lg shadow-[var(--accent)]/20">
            <Plus className="h-5 w-5 mr-2" /> Nouvelle Certification
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Certifications", value: totalCerts, icon: ClipboardCheck, color: "text-[var(--accent)]", bg: "bg-[var(--accent)]/10" },
          { label: "Normes suivies", value: totalStandards, icon: Scale, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Processus Régulés", value: processesWithObligations, icon: FileText, color: "text-violet-500", bg: "bg-violet-500/10" },
          { label: "Sites Audités", value: factories.length, icon: Building2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl hover:shadow-md transition-all group overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">{stat.label}</p>
                  <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sites and Certifications */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl shadow-sm">
            <CardHeader className="border-b border-[var(--border)] pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-[var(--text-primary)]">Certifications par Site</CardTitle>
                  <p className="text-sm text-[var(--text-muted)] font-medium mt-1">État des lieux des audits usines</p>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                  <Input 
                    placeholder="Filtrer un site..." 
                    className="pl-10 h-10 bg-[var(--bg-tertiary)]/50 border-[var(--border)] rounded-xl text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[var(--border)]">
                {factories
                  .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((factory) => (
                  <div key={factory.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--bg-hover)] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center border border-[var(--border)]">
                        <Building2 className="h-6 w-6 text-[var(--text-secondary)]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[var(--text-primary)]">{factory.name}</h3>
                        <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">{factory.code}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      {factory.certifications.map(cert => (
                        <Badge key={cert} className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-black">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> {cert}
                        </Badge>
                      ))}
                      {factory.complianceStandards.map(std => (
                        <Badge key={std} className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] font-black">
                           {std}
                        </Badge>
                      ))}
                      {factory.certifications.length === 0 && factory.complianceStandards.length === 0 && (
                        <span className="text-xs text-[var(--text-muted)] italic">Aucune certification active</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Legal Obligations Sidebar */}
        <div className="space-y-6">
          <Card className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl shadow-sm h-full">
            <CardHeader className="border-b border-[var(--border)] pb-6">
              <CardTitle className="text-xl font-black text-[var(--text-primary)]">Obligations Légales</CardTitle>
              <p className="text-sm text-[var(--text-muted)] font-medium mt-1">Vigilance réglementaire par processus</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {processes
                  .filter(p => p.legalObligations || p.legalRequirements.length > 0)
                  .slice(0, 8)
                  .map((process) => (
                  <div key={process.id} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)]/30 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-sm text-[var(--text-primary)]">{process.name}</p>
                      <Badge variant="outline" className="text-[9px] font-black uppercase border-[var(--border)]">{process.department}</Badge>
                    </div>
                    
                    {process.legalObligations && (
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed italic">
                        {process.legalObligations}
                      </p>
                    )}

                    {process.legalRequirements.map(req => (
                      <div key={req.id} className="flex items-start gap-2 pt-1 border-t border-[var(--border)] mt-2">
                         <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                         <div>
                            <p className="text-[11px] font-bold text-[var(--text-secondary)]">{req.name}</p>
                            {req.description && (
                              <p className="text-[10px] text-[var(--text-muted)] line-clamp-1">{req.description}</p>
                            )}
                         </div>
                      </div>
                    ))}

                    <Button variant="link" className="p-0 h-auto text-[var(--accent)] text-[10px] font-black hover:no-underline flex items-center group uppercase tracking-widest pt-2">
                      Détails complets <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                ))}
                {processes.filter(p => p.legalObligations || p.legalRequirements.length > 0).length === 0 && (
                   <div className="text-center py-10">
                      <AlertTriangle className="h-10 w-10 text-[var(--text-muted)]/30 mx-auto mb-4" />
                      <p className="text-sm text-[var(--text-muted)] italic">Aucune obligation enregistrée</p>
                   </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
