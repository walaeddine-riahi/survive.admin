# 🔧 Guide d'Intégration - Formulaire BIA Multi-Éléments

## Vue d'Ensemble

Le formulaire de processus BIA a été amélioré pour supporter les **structures multi-éléments** conformément au standard SMCA/BCM.

---

## 📦 Composants Créés

### 1. `DynamicListField` (Composant Réutilisable)

**Fichier**: `src/components/bia/dynamic-list-field.tsx`

**Fonctionnalités**:

- Gestion de listes d'éléments dynamiques
- Ajout/Suppression d'éléments
- Expansion/Réduction pour chaque élément
- Validation par champ
- Support de multiples types de champs (text, textarea, number, select, checkbox)

**Props**:

```typescript
interface DynamicListFieldProps {
  title: string; // Titre de la section
  description?: string; // Description optionnelle
  fields: FieldConfig[]; // Configuration des champs
  value: Record<string, unknown>[]; // Valeur actuelle (tableau)
  onChange: (value: Record<string, unknown>[]) => void; // Callback de changement
  defaultItem?: Record<string, unknown>; // Valeur par défaut pour nouvel élément
  minItems?: number; // Nombre minimum d'éléments
  maxItems?: number; // Nombre maximum d'éléments
}
```

**Exemple d'utilisation**:

```tsx
import { DynamicListField } from "@/components/bia/dynamic-list-field";
import { activitesCritiquesFields } from "@/components/bia/process-form-fields";

<DynamicListField
  title="Activités Critiques"
  description="Liste des activités critiques de ce processus"
  fields={activitesCritiquesFields}
  value={activitesCritiques}
  onChange={setActivitesCritiques}
  minItems={1}
/>;
```

### 2. `process-form-fields.ts` (Configurations Prédéfinies)

**Fichier**: `src/components/bia/process-form-fields.ts`

**Configurations disponibles**:

- `activitesCritiquesFields` - Section 2 (9 champs)
- `fournisseursFields` - Section 5 (10 champs)
- `obligationsLegalesFields` - Section 6 (5 champs)
- `systemesInformatiquesFields` - Section 7 (13 champs)
- `infrastructuresFields` - Section 8 (9 champs)
- `rolesPersonnelFields` - Section 9 (11 champs)
- `equipementsIndustrielsFields` - Section 10A (16 champs)
- `equipementsBureautiquesFields` - Section 10B (10 champs)
- `documentationsFields` - Section 11 (12 champs)

---

## 🔄 Intégration dans le Formulaire de Processus

### Étape 1: Ajouter les States

Dans `process-form.tsx`, ajouter les states pour chaque section multi-éléments:

```tsx
// États pour les structures multi-éléments
const [activitesCritiques, setActivitesCritiques] = useState<
  Record<string, unknown>[]
>([]);
const [fournisseurs, setFournisseurs] = useState<Record<string, unknown>[]>([]);
const [obligationsLegales, setObligationsLegales] = useState<
  Record<string, unknown>[]
>([]);
const [systemesInformatiques, setSystemesInformatiques] = useState<
  Record<string, unknown>[]
>([]);
const [infrastructures, setInfrastructures] = useState<
  Record<string, unknown>[]
>([]);
const [rolesPersonnel, setRolesPersonnel] = useState<Record<string, unknown>[]>(
  []
);
const [equipementsIndustriels, setEquipementsIndustriels] = useState<
  Record<string, unknown>[]
>([]);
const [equipementsBureautiques, setEquipementsBureautiques] = useState<
  Record<string, unknown>[]
>([]);
const [documentations, setDocumentations] = useState<Record<string, unknown>[]>(
  []
);
```

### Étape 2: Remplacer les Champs Texte par DynamicListField

**Avant** (champs texte simples):

```tsx
<FormField
  control={typedControl}
  name="itSystems"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Applications utilisées</FormLabel>
      <FormControl>
        <Textarea placeholder="Liste des applications..." {...field} />
      </FormControl>
    </FormItem>
  )}
/>
```

**Après** (liste dynamique):

```tsx
<DynamicListField
  title="Systèmes Informatiques"
  description="Applications IT critiques pour ce processus"
  fields={systemesInformatiquesFields}
  value={systemesInformatiques}
  onChange={setSystemesInformatiques}
/>
```

### Étape 3: Mettre à Jour l'Onglet "Activités"

Dans le `TabsContent` de l'onglet "activities":

```tsx
<TabsContent value="activities" className="space-y-4">
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium">Activités du processus</h3>
      <p className="text-sm text-muted-foreground">
        Définissez les activités principales et leurs métriques de continuité.
      </p>
    </div>

    {/* Activités Critiques - Liste dynamique */}
    <DynamicListField
      title="Activités Critiques"
      description="Chaque activité critique avec ses propres métriques (RTO, MTPD, etc.)"
      fields={activitesCritiquesFields}
      value={activitesCritiques}
      onChange={setActivitesCritiques}
      minItems={1}
    />

    {/* Conserver les champs globaux existants si nécessaire */}
    <FormField
      control={typedControl}
      name="mainFunctionality"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Fonctionnalité principale</FormLabel>
          <FormControl>
            <Textarea placeholder="Description..." {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  </div>
</TabsContent>
```

### Étape 4: Créer de Nouveaux Onglets Dédiés

Pour améliorer l'UX, créer des onglets séparés:

```tsx
<TabsList className="flex-wrap">
  <TabsTrigger value="general">Général</TabsTrigger>
  <TabsTrigger value="activities">Activités Critiques</TabsTrigger>
  <TabsTrigger value="systems">Systèmes IT</TabsTrigger>
  <TabsTrigger value="infrastructure">Infrastructures</TabsTrigger>
  <TabsTrigger value="personnel">Personnel</TabsTrigger>
  <TabsTrigger value="equipment-industrial">Équipement Industriel</TabsTrigger>
  <TabsTrigger value="equipment-office">Équipement Bureautique</TabsTrigger>
  <TabsTrigger value="documentation">Documentation</TabsTrigger>
  <TabsTrigger value="suppliers">Fournisseurs</TabsTrigger>
  <TabsTrigger value="legal">Obligations Légales</TabsTrigger>
</TabsList>
```

### Étape 5: Mettre à Jour la Soumission du Formulaire

Dans la fonction `onSubmit`:

```typescript
const processData = {
  // ... champs existants ...

  // Ajouter les structures multi-éléments en JSON
  activitesCritiques: JSON.stringify(activitesCritiques),
  fournisseurs: JSON.stringify(fournisseurs),
  obligationsLegales: JSON.stringify(obligationsLegales),
  systemesInformatiques: JSON.stringify(systemesInformatiques),
  infrastructures: JSON.stringify(infrastructures),
  rolesPersonnel: JSON.stringify(rolesPersonnel),
  equipementsIndustriels: JSON.stringify(equipementsIndustriels),
  equipementsBureautiques: JSON.stringify(equipementsBureautiques),
  documentations: JSON.stringify(documentations),
};
```

---

## 🗄️ Mise à Jour du Schéma Prisma

Ajouter les nouveaux champs JSON dans `prisma/schema.prisma`:

```prisma
model Process {
  // ... champs existants ...

  // Structures multi-éléments (JSON)
  activitesCritiques       Json?  // Section 2
  fournisseurs             Json?  // Section 5
  obligationsLegales       Json?  // Section 6
  systemesInformatiques    Json?  // Section 7
  infrastructures          Json?  // Section 8
  rolesPersonnel           Json?  // Section 9
  equipementsIndustriels   Json?  // Section 10A
  equipementsBureautiques  Json?  // Section 10B
  documentations           Json?  // Section 11
}
```

Puis exécuter:

```bash
npx prisma migrate dev --name add-multi-elements
```

---

## 🔄 Mise à Jour des Actions Serveur

Dans `src/actions/bia/process-actions.ts`:

```typescript
export async function createProcess(data: unknown) {
  // ... validation existante ...

  const processData = {
    // ... champs existants ...

    // Parser les JSON pour les structures multi-éléments
    activitesCritiques: data.activitesCritiques
      ? JSON.parse(data.activitesCritiques)
      : null,
    fournisseurs: data.fournisseurs ? JSON.parse(data.fournisseurs) : null,
    obligationsLegales: data.obligationsLegales
      ? JSON.parse(data.obligationsLegales)
      : null,
    systemesInformatiques: data.systemesInformatiques
      ? JSON.parse(data.systemesInformatiques)
      : null,
    infrastructures: data.infrastructures
      ? JSON.parse(data.infrastructures)
      : null,
    rolesPersonnel: data.rolesPersonnel
      ? JSON.parse(data.rolesPersonnel)
      : null,
    equipementsIndustriels: data.equipementsIndustriels
      ? JSON.parse(data.equipementsIndustriels)
      : null,
    equipementsBureautiques: data.equipementsBureautiques
      ? JSON.parse(data.equipementsBureautiques)
      : null,
    documentations: data.documentations
      ? JSON.parse(data.documentations)
      : null,
  };

  const process = await prisma.process.create({
    data: processData,
  });

  return process;
}
```

---

## 📊 Affichage des Données Multi-Éléments

### Option 1: Composant de Tableau

```tsx
// src/components/bia/multi-element-table.tsx
interface MultiElementTableProps {
  title: string;
  data: Record<string, unknown>[];
  fields: FieldConfig[];
}

export function MultiElementTable({
  title,
  data,
  fields,
}: MultiElementTableProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="font-medium">{title}</h4>
      <div className="border rounded-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              {fields.slice(0, 4).map((field) => (
                <th
                  key={field.name}
                  className="px-4 py-2 text-left text-sm font-medium"
                >
                  {field.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-t">
                {fields.slice(0, 4).map((field) => (
                  <td key={field.name} className="px-4 py-2 text-sm">
                    {String(item[field.name] || "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        {data.length} élément{data.length > 1 ? "s" : ""}
      </p>
    </div>
  );
}
```

### Option 2: Cartes Expandables

Réutiliser le `DynamicListField` en mode lecture seule.

---

## ✅ Checklist d'Intégration

### Frontend

- [x] Créer `DynamicListField` component
- [x] Créer `process-form-fields.ts` configurations
- [ ] Ajouter les states dans `process-form.tsx`
- [ ] Remplacer les champs texte par `DynamicListField`
- [ ] Créer nouveaux onglets dédiés
- [ ] Mettre à jour `onSubmit` pour sérialiser JSON
- [ ] Gérer l'initialisation avec `initialData` (parsing JSON)

### Backend

- [ ] Ajouter champs JSON dans `schema.prisma`
- [ ] Exécuter migration Prisma
- [ ] Mettre à jour `process-actions.ts` (create/update)
- [ ] Parser JSON dans les actions

### Affichage

- [ ] Créer composant d'affichage multi-éléments
- [ ] Intégrer dans la page de détail du processus
- [ ] Ajouter export Excel/PDF

---

## 🎯 Avantages de Cette Architecture

1. **Réutilisabilité**: Le composant `DynamicListField` est générique
2. **Maintenabilité**: Les configurations sont centralisées
3. **Extensibilité**: Facile d'ajouter de nouvelles sections
4. **UX**: Interface intuitive avec expansion/réduction
5. **Validation**: Validation par champ configurée
6. **Flexibilité**: Nombre variable d'éléments par section
7. **Standards**: Conforme SMCA/BCM ISO 22301

---

## 📝 Exemple Complet d'Utilisation

```tsx
// Dans process-form.tsx

import { DynamicListField } from "@/components/bia/dynamic-list-field";
import {
  activitesCritiquesFields,
  fournisseursFields,
  systemesInformatiquesFields,
} from "@/components/bia/process-form-fields";

export function ProcessForm({ initialData }: ProcessFormProps) {
  // States
  const [activitesCritiques, setActivitesCritiques] = useState(() =>
    initialData?.activitesCritiques
      ? JSON.parse(initialData.activitesCritiques as string)
      : []
  );

  // ... autres states ...

  return (
    <Form {...form}>
      <Tabs>
        {/* Onglet Activités */}
        <TabsContent value="activities">
          <DynamicListField
            title="Activités Critiques"
            description="N activités avec métriques individuelles"
            fields={activitesCritiquesFields}
            value={activitesCritiques}
            onChange={setActivitesCritiques}
            minItems={1}
          />
        </TabsContent>

        {/* Onglet Fournisseurs */}
        <TabsContent value="suppliers">
          <DynamicListField
            title="Fournisseurs Externes Critiques"
            description="N fournisseurs avec PCA/SLA"
            fields={fournisseursFields}
            value={fournisseurs}
            onChange={setFournisseurs}
          />
        </TabsContent>

        {/* ... autres onglets ... */}
      </Tabs>
    </Form>
  );
}
```

---

Cette architecture permet une gestion complète et professionnelle des processus BIA ! 🎯
