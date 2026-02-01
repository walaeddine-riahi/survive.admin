import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ProcessData {
  name: string;
  criticality: string;
  rto: number;
  rpo: number;
  mtpd: number;
  department?: string;
  owner?: {
    name: string;
    role: string;
  };
  activities?: Array<{
    name: string;
    role: string;
    impact: string;
    rto: number;
    rpo: number;
    mbco: string;
    workaround: string;
  }>;
}

interface ReportDataStructure {
  metadata?: Record<string, unknown> & {
    reference?: string;
    version?: string;
    classification?: string;
  };
  processes?: ProcessData[];
}

interface ReportProps {
  report: {
    id: string;
    name: string;
    createdAt: Date;
    factory?: {
      name: string;
      code: string;
    } | null;
    author?: {
      firstName?: string | null;
      lastName?: string | null;
    } | null;
  };
  reportData: ReportDataStructure;
}

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.6,
    backgroundColor: "#ffffff",
  },
  header: {
    border: "2px solid #000000",
    flexDirection: "row",
    marginBottom: 20,
  },
  headerLogo: {
    width: 120,
    borderRight: "2px solid #000000",
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  headerLogoTitle: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: "#1e40af",
  },
  headerLogoSubtitle: {
    fontSize: 9,
    color: "#000000",
    marginTop: 4,
  },
  headerCenter: {
    flex: 1,
    borderRight: "2px solid #000000",
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenterText: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  headerInfo: {
    width: 100,
    padding: 8,
  },
  headerInfoRow: {
    border: "1px solid #000000",
    padding: 4,
    fontSize: 9,
    textAlign: "center",
    backgroundColor: "#f0f0f0",
  },
  headerInfoCell: {
    border: "1px solid #000000",
    padding: 4,
    fontSize: 9,
    textAlign: "center",
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginTop: 18,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginTop: 16,
    marginBottom: 8,
    borderBottom: "2px solid #000000",
    paddingBottom: 3,
  },
  heading3: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginTop: 12,
    marginBottom: 6,
  },
  paragraph: {
    marginTop: 6,
    marginBottom: 6,
    textAlign: "justify",
  },
  table: {
    marginTop: 10,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #000000",
  },
  tableHeaderCell: {
    flex: 1,
    padding: 8,
    backgroundColor: "#f0f0f0",
    border: "1px solid #000000",
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  tableCell: {
    flex: 1,
    padding: 6,
    border: "1px solid #000000",
    fontSize: 10,
  },
  infoBox: {
    border: "1px solid #d0d0d0",
    backgroundColor: "#fafafa",
    padding: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  metricCard: {
    flex: 1,
    border: "1px solid #d0d0d0",
    padding: 10,
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  metricLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#666666",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#000000",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#666666",
  },
});

// Composant Header
const Header = ({
  factoryName,
  pageNumber,
}: {
  factoryName: string;
  pageNumber: number;
}) => (
  <View style={styles.header}>
    <View style={styles.headerLogo}>
      <Text style={styles.headerLogoTitle}>SURVIVE</Text>
      <Text style={styles.headerLogoSubtitle}>BCM Platform</Text>
    </View>
    <View style={styles.headerCenter}>
      <Text style={styles.headerCenterText}>
        Rapport d&apos;analyse d&apos;impact - BIA - Processus {factoryName}
      </Text>
    </View>
    <View style={styles.headerInfo}>
      <View style={styles.headerInfoRow}>
        <Text>Réf.</Text>
      </View>
      <View style={styles.headerInfoCell}>
        <Text> </Text>
      </View>
      <View style={styles.headerInfoRow}>
        <Text>Date</Text>
      </View>
      <View style={styles.headerInfoRow}>
        <Text>Page {pageNumber}</Text>
      </View>
    </View>
  </View>
);

// Document PDF
export const BIAReportPDF = ({ report, reportData }: ReportProps) => {
  const processes = reportData.processes || [];
  const metadata = reportData.metadata || {};
  const factoryName = report.factory?.name || "Organisation";
  const authorName = report.author
    ? `${report.author.firstName || ""} ${report.author.lastName || ""}`.trim()
    : "À compléter";

  return (
    <Document>
      {/* PAGE 1: COUVERTURE */}
      <Page size="A4" style={styles.page}>
        <Header factoryName={factoryName} pageNumber={1} />

        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text
            style={[
              styles.title,
              { textDecoration: "underline", marginBottom: 20 },
            ]}
          >
            Processus Assurance Qualité
          </Text>
          <Text style={[styles.title, { marginTop: 10 }]}>
            Rapport d&apos;analyse d&apos;impact (BIA)
          </Text>
          <Text style={[styles.title, { fontSize: 14, marginTop: 10 }]}>
            {factoryName}
          </Text>

          <View style={{ marginTop: 40, width: "80%" }}>
            <View style={styles.tableRow}>
              <View style={[styles.tableHeaderCell, { flex: 2 }]}>
                <Text>Réf Document</Text>
              </View>
              <View style={styles.tableCell}>
                <Text>
                  {metadata.reference ||
                    `BIA-${report.id.slice(0, 8).toUpperCase()}`}
                </Text>
              </View>
              <View style={[styles.tableHeaderCell, { flex: 2 }]}>
                <Text>Classification</Text>
              </View>
              <View style={styles.tableCell}>
                <Text>{metadata.classification || "Confidentiel"}</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={[styles.tableHeaderCell, { flex: 2 }]}>
                <Text>N° Version</Text>
              </View>
              <View style={styles.tableCell}>
                <Text>{metadata.version || "1.0"}</Text>
              </View>
              <View style={[styles.tableHeaderCell, { flex: 2 }]}>
                <Text>Validé par</Text>
              </View>
              <View style={styles.tableCell}>
                <Text>{authorName}</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={[styles.tableHeaderCell, { flex: 2 }]}>
                <Text>Date de création</Text>
              </View>
              <View style={styles.tableCell}>
                <Text>
                  {format(new Date(report.createdAt), "dd-MM-yyyy", {
                    locale: fr,
                  })}
                </Text>
              </View>
              <View style={[styles.tableHeaderCell, { flex: 2 }]}>
                <Text>Fedia Bayouness</Text>
              </View>
              <View style={styles.tableCell}>
                <Text>Fedia Bayouness</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>1#</Text>
        </View>
      </Page>

      {/* PAGE 2: FICHE D'IDENTIFICATION */}
      <Page size="A4" style={styles.page}>
        <Header factoryName={factoryName} pageNumber={2} />

        <Text style={styles.subtitle}>
          1. Fiche d&apos;Identification du Document
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.heading3}>Informations Générales</Text>
          <View style={{ marginTop: 10 }}>
            <View style={[styles.tableRow, { borderBottom: "1px solid #ccc" }]}>
              <View style={{ flex: 1, padding: 6 }}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>
                  Titre du document
                </Text>
              </View>
              <View style={{ flex: 2, padding: 6 }}>
                <Text>{report.name}</Text>
              </View>
            </View>
            <View style={[styles.tableRow, { borderBottom: "1px solid #ccc" }]}>
              <View style={{ flex: 1, padding: 6 }}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>Référence</Text>
              </View>
              <View style={{ flex: 2, padding: 6 }}>
                <Text>
                  {metadata.reference ||
                    `BIA-${report.id.slice(0, 8).toUpperCase()}`}
                </Text>
              </View>
            </View>
            <View style={[styles.tableRow, { borderBottom: "1px solid #ccc" }]}>
              <View style={{ flex: 1, padding: 6 }}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>
                  Date de création
                </Text>
              </View>
              <View style={{ flex: 2, padding: 6 }}>
                <Text>
                  {format(new Date(report.createdAt), "dd/MM/yyyy", {
                    locale: fr,
                  })}
                </Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={{ flex: 1, padding: 6 }}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>
                  Préparé par
                </Text>
              </View>
              <View style={{ flex: 2, padding: 6 }}>
                <Text>{authorName}</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.heading3}>Historique des Modifications</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableHeaderCell}>
              <Text>Version</Text>
            </View>
            <View style={styles.tableHeaderCell}>
              <Text>Date</Text>
            </View>
            <View style={styles.tableHeaderCell}>
              <Text>Auteur</Text>
            </View>
            <View style={[styles.tableHeaderCell, { flex: 2 }]}>
              <Text>Modifications</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text>{metadata.version || "1.0"}</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>{format(new Date(report.createdAt), "dd/MM/yyyy")}</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>{authorName}</Text>
            </View>
            <View style={[styles.tableCell, { flex: 2 }]}>
              <Text>Création initiale du rapport</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>
            Document confidentiel - Distribution contrôlée
          </Text>
          <Text style={{ marginTop: 5 }}>Page 2/{processes.length + 10}</Text>
        </View>
      </Page>

      {/* PAGES PROCESSUS */}
      {processes.map((process, idx) => (
        <Page key={idx} size="A4" style={styles.page}>
          <Header factoryName={factoryName} pageNumber={idx + 6} />

          <Text style={styles.subtitle}>
            4. Analyse du Processus - {process.name}
          </Text>

          <Text style={styles.heading3}>4.1 Informations Générales</Text>
          <View style={styles.infoBox}>
            <View style={[styles.tableRow, { borderBottom: "1px solid #ccc" }]}>
              <View style={{ flex: 1, padding: 6 }}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>
                  Nom du processus
                </Text>
              </View>
              <View style={{ flex: 2, padding: 6 }}>
                <Text>{process.name}</Text>
              </View>
            </View>
            <View style={[styles.tableRow, { borderBottom: "1px solid #ccc" }]}>
              <View style={{ flex: 1, padding: 6 }}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>
                  Département
                </Text>
              </View>
              <View style={{ flex: 2, padding: 6 }}>
                <Text>{process.department || "À compléter"}</Text>
              </View>
            </View>
            <View style={[styles.tableRow, { borderBottom: "1px solid #ccc" }]}>
              <View style={{ flex: 1, padding: 6 }}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>
                  Responsable
                </Text>
              </View>
              <View style={{ flex: 2, padding: 6 }}>
                <Text>
                  {process.owner
                    ? `${process.owner.name} (${process.owner.role})`
                    : "À compléter"}
                </Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={{ flex: 1, padding: 6 }}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>Criticité</Text>
              </View>
              <View style={{ flex: 2, padding: 6 }}>
                <Text>
                  {process.criticality === "critical"
                    ? "Critique"
                    : process.criticality === "high"
                    ? "Élevé"
                    : process.criticality === "medium"
                    ? "Moyen"
                    : "Faible"}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.heading3}>4.2 Objectifs de Reprise Globaux</Text>
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>RTO</Text>
              <Text style={styles.metricValue}>{process.rto}h</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>RPO</Text>
              <Text style={styles.metricValue}>{process.rpo}h</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>MTPD</Text>
              <Text style={styles.metricValue}>{process.mtpd}h</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>MBCO</Text>
              <Text style={styles.metricValue}>
                {process.mtpd > 24 ? "30%" : process.mtpd > 8 ? "50%" : "80%"}
              </Text>
            </View>
          </View>

          {process.activities && process.activities.length > 0 ? (
            <>
              <Text style={styles.heading3}>
                4.3 Analyse Détaillée des Activités
              </Text>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <View style={[styles.tableHeaderCell, { flex: 2 }]}>
                    <Text>Activité</Text>
                  </View>
                  <View style={styles.tableHeaderCell}>
                    <Text>Rôle</Text>
                  </View>
                  <View style={styles.tableHeaderCell}>
                    <Text>RTO</Text>
                  </View>
                  <View style={styles.tableHeaderCell}>
                    <Text>RPO</Text>
                  </View>
                  <View style={[styles.tableHeaderCell, { flex: 2 }]}>
                    <Text>Solution</Text>
                  </View>
                </View>
                {process.activities.slice(0, 5).map((activity, actIdx) => (
                  <View key={actIdx} style={styles.tableRow}>
                    <View style={[styles.tableCell, { flex: 2 }]}>
                      <Text>{activity.name}</Text>
                    </View>
                    <View style={styles.tableCell}>
                      <Text>{activity.role}</Text>
                    </View>
                    <View style={styles.tableCell}>
                      <Text>{activity.rto}h</Text>
                    </View>
                    <View style={styles.tableCell}>
                      <Text>{activity.rpo}h</Text>
                    </View>
                    <View style={[styles.tableCell, { flex: 2 }]}>
                      <Text>{activity.workaround}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={[styles.infoBox, { backgroundColor: "#fffbeb" }]}>
              <Text style={{ fontFamily: "Helvetica-Bold", color: "#92400e" }}>
                ⚠️ À compléter
              </Text>
              <Text style={{ marginTop: 4 }}>
                Les activités détaillées de ce processus doivent être
                documentées lors de la prochaine révision.
              </Text>
            </View>
          )}

          <View style={styles.footer}>
            <Text>
              Page {idx + 6}/{processes.length + 10}
            </Text>
          </View>
        </Page>
      ))}

      {/* PAGE FINALE */}
      <Page size="A4" style={styles.page}>
        <Header factoryName={factoryName} pageNumber={processes.length + 7} />

        <Text style={styles.subtitle}>
          6. Validation & Acceptation du Document
        </Text>

        <View style={[styles.infoBox, { backgroundColor: "#ecfdf5" }]}>
          <Text style={styles.paragraph}>
            Ce rapport de Business Impact Analysis a été préparé conformément
            aux normes ISO 22301:2019 et ISO/TS 22317:2021. Les informations
            contenues dans ce document sont basées sur les données collectées au{" "}
            <Text style={{ fontFamily: "Helvetica-Bold" }}>
              {format(new Date(report.createdAt), "dd MMMM yyyy", {
                locale: fr,
              })}
            </Text>
            .
          </Text>
        </View>

        <Text style={styles.heading3}>Signatures et Approbations</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableHeaderCell}>
              <Text>Rôle</Text>
            </View>
            <View style={styles.tableHeaderCell}>
              <Text>Nom</Text>
            </View>
            <View style={styles.tableHeaderCell}>
              <Text>Signature</Text>
            </View>
            <View style={styles.tableHeaderCell}>
              <Text>Date</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text>Responsable BCM</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>{authorName}</Text>
            </View>
            <View style={styles.tableCell}>
              <Text> </Text>
            </View>
            <View style={styles.tableCell}>
              <Text> </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCell}>
              <Text>Direction</Text>
            </View>
            <View style={styles.tableCell}>
              <Text>À compléter</Text>
            </View>
            <View style={styles.tableCell}>
              <Text> </Text>
            </View>
            <View style={styles.tableCell}>
              <Text> </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>
            Fin du Rapport BIA
          </Text>
          <Text style={{ marginTop: 5 }}>
            Page {processes.length + 7}/{processes.length + 10}
          </Text>
          <Text style={{ fontSize: 8, color: "#999999", marginTop: 10 }}>
            Document généré automatiquement par SURVIVE BCM Platform - ISO
            22301:2019 Compliant
          </Text>
        </View>
      </Page>
    </Document>
  );
};
