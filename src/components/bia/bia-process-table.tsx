"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";

type Process = {
  id: string;
  name: string;
  description: string | null;
  department: string;
  location: string;
  impact: string;
  criticality: "low" | "medium" | "high" | "critical";
  rto: number;
  mtpd: number;
  rpo: number;
  mbco: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

interface BiaProcessTableProps {
  processes: Process[];
}

export function BiaProcessTable({ processes }: BiaProcessTableProps) {
  if (processes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
        <p>Aucun processus nécessitant une attention particulière.</p>
        <p className="text-sm">Excellente santé de vos processus BIA !</p>
      </div>
    );
  }

  const getCriticalityBadge = (criticality: string) => {
    switch (criticality) {
      case "critical":
        return <Badge variant="destructive">Critique</Badge>;
      case "high":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Élevé
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Moyen
          </Badge>
        );
      case "low":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Faible
          </Badge>
        );
      default:
        return <Badge variant="outline">{criticality}</Badge>;
    }
  };

  const getRtoBadge = (rto: number) => {
    if (rto <= 4) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Excellent
        </Badge>
      );
    } else if (rto <= 12) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Bon
        </Badge>
      );
    } else if (rto <= 24) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Moyen
        </Badge>
      );
    } else {
      return <Badge variant="destructive">À améliorer</Badge>;
    }
  };

  const getReasonForAttention = (process: Process) => {
    const reasons: string[] = [];

    if (process.criticality === "critical") {
      reasons.push("Criticité maximale");
    }
    if (process.rto > 24) {
      reasons.push(`RTO élevé (${process.rto}h)`);
    }
    if (process.mtpd <= 4) {
      reasons.push(`MTPD très faible (${process.mtpd}h)`);
    }

    return reasons.length > 0 ? reasons.join(", ") : "Révision recommandée";
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Processus</TableHead>
            <TableHead>Département</TableHead>
            <TableHead>Criticité</TableHead>
            <TableHead>RTO</TableHead>
            <TableHead>MTPD</TableHead>
            <TableHead>Raison de l&apos;attention</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {processes.map((process) => (
            <TableRow key={process.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/bia/processes/${process.id}`}
                  className="hover:underline"
                >
                  {process.name}
                </Link>
                {process.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {process.description}
                  </p>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <span>{process.department}</span>
                  <span className="text-xs text-muted-foreground">
                    ({process.location})
                  </span>
                </div>
              </TableCell>
              <TableCell>{getCriticalityBadge(process.criticality)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{process.rto}h</span>
                  {getRtoBadge(process.rto)}
                </div>
              </TableCell>
              <TableCell>
                <span className="font-medium">{process.mtpd}h</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">
                    {getReasonForAttention(process)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/bia/processes/${process.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Réviser
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
