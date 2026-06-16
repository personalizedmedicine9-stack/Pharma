import { NextRequest, NextResponse } from 'next/server';
// ─── Image OCR Support ────────────────────────────────────────────────────────
const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.tif', '.tiff', '.bmp'];
const WEB_NATIVE_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];

function guessImageMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
    gif: 'image/gif', webp: 'image/webp',
    tif: 'image/tiff', tiff: 'image/tiff', bmp: 'image/bmp',
  };
  return map[ext || ''] || 'application/octet-stream';
}

async function handleImageOCR(imageFile: File): Promise<Record<string, unknown>> {
  if (imageFile.size > 10 * 1024 * 1024) {
    return { success: false, error: 'Image too large. Maximum size is 10MB.' };
  }
  const fileName = imageFile.name.toLowerCase();
  let finalBuffer: Buffer;
  let finalMimeType: string;
  if (!WEB_NATIVE_EXTS.some(v => fileName.endsWith(v))) {
    try {
      const sharpModule = await import('sharp');
      const sharp = sharpModule.default || sharpModule;
      const arrayBuffer = await imageFile.arrayBuffer();
      finalBuffer = await sharp(Buffer.from(arrayBuffer)).png({ compressionLevel: 0 }).toBuffer();
      finalMimeType = 'image/png';
    } catch { return { success: false, error: 'TIFF/BMP conversion failed. Save as PNG/JPG.' }; }
  } else {
    const arrayBuffer = await imageFile.arrayBuffer();
    finalBuffer = Buffer.from(arrayBuffer);
    finalMimeType = guessImageMimeType(fileName);
  }
  const base64 = finalBuffer.toString('base64');
  const dataUrl = `data:${finalMimeType};base64,${base64}`;
  let parsed: Record<string, unknown>;
  try {
    const zaiModule = await import('z-ai-web-dev-sdk');
    const ZAI = zaiModule.default || zaiModule;
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a chemical structure recognition AI. Analyze the image and respond ONLY with valid JSON: {"smiles":"SMILES or null","compoundName":"name or null","inchi":"InChI or null","casNumber":"CAS or null","molecularFormula":"formula or null","confidence":"high/medium/low","reasoning":"explanation"}' },
        { role: 'user', content: [
          { type: 'image_url', image_url: { url: dataUrl } },
          { type: 'text', text: 'Identify the chemical structure. Extract SMILES, name, InChI, CAS, formula.' }
        ]}
      ],
      temperature: 0.1, max_tokens: 800,
    });
    const text = completion.choices?.[0]?.message?.content || '';
    try { const c = text.replace(/```json\s*/gi,'').replace(/```\s*/gi,'').trim(); parsed = JSON.parse(c); }
    catch { const sm = text.match(/SMILES[:\s]*([^\s,}"']+)/i); const nm = text.match(/(?:name|compound)[:\s]*([^\n,}"']+)/i); parsed = { smiles: sm?.[1]||null, compoundName: nm?.[1]||null, confidence:'low' }; }
  } catch (aiError) { console.error('[OCR] AI failed:', aiError); return { success: false, error: 'AI image analysis failed. Try again or use text search.' }; }
  const smiles = (parsed.smiles as string)||null;
  const compoundName = (parsed.compoundName as string)||null;
  const inchi = (parsed.inchi as string)||null;
  const casNumber = (parsed.casNumber as string)||null;
  const molecularFormula = (parsed.molecularFormula as string)||null;
  const searchQuery = smiles||inchi||casNumber||compoundName||null;
  if (!searchQuery) return { success:false, error:'Could not recognize a chemical structure. Try a clearer image.', smiles, compoundName, inchi, casNumber, molecularFormula, confidence:(parsed.confidence as string)||'low', format:'Image (AI OCR)' };
  return { success:true, smiles:smiles||undefined, compoundName:compoundName||undefined, inchi:inchi||undefined, casNumber:casNumber||undefined, molecularFormula:molecularFormula||undefined, confidence:(parsed.confidence as string)||'medium', reasoning:(parsed.reasoning as string)||undefined, searchQuery, fileName:imageFile.name, format:'Image (AI OCR)' };
}
// ─── Force dynamic rendering (fixes Next.js 16 "Failed to find Server Action" bug) ──
export const dynamic = 'force-dynamic';

// ─── MOL/SDF Parser ──────────────────────────────────────────────────────────

function parseMolFile(content: string): {
  compoundName: string;
  atoms: { x: number; y: number; z: number; symbol: string }[];
  bonds: { atom1: number; atom2: number; type: number }[];
  molecularFormula: string;
} {
  const lines = content.split('\n');
  const compoundName = lines[0]?.trim() || '';

  const countsLine = lines[3] || '';
  const numAtoms = parseInt(countsLine.substring(0, 3), 10) || 0;
  const numBonds = parseInt(countsLine.substring(3, 6), 10) || 0;

  const atoms: { x: number; y: number; z: number; symbol: string }[] = [];
  const bonds: { atom1: number; atom2: number; type: number }[] = [];

  for (let i = 0; i < numAtoms && (4 + i) < lines.length; i++) {
    const line = lines[4 + i];
    const x = parseFloat(line.substring(0, 10));
    const y = parseFloat(line.substring(10, 20));
    const z = parseFloat(line.substring(20, 30));
    const symbol = line.substring(31, 34).trim();
    atoms.push({ x, y, z, symbol });
  }

  const bondStart = 4 + numAtoms;
  for (let i = 0; i < numBonds && (bondStart + i) < lines.length; i++) {
    const line = lines[bondStart + i];
    const atom1 = parseInt(line.substring(0, 3), 10);
    const atom2 = parseInt(line.substring(3, 6), 10);
    const type = parseInt(line.substring(6, 9), 10);
    bonds.push({ atom1, atom2, type });
  }

  const elementCounts: Record<string, number> = {};
  for (const atom of atoms) {
    elementCounts[atom.symbol] = (elementCounts[atom.symbol] || 0) + 1;
  }

  const formulaParts: string[] = [];
  if (elementCounts['C']) {
    formulaParts.push('C' + (elementCounts['C'] > 1 ? elementCounts['C'] : ''));
    delete elementCounts['C'];
  }
  if (elementCounts['H']) {
    formulaParts.push('H' + (elementCounts['H'] > 1 ? elementCounts['H'] : ''));
    delete elementCounts['H'];
  }
  for (const element of Object.keys(elementCounts).sort()) {
    formulaParts.push(element + (elementCounts[element] > 1 ? elementCounts[element] : ''));
  }

  return { compoundName, atoms, bonds, molecularFormula: formulaParts.join('') };
}

// ─── Convert MOL atoms/bonds to basic SMILES ─────────────────────────────────

function molToSmiles(atoms: { symbol: string }[], bonds: { atom1: number; atom2: number; type: number }[]): string {
  if (atoms.length === 0) return '';

  const adj: Map<number, { neighbor: number; type: number }[]> = new Map();
  for (let i = 0; i < atoms.length; i++) adj.set(i, []);
  for (const bond of bonds) {
    adj.get(bond.atom1 - 1)?.push({ neighbor: bond.atom2 - 1, type: bond.type });
    adj.get(bond.atom2 - 1)?.push({ neighbor: bond.atom1 - 1, type: bond.type });
  }

  const visited = new Set<number>();
  const smilesParts: string[] = [];

  function dfs(node: number, parentBondType: number) {
    if (visited.has(node)) return;
    visited.add(node);

    const symbol = atoms[node].symbol;
    const needsBrackets = symbol.length > 1 || !['C', 'N', 'O', 'S', 'P', 'F', 'Cl', 'Br', 'I', 'B'].includes(symbol);
    let prefix = '';

    if (parentBondType === 2) prefix = '=';
    else if (parentBondType === 3) prefix = '#';

    smilesParts.push(prefix + (needsBrackets ? `[${symbol}]` : symbol));

    const neighbors = adj.get(node) || [];
    for (const { neighbor, type } of neighbors) {
      if (!visited.has(neighbor)) {
        if (neighbors.filter(n => !visited.has(n.neighbor)).length > 1 && visited.size > 1) {
          smilesParts.push('(');
          dfs(neighbor, type);
          smilesParts.push(')');
        } else {
          dfs(neighbor, type);
        }
      }
    }
  }

  dfs(0, 1);
  return smilesParts.join('');
}

// ─── CML (Chemical Markup Language) Parser ────────────────────────────────────

function parseCML(content: string): { smiles: string; molecularFormula: string; compoundName: string } {
  try {
    const atomRegex = /<atom\s+id="([^"]*)"\s+elementType="([^"]*)"/g;
    const atoms: { id: string; symbol: string }[] = [];
    let match;
    while ((match = atomRegex.exec(content)) !== null) {
      atoms.push({ id: match[1], symbol: match[2] });
    }

    const bondRegex = /<bond\s+id="[^"]*"\s+atomRefs2="([^"]*)"\s+order="([^"]*)"/g;
    const bonds: { atom1: string; atom2: string; order: string }[] = [];
    while ((match = bondRegex.exec(content)) !== null) {
      const refs = match[1].split(/\s+/);
      bonds.push({ atom1: refs[0], atom2: refs[1], order: match[2] });
    }

    const titleMatch = content.match(/<molecule[^>]*title="([^"]*)"/);
    const compoundName = titleMatch?.[1] || '';

    const elementCounts: Record<string, number> = {};
    for (const atom of atoms) {
      elementCounts[atom.symbol] = (elementCounts[atom.symbol] || 0) + 1;
    }
    const formulaParts: string[] = [];
    if (elementCounts['C']) {
      formulaParts.push('C' + (elementCounts['C'] > 1 ? elementCounts['C'] : ''));
      delete elementCounts['C'];
    }
    if (elementCounts['H']) {
      formulaParts.push('H' + (elementCounts['H'] > 1 ? elementCounts['H'] : ''));
      delete elementCounts['H'];
    }
    for (const element of Object.keys(elementCounts).sort()) {
      formulaParts.push(element + (elementCounts[element] > 1 ? elementCounts[element] : ''));
    }

    const atomIdMap = new Map(atoms.map((a, i) => [a.id, i]));
    const molBonds = bonds.map(b => ({
      atom1: (atomIdMap.get(b.atom1) ?? 0) + 1,
      atom2: (atomIdMap.get(b.atom2) ?? 0) + 1,
      type: b.order === '2' ? 2 : b.order === '3' ? 3 : 1,
    }));
    const smiles = molToSmiles(atoms.map(a => ({ symbol: a.symbol })), molBonds);

    return { smiles, molecularFormula: formulaParts.join(''), compoundName };
  } catch {
    return { smiles: '', molecularFormula: '', compoundName: '' };
  }
}

// ─── XYZ Coordinates Parser ──────────────────────────────────────────────────

function parseXYZ(content: string): { atoms: { symbol: string }[]; molecularFormula: string } {
  try {
    const lines = content.trim().split('\n');
    const numAtoms = parseInt(lines[0]?.trim(), 10) || 0;
    const atoms: { symbol: string }[] = [];

    for (let i = 2; i < 2 + numAtoms && i < lines.length; i++) {
      const parts = lines[i].trim().split(/\s+/);
      if (parts.length >= 4) {
        atoms.push({ symbol: parts[0] });
      }
    }

    const elementCounts: Record<string, number> = {};
    for (const atom of atoms) {
      elementCounts[atom.symbol] = (elementCounts[atom.symbol] || 0) + 1;
    }
    const formulaParts: string[] = [];
    if (elementCounts['C']) {
      formulaParts.push('C' + (elementCounts['C'] > 1 ? elementCounts['C'] : ''));
      delete elementCounts['C'];
    }
    if (elementCounts['H']) {
      formulaParts.push('H' + (elementCounts['H'] > 1 ? elementCounts['H'] : ''));
      delete elementCounts['H'];
    }
    for (const element of Object.keys(elementCounts).sort()) {
      formulaParts.push(element + (elementCounts[element] > 1 ? elementCounts[element] : ''));
    }

    return { atoms, molecularFormula: formulaParts.join('') };
  } catch {
    return { atoms: [], molecularFormula: '' };
  }
}

// ─── CDXML (ChemDraw XML) Parser ─────────────────────────────────────────────

function parseCDXML(content: string): { smiles: string; molecularFormula: string; compoundName: string } {
  try {
    const atomRegex = /<n\s+id="[^"]*"\s+element="([^"]*)"/g;
    const atoms: { symbol: string }[] = [];
    let match;
    while ((match = atomRegex.exec(content)) !== null) {
      atoms.push({ symbol: match[1] });
    }

    const bondRegex = /<b\s+B="[^"]*"\s+E="[^"]*"\s+Order="([^"]*)"/g;
    const bonds: { type: number }[] = [];
    while ((match = bondRegex.exec(content)) !== null) {
      bonds.push({ type: parseInt(match[1], 10) || 1 });
    }

    // Try to find SMILES in CDXML metadata
    const smilesMatch = content.match(/SMILES[^>]*>([^<]+)/i);
    if (smilesMatch && smilesMatch[1]?.trim()) {
      return {
        smiles: smilesMatch[1].trim(),
        molecularFormula: '',
        compoundName: '',
      };
    }

    const elementCounts: Record<string, number> = {};
    for (const atom of atoms) {
      elementCounts[atom.symbol] = (elementCounts[atom.symbol] || 0) + 1;
    }
    const formulaParts: string[] = [];
    if (elementCounts['C']) {
      formulaParts.push('C' + (elementCounts['C'] > 1 ? elementCounts['C'] : ''));
      delete elementCounts['C'];
    }
    if (elementCounts['H']) {
      formulaParts.push('H' + (elementCounts['H'] > 1 ? elementCounts['H'] : ''));
      delete elementCounts['H'];
    }
    for (const element of Object.keys(elementCounts).sort()) {
      formulaParts.push(element + (elementCounts[element] > 1 ? elementCounts[element] : ''));
    }

    return { smiles: '', molecularFormula: formulaParts.join(''), compoundName: '' };
  } catch {
    return { smiles: '', molecularFormula: '', compoundName: '' };
  }
}

// ─── MOL2 (Tripos) Parser ───────────────────────────────────────────────────

function parseMOL2(content: string): { smiles: string; molecularFormula: string; compoundName: string } {
  try {
    const compoundNameMatch = content.match(/@<TRIPOS>MOLECULE\s*\n([^\n]+)/);
    const compoundName = compoundNameMatch?.[1]?.trim() || '';

    // Parse atoms from @<TRIPOS>ATOM section
    const atomSection = content.match(/@<TRIPOS>ATOM\s*\n([\s\S]*?)(?=@<TRIPOS>|$)/);
    const atoms: { symbol: string }[] = [];
    if (atomSection) {
      const atomLines = atomSection[1].trim().split('\n');
      for (const line of atomLines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 6) {
          // MOL2 atom type may be like "C.2", "O.3" etc. — extract element symbol
          let symbol = parts[5].split('.')[0];
          // Handle cases where atom type is just a number or not an element
          if (symbol.length <= 2 && /^[A-Z][a-z]?$/.test(symbol)) {
            atoms.push({ symbol });
          } else if (parts[1] && /^[A-Z][a-z]?$/.test(parts[1])) {
            atoms.push({ symbol: parts[1] });
          }
        }
      }
    }

    const elementCounts: Record<string, number> = {};
    for (const atom of atoms) {
      elementCounts[atom.symbol] = (elementCounts[atom.symbol] || 0) + 1;
    }
    const formulaParts: string[] = [];
    if (elementCounts['C']) {
      formulaParts.push('C' + (elementCounts['C'] > 1 ? elementCounts['C'] : ''));
      delete elementCounts['C'];
    }
    if (elementCounts['H']) {
      formulaParts.push('H' + (elementCounts['H'] > 1 ? elementCounts['H'] : ''));
      delete elementCounts['H'];
    }
    for (const element of Object.keys(elementCounts).sort()) {
      formulaParts.push(element + (elementCounts[element] > 1 ? elementCounts[element] : ''));
    }

    return { smiles: '', molecularFormula: formulaParts.join(''), compoundName };
  } catch {
    return { smiles: '', molecularFormula: '', compoundName: '' };
  }
}

// ─── PDB (Protein Data Bank) Parser ─────────────────────────────────────────

function parsePDB(content: string): { molecularFormula: string; compoundName: string } {
  try {
    const atoms: { symbol: string }[] = [];
    const lines = content.split('\n');
    let compoundName = '';

    for (const line of lines) {
      if (line.startsWith('COMPND')) {
        compoundName += line.substring(10).trim() + ' ';
      }
      if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
        // PDB format: columns 77-78 contain element symbol
        const symbol = line.substring(76, 78).trim();
        if (symbol && /^[A-Z][a-z]?$/.test(symbol)) {
          atoms.push({ symbol });
        }
      }
    }

    compoundName = compoundName.trim().replace(/;$/, '');

    const elementCounts: Record<string, number> = {};
    for (const atom of atoms) {
      elementCounts[atom.symbol] = (elementCounts[atom.symbol] || 0) + 1;
    }
    const formulaParts: string[] = [];
    if (elementCounts['C']) {
      formulaParts.push('C' + (elementCounts['C'] > 1 ? elementCounts['C'] : ''));
      delete elementCounts['C'];
    }
    if (elementCounts['H']) {
      formulaParts.push('H' + (elementCounts['H'] > 1 ? elementCounts['H'] : ''));
      delete elementCounts['H'];
    }
    for (const element of Object.keys(elementCounts).sort()) {
      formulaParts.push(element + (elementCounts[element] > 1 ? elementCounts[element] : ''));
    }

    return { molecularFormula: formulaParts.join(''), compoundName };
  } catch {
    return { molecularFormula: '', compoundName: '' };
  }
}

// ─── CIF (Crystallographic Information File) Parser ──────────────────────────

function parseCIF(content: string): { molecularFormula: string; compoundName: string } {
  try {
    let compoundName = '';
    let molecularFormula = '';

    // Extract chemical name
    const nameMatch = content.match(/_chemical_name_common\s+([^\n]+)/);
    if (nameMatch) compoundName = nameMatch[1].trim().replace(/^['"]|['"]$/g, '');
    if (!compoundName) {
      const nameMatch2 = content.match(/_chemical_name_systematic\s+([^\n]+)/);
      if (nameMatch2) compoundName = nameMatch2[1].trim().replace(/^['"]|['"]$/g, '');
    }

    // Extract formula
    const formulaMatch = content.match(/_chemical_formula_sum\s+['"]?([^'"\n]+)['"]?/);
    if (formulaMatch) molecularFormula = formulaMatch[1].trim();

    return { molecularFormula, compoundName };
  } catch {
    return { molecularFormula: '', compoundName: '' };
  }
}

// ─── SMARTS Parser ──────────────────────────────────────────────────────────

function parseSMARTS(content: string): { smarts: string; compoundName: string } {
  try {
    const firstLine = content.split('\n')[0]?.trim();
    if (!firstLine) return { smarts: '', compoundName: '' };
    const parts = firstLine.split(/\s+/);
    return {
      smarts: parts[0],
      compoundName: parts.slice(1).join(' ') || '',
    };
  } catch {
    return { smarts: '', compoundName: '' };
  }
}

// ─── JSON Parser (various chem JSON formats) ────────────────────────────────

function parseChemJSON(content: string): { smiles: string; molecularFormula: string; compoundName: string; inchi: string } {
  try {
    const data = JSON.parse(content);

    // CommonChem JSON
    if (data.molecules && Array.isArray(data.molecules)) {
      const mol = data.molecules[0];
      return {
        smiles: mol.smiles || '',
        molecularFormula: mol.formula || '',
        compoundName: mol.name || '',
        inchi: mol.inchi || '',
      };
    }

    // PubChem-style JSON
    if (data.PC_Compounds) {
      const compound = data.PC_Compounds[0];
      const props = compound?.props || [];
      let smiles = '';
      let inchi = '';
      let name = '';
      for (const prop of props) {
        const label = prop?.urn?.label;
        if (label === 'SMILES' || label === 'Canonical SMILES' || label === 'Isomeric SMILES') {
          smiles = prop?.value?.sval || '';
        }
        if (label === 'InChI') {
          inchi = prop?.value?.sval || '';
        }
        if (label === 'IUPAC Name') {
          name = prop?.value?.sval || '';
        }
      }
      return { smiles, molecularFormula: '', compoundName: name, inchi };
    }

    // Generic JSON with common fields
    return {
      smiles: data.smiles || data.SMILES || data.canonical_smiles || '',
      molecularFormula: data.formula || data.molecular_formula || data.molecularFormula || '',
      compoundName: data.name || data.compound_name || data.compoundName || data.title || '',
      inchi: data.inchi || data.InChI || '',
    };
  } catch {
    return { smiles: '', molecularFormula: '', compoundName: '', inchi: '' };
  }
}

// ─── POST Handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    // ── Route image files to AI OCR handler ──
    const fName = (file?.name || '').toLowerCase();
    if (IMAGE_EXTS.some(ext => fName.endsWith(ext))) {
      try {
        const result = await handleImageOCR(file);
        return NextResponse.json(result);
      } catch (error) {
        return NextResponse.json({ success: false, error: `Image analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
      }
    }
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();

    // For binary CDX format — cannot read as text
    if (fileName.endsWith('.cdx')) {
      return NextResponse.json({
        success: false,
        error: 'ChemDraw binary (.cdx) is a proprietary binary format and cannot be parsed directly.',
        hint: 'In ChemDraw: File → Save As → choose MDL Molfile (.mol) or ChemDraw XML (.cdxml) or SMILES (.smi)',
      }, { status: 400 });
    }

    const content = await file.text();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'File is empty.' }, { status: 400 });
    }

    // ─── .mol and .sdf files ───────────────────────────────────────────────
    if (fileName.endsWith('.mol') || fileName.endsWith('.sdf')) {
      let molContent = content;
      if (fileName.endsWith('.sdf')) {
        const molEnd = content.indexOf('M  END');
        if (molEnd > 0) {
          molContent = content.substring(0, molEnd + 6);
        }
      }

      const parsed = parseMolFile(molContent);
      const smiles = molToSmiles(parsed.atoms, parsed.bonds);

      return NextResponse.json({
        success: true,
        smiles: smiles || undefined,
        molecularFormula: parsed.molecularFormula || undefined,
        compoundName: parsed.compoundName || undefined,
        atomCount: parsed.atoms.length,
        bondCount: parsed.bonds.length,
        format: fileName.endsWith('.sdf') ? 'SDF' : 'MOL',
      });
    }

    // ─── .mol2 (Tripos) ───────────────────────────────────────────────────
    if (fileName.endsWith('.mol2')) {
      const parsed = parseMOL2(content);
      if (parsed.molecularFormula) {
        return NextResponse.json({
          success: true,
          smiles: parsed.smiles || undefined,
          molecularFormula: parsed.molecularFormula || undefined,
          compoundName: parsed.compoundName || undefined,
          format: 'MOL2',
          hint: parsed.smiles ? undefined : 'MOL2 format contains coordinates only. Search will use the molecular formula.',
        });
      }
    }

    // ─── .pdb (Protein Data Bank) ─────────────────────────────────────────
    if (fileName.endsWith('.pdb')) {
      const parsed = parsePDB(content);
      if (parsed.molecularFormula) {
        return NextResponse.json({
          success: true,
          molecularFormula: parsed.molecularFormula || undefined,
          compoundName: parsed.compoundName || undefined,
          format: 'PDB',
          hint: 'PDB format contains 3D coordinates. Search will use the molecular formula.',
        });
      }
    }

    // ─── .cif (Crystallographic Information File) ─────────────────────────
    if (fileName.endsWith('.cif')) {
      const parsed = parseCIF(content);
      if (parsed.molecularFormula || parsed.compoundName) {
        return NextResponse.json({
          success: true,
          molecularFormula: parsed.molecularFormula || undefined,
          compoundName: parsed.compoundName || undefined,
          format: 'CIF',
          hint: 'CIF format contains crystal data. Search will use the molecular formula or compound name.',
        });
      }
    }

    // ─── .smi / .smiles files ──────────────────────────────────────────────
    if (fileName.endsWith('.smi') || fileName.endsWith('.smiles')) {
      const firstLine = content.split('\n')[0]?.trim();
      if (firstLine) {
        const parts = firstLine.split(/\s+/);
        return NextResponse.json({
          success: true,
          smiles: parts[0],
          compoundName: parts.slice(1).join(' ') || undefined,
          format: 'SMILES',
        });
      }
    }

    // ─── .smarts files ─────────────────────────────────────────────────────
    if (fileName.endsWith('.smarts')) {
      const parsed = parseSMARTS(content);
      if (parsed.smarts) {
        return NextResponse.json({
          success: true,
          smiles: parsed.smarts,
          compoundName: parsed.compoundName || undefined,
          format: 'SMARTS',
          hint: 'SMARTS pattern will be used for substructure search.',
        });
      }
    }

    // ─── .inchi files ──────────────────────────────────────────────────────
    if (fileName.endsWith('.inchi')) {
      const firstLine = content.split('\n')[0]?.trim();
      if (firstLine && firstLine.startsWith('InChI=')) {
        return NextResponse.json({
          success: true,
          inchi: firstLine,
          format: 'InChI',
        });
      }
    }

    // ─── .cml (Chemical Markup Language) ────────────────────────────────────
    if (fileName.endsWith('.cml')) {
      const parsed = parseCML(content);
      if (parsed.smiles || parsed.molecularFormula) {
        return NextResponse.json({
          success: true,
          smiles: parsed.smiles || undefined,
          molecularFormula: parsed.molecularFormula || undefined,
          compoundName: parsed.compoundName || undefined,
          format: 'CML',
        });
      }
    }

    // ─── .xyz (Cartesian coordinates) ──────────────────────────────────────
    if (fileName.endsWith('.xyz')) {
      const parsed = parseXYZ(content);
      if (parsed.atoms.length > 0) {
        return NextResponse.json({
          success: true,
          smiles: undefined,
          molecularFormula: parsed.molecularFormula || undefined,
          atomCount: parsed.atoms.length,
          format: 'XYZ',
          hint: 'XYZ format contains atom coordinates only (no bond info). Search will use the molecular formula.',
        });
      }
    }

    // ─── .cdxml (ChemDraw XML) ─────────────────────────────────────────────
    if (fileName.endsWith('.cdxml')) {
      const parsed = parseCDXML(content);
      if (parsed.smiles || parsed.molecularFormula) {
        return NextResponse.json({
          success: true,
          smiles: parsed.smiles || undefined,
          molecularFormula: parsed.molecularFormula || undefined,
          compoundName: parsed.compoundName || undefined,
          format: 'CDXML',
        });
      }
    }

    // ─── .json (various chem JSON formats) ────────────────────────────────
    if (fileName.endsWith('.json')) {
      const parsed = parseChemJSON(content);
      if (parsed.smiles || parsed.inchi || parsed.molecularFormula) {
        return NextResponse.json({
          success: true,
          smiles: parsed.smiles || undefined,
          inchi: parsed.inchi || undefined,
          molecularFormula: parsed.molecularFormula || undefined,
          compoundName: parsed.compoundName || undefined,
          format: 'JSON',
        });
      }
    }

    // ─── .txt (auto-detect content) ────────────────────────────────────────
    if (fileName.endsWith('.txt')) {
      const firstLine = content.split('\n')[0]?.trim();
      if (!firstLine) {
        return NextResponse.json({ error: 'Text file is empty.' }, { status: 400 });
      }

      // Check if it's InChI
      if (firstLine.startsWith('InChI=')) {
        return NextResponse.json({
          success: true,
          inchi: firstLine,
          format: 'InChI (from text)',
        });
      }

      // Check if it looks like SMILES
      if (/[CNcnOSoos]\d|[CNcnOSoos]\(|\([CNcnOSoos]/.test(firstLine) ||
        firstLine.includes('=') || firstLine.includes('#') || firstLine.includes('@@')) {
        const parts = firstLine.split(/\s+/);
        return NextResponse.json({
          success: true,
          smiles: parts[0],
          compoundName: parts.slice(1).join(' ') || undefined,
          format: 'SMILES (from text)',
        });
      }

      // Check if it looks like MOL file
      const lines = content.split('\n');
      if (lines.length >= 4 && lines[3]?.length >= 6) {
        const numAtoms = parseInt(lines[3].substring(0, 3), 10);
        const numBonds = parseInt(lines[3].substring(3, 6), 10);
        if (!isNaN(numAtoms) && !isNaN(numBonds) && numAtoms > 0 && numAtoms < 1000) {
          const parsed = parseMolFile(content);
          const smiles = molToSmiles(parsed.atoms, parsed.bonds);
          return NextResponse.json({
            success: true,
            smiles: smiles || undefined,
            molecularFormula: parsed.molecularFormula || undefined,
            compoundName: parsed.compoundName || undefined,
            atomCount: parsed.atoms.length,
            bondCount: parsed.bonds.length,
            format: 'MOL (auto-detected)',
          });
        }
      }

      // Treat as compound name
      return NextResponse.json({
        success: true,
        smiles: firstLine,
        compoundName: firstLine,
        format: 'Compound Name (from text)',
        hint: 'Content treated as compound name for search.',
      });
    }

    // ─── Auto-detect: try MOL format first ──────────────────────────────────
    const lines = content.split('\n');
    if (lines.length >= 4 && lines[3]?.length >= 6) {
      const numAtoms = parseInt(lines[3].substring(0, 3), 10);
      const numBonds = parseInt(lines[3].substring(3, 6), 10);
      if (!isNaN(numAtoms) && !isNaN(numBonds) && numAtoms > 0 && numAtoms < 1000) {
        const parsed = parseMolFile(content);
        const smiles = molToSmiles(parsed.atoms, parsed.bonds);
        return NextResponse.json({
          success: true,
          smiles: smiles || undefined,
          molecularFormula: parsed.molecularFormula || undefined,
          compoundName: parsed.compoundName || undefined,
          atomCount: parsed.atoms.length,
          bondCount: parsed.bonds.length,
          format: 'MOL (auto-detected)',
        });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Unsupported file format. Please upload .mol, .sdf, .mol2, .pdb, .cif, .smi, .smiles, .smarts, .inchi, .cml, .xyz, .cdxml, .json, or .txt files.',
    }, { status: 400 });
  } catch (error) {
    console.error('File upload parse error:', error);
    return NextResponse.json({ error: 'Failed to parse uploaded file.' }, { status: 500 });
  }
}
