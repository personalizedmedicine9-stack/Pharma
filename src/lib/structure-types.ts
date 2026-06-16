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

export const EXAMPLE_COMPOUNDS = [
  'Curcumin', 'Aspirin', 'Quercetin', 'Berberine', 'Resveratrol',
  'Morphine', 'Caffeine', 'Metformin', 'Paclitaxel', 'Artemisinin',
];

export const SUPPORTED_FORMATS = [
  { ext: '.mol', name: 'MDL MOL', description: 'Single molecule structure file', category: 'chemical' as const },
  { ext: '.sdf', name: 'SDF', description: 'Structure-Data File (multiple molecules)', category: 'chemical' as const },
  { ext: '.mol2', name: 'MOL2', description: 'Tripos MOL2 format', category: 'chemical' as const },
  { ext: '.pdb', name: 'PDB', description: 'Protein Data Bank format', category: 'chemical' as const },
  { ext: '.cif', name: 'CIF', description: 'Crystallographic Information File', category: 'chemical' as const },
  { ext: '.smi', name: 'SMILES', description: 'SMILES notation file', category: 'chemical' as const },
  { ext: '.smiles', name: 'SMILES', description: 'SMILES notation file', category: 'chemical' as const },
  { ext: '.smarts', name: 'SMARTS', description: 'SMARTS substructure pattern', category: 'chemical' as const },
  { ext: '.inchi', name: 'InChI', description: 'InChI identifier file', category: 'chemical' as const },
  { ext: '.cml', name: 'CML', description: 'Chemical Markup Language (XML)', category: 'chemical' as const },
  { ext: '.xyz', name: 'XYZ', description: 'Cartesian coordinates file', category: 'chemical' as const },
  { ext: '.cdxml', name: 'CDXML', description: 'ChemDraw XML format', category: 'chemical' as const },
  { ext: '.json', name: 'JSON', description: 'Chemical JSON (CommonChem, PubChem, etc.)', category: 'chemical' as const },
  { ext: '.txt', name: 'Text', description: 'Auto-detects SMILES/InChI/MOL content', category: 'chemical' as const },
  { ext: '.tif', name: 'TIFF', description: 'TIFF image - AI structure recognition', category: 'image' as const },
  { ext: '.tiff', name: 'TIFF', description: 'TIFF image - AI structure recognition', category: 'image' as const },
  { ext: '.png', name: 'PNG', description: 'PNG image - AI structure recognition', category: 'image' as const },
  { ext: '.jpg', name: 'JPEG', description: 'JPEG image - AI structure recognition', category: 'image' as const },
  { ext: '.jpeg', name: 'JPEG', description: 'JPEG image - AI structure recognition', category: 'image' as const },
  { ext: '.bmp', name: 'BMP', description: 'BMP image - AI structure recognition', category: 'image' as const },
  { ext: '.gif', name: 'GIF', description: 'GIF image - AI structure recognition', category: 'image' as const },
  { ext: '.webp', name: 'WebP', description: 'WebP image - AI structure recognition', category: 'image' as const },
];

export const ACCEPTED_EXTENSIONS = '.mol,.sdf,.mol2,.pdb,.cif,.smi,.smiles,.smarts,.inchi,.cml,.xyz,.cdxml,.json,.txt,.tif,.tiff,.png,.jpg,.jpeg,.bmp,.gif,.webp';
export const IMAGE_EXTENSIONS = ['.tif', '.tiff', '.png', '.jpg', '.jpeg', '.bmp', '.gif', '.webp'];

export function isImageFile(fileName: string): boolean {
  const ext = '.' + fileName.split('.').pop()?.toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

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
