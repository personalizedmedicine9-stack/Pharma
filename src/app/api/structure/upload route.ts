import { NextRequest, NextResponse } from 'next/server';

/**
 * Chemical Structure File Upload & Parsing API Route
 *
 * Parses text-based chemical structure files (.mol, .sdf, .mol2, .pdb, .cif,
 * .smi, .smiles, .smarts, .inchi, .cml, .xyz, .cdxml, .json, .txt) and
 * extracts SMILES notation, compound names, or InChI strings that can be
 * fed into the existing structure search pipeline.
 *
 * POST /api/structure/upload
 * Body: FormData with 'file' file
 * Returns: { smiles?: string, compoundName?: string, inchi?: string, searchQuery?: string }
 */

export const runtime = 'nodejs';

// Supported file formats with their parsing strategies
const FORMAT_CONFIG: Record<string, { name: string; strategy: 'smiles' | 'inchi' | 'mol' | 'sdf' | 'pdb' | 'json' | 'text' }> = {
  '.mol':   { name: 'MDL MOL',     strategy: 'mol' },
  '.sdf':   { name: 'SDF',         strategy: 'sdf' },
  '.mol2':  { name: 'MOL2',        strategy: 'mol' },
  '.pdb':   { name: 'PDB',         strategy: 'pdb' },
  '.cif':   { name: 'CIF',         strategy: 'text' },
  '.smi':   { name: 'SMILES',      strategy: 'smiles' },
  '.smiles': { name: 'SMILES',     strategy: 'smiles' },
  '.smarts': { name: 'SMARTS',     strategy: 'smiles' },
  '.inchi': { name: 'InChI',       strategy: 'inchi' },
  '.cml':   { name: 'CML',         strategy: 'text' },
  '.xyz':   { name: 'XYZ',         strategy: 'text' },
  '.cdxml': { name: 'CDXML',       strategy: 'text' },
  '.json':  { name: 'JSON',        strategy: 'json' },
  '.txt':   { name: 'Text',        strategy: 'text' },
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided. Please upload a chemical structure file.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Determine file format
    const fileName = file.name.toLowerCase();
    const ext = '.' + (fileName.split('.').pop() || '');
    const format = FORMAT_CONFIG[ext];

    if (!format) {
      const supported = Object.entries(FORMAT_CONFIG)
        .map(([e, c]) => `${e} (${c.name})`)
        .join(', ');
      return NextResponse.json(
        { error: `Unsupported file format "${ext}". Supported formats: ${supported}` },
        { status: 400 }
      );
    }

    // Read file content
    const content = await file.text();
    if (!content.trim()) {
      return NextResponse.json(
        { error: 'File is empty.' },
        { status: 400 }
      );
    }

    // Parse based on format strategy
    const result = parseFile(content, ext, format.strategy);

    // Determine the best search query
    const searchQuery = result.smiles || result.inchi || result.casNumber || result.compoundName || null;

    if (!searchQuery) {
      return NextResponse.json({
        success: false,
        error: `Could not extract chemical structure data from "${file.name}". The file may not contain recognizable structure information. Try entering a compound name or SMILES directly.`,
        extracted: result,
        fileName: file.name,
        format: format.name,
      });
    }

    return NextResponse.json({
      success: true,
      extracted: result,
      searchQuery,
      fileName: file.name,
      format: format.name,
    });

  } catch (error) {
    console.error('[Structure Upload] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error parsing file';
    return NextResponse.json(
      { error: `Failed to parse file: ${message}` },
      { status: 500 }
    );
  }
}

/**
 * Parse file content based on format strategy
 */
function parseFile(
  content: string,
  ext: string,
  strategy: string
): { smiles?: string; inchi?: string; compoundName?: string; casNumber?: string; molecularFormula?: string } {
  const result: { smiles?: string; inchi?: string; compoundName?: string; casNumber?: string; molecularFormula?: string } = {};

  switch (strategy) {
    case 'smiles': {
      // .smi, .smiles, .smarts files — content is typically SMILES (optionally followed by name)
      const lines = content.trim().split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
      if (lines.length > 0) {
        const firstLine = lines[0].trim();
        const parts = firstLine.split(/\s+/);
        result.smiles = parts[0]; // First token is SMILES
        if (parts.length > 1) {
          result.compoundName = parts.slice(1).join(' '); // Rest is name
        }
      }
      break;
    }

    case 'inchi': {
      // .inchi files — content is InChI string
      const trimmed = content.trim();
      if (trimmed.startsWith('InChI=')) {
        result.inchi = trimmed.split('\n')[0].trim();
      } else {
        // Try to find InChI in the content
        const inchiMatch = content.match(/InChI=[^\s]+/);
        if (inchiMatch) result.inchi = inchiMatch[0];
      }
      break;
    }

    case 'mol': {
      // MDL MOL / MOL2 — extract compound name from header block
      const lines = content.split('\n');
      // MOL format: line 1 = molecule name, line 2 = program/timestamp, line 3 = comment
      if (lines.length >= 1) {
        const molName = lines[0].trim();
        if (molName) result.compoundName = molName;
      }
      // Try to find SMILES in comment or property lines
      const smilesMatch = content.match(/SMILES[:\s]*([^\s\n]+)/i);
      if (smilesMatch) result.smiles = smilesMatch[1];
      // Try to find InChI
      const inchiMatch = content.match(/InChI=[^\s\n]+/);
      if (inchiMatch) result.inchi = inchiMatch[0];
      break;
    }

    case 'sdf': {
      // SDF — same as MOL but may contain multiple records
      const lines = content.split('\n');
      // First line of each record is the molecule name
      const molName = lines[0]?.trim();
      if (molName) result.compoundName = molName;
      // Try to find SMILES in properties
      const smilesMatch = content.match(/SMILES[:\s]*([^\s\n]+)/i);
      if (smilesMatch) result.smiles = smilesMatch[1];
      // Try to find InChI in properties
      const inchiMatch = content.match(/InChI=[^\s\n]+/);
      if (inchiMatch) result.inchi = inchiMatch[0];
      // Try to find PUBCHEM_COMPOUND_CID
      const cidMatch = content.match(/PUBCHEM_COMPOUND_CID\s*\n\s*(\d+)/);
      if (cidMatch) result.compoundName = result.compoundName || `CID:${cidMatch[1]}`;
      break;
    }

    case 'pdb': {
      // PDB — extract compound name from COMPND or TITLE records
      const compndMatch = content.match(/COMPND\s+(.*)/);
      const titleMatch = content.match(/TITLE\s+(.*)/);
      if (compndMatch) result.compoundName = compndMatch[1].trim();
      else if (titleMatch) result.compoundName = titleMatch[1].trim();
      break;
    }

    case 'json': {
      // JSON — try to extract SMILES, InChI, name from common schema formats
      try {
        const json = JSON.parse(content);
        // RDKit JSON output
        result.smiles = json.SMILES || json.smiles || json.isomericSmiles || json.canonicalSmiles || null;
        result.inchi = json.InChI || json.inchi || json.inchikey || null;
        result.compoundName = json.name || json.compoundName || json.moleculeName || json.title || null;
        result.molecularFormula = json.molecularFormula || json.formula || null;
        result.casNumber = json.cas || json.casNumber || null;
        // If it's an array, take the first item
        if (Array.isArray(json) && json.length > 0) {
          const first = json[0];
          result.smiles = result.smiles || first.SMILES || first.smiles || first.isomericSmiles || first.canonicalSmiles || null;
          result.inchi = result.inchi || first.InChI || first.inchi || null;
          result.compoundName = result.compoundName || first.name || first.compoundName || null;
        }
      } catch {
        // Not valid JSON, try text parsing
        const smilesMatch = content.match(/SMILES[:\s]*["']?([^\s"']+)"?/i);
        if (smilesMatch) result.smiles = smilesMatch[1];
      }
      break;
    }

    case 'text':
    default: {
      // Generic text parsing — try to find any recognizable chemical identifiers
      // SMILES
      const smilesMatch = content.match(/(?:SMILES|smiles|Smiles)[:\s]*["']?([A-Za-z0-9@\[\]\\\/#+-=.()]+)["']?/);
      if (smilesMatch) result.smiles = smilesMatch[1];

      // InChI
      const inchiMatch = content.match(/InChI=[^\s"']+/);
      if (inchiMatch) result.inchi = inchiMatch[0];

      // CAS Number
      const casMatch = content.match(/(?:CAS|cas)[:\s]*(\d{2,7}-\d{2}-\d)/);
      if (casMatch) result.casNumber = casMatch[1];

      // Compound name
      const nameMatch = content.match(/(?:name|Name|compound|Compound|title|Title|MOLECULE)[:\s]*([^\n,;]+)/);
      if (nameMatch) result.compoundName = nameMatch[1].trim();

      // If nothing found, try the first line as compound name
      if (!result.smiles && !result.inchi && !result.compoundName && !result.casNumber) {
        const firstLine = content.trim().split('\n')[0]?.trim();
        if (firstLine && firstLine.length < 200 && !firstLine.startsWith('<') && !firstLine.startsWith('{')) {
          // Check if it looks like a SMILES string
          if (/[CNcnOSoos]\d|\([CNcnOSoos]/.test(firstLine) || /[\[\]\\\/=#@]/.test(firstLine)) {
            result.smiles = firstLine;
          } else {
            result.compoundName = firstLine;
          }
        }
      }
      break;
    }
  }

  return result;
}
