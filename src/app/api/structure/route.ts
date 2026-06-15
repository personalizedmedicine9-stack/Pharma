import { NextRequest, NextResponse } from 'next/server';

// ─── Force dynamic rendering (fixes Next.js 16 "Failed to find Server Action" bug) ──
export const dynamic = 'force-dynamic';

// ─── PubChem PUG API Helper Functions ─────────────────────────────────────────

async function searchByName(query: string, maxRecords = 10): Promise<number[]> {
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/cids/JSON?MaxRecords=${maxRecords}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.IdentifierList?.CID ?? [];
}

async function searchByInChIKey(inchikey: string): Promise<number[]> {
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/inchikey/${encodeURIComponent(inchikey)}/cids/JSON`;
  const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.IdentifierList?.CID ?? [];
}

async function searchBySMILESorInChI(query: string): Promise<number[]> {
  const isSMILES = !query.trim().toLowerCase().startsWith('inchi=');
  const body = isSMILES ? { smarts: query } : { inchi: query };

  try {
    const fastUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/fastidentity/${isSMILES ? 'smiles' : 'inchi'}/cids/JSON?identity_type=same_tautomer`;
    const fastRes = await fetch(fastUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, MaxRecords: 10 }),
      signal: AbortSignal.timeout(15000),
    });
    if (fastRes.ok) {
      const data = await fastRes.json();
      const cids = data?.IdentifierList?.CID ?? [];
      if (cids.length > 0) return cids;
    }
  } catch { /* fallback below */ }

  const fallbackUrl = isSMILES
    ? `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(query)}/cids/JSON`
    : `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/inchi/${encodeURIComponent(query)}/cids/JSON`;
  const res = await fetch(fallbackUrl, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.IdentifierList?.CID ?? [];
}

async function searchBySimilarity(smiles: string, threshold = 90): Promise<number[]> {
  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/fastsimilarity_2d/smiles/cids/JSON?Threshold=${threshold}&MaxRecords=15`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ smarts: smiles, MaxRecords: 15 }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.IdentifierList?.CID ?? [];
  } catch {
    return [];
  }
}

async function searchByNameAutocomplete(query: string): Promise<string[]> {
  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${encodeURIComponent(query)}/json?limit=5`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.autocomplete?.suggestions?.map((s: { name: string }) => s.name) ?? [];
  } catch { return []; }
}

async function fetchCompoundProperties(cids: number[]) {
  if (cids.length === 0) return [];
  const cidStr = cids.join(',');
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cidStr}/property/MolecularFormula,MolecularWeight,IsomericSMILES,CanonicalSMILES,InChI,InChIKey,IUPACName,Title/JSON`;
  const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.PropertyTable?.Properties ?? [];
}

async function fetchSynonyms(cid: number): Promise<{ casNumber: string; synonyms: string[] }> {
  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/synonyms/TXT`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { casNumber: '', synonyms: [] };
    const text = await res.text();
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const casRegex = /\b\d{2,7}-\d{2}-\d\b/;
    return {
      casNumber: lines.find(l => casRegex.test(l)) || '',
      synonyms: lines.slice(0, 20),
    };
  } catch { return { casNumber: '', synonyms: [] }; }
}

async function fetchChEBI(query: string) {
  try {
    const url = `https://www.ebi.ac.uk/chebi/api/data/search?query=${encodeURIComponent(query)}&maxResults=1&stars=3`;
    const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const data = await res.json();
    const result = data?.searchResults?.[0];
    if (!result) return null;

    let sourceOrganism = '';
    let compoundClass = '';
    try {
      const entityUrl = `https://www.ebi.ac.uk/chebi/api/data/completeEntity?chebiId=${result.chebiId}`;
      const entityRes = await fetch(entityUrl, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) });
      if (entityRes.ok) {
        const entity = await entityRes.json();
        const origins = entity?.CompoundOrigins ?? [];
        if (origins.length > 0) sourceOrganism = origins[0]?.speciesText || origins[0]?.species || '';
        const parents = entity?.OntologyParents ?? [];
        if (parents.length > 0) compoundClass = parents.map((p: { chebiAsciiName: string }) => p.chebiAsciiName || '').filter(Boolean).slice(0, 3).join(', ');
      }
    } catch { /* ignore */ }

    return { chebiId: result.chebiId || '', chebiAsciiName: result.chebiAsciiName || '', sourceOrganism, compoundClass };
  } catch { return null; }
}

async function fetchNPAtlas(query: string) {
  try {
    const url = `https://www.npatlas.org/api/v1/compounds?name=${encodeURIComponent(query)}&limit=5`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map((c: Record<string, unknown>) => ({
      name: c.name || '',
      sourceOrganism: c.origin_organism || '',
      compoundClass: c.molecule_type || '',
      smiles: c.smiles || '',
      inchiKey: c.inchikey || '',
      reference: c.doi || '',
    }));
  } catch { return []; }
}

async function fetchPubMedRefs(query: string): Promise<string[]> {
  try {
    const term = `"${query}"[Title/Abstract] AND (natural product[Title/Abstract] OR phytochemistry[Title/Abstract] OR structure[Title/Abstract])`;
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(term)}&retmax=5&retmode=json&sort=relevance&tool=PhytoInsight&email=research@PhytoInsight.dev`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.esearchresult?.idlist ?? [];
  } catch { return []; }
}

// ─── Compound Class Classifier ────────────────────────────────────────────────

function classifyCompound(name: string): string {
  const n = name.toLowerCase();
  const rules: [RegExp, string][] = [
    [/curcumin/, 'Curcuminoids'],
    [/ginsenoside/, 'Saponins'],
    [/quercetin|rutin|kaempferol|luteolin|apigenin|myricetin|fisetin|baicalein/, 'Flavonoids'],
    [/berberine|vincamine|vinblastine|vincristine|camptothecin|quinine|morphine|codeine|caffeine|nicotine|atropine|cocaine|ephedrine|strychnine|colchicine|papaverine|reserpine|emetine|galantamine/, 'Alkaloids'],
    [/allicin|diallyl/, 'Sulfur Compounds'],
    [/gingerol|shogaol|capsaicin|piperine|zingerone|paradol/, 'Phenols'],
    [/hypericin|hyperforin|emodin|rhein|chrysophanol|physcion|aloe-emodin/, 'Anthraquinones'],
    [/silymarin|silibinin|silychristin|silydianin/, 'Flavonolignans'],
    [/ginkgolide|bilobalide|taxol|paclitaxel|artemisinin|menthol|limonene|pinene|linalool|carvone|thymol|carnosic|ursolic|oleanolic|betulinic|glycyrrhetinic/, 'Terpenoids'],
    [/egcg|epigallocatechin|catechin|epicatechin|theaflavin/, 'Catechins'],
    [/withaferin|withanolide/, 'Steroidal Lactones'],
    [/kavalactone|kavain|yangonin/, 'Lactones'],
    [/glycyrrhizin/, 'Saponins'],
    [/resveratrol|pterostilbene|combretastatin/, 'Stilbenes'],
    [/genistein|daidzein|glycitein|formononetin|biochanin/, 'Isoflavones'],
    [/lignan|podophyllotoxin|sesamin/, 'Lignans'],
    [/coumarin|esculetin|umbelliferone|scopoletin|bergapten|xanthotoxin|psoralen/, 'Coumarins/Furanocoumarins'],
    [/tannin|gallic acid|ellagic acid|proanthocyanidin/, 'Tannins/Polyphenols'],
    [/glucosinolate|sulforaphane|isothiocyanate/, 'Glucosinolates'],
    [/polysaccharide|beta-glucan|pectin|inulin/, 'Polysaccharides'],
    [/steroid|cholesterol|sitosterol|campesterol|stigmasterol|ergosterol|diosgenin/, 'Steroids/Phytosterols'],
    [/fatty acid|linoleic|oleic|palmitic|stearic|omega-3|eicosapentaenoic|docosahexaenoic/, 'Fatty Acids'],
    [/vitamin|ascorbic|tocopherol|retinol|thiamine|riboflavin|niacin|pyridoxine|cobalamin|folate/, 'Vitamins'],
    [/amino acid|theanine|tryptophan|tyrosine|arginine|glutamine/, 'Amino Acids'],
    [/peptide|cyclosporine|vancomycin|bleomycin/, 'Peptides/Cyclic Peptides'],
    [/penicillin|amoxicillin|ampicillin|cephalosporin|vancomycin|tetracycline|streptomycin|erythromycin|azithromycin/, 'Antibiotics'],
    [/statin|atorvastatin|simvastatin|lovastatin|pravastatin|rosuvastatin/, 'Statins'],
    [/nsaid|ibuprofen|aspirin|diclofenac|naproxen|celecoxib|indomethacin/, 'NSAIDs'],
    [/warfarin|heparin|clopidogrel|enoxaparin/, 'Anticoagulants/Antiplatelets'],
    [/prednisone|dexamethasone|cortisone|hydrocortisone|betamethasone/, 'Corticosteroids'],
    [/methotrexate|doxorubicin|cisplatin|5-fluorouracil|tamoxifen|imatinib/, 'Chemotherapeutics'],
    [/insulin|metformin|glipizide|glyburide|sitagliptin|pioglitazone/, 'Antidiabetics'],
  ];
  for (const [regex, cls] of rules) {
    if (regex.test(n)) return cls;
  }
  return 'Chemical Compound';
}

// ─── POST Handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, searchMode = 'exact' } = body;

    if (!query?.trim()) {
      return NextResponse.json(
        { error: 'Compound name, CAS number, SMILES, InChI, InChIKey, or CID is required.' },
        { status: 400 }
      );
    }

    const trimmed = query.trim();
    const isSMILES = /[CNcnOSoos]\d|[CNcnOSoos]\(|\([CNcnOSoos]/.test(trimmed) ||
      trimmed.includes('=') || trimmed.includes('#') || trimmed.includes('@@') ||
      trimmed.includes('\\') || (trimmed.includes('[') && trimmed.includes(']'));

    let cids: number[] = [];
    const sourcesUsed: string[] = [];

    // Route search based on searchMode
    if (searchMode === 'similarity' && isSMILES) {
      cids = await searchBySimilarity(trimmed);
      if (cids.length > 0) sourcesUsed.push('PubChem Similarity');
    } else {
      // Exact search: detect query type
      const queryType = detectQueryTypeSimple(trimmed);

      switch (queryType) {
        case 'cid':
          cids = [parseInt(trimmed, 10)];
          break;
        case 'inchikey':
          cids = await searchByInChIKey(trimmed);
          break;
        case 'inchi':
        case 'smiles':
          cids = await searchBySMILESorInChI(trimmed);
          break;
        default:
          cids = await searchByName(trimmed, 8);
          if (cids.length === 0) {
            const suggestions = await searchByNameAutocomplete(trimmed);
            for (const suggestion of suggestions.slice(0, 3)) {
              const suggestedCids = await searchByName(suggestion, 3);
              if (suggestedCids.length > 0) {
                cids = suggestedCids;
                break;
              }
            }
          }
          break;
      }

      if (cids.length > 0) sourcesUsed.push('PubChem');
    }

    const properties = await fetchCompoundProperties(cids);
    const chebiPromise = fetchChEBI(trimmed);
    const npatlasPromise = fetchNPAtlas(trimmed);
    const [chebiData, npatlasData] = await Promise.all([chebiPromise, npatlasPromise]);

    if (chebiData) sourcesUsed.push('ChEBI');
    if (npatlasData.length > 0) sourcesUsed.push('NPAtlas');

    const compounds = [];

    for (const prop of properties) {
      const { casNumber } = await fetchSynonyms(prop.CID);
      const npMatch = npatlasData.find(
        (np: { inchiKey: string; name: string }) =>
          np.inchiKey === prop.InChIKey || np.name.toLowerCase() === (prop.Title || '').toLowerCase()
      );
      const sourceOrganism = npMatch?.sourceOrganism || chebiData?.sourceOrganism || '';
      const compoundClass = npMatch?.compoundClass || chebiData?.compoundClass || classifyCompound(prop.Title || '');
      const pubmedRefs = await fetchPubMedRefs(prop.Title || trimmed);

      if (pubmedRefs.length > 0 && !sourcesUsed.includes('PubMed')) sourcesUsed.push('PubMed');

      compounds.push({
        name: prop.Title || trimmed,
        iupacName: prop.IUPACName || '',
        molecularFormula: prop.MolecularFormula || '',
        molecularWeight: prop.MolecularWeight ? parseFloat(prop.MolecularWeight) : 0,
        smiles: prop.IsomericSMILES || prop.CanonicalSMILES || '',
        inchi: prop.InChI || '',
        inchiKey: prop.InChIKey || '',
        casNumber,
        cid: prop.CID,
        chebiId: chebiData?.chebiId || '',
        imageUrl2D: `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${prop.CID}/PNG?image_size=large`,
        conformerId3D: '',
        sourceOrganism,
        compoundClass,
        pubmedReferences: pubmedRefs,
      });
    }

    if (compounds.length === 0 && npatlasData.length > 0) {
      for (const np of npatlasData) {
        const refs = await fetchPubMedRefs(np.name);
        compounds.push({
          name: np.name || trimmed,
          iupacName: '',
          molecularFormula: '',
          molecularWeight: 0,
          smiles: np.smiles,
          inchi: '',
          inchiKey: np.inchiKey,
          casNumber: '',
          cid: 0,
          chebiId: '',
          imageUrl2D: np.smiles
            ? `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(np.smiles)}/PNG?image_size=large`
            : '',
          conformerId3D: '',
          sourceOrganism: np.sourceOrganism,
          compoundClass: np.compoundClass || 'Natural Product',
          pubmedReferences: refs,
        });
      }
    }

    const totalResults = compounds.length;
    const noResultsMessage = totalResults === 0
      ? `No chemical structure data found for "${trimmed}" in PubChem, ChEBI, or NPAtlas. Try a different name, CAS number, SMILES string, InChI, or PubChem CID.`
      : undefined;

    let confidenceReasoning = '';
    if (totalResults > 0) {
      const parts: string[] = [];
      parts.push(`${totalResults} compound structure${totalResults > 1 ? 's' : ''} retrieved`);
      const withSmiles = compounds.filter(c => c.smiles).length;
      const withInchi = compounds.filter(c => c.inchi).length;
      const withSource = compounds.filter(c => c.sourceOrganism).length;
      const withPmids = compounds.filter(c => c.pubmedReferences.length > 0).length;
      if (withSmiles > 0) parts.push(`${withSmiles} with SMILES notation`);
      if (withInchi > 0) parts.push(`${withInchi} with InChI identifier`);
      if (withSource > 0) parts.push(`${withSource} with source organism data`);
      if (withPmids > 0) parts.push(`${withPmids} linked to PubMed references`);
      parts.push(`sources: ${sourcesUsed.join(', ')}`);
      confidenceReasoning = parts.join('; ') + '.';
    } else {
      confidenceReasoning = 'No structural data available from any queried source.';
    }

    return NextResponse.json({
      query: trimmed,
      compounds,
      totalResults,
      sourcesUsed,
      noResultsMessage,
      spellingCorrection: null,
      confidenceReasoning,
      searchMode,
    });
  } catch (error) {
    console.error('Structure search error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectQueryTypeSimple(query: string): string {
  const trimmed = query.trim();
  if (/^\d{1,9}$/.test(trimmed)) return 'cid';
  if (/^[A-Z]{14}-[A-Z]{10}-[A-Z]$/.test(trimmed)) return 'inchikey';
  if (/^InChI=/i.test(trimmed)) return 'inchi';
  if (/^\d{2,7}-\d{2}-\d$/.test(trimmed)) return 'cas';
  if (/[\[\]\\\/=#@]/.test(trimmed) || /^[A-Za-z0-9@\[\]\\\/#+-=.()]+$/.test(trimmed)) {
    if (/[CNcnOSoos]\d|[CNcnOSoos]\(|\([CNcnOSoos]/.test(trimmed) ||
      trimmed.includes('=') || trimmed.includes('#') || trimmed.includes('@@') ||
      trimmed.includes('\\') || (trimmed.includes('[') && trimmed.includes(']'))) {
      return 'smiles';
    }
  }
  return 'name';
}
