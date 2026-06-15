import { NextRequest, NextResponse } from 'next/server';
import {
  expandHerb,
  PHYTO_COMPOUNDS,
  HERB_METADATA,
  HIGH_IMPACT_JOURNALS,
  MEDIUM_IMPACT_JOURNALS,
  PHARM_ACTIONS,
  MECH_KEYWORDS,
  PHYTO_CLASS_COLORS,
} from '@/lib/knowledge-base';
import { correctAndNormalize } from '@/lib/spell-corrector';
import { normalizeMechanismName } from '@/lib/mechanism-taxonomy';
import type {
  PhytoInsightResponse,
  PhytoCompoundProfile,
  PhytoClassDistribution,
  PhytoPathwaySummary,
  PharmacologyAction,
  SpellingCorrection,
  PharmacologyReference,
  CompoundSuperclass,
  BiosyntheticPathway,
} from '@/lib/types';

// ─── Proximity check (same pattern as pharmacology route) ───

function isProximate(text: string, actionRegex: RegExp, mechRegex: RegExp, maxDist = 150): boolean {
  const actionPositions: number[] = [];
  let m: RegExpExecArray | null;
  const actionRe = new RegExp(actionRegex.source, actionRegex.flags);
  while ((m = actionRe.exec(text)) !== null) {
    actionPositions.push(m.index);
    if (actionPositions.length > 50) break;
  }
  if (actionPositions.length === 0) return false;

  const mechPositions: number[] = [];
  const mechRe = new RegExp(mechRegex.source, mechRegex.flags);
  while ((m = mechRe.exec(text)) !== null) {
    mechPositions.push(m.index);
    if (mechPositions.length > 50) break;
  }
  if (mechPositions.length === 0) return false;

  for (const ap of actionPositions) {
    for (const mp of mechPositions) {
      if (Math.abs(ap - mp) <= maxDist) return true;
    }
  }
  return false;
}

// ─── Article scoring (same pattern as pharmacology route) ───

function scoreArticle(a: { title: string; abstract: string; journal: string }): number {
  const t = ((a.title || '') + ' ' + (a.abstract || '')).toLowerCase();
  const j = (a.journal || '').toLowerCase();
  let ts = 5;
  if (t.includes('meta-analysis') || t.includes('meta analysis')) ts = 50;
  else if (t.includes('systematic review')) ts = 48;
  else if (t.includes('randomized controlled') || /\brct\b/.test(t)) ts = 45;
  else if (t.includes('cohort study') || t.includes('prospective study')) ts = 35;
  else if (/\brat\b|\bmice\b|\bin vivo\b/.test(t)) ts = 15;

  let ss = 0;
  const sm = t.match(/(?:n\s*=\s*)(\d{1,4}(?:,\d{3})*)/i);
  if (sm) {
    const n = parseInt(sm[1].replace(/,/g, ''));
    if (n >= 200) ss = 30;
    else if (n >= 100) ss = 25;
    else if (n >= 50) ss = 15;
    else if (n >= 20) ss = 10;
    else ss = 5;
  }

  let js = 0;
  if (HIGH_IMPACT_JOURNALS.some(jn => j.includes(jn))) js = 20;
  else if (MEDIUM_IMPACT_JOURNALS.some(jn => j.includes(jn))) js = 10;

  return ts + ss + js;
}

// ─── PubChem PUG REST helpers ───

interface PubChemPropertyResult {
  CID: number;
  IUPACName?: string;
  MolecularFormula?: string;
  MolecularWeight?: string;
  IsomericSMILES?: string;
  InChI?: string;
  InChIKey?: string;
}

async function getPubChemPropertiesByCid(cid: number): Promise<PubChemPropertyResult | null> {
  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/IUPACName,MolecularFormula,MolecularWeight,IsomericSMILES,InChI,InChIKey/JSON`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    const data = await res.json();
    const props = data?.PropertyTable?.Properties;
    if (Array.isArray(props) && props.length > 0) return props[0];
    return null;
  } catch {
    return null;
  }
}

async function getPubChemSynonymsAndCas(cid: number): Promise<string> {
  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/synonyms/TXT`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return '';
    const text = await res.text();
    const synonyms = text.split('\n').map(s => s.trim()).filter(Boolean);
    const casRegex = /\b\d{2,7}-\d{2}-\d\b/;
    const casMatch = synonyms.find(s => casRegex.test(s));
    return casMatch || '';
  } catch {
    return '';
  }
}

async function searchPubChemCidByName(name: string): Promise<number | null> {
  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/cids/JSON?MaxRecords=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    const data = await res.json();
    const cids = data?.IdentifierList?.CID ?? [];
    return cids.length > 0 ? cids[0] : null;
  } catch {
    return null;
  }
}

async function get3DConformerId(cid: number): Promise<string> {
  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/conformers/JSON?max_records=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return '';
    const data = await res.json();
    const conformerIds = data?.ConformerList?.ConformerID ?? [];
    return conformerIds.length > 0 ? String(conformerIds[0]) : '';
  } catch {
    return '';
  }
}

// ─── ChEBI helper ───

async function fetchChebiSourceOrganism(chebiId: string): Promise<string> {
  try {
    const url = `https://www.ebi.ac.uk/chebi/api/data/${encodeURIComponent(chebiId)}`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return '';
    const data = await res.json();
    const origins = data?.CompoundOrigins ?? [];
    if (origins.length > 0) {
      const org = origins[0];
      return org?.speciesText || org?.species || org?.source || '';
    }
    return '';
  } catch {
    return '';
  }
}

// ─── Confidence reasoning generator ───

function generatePhytoInsightReasoning(
  compounds: PhytoCompoundProfile[],
  actions: PharmacologyAction[],
  classDistribution: PhytoClassDistribution[],
  pathwaySummary: PhytoPathwaySummary[],
  evidenceLevel: string,
  confidence: string,
): string {
  if (compounds.length === 0 && actions.length === 0) {
    return 'No phytochemical or pharmacological evidence available for assessment.';
  }

  const parts: string[] = [];

  // Compound profile
  if (compounds.length > 0) {
    const majorCount = compounds.filter(c => c.isMajorConstituent).length;
    const withMolData = compounds.filter(c => c.molecularFormula).length;
    if (majorCount > 0) {
      parts.push(`${compounds.length} phytochemical compound${compounds.length > 1 ? 's' : ''} identified (${majorCount} major constituent${majorCount > 1 ? 's' : ''})`);
    } else {
      parts.push(`${compounds.length} phytochemical compound${compounds.length > 1 ? 's' : ''} identified from knowledge base`);
    }
    if (withMolData > 0) {
      parts.push(`${withMolData} with full molecular property data from PubChem`);
    }
  } else {
    parts.push('no specific phytochemical compounds validated from current evidence');
  }

  // Class distribution
  if (classDistribution.length > 0) {
    const topClass = classDistribution.reduce((a, b) => a.compoundCount > b.compoundCount ? a : b, classDistribution[0]);
    parts.push(`${classDistribution.length} compound class${classDistribution.length > 1 ? 'es' : ''} represented (predominant: ${topClass.className})`);
  }

  // Pathway summary
  if (pathwaySummary.length > 0) {
    const pathwayNames = pathwaySummary.map(p => p.pathway).join(', ');
    parts.push(`biosynthetic pathways: ${pathwayNames}`);
  }

  // Pharmacological actions
  if (actions.length > 0) {
    const highScore = actions.filter(a => a.score >= 80).length;
    const modScore = actions.filter(a => a.score >= 50 && a.score < 80).length;
    parts.push(`${actions.length} pharmacological action${actions.length > 1 ? 's' : ''} documented (${highScore} well-supported, ${modScore} moderately supported)`);
  }

  // Reference count
  const totalRefs = new Set(actions.flatMap(a => a.pmids)).size;
  if (totalRefs > 0) {
    parts.push(`${totalRefs} unique PubMed reference${totalRefs > 1 ? 's' : ''} identified`);
  }

  // Translational caution
  const hasHumanClinical = actions.some(a => a.score >= 50);
  if (!hasHumanClinical && actions.length > 0) {
    parts.push('predominance of preclinical evidence; findings do not establish clinical efficacy in humans');
  }

  // Confidence assessment
  if (confidence === 'Low') {
    if (compounds.length === 0) {
      parts.push('low confidence due to absence of identified phytochemical compounds and limited evidence');
    } else {
      parts.push('low confidence due to limited high-quality evidence; conclusions remain provisional');
    }
  } else if (confidence === 'Moderate') {
    parts.push('moderate confidence with some well-supported actions and identified compounds; however, human clinical validation remains limited');
  } else {
    parts.push('relatively robust phytochemical evidence base; however, heterogeneity in study designs warrants consideration when interpreting clinical applicability');
  }

  return parts.join('; ') + '.';
}

// ─── Main handler ───

export async function POST(req: NextRequest) {
  try {
    const { herb } = await req.json();
    if (!herb?.trim()) {
      return NextResponse.json({ error: 'Natural product name is required.' }, { status: 400 });
    }

    // 1. Apply spelling correction and synonym normalization
    const herbCorrection = correctAndNormalize(herb.trim());
    const herbName = herbCorrection.canonical || herbCorrection.corrected;

    // Build spelling correction info
    const spellingCorrection: SpellingCorrection | null =
      (herbCorrection.wasCorrected || herbCorrection.synonymApplied || herbCorrection.suggestion)
        ? {
            original: herbCorrection.original,
            corrected: herbCorrection.corrected,
            canonical: herbCorrection.canonical !== herbCorrection.corrected ? herbCorrection.canonical : undefined,
            synonymApplied: herbCorrection.synonymApplied,
            wasAutoCorrected: herbCorrection.wasCorrected,
          }
        : null;

    // 2. Expand herb aliases
    const herbTerms = expandHerb(herbName);

    // 3. Look up herb metadata
    const herbLower = herbName.toLowerCase();
    const metadata = HERB_METADATA[herbLower] || null;

    // 4. Search PubMed for phytochemical articles
    const herbQuery = herbTerms.map(t => `"${t}"[Title/Abstract]`).join(' OR ');
    const query = `(${herbQuery}) AND (phytochemistry[Title/Abstract] OR phytochemical[Title/Abstract] OR chemical composition[Title/Abstract] OR active compound[Title/Abstract] OR bioactive compound[Title/Abstract])`;

    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=30&retmode=json&sort=relevance&tool=PharmaInsight&email=research@pharmainsight.dev`;
    const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(15000) });
    if (!searchRes.ok) {
      return NextResponse.json({ error: 'PubMed search failed.' }, { status: 502 });
    }

    const searchData = await searchRes.json();
    const ids: string[] = searchData?.esearchresult?.idlist ?? [];

    if (ids.length === 0) {
      // Try to return knowledge-base compounds even without PubMed results
      const matchedCompounds = PHYTO_COMPOUNDS.filter(c =>
        c.herbs.some(h => herbLower.includes(h) || h.includes(herbLower))
      );

      if (matchedCompounds.length === 0) {
        return NextResponse.json({
          herb: herbName,
          herbCanonicalName: metadata?.botanicalName || herbName,
          herbFamily: metadata?.family,
          herbPartUsed: metadata?.partUsed,
          compounds: [],
          classDistribution: [],
          pathwaySummary: [],
          pharmacologicalActions: [],
          evidenceLevel: 'No Evidence',
          confidence: 'Low',
          sourcesUsed: [],
          noResultsMessage: 'No phytochemical evidence found in PubMed for this natural product, and no compounds are listed in the knowledge base.',
          spellingCorrection,
          confidenceReasoning: 'No phytochemical or pharmacological evidence available for assessment.',
        } satisfies PhytoInsightResponse);
      }

      // Build compounds from knowledge base only (no PubMed articles)
      const compoundProfiles: PhytoCompoundProfile[] = matchedCompounds.map((c, idx) => ({
        name: c.name,
        iupacName: '',
        molecularFormula: '',
        molecularWeight: 0,
        smiles: '',
        inchi: '',
        inchiKey: '',
        casNumber: '',
        cid: c.pubchemCid || 0,
        chebiId: c.chebiId || '',
        imageUrl2D: c.pubchemCid
          ? `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${c.pubchemCid}/PNG?image_size=large`
          : '',
        conformerId3D: '',
        sourceOrganism: metadata?.botanicalName || '',
        compoundClass: c.category,
        superclass: c.superclass,
        biosyntheticPathway: c.biosyntheticPathway,
        pharmacologicalActions: c.pharmacologicalActions,
        isMajorConstituent: c.isMajorConstituent || false,
        typicalConcentration: c.typicalConcentration,
        pubmedReferences: [],
        abundanceRank: idx + 1,
      }));

      // Build class distribution
      const classMap = new Map<string, { count: number; majors: string[]; superclass: CompoundSuperclass }>();
      for (const comp of compoundProfiles) {
        const key = comp.compoundClass;
        if (!classMap.has(key)) {
          classMap.set(key, { count: 0, majors: [], superclass: comp.superclass });
        }
        const entry = classMap.get(key)!;
        entry.count++;
        if (comp.isMajorConstituent) entry.majors.push(comp.name);
      }

      const classDistribution: PhytoClassDistribution[] = Array.from(classMap.entries()).map(([className, data]) => ({
        className,
        superclass: data.superclass,
        compoundCount: data.count,
        majorCompounds: data.majors,
        color: PHYTO_CLASS_COLORS[className] || '#6B7280',
      }));

      // Build pathway summary
      const pathwayMap = new Map<string, string[]>();
      for (const comp of compoundProfiles) {
        const pw = comp.biosyntheticPathway;
        if (!pathwayMap.has(pw)) pathwayMap.set(pw, []);
        pathwayMap.get(pw)!.push(comp.name);
      }

      const pathwaySummary: PhytoPathwaySummary[] = Array.from(pathwayMap.entries()).map(([pathway, compounds]) => ({
        pathway: pathway as BiosyntheticPathway,
        compoundCount: compounds.length,
        representativeCompounds: compounds.slice(0, 5),
      }));

      return NextResponse.json({
        herb: herbName,
        herbCanonicalName: metadata?.botanicalName || herbName,
        herbFamily: metadata?.family,
        herbPartUsed: metadata?.partUsed,
        compounds: compoundProfiles,
        classDistribution,
        pathwaySummary,
        pharmacologicalActions: [],
        evidenceLevel: 'Low',
        confidence: 'Low',
        sourcesUsed: ['Knowledge Base'],
        noResultsMessage: 'No phytochemistry articles found in PubMed. Compounds are derived from the internal knowledge base only.',
        spellingCorrection,
        confidenceReasoning: generatePhytoInsightReasoning(compoundProfiles, [], classDistribution, pathwaySummary, 'Low', 'Low'),
      } satisfies PhytoInsightResponse);
    }

    // 5. Fetch article details from PubMed
    const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids.join(',')}&retmode=xml&tool=PharmaInsight&email=research@pharmainsight.dev`;
    const fetchRes = await fetch(fetchUrl, { signal: AbortSignal.timeout(15000) });
    if (!fetchRes.ok) {
      return NextResponse.json({ error: 'PubMed fetch failed.' }, { status: 502 });
    }

    const xml = await fetchRes.text();
    const articles: {
      pmid: string;
      title: string;
      abstract: string;
      journal: string;
      doi?: string;
      authors: string[];
      pubYear: string;
    }[] = [];

    const articleRegex = /<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g;
    let match;
    while ((match = articleRegex.exec(xml)) !== null) {
      const chunk = match[0];
      const pmid = chunk.match(/<PMID[^>]*>(\d+)<\/PMID>/)?.[1] ?? '';
      const title = chunk.match(/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/)?.[1]?.replace(/<[^>]+>/g, '').trim() ?? '';
      const journal = chunk.match(/<ISOAbbreviation>([\s\S]*?)<\/ISOAbbreviation>/)?.[1]?.replace(/<[^>]+>/g, '').trim() ?? '';
      const abstract = [...chunk.matchAll(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g)].map(m => m[1].replace(/<[^>]+>/g, '').trim()).join(' ');
      const doi = chunk.match(/<ArticleId IdType="doi">([^<]+)<\/ArticleId>/)?.[1];
      const authors: string[] = [];
      const authorRegex = /<Author[^>]*>([\s\S]*?)<\/Author>/g;
      let authorMatch;
      while ((authorMatch = authorRegex.exec(chunk)) !== null) {
        const authorChunk = authorMatch[1];
        const lastName = authorChunk.match(/<LastName>([\s\S]*?)<\/LastName>/)?.[1]?.trim() ?? '';
        const foreName = authorChunk.match(/<ForeName>([\s\S]*?)<\/ForeName>/)?.[1]?.trim() ?? '';
        const initials = authorChunk.match(/<Initials>([\s\S]*?)<\/Initials>/)?.[1]?.trim() ?? '';
        if (lastName) {
          authors.push(foreName ? `${lastName} ${initials || foreName.charAt(0)}` : lastName);
        }
      }
      const pubYear = chunk.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/)?.[1]
        ?? chunk.match(/<PubDate>[\s\S]*?<MedlineDate>(\d{4})<\/MedlineDate>/)?.[1]
        ?? '';
      if (pmid && title) articles.push({ pmid, title, abstract, journal, doi, authors, pubYear });
    }

    const sourcesUsed: string[] = ['PubMed'];

    // 6. Match compounds from PHYTO_COMPOUNDS
    const matchedCompounds = PHYTO_COMPOUNDS.filter(c =>
      c.herbs.some(h => herbLower.includes(h) || h.includes(herbLower))
    );

    // 7. Build PhytoCompoundProfile for each matched compound
    const compoundProfiles: PhytoCompoundProfile[] = [];

    for (let idx = 0; idx < matchedCompounds.length; idx++) {
      const compound = matchedCompounds[idx];
      const baseName = compound.name.split('(')[0].trim();
      const regex = new RegExp(`\\b${baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      const matchedArticles = articles.filter(a => regex.test(a.title + ' ' + a.abstract));
      const pmids = matchedArticles.slice(0, 5).map(a => a.pmid);

      let iupacName = '';
      let molecularFormula = '';
      let molecularWeight = 0;
      let smiles = '';
      let inchi = '';
      let inchiKey = '';
      let casNumber = '';
      let cid = 0;
      let imageUrl2D = '';
      let conformerId3D = '';
      let sourceOrganism = metadata?.botanicalName || '';

      // 8. For compounds with pubchemCid, fetch molecular properties
      if (compound.pubchemCid) {
        cid = compound.pubchemCid;
        imageUrl2D = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG?image_size=large`;

        // Fetch properties and synonyms in parallel
        const [propsResult, casResult, conformerResult] = await Promise.all([
          getPubChemPropertiesByCid(cid),
          getPubChemSynonymsAndCas(cid),
          get3DConformerId(cid),
        ]);

        if (propsResult) {
          iupacName = propsResult.IUPACName || '';
          molecularFormula = propsResult.MolecularFormula || '';
          molecularWeight = propsResult.MolecularWeight ? parseFloat(propsResult.MolecularWeight) : 0;
          smiles = propsResult.IsomericSMILES || '';
          inchi = propsResult.InChI || '';
          inchiKey = propsResult.InChIKey || '';
        }

        casNumber = casResult;
        conformerId3D = conformerResult;

        if (!sourcesUsed.includes('PubChem')) sourcesUsed.push('PubChem');
      } else {
        // 9. For compounds without pubchemCid, try searching by name on PubChem
        const foundCid = await searchPubChemCidByName(compound.name);
        if (foundCid) {
          cid = foundCid;
          imageUrl2D = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG?image_size=large`;

          const [propsResult, casResult, conformerResult] = await Promise.all([
            getPubChemPropertiesByCid(cid),
            getPubChemSynonymsAndCas(cid),
            get3DConformerId(cid),
          ]);

          if (propsResult) {
            iupacName = propsResult.IUPACName || '';
            molecularFormula = propsResult.MolecularFormula || '';
            molecularWeight = propsResult.MolecularWeight ? parseFloat(propsResult.MolecularWeight) : 0;
            smiles = propsResult.IsomericSMILES || '';
            inchi = propsResult.InChI || '';
            inchiKey = propsResult.InChIKey || '';
          }

          casNumber = casResult;
          conformerId3D = conformerResult;

          if (!sourcesUsed.includes('PubChem')) sourcesUsed.push('PubChem');
        }
      }

      // ChEBI enrichment for source organism info
      if (compound.chebiId) {
        const chebiSource = await fetchChebiSourceOrganism(compound.chebiId);
        if (chebiSource && !sourceOrganism) {
          sourceOrganism = chebiSource;
        }
        if (!sourcesUsed.includes('ChEBI')) sourcesUsed.push('ChEBI');
      }

      compoundProfiles.push({
        name: compound.name,
        iupacName,
        molecularFormula,
        molecularWeight,
        smiles,
        inchi,
        inchiKey,
        casNumber,
        cid,
        chebiId: compound.chebiId || '',
        imageUrl2D,
        conformerId3D,
        sourceOrganism,
        compoundClass: compound.category,
        superclass: compound.superclass,
        biosyntheticPathway: compound.biosyntheticPathway,
        pharmacologicalActions: compound.pharmacologicalActions,
        isMajorConstituent: compound.isMajorConstituent || false,
        typicalConcentration: compound.typicalConcentration,
        pubmedReferences: pmids,
        abundanceRank: idx + 1,
      });
    }

    // 10. Build PhytoClassDistribution
    const classMap = new Map<string, { count: number; majors: string[]; superclass: CompoundSuperclass }>();
    for (const comp of compoundProfiles) {
      const key = comp.compoundClass;
      if (!classMap.has(key)) {
        classMap.set(key, { count: 0, majors: [], superclass: comp.superclass });
      }
      const entry = classMap.get(key)!;
      entry.count++;
      if (comp.isMajorConstituent) entry.majors.push(comp.name);
    }

    const classDistribution: PhytoClassDistribution[] = Array.from(classMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .map(([className, data]) => ({
        className,
        superclass: data.superclass,
        compoundCount: data.count,
        majorCompounds: data.majors,
        color: PHYTO_CLASS_COLORS[className] || '#6B7280',
      }));

    // 11. Build PhytoPathwaySummary
    const pathwayMap = new Map<string, string[]>();
    for (const comp of compoundProfiles) {
      const pw = comp.biosyntheticPathway;
      if (!pathwayMap.has(pw)) pathwayMap.set(pw, []);
      pathwayMap.get(pw)!.push(comp.name);
    }

    const pathwaySummary: PhytoPathwaySummary[] = Array.from(pathwayMap.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .map(([pathway, compounds]) => ({
        pathway: pathway as BiosyntheticPathway,
        compoundCount: compounds.length,
        representativeCompounds: compounds.slice(0, 5),
      }));

    // 12. Extract pharmacological actions — cross-reference with PubMed articles
    // Using the same pattern as the pharmacology route with PHARM_ACTIONS and MECH_KEYWORDS
    const seenActions = new Set<string>();
    const actions: PharmacologyAction[] = PHARM_ACTIONS.map(action => {
      const key = (action || '').toLowerCase();
      if (seenActions.has(key)) return null;
      seenActions.add(key);

      const actionRegex = new RegExp(`\\b${action.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      const matched = articles.filter(a => actionRegex.test(a.title + ' ' + a.abstract));
      if (matched.length === 0) return null;

      const score = Math.max(...matched.map(scoreArticle));

      // Build mechanisms with normalization + proximity check
      const seenMechanisms = new Set<string>();
      const mechanisms = MECH_KEYWORDS.map(m => {
        const displayName = normalizeMechanismName(m);
        const normalizedKey = (displayName || '').toLowerCase();
        if (seenMechanisms.has(normalizedKey)) return null;
        seenMechanisms.add(normalizedKey);

        const mechRegex = new RegExp(`\\b${m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        const mm = matched.filter(a => mechRegex.test(a.title + ' ' + a.abstract));
        if (mm.length === 0) return null;

        // Proximity filter: action + mechanism must co-occur within 150 chars
        const proximate = mm.filter(a => {
          const text = a.title + ' ' + a.abstract;
          return isProximate(text, actionRegex, mechRegex, 150);
        });
        if (proximate.length === 0) return null;

        return { name: displayName, pmids: proximate.map(a => a.pmid) };
      }).filter((m): m is { name: string; pmids: string[] } => m !== null);

      const finalMechanisms = mechanisms.length > 0
        ? mechanisms
        : [{ name: 'Mechanism not explicitly characterized in the cited literature', pmids: [] }];

      return { name: action, pmids: matched.slice(0, 3).map(a => a.pmid), score, mechanisms: finalMechanisms };
    }).filter((a): a is PharmacologyAction => a !== null);

    // 13. Score articles and determine evidence level and confidence
    const bestScore = actions.length > 0 ? Math.max(...actions.map(a => a.score)) : 0;
    const conf: 'High' | 'Moderate' | 'Low' = bestScore >= 80 ? 'High' : bestScore >= 50 ? 'Moderate' : 'Low';
    let ev: 'High' | 'Moderate' | 'Low' | 'No Evidence' = 'Low';
    if (actions.length === 0 && compoundProfiles.length === 0) ev = 'No Evidence';
    else if (bestScore >= 80) ev = 'High';
    else if (bestScore >= 50) ev = 'Moderate';

    // 14. Generate confidence reasoning
    const confidenceReasoning = generatePhytoInsightReasoning(
      compoundProfiles,
      actions,
      classDistribution,
      pathwaySummary,
      ev,
      conf,
    );

    // Build references array with full academic metadata
    const references: PharmacologyReference[] = articles.map(a => ({
      pmid: a.pmid,
      title: a.title,
      authors: a.authors,
      journal: a.journal,
      pubYear: a.pubYear,
      doi: a.doi,
    }));

    // 15. Return PhytoInsightResponse
    const result: PhytoInsightResponse = {
      herb: herbName,
      herbCanonicalName: metadata?.botanicalName || herbName,
      herbFamily: metadata?.family,
      herbPartUsed: metadata?.partUsed,
      compounds: compoundProfiles,
      classDistribution,
      pathwaySummary,
      pharmacologicalActions: actions,
      evidenceLevel: ev,
      confidence: conf,
      sourcesUsed,
      spellingCorrection,
      confidenceReasoning,
      references,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('PhytoInsight search error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
