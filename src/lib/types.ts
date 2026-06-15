export type EvidenceLevel = "High" | "Moderate" | "Low";
export type JournalQuality = "High-impact journal" | "Medium-impact journal" | "Low/uncertain quality";
export type RelevanceLabel = "HIGH" | "MEDIUM" | "LOW";
export type SeverityLevel = "Major" | "Moderate" | "Minor"; // No "Unknown" — always normalized
export type InteractionType = "Pharmacokinetic" | "Pharmacodynamic" | "Mixed"; // No "Unknown"
export type ClinicalRelevance = "Human Clinical" | "Animal/In Vitro" | "Unknown";
export type EvidenceConsistency = "Consistent" | "Conflicting" | "Insufficient";
export type ConfidenceLevel = "High" | "Moderate" | "Low";

export interface StudyResult {
  title: string;
  source: "PubMed";
  pubmedLink: string;
  pmid: string;
  doi?: string;
  doiLink?: string;
  journal: string;
  pubYear: string;
  authors: string[];
  abstract: string;
  citationCount: number;
  studyType: string;
  evidenceLevel: EvidenceLevel;
  journalQuality: JournalQuality;
  relevanceLabel: RelevanceLabel;
  relevanceScore: number;
  compositeScore: number;
  fdaWarnings: string[];
  severity: SeverityLevel;
  interactionType: InteractionType;
  clinicalRelevance: ClinicalRelevance;
  confidence: ConfidenceLevel;
  rationale?: string;
  mechanismDescription?: string; // Normalized mechanism from taxonomy
}

export interface FdaDrugData {
  warnings: string[];
  interactions: string[];
  brandNames: string[];
}

export interface SpellingCorrection {
  original: string;
  corrected: string;
  canonical?: string;
  synonymApplied?: boolean;
  wasAutoCorrected?: boolean;
}

export interface SearchResponse {
  results: StudyResult[];
  total: number;
  sourcesUsed: string[];
  fdaData: FdaDrugData | null;
  topCitationCount: number;
  fromCache: boolean;
  evidenceConsistency?: EvidenceConsistency;
  noEvidenceMessage?: string;
  error?: string;
  spellingCorrections?: {
    drug: SpellingCorrection | null;
    herb: SpellingCorrection | null;
  };
  confidenceReasoning?: string;
}

export interface PharmacologyAction {
  name: string;
  pmids: string[];
  score: number;
  mechanisms: { name: string; pmids: string[] }[];
}

export interface PharmacologyCompound {
  name: string;
  category: string;
  pmids: string[];
  isMajor?: boolean;
}

export interface PharmacologyReference {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  pubYear: string;
  doi?: string;
}

export interface PharmacologyResponse {
  herb: string;
  pharmacological_actions: PharmacologyAction[];
  active_compounds: PharmacologyCompound[];
  evidence_level: "High" | "Moderate" | "Low" | "No Evidence";
  confidence: "High" | "Moderate" | "Low";
  sourcesUsed: string[];
  noEvidenceMessage?: string;
  error?: string;
  spellingCorrection?: SpellingCorrection | null;
  confidenceReasoning?: string;
  references?: PharmacologyReference[];
}

export interface SearchHistoryEntry {
  id: string;
  query: string;
  engineType: string;
  resultsCount: number;
  sourcesUsed: string[];
  topCitationCount: number;
  hasFdaData: boolean;
  timestamp: string;
}

export interface SavedReport {
  id: string;
  report_id: string;
  report_type: 'interaction' | 'pharmacology' | 'structure' | 'phytoinsight';
  report_data: Record<string, unknown>;
  drug_name?: string;
  herb_name?: string;
  created_at: string;
}

// ─── Chemical Structure of Natural Products ───

export interface CompoundStructure {
  name: string;
  iupacName: string;
  molecularFormula: string;
  molecularWeight: number;
  smiles: string;
  inchi: string;
  inchiKey: string;
  casNumber: string;
  cid: number; // PubChem CID
  chebiId: string; // ChEBI ID
  imageUrl2D: string; // PubChem 2D structure PNG image URL
  conformerId3D: string; // PubChem 3D conformer ID for 3D viewing
  sourceOrganism: string;
  compoundClass: string;
  pubmedReferences: string[]; // PMIDs
}

export interface StructureResponse {
  query: string;
  compounds: CompoundStructure[];
  totalResults: number;
  sourcesUsed: string[];
  noResultsMessage?: string;
  error?: string;
  spellingCorrection?: SpellingCorrection | null;
  confidenceReasoning?: string;
}

// ─── PhytoInsight: Deep Phytochemical Intelligence ───

export type BiosyntheticPathway =
  | "Shikimate Pathway"
  | "Mevalonate Pathway"
  | "Methylerythritol Phosphate Pathway"
  | "Polyketide Pathway"
  | "Alkaloid Biosynthesis"
  | "Mixed Biosynthesis";

export type CompoundSuperclass =
  | "Alkaloids"
  | "Terpenoids"
  | "Flavonoids"
  | "Phenylpropanoids"
  | "Polyketides"
  | "Fatty Acid Derivatives"
  | "Glucosinolates"
  | "Cyanogenic Glycosides"
  | "Sulfur Compounds"
  | "Other";

export interface PhytoCompoundProfile {
  name: string;
  iupacName: string;
  molecularFormula: string;
  molecularWeight: number;
  smiles: string;
  inchi: string;
  inchiKey: string;
  casNumber: string;
  cid: number;
  chebiId: string;
  imageUrl2D: string;
  conformerId3D: string;
  sourceOrganism: string;
  compoundClass: string;
  superclass: CompoundSuperclass;
  biosyntheticPathway: BiosyntheticPathway;
  pharmacologicalActions: string[];
  isMajorConstituent: boolean;
  typicalConcentration?: string;
  pubmedReferences: string[];
  /** Relative abundance rank among identified compounds (1 = most abundant) */
  abundanceRank?: number;
}

export interface PhytoClassDistribution {
  className: string;
  superclass: CompoundSuperclass;
  compoundCount: number;
  majorCompounds: string[];
  color: string;
}

export interface PhytoPathwaySummary {
  pathway: BiosyntheticPathway;
  compoundCount: number;
  representativeCompounds: string[];
}

export interface PhytoInsightResponse {
  herb: string;
  herbCanonicalName: string;
  herbFamily?: string;
  herbPartUsed?: string;
  compounds: PhytoCompoundProfile[];
  classDistribution: PhytoClassDistribution[];
  pathwaySummary: PhytoPathwaySummary[];
  pharmacologicalActions: PharmacologyAction[];
  evidenceLevel: "High" | "Moderate" | "Low" | "No Evidence";
  confidence: "High" | "Moderate" | "Low";
  sourcesUsed: string[];
  noResultsMessage?: string;
  error?: string;
  spellingCorrection?: SpellingCorrection | null;
  confidenceReasoning?: string;
  references?: PharmacologyReference[];
}

// ─── Structured AI Report Sections ───

export interface StructuredAiReport {
  executiveSummary: string;
  evidenceSynthesis: string;
  mechanisticInterpretation: string;
  clinicalRelevance: string;
  discussion: string;
  limitations: string;
  conclusion: string;
}

export interface AiSummaryResponse {
  text: string | StructuredAiReport;
  source: string;
  structured: boolean;
}
