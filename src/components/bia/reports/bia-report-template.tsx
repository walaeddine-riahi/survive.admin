
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer';

// Note: Dans un environnement réel, on enregistrerait des polices personnalisées ici
// Pour le moment, on utilise les polices standard sécurisées.

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  // PAGE DE GARDE
  coverPage: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    backgroundColor: '#1a365d',
    color: '#FFFFFF',
    padding: 60,
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 18,
    marginBottom: 40,
    opacity: 0.8,
  },
  coverDivider: {
    width: 100,
    height: 4,
    backgroundColor: '#4299e1',
    marginBottom: 40,
  },
  coverMeta: {
    fontSize: 12,
    marginTop: 20,
    opacity: 0.6,
  },
  // CONTENU
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 10,
    color: '#718096',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 12,
    backgroundColor: '#F7FAFC',
    padding: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3182ce',
  },
  // GRILLE DE METRIQUES
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 20,
  },
  metricCard: {
    width: '30%',
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricLabel: {
    fontSize: 9,
    color: '#718096',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  // ANALYSE D'IMPACT
  impactBox: {
    padding: 15,
    borderRadius: 6,
    marginBottom: 15,
  },
  impactTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  impactText: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#4A5568',
  },
  // RECOMMANDATIONS
  recommendation: {
    marginBottom: 10,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 4,
  },
  recHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  recTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  recBadge: {
    fontSize: 8,
    padding: '2 6',
    borderRadius: 10,
    backgroundColor: '#EBF8FF',
    color: '#2B6CB0',
  },
  recDesc: {
    fontSize: 10,
    color: '#718096',
    lineHeight: 1.4,
  },
  // FOOTER
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    color: '#A0AEC0',
  },
});

interface BiaReportTemplateProps {
  data: any;
  analysis: any;
  type?: 'individual' | 'global';
}

export const BiaReportTemplate = ({ data, analysis, type = 'individual' }: BiaReportTemplateProps) => {
  // Valeurs par défaut pour éviter les crashs
  const safeData = {
    name: data?.name || 'Sans nom',
    department: data?.department || 'Non spécifié',
    rto: data?.rto ?? 'N/A',
    rpo: data?.rpo ?? 'N/A',
    mtpd: data?.mtpd ?? 'N/A',
    criticality: data?.criticality || 'medium'
  };

  const safeAnalysis = {
    summary: analysis?.summary || 'Aucun résumé disponible.',
    riskLevel: analysis?.riskLevel || 'medium',
    estimatedRecoveryTime: analysis?.estimatedRecoveryTime || 'Non estimé',
    financialImpact: analysis?.financialImpact || 'Non évalué',
    operationalImpact: analysis?.operationalImpact || 'Non évalué',
    reputationImpact: analysis?.reputationImpact || 'Non évalué',
    keyRisks: analysis?.keyRisks || [],
    criticalDependencies: analysis?.criticalDependencies || [],
    recommendations: analysis?.recommendations || [],
    recoveryStrategy: analysis?.recoveryStrategy || 'Non spécifiée',
    contingencyMeasures: analysis?.contingencyMeasures || 'Non spécifiées'
  };

  return (
    <Document title={`Rapport BIA - ${safeData.name}`}>
      {/* PAGE DE GARDE */}
      <Page size="A4" style={styles.coverPage}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.coverTitle}>RAPPORT D'ANALYSE D'IMPACT</Text>
          <Text style={styles.coverSubtitle}>Business Impact Analysis (BIA)</Text>
          <View style={styles.coverDivider} />
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{safeData.name}</Text>
          <Text style={{ fontSize: 14, marginTop: 10 }}>{safeData.department}</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.coverMeta}>S.U.R.V.I.V.E. Resilience Platform</Text>
          <Text style={styles.coverMeta}>Date de génération : {new Date().toLocaleDateString('fr-FR')}</Text>
          <Text style={styles.coverMeta}>Confidentialité : Interne</Text>
        </View>
      </Page>

      {/* CONTENU PRINCIPAL */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>S.U.R.V.I.V.E. | BIA Report</Text>
          <Text style={styles.headerTitle}>{safeData.name}</Text>
        </View>

        {/* SECTION 1: RÉSUMÉ D'EXÉCUTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Résumé d'Exécution</Text>
          <View style={[styles.impactBox, { backgroundColor: '#F0F9FF', borderLeftWidth: 4, borderLeftColor: '#0EA5E9' }]}>
            <Text style={styles.impactText}>{safeAnalysis.summary}</Text>
          </View>
        </View>

        {/* SECTION 2: MÉTRIQUES DE RÉSURGENCE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Objectifs de Rétablissement</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>RTO (Acceptable)</Text>
              <Text style={styles.metricValue}>{safeData.rto} Heures</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>RPO (Données)</Text>
              <Text style={styles.metricValue}>{safeData.rpo} Heures</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>MTPD (Maximal)</Text>
              <Text style={styles.metricValue}>{safeData.mtpd} Heures</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Criticité</Text>
              <Text style={[styles.metricValue, { color: safeData.criticality === 'critical' ? '#E53E3E' : '#2D3748' }]}>
                {safeData.criticality.toUpperCase()}
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Risque IA</Text>
              <Text style={styles.metricValue}>{safeAnalysis.riskLevel.toUpperCase()}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Reprise (Est.)</Text>
              <Text style={styles.metricValue}>{safeAnalysis.estimatedRecoveryTime}</Text>
            </View>
          </View>
        </View>

        {/* SECTION 3: ANALYSE DES IMPACTS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Analyse Détaillée des Impacts</Text>
          
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 4, color: '#2D3748' }}>Impact Financier</Text>
            <Text style={{ fontSize: 10, color: '#4A5568' }}>{safeAnalysis.financialImpact}</Text>
          </View>
          
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 4, color: '#2D3748' }}>Impact Opérationnel</Text>
            <Text style={{ fontSize: 10, color: '#4A5568' }}>{safeAnalysis.operationalImpact}</Text>
          </View>
          
          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 4, color: '#2D3748' }}>Impact Réputationnel</Text>
            <Text style={{ fontSize: 10, color: '#4A5568' }}>{safeAnalysis.reputationImpact}</Text>
          </View>
        </View>

        {/* SECTION 4: RISQUES ET DÉPENDANCES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Risques et Dépendances Critiques</Text>
          <View style={{ flexDirection: 'row', gap: 20 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 6, color: '#2D3748' }}>Risques Clés</Text>
              {safeAnalysis.keyRisks.length > 0 ? safeAnalysis.keyRisks.map((risk: string, i: number) => (
                <Text key={i} style={{ fontSize: 9, color: '#4A5568', marginBottom: 4 }}>• {risk}</Text>
              )) : <Text style={{ fontSize: 9, color: '#A0AEC0' }}>Aucun risque spécifique mentionné</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 6, color: '#2D3748' }}>Dépendances</Text>
              {safeAnalysis.criticalDependencies.length > 0 ? safeAnalysis.criticalDependencies.map((dep: string, i: number) => (
                <Text key={i} style={{ fontSize: 9, color: '#4A5568', marginBottom: 4 }}>• {dep}</Text>
              )) : <Text style={{ fontSize: 9, color: '#A0AEC0' }}>Aucune dépendance critique identifiée</Text>}
            </View>
          </View>
        </View>

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} sur ${totalPages}`
        )} />
      </Page>

      {/* SECTION 5: RECOMMANDATIONS */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Recommandations Actionnables</Text>
          {safeAnalysis.recommendations.length > 0 ? safeAnalysis.recommendations.map((rec: any, i: number) => (
            <View key={i} style={styles.recommendation}>
              <View style={styles.recHeader}>
                <Text style={styles.recTitle}>{rec.title}</Text>
                <Text style={[styles.recBadge, { backgroundColor: rec.priority === 'high' ? '#FED7D7' : '#EBF8FF', color: rec.priority === 'high' ? '#C53030' : '#2B6CB0' }]}>
                  PRIORITÉ {rec.priority?.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.recDesc}>{rec.description}</Text>
              <Text style={{ fontSize: 8, marginTop: 4, color: '#A0AEC0' }}>Temps estimé : {rec.estimatedTime || 'N/A'}</Text>
            </View>
          )) : <Text style={{ fontSize: 10, color: '#A0AEC0', textAlign: 'center' }}>Aucune recommandation générée.</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Stratégie de Reprise Préconisée</Text>
          <Text style={{ fontSize: 10, color: '#4A5568', lineHeight: 1.5 }}>{safeAnalysis.recoveryStrategy}</Text>
        </View>

        <View style={[styles.section, { marginTop: 20, borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 20 }]}>
          <Text style={{ fontSize: 10, textAlign: 'center', color: '#718096' }}>
            Ce document est généré automatiquement par l'IA de la plateforme S.U.R.V.I.V.E. 
            Il doit être validé par le responsable du processus et le responsable PCA.
          </Text>
        </View>

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} sur ${totalPages}`
        )} />
      </Page>
    </Document>
  );
};

