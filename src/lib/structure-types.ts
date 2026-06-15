// ─── Structure Search Types ────────────────────────────────────────────────────

export type SearchMode = 'exact' | 'similarity';
export type ViewerMode = '2d' | '3d';
export type QueryType = 'name' | 'cas' | 'smiles' | 'inchi' | 'inchikey' | 'cid';

export interface SpellingCorrection {
  original: string;
  corrected: string;
  canonical?: string;
  synonymApplied?: boolean;
  wasAutoCorrected?: boolean;
}

export interface CompoundResult {
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
  pubmedReferences: string[];
}

export interface StructureSearchResponse {
  query: string;
  compounds: CompoundResult[];
  totalResults: number;
  sourcesUsed: string[];
  noResultsMessage?: string;
  spellingCorrection?: SpellingCorrection | null;
  confidenceReasoning?: string | null;
  searchMode?: SearchMode;
}

export interface UploadParseResponse {
  success: boolean;
  smiles?: string;
  inchi?: string;
  molecularFormula?: string;
  compoundName?: string;
  atomCount?: number;
  bondCount?: number;
  error?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const EXAMPLE_COMPOUNDS = [
  'Curcumin',
  'Aspirin',
  'Quercetin',
  'Berberine',
  'Resveratrol',
  'Morphine',
  'Caffeine',
  'Metformin',
  'Paclitaxel',
  'Artemisinin',
];

// ─── Supported file formats for upload ────────────────────────────────────────

export const SUPPORTED_FORMATS = [
  { ext: '.mol', name: 'MDL MOL', description: 'Single molecule structure file' },
  { ext: '.sdf', name: 'SDF', description: 'Structure-Data File (multiple molecules)' },
  { ext: '.mol2', name: 'MOL2', description: 'Tripos MOL2 format' },
  { ext: '.pdb', name: 'PDB', description: 'Protein Data Bank format' },
  { ext: '.cif', name: 'CIF', description: 'Crystallographic Information File' },
  { ext: '.smi', name: 'SMILES', description: 'SMILES notation file' },
  { ext: '.smiles', name: 'SMILES', description: 'SMILES notation file' },
  { ext: '.smarts', name: 'SMARTS', description: 'SMARTS substructure pattern' },
  { ext: '.inchi', name: 'InChI', description: 'InChI identifier file' },
  { ext: '.cml', name: 'CML', description: 'Chemical Markup Language (XML)' },
  { ext: '.xyz', name: 'XYZ', description: 'Cartesian coordinates file' },
  { ext: '.cdxml', name: 'CDXML', description: 'ChemDraw XML format' },
  { ext: '.json', name: 'JSON', description: 'Chemical JSON (CommonChem, PubChem, etc.)' },
  { ext: '.txt', name: 'Text', description: 'Auto-detects SMILES/InChI/MOL content' },
];

export const ACCEPTED_EXTENSIONS = '.mol,.sdf,.mol2,.pdb,.cif,.smi,.smiles,.smarts,.inchi,.cml,.xyz,.cdxml,.json,.txt';

export function detectQueryType(query: string): QueryType {
  const trimmed = query.trim();

  if (/^\d{1,9}$/.test(trimmed)) return 'cid';
  if (/^[A-Z]{14}-[A-Z]{10}-[A-Z]$/.test(trimmed)) return 'inchikey';
  if (/^InChI=/i.test(trimmed)) return 'inchi';
  if (/^\d{2,7}-\d{2}-\d$/.test(trimmed)) return 'cas';
  if (/^[[\]\\\/#@]/.test(trimmed) || /^[A-Za-z0-9@[\]\\\/#+-=.()]+$/.test(trimmed)) {
    if (/[CNcnOSoos]\d|[CNcnOSoos]\(|\([CNcnOSoos]/.test(trimmed) ||
      trimmed.includes('=') || trimmed.includes('#') || trimmed.includes('@@') ||
      trimmed.includes('\\') || (trimmed.includes('[') && trimmed.includes(']'))) {
      return 'smiles';
    }
  }

  return 'name';
}
