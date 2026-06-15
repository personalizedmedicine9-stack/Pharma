export interface ActiveCompound {
  name: string;
  herbs: string[];
  category: string;
}

export const ACTIVE_COMPOUNDS: ActiveCompound[] = [
  { name: "Curcumin", herbs: ["turmeric", "curcuma longa"], category: "Curcuminoids" },
  { name: "Turmerone", herbs: ["turmeric", "curcuma longa"], category: "Sesquiterpenes" },
  { name: "Gingerol", herbs: ["ginger", "zingiber officinale"], category: "Phenols" },
  { name: "Shogaol", herbs: ["ginger", "zingiber officinale"], category: "Phenols" },
  { name: "Zingerone", herbs: ["ginger", "zingiber officinale"], category: "Phenols" },
  { name: "Hypericin", herbs: ["st. john's wort", "hypericum perforatum"], category: "Anthraquinones" },
  { name: "Hyperforin", herbs: ["st. john's wort", "hypericum perforatum"], category: "Phthalides" },
  { name: "Ginsenosides (Rb1, Rg1)", herbs: ["ginseng", "panax ginseng"], category: "Saponins" },
  { name: "Allicin", herbs: ["garlic", "allium sativum"], category: "Sulfur Compounds" },
  { name: "S-allyl cysteine", herbs: ["garlic", "allium sativum"], category: "Sulfur Compounds" },
  { name: "Silymarin", herbs: ["milk thistle", "silybum marianum"], category: "Flavonolignans" },
  { name: "Silibinin", herbs: ["milk thistle", "silybum marianum"], category: "Flavonolignans" },
  { name: "Ginkgolides", herbs: ["ginkgo biloba", "ginkgo"], category: "Terpenoids" },
  { name: "Bilobalide", herbs: ["ginkgo biloba", "ginkgo"], category: "Terpenoids" },
  { name: "Quercetin", herbs: ["onion", "apple", "capers", "berries"], category: "Flavonoids" },
  { name: "Rutin", herbs: ["apple", "buckwheat", "citrus"], category: "Flavonoids" },
  { name: "Epigallocatechin gallate (EGCG)", herbs: ["green tea", "camellia sinensis"], category: "Catechins" },
  { name: "L-theanine", herbs: ["green tea", "camellia sinensis"], category: "Amino Acids" },
  { name: "Berberine", herbs: ["berberine", "berberis vulgaris", "goldenseal"], category: "Alkaloids" },
  { name: "Withanolides", herbs: ["ashwagandha", "withania somnifera"], category: "Steroidal Lactones" },
  { name: "Withaferin A", herbs: ["ashwagandha", "withania somnifera"], category: "Steroidal Lactones" },
  { name: "Kavalactones", herbs: ["kava", "piper methysticum"], category: "Lactones" },
  { name: "Glycyrrhizin", herbs: ["licorice", "glycyrrhiza glabra"], category: "Saponins" },
  { name: "Glabridin", herbs: ["licorice", "glycyrrhiza glabra"], category: "Flavonoids" },
  { name: "Echinacoside", herbs: ["echinacea", "echinacea purpurea"], category: "Phenylpropanoids" },
  { name: "Valerenic acid", herbs: ["valerian", "valeriana officinalis"], category: "Sesquiterpenes" },
  { name: "Vincamine", herbs: ["valerian", "vinca minor"], category: "Alkaloids" },
  { name: "Flavonoids", herbs: ["*"], category: "Polyphenols" },
  { name: "Alkaloids", herbs: ["*"], category: "Alkaloids" },
  { name: "Terpenes", herbs: ["*"], category: "Terpenoids" },
  { name: "Tannins", herbs: ["*"], category: "Polyphenols" },
  { name: "Essential Oils", herbs: ["*"], category: "Volatile Compounds" },
];

export const HERB_ALIASES: Record<string, string[]> = {
  "ginkgo biloba": ["ginkgo", "EGb 761"],
  "ginseng": ["panax ginseng", "asian ginseng", "korean ginseng", "american ginseng", "ginsenoside"],
  "curcumin": ["curcumin", "turmeric", "curcuma longa", "diferuloylmethane"],
  "st. john's wort": ["hypericum perforatum", "saint john's wort", "hypericin", "hyperforin", "st john wort"],
  "garlic": ["allium sativum", "allicin"],
  "echinacea": ["echinacea purpurea", "echinacea angustifolia", "coneflower"],
  "valerian": ["valeriana officinalis"],
  "milk thistle": ["silybum marianum", "silymarin"],
  "kava": ["piper methysticum", "kavalactone"],
  "black cohosh": ["actaea racemosa", "cimicifuga"],
  "ginger": ["zingiber officinale", "gingerol"],
  "licorice": ["glycyrrhiza glabra", "glycyrrhizin"],
  "green tea": ["camellia sinensis", "epigallocatechin", "egcg"],
  "berberine": ["berberis vulgaris"],
  "ashwagandha": ["withania somnifera", "withanolide"],
};

export const HIGH_IMPACT_JOURNALS = [
  "new england journal of medicine", "nejm", "lancet", "jama", "bmj",
  "nature", "science", "cell", "annals of internal medicine", "circulation",
  "journal of the american college of cardiology", "clinical pharmacology",
  "british journal of clinical pharmacology", "european journal of clinical pharmacology",
  "drug metabolism", "pharmacotherapy", "journal of clinical pharmacology",
  "phytomedicine", "journal of ethnopharmacology", "clinical pharmacokinetics",
  "drug safety", "british journal of pharmacology",
];

export const MEDIUM_IMPACT_JOURNALS = [
  "plos", "evidence-based complementary", "complementary therapies",
  "alternative medicine", "integrative medicine", "herbal medicine",
  "natural product", "phytotherapy", "pharmacognosy",
  "frontiers in pharmacology", "molecules", "nutrients",
  "international journal of molecular sciences", "biomedicines",
];

export const PHARM_ACTIONS = [
  "anti-inflammatory", "antioxidant", "antimicrobial", "antifungal", "antiviral",
  "anticoagulant", "antiplatelet", "antidiabetic", "antihypertensive", "anticancer",
  "hepatoprotective", "neuroprotective", "cardioprotective", "immunomodulatory",
  "anxiolytic", "sedative", "analgesic", "antipyretic", "adaptogenic",
  "antispasmodic", "diuretic", "expectorant", "astringent", "estrogenic",
];

export const MECH_KEYWORDS = [
  "nf-kb", "nf-κb", "cyp3a4", "cyp2d6", "cyp2c9", "cyp2c19", "cyp1a2",
  "p-glycoprotein", "cox-2", "cox-1", "tnf-alpha", "il-6", "il-1",
  "mtor", "pi3k", "mapk", "erk", "jak-stat", "nrf2", "apoptosis", "autophagy",
  "oxidative stress", "free radical", "ros", "nitric oxide", "no synthase",
  "serotonin reuptake", "monoamine oxidase", "acetylcholinesterase",
  "hmg-coa", "ppar", "amp kinase", "ampk",
];

export const EXAMPLE_SEARCHES = [
  { drug: "Warfarin", herb: "St. John's Wort" },
  { drug: "Cyclosporine", herb: "Ginkgo biloba" },
  { drug: "Metformin", herb: "Ginseng" },
  { drug: "Atorvastatin", herb: "Garlic" },
  { drug: "Tacrolimus", herb: "Curcumin" },
];

export const EXAMPLE_HERBS = [
  "St. John's Wort",
  "Ginkgo biloba",
  "Turmeric",
  "Ginseng",
  "Milk Thistle",
  "Garlic",
];

export const API_SOURCES = [
  { name: "PubMed", desc: "Biomedical Literature", color: "bg-blue-500" },
  { name: "CrossRef", desc: "DOI Resolution", color: "bg-indigo-500" },
  { name: "OpenAlex", desc: "Citation Metrics", color: "bg-violet-500" },
  { name: "OpenFDA", desc: "Drug Safety Labels", color: "bg-amber-500" },
  { name: "PubChem", desc: "Chemical Structures", color: "bg-cyan-500" },
  { name: "ChEBI", desc: "Biochemical Ontology", color: "bg-teal-500" },
  { name: "NPAtlas", desc: "Natural Product Atlas", color: "bg-lime-500" },
];

// ─── Chemical Structure Feature ───

/** Quick example compounds for the Chemical Structure page */
export const EXAMPLE_COMPOUNDS = [
  "Curcumin",
  "Quercetin",
  "Berberine",
  "EGCG",
  "Paclitaxel",
  "Aspirin",
  "Artemisinin",
  "Caffeine",
  "Resveratrol",
  "Morphine",
];

// ─── PhytoInsight: Deep Phytochemical Intelligence ───

export interface PhytoCompoundEntry {
  name: string;
  herbs: string[];
  category: string;
  superclass: "Alkaloids" | "Terpenoids" | "Flavonoids" | "Phenylpropanoids" | "Polyketides" | "Fatty Acid Derivatives" | "Glucosinolates" | "Cyanogenic Glycosides" | "Sulfur Compounds" | "Other";
  biosyntheticPathway: "Shikimate Pathway" | "Mevalonate Pathway" | "Methylerythritol Phosphate Pathway" | "Polyketide Pathway" | "Alkaloid Biosynthesis" | "Mixed Biosynthesis";
  pharmacologicalActions: string[];
  isMajorConstituent?: boolean;
  typicalConcentration?: string;
  pubchemCid?: number;
  chebiId?: string;
}

export const PHYTO_COMPOUNDS: PhytoCompoundEntry[] = [
  // Turmeric (Curcuma longa)
  { name: "Curcumin", herbs: ["turmeric", "curcuma longa"], category: "Curcuminoids", superclass: "Polyketides", biosyntheticPathway: "Polyketide Pathway", pharmacologicalActions: ["anti-inflammatory", "antioxidant", "anticancer", "antimicrobial"], isMajorConstituent: true, typicalConcentration: "2-5% of rhizome", pubchemCid: 969516, chebiId: "CHEBI:3962" },
  { name: "Demethoxycurcumin", herbs: ["turmeric", "curcuma longa"], category: "Curcuminoids", superclass: "Polyketides", biosyntheticPathway: "Polyketide Pathway", pharmacologicalActions: ["anti-inflammatory", "antioxidant"], isMajorConstituent: true, typicalConcentration: "0.5-2% of rhizome", pubchemCid: 54694248 },
  { name: "Bisdemethoxycurcumin", herbs: ["turmeric", "curcuma longa"], category: "Curcuminoids", superclass: "Polyketides", biosyntheticPathway: "Polyketide Pathway", pharmacologicalActions: ["anti-inflammatory", "antioxidant"], typicalConcentration: "0.3-1% of rhizome", pubchemCid: 5315472 },
  { name: "Turmerone", herbs: ["turmeric", "curcuma longa"], category: "Sesquiterpenes", superclass: "Terpenoids", biosyntheticPathway: "Mevalonate Pathway", pharmacologicalActions: ["anti-inflammatory", "neuroprotective"], isMajorConstituent: true, typicalConcentration: "10-15% of essential oil", pubchemCid: 119092, chebiId: "CHEBI:9703" },
  { name: "Ar-Turmerone", herbs: ["turmeric", "curcuma longa"], category: "Sesquiterpenes", superclass: "Terpenoids", biosyntheticPathway: "Mevalonate Pathway", pharmacologicalActions: ["anti-inflammatory", "antioxidant"], typicalConcentration: "5-10% of essential oil", pubchemCid: 5363020 },

  // Ginger (Zingiber officinale)
  { name: "Gingerol", herbs: ["ginger", "zingiber officinale"], category: "Phenols", superclass: "Polyketides", biosyntheticPathway: "Polyketide Pathway", pharmacologicalActions: ["anti-inflammatory", "antioxidant", "analgesic", "antipyretic"], isMajorConstituent: true, typicalConcentration: "1-3% of rhizome", pubchemCid: 442793, chebiId: "CHEBI:10136" },
  { name: "Shogaol", herbs: ["ginger", "zingiber officinale"], category: "Phenols", superclass: "Polyketides", biosyntheticPathway: "Polyketide Pathway", pharmacologicalActions: ["anti-inflammatory", "anticancer", "antioxidant"], isMajorConstituent: true, typicalConcentration: "0.2-1% of rhizome (dried)", pubchemCid: 5281791 },
  { name: "Zingerone", herbs: ["ginger", "zingiber officinale"], category: "Phenols", superclass: "Polyketides", biosyntheticPathway: "Polyketide Pathway", pharmacologicalActions: ["anti-inflammatory", "antioxidant", "antimicrobial"], typicalConcentration: "0.1-0.5% of rhizome", pubchemCid: 31211 },
  { name: "Zingiberene", herbs: ["ginger", "zingiber officinale"], category: "Sesquiterpenes", superclass: "Terpenoids", biosyntheticPathway: "Mevalonate Pathway", pharmacologicalActions: ["anti-inflammatory"], typicalConcentration: "30-40% of essential oil", pubchemCid: 92776 },

  // St. John's Wort (Hypericum perforatum)
  { name: "Hypericin", herbs: ["st. john's wort", "hypericum perforatum"], category: "Anthraquinones", superclass: "Polyketides", biosyntheticPathway: "Polyketide Pathway", pharmacologicalActions: ["antiviral", "antidepressant", "anticancer"], isMajorConstituent: true, typicalConcentration: "0.1-0.3% of aerial parts", pubchemCid: 5281643, chebiId: "CHEBI:5830" },
  { name: "Hyperforin", herbs: ["st. john's wort", "hypericum perforatum"], category: "Phthalides", superclass: "Polyketides", biosyntheticPathway: "Polyketide Pathway", pharmacologicalActions: ["antidepressant", "antimicrobial", "anti-inflammatory"], isMajorConstituent: true, typicalConcentration: "2-4% of aerial parts", pubchemCid: 114787, chebiId: "CHEBI:7920" },
  { name: "Quercetin", herbs: ["st. john's wort", "hypericum perforatum", "onion", "apple", "capers", "berries"], category: "Flavonoids", superclass: "Flavonoids", biosyntheticPathway: "Shikimate Pathway", pharmacologicalActions: ["antioxidant", "anti-inflammatory", "antiviral", "anticancer"], typicalConcentration: "0.5-2% of aerial parts", pubchemCid: 5280343, chebiId: "CHEBI:16243" },
  { name: "Rutin", herbs: ["st. john's wort", "hypericum perforatum", "apple", "buckwheat", "citrus"], category: "Flavonoids", superclass: "Flavonoids", biosyntheticPathway: "Shikimate Pathway", pharmacologicalActions: ["antioxidant", "anti-inflammatory", "neuroprotective"], typicalConcentration: "0.5-1.5%", pubchemCid: 5280805, chebiId: "CHEBI:28510" },

  // Ginkgo biloba
  { name: "Ginkgolide A", herbs: ["ginkgo biloba", "ginkgo"], category: "Terpenoids", superclass: "Terpenoids", biosyntheticPathway: "Mevalonate Pathway", pharmacologicalActions: ["neuroprotective", "antiplatelet", "cardioprotective"], isMajorConstituent: true, typicalConcentration: "0.5-1% of leaf extract", pubchemCid: 12305001, chebiId: "CHEBI:5293" },
  { name: "Ginkgolide B", herbs: ["ginkgo biloba", "ginkgo"], category: "Terpenoids", superclass: "Terpenoids", biosyntheticPathway: "Mevalonate Pathway", pharmacologicalActions: ["neuroprotective", "antiplatelet", "cardioprotective"], isMajorConstituent: true, typicalConcentration: "0.3-0.8% of leaf extract", pubchemCid: 441898, chebiId: "CHEBI:5294" },
  { name: "Bilobalide", herbs: ["ginkgo biloba", "ginkgo"], category: "Terpenoids", superclass: "Terpenoids", biosyntheticPathway: "Mevalonate Pathway", pharmacologicalActions: ["neuroprotective", "anticonvulsant"], isMajorConstituent: true, typicalConcentration: "1-3% of leaf extract", pubchemCid: 120236, chebiId: "CHEBI:3097" },
  { name: "Quercetin-3-O-rutinoside", herbs: ["ginkgo biloba", "ginkgo"], category: "Flavonoids", superclass: "Flavonoids", biosyntheticPathway: "Shikimate Pathway", pharmacologicalActions: ["antioxidant", "anti-inflammatory"], typicalConcentration: "2-4% of leaf extract", pubchemCid: 5280805 },

  // Ginseng (Panax ginseng)
  { name: "Ginsenoside Rb1", herbs: ["ginseng", "panax ginseng"], category: "Saponins", superclass: "Terpenoids", biosyntheticPathway: "Mevalonate Pathway", pharmacologicalActions: ["adaptogenic", "neuroprotective", "antidiabetic", "immunomodulatory"], isMajorConstituent: true, typicalConcentration: "0.5-2% of root", pubchemCid: 101317825, chebiId: "CHEBI:6795" },
  { name: "Ginsenoside Rg1", herbs: ["ginseng", "panax ginseng"], category: "Saponins", superclass: "Terpenoids", biosyntheticPathway: "Mevalonate Pathway", pharmacologicalActions: ["adaptogenic", "neuroprotective", "immunomodulatory"], isMajorConstituent: true, typicalConcentration: "0.2-1% of root", pubchemCid: 441922, chebiId: "CHEBI:6798" },
  { name: "Ginsenoside Re", herbs: ["ginseng", "panax ginseng"], category: "Saponins", superclass: "Terpenoids", biosyntheticPathway: "Mevalonate Pathway", pharmacologicalActions: ["antidiabetic", "antioxidant", "cardioprotective"], typicalConcentration: "0.1-0.5% of root", pubchemCid: 441923 },

  // Garlic (Allium sativum)
  { name: "Allicin", herbs: ["garlic", "allium sativum"], category: "Sulfur Compounds", superclass: "Sulfur Compounds", biosyntheticPathway: "Mixed Biosynthesis", pharmacologicalActions: ["antimicrobial", "antifungal", "antiviral", "anticoagulant"], isMajorConstituent: true, typicalConcentration: "2-6 mg/g of crushed garlic", pubchemCid: 65036, chebiId: "CHEBI:1821" },
  { name: "S-allyl cysteine", herbs: ["garlic", "allium sativum"], category: "Sulfur Compounds", superclass: "Sulfur Compounds", biosyntheticPathway: "Mixed Biosynthesis", pharmacologicalActions: ["antioxidant", "hepatoprotective", "anticancer"], isMajorConstituent: true, typicalConcentration: "0.3-1 mg/g", pubchemCid: 9794189 },
  { name: "Diallyl disulfide", herbs: ["garlic", "allium sativum"], category: "Sulfur Compounds", superclass: "Sulfur Compounds", biosyntheticPathway: "Mixed Biosynthesis", pharmacologicalActions: ["anticancer", "antimicrobial", "antioxidant"], typicalConcentration: "1-3 mg/g of essential oil", pubchemCid: 16590 },

  // Milk Thistle (Silybum marianum)
  { name: "Silymarin", herbs: ["milk thistle", "silybum marianum"], category: "Flavonolignans", superclass: "Flavonoids", biosyntheticPathway: "Shikimate Pathway", pharmacologicalActions: ["hepatoprotective", "antioxidant", "anti-inflammatory"], isMajorConstituent: true, typicalConcentration: "1-3% of seed", pubchemCid: 1548894 },
  { name: "Silibinin", herbs: ["milk thistle", "silybum marianum"], category: "Flavonolignans", superclass: "Flavonoids", biosyntheticPathway: "Shikimate Pathway", pharmacologicalActions: ["hepatoprotective", "anticancer", "antioxidant"], isMajorConstituent: true, typicalConcentration: "50-70% of silymarin complex", pubchemCid: 31553, chebiId: "CHEBI:9236" },
  { name: "Silydianin", herbs: ["milk thistle", "silybum marianum"], category: "Flavonolignans", superclass: "Flavonoids", biosyntheticPathway: "Shikimate Pathway", pharmacologicalActions: ["hepatoprotective", "antioxidant"], typicalConcentration: "10-20% of silymarin complex", pubchemCid: 521715 },

  // Green Tea (Camellia sinensis)
  { name: "Epigallocatechin gallate", herbs: ["green tea", "camellia sinensis"], category: "Catechins", superclass: "Flavonoids", biosyntheticPathway: "Shikimate Pathway", pharmacologicalActions: ["antioxidant", "anticancer", "antimicrobial", "neuroprotective"], isMajorConstituent: true, typicalConcentration: "50-70% of catechins", pubchemCid: 65064, chebiId: "CHEBI:4806" },
  { name: "Epigallocatechin", herbs: ["green tea", "camellia sinensis"], category: "Catechins", superclass: "Flavonoids", biosyntheticPathway: "Shikimate Pathway", pharmacologicalActions: ["antioxidant", "anticancer"], typicalConcentration: "10-15% of catechins", pubchemCid: 72277 },
  { name: "L-theanine", herbs: ["green tea", "camellia sinensis"], category: "Amino Acids", superclass: "Other", biosyntheticPathway: "Shikimate Pathway", pharmacologicalActions: ["anxiolytic", "neuroprotective"], isMajorConstituent: true, typicalConcentration: "1-2% of dry leaf", pubchemCid: 443729, chebiId: "CHEBI:14321" },
  { name: "Caffeine", herbs: ["green tea", "camellia sinensis", "coffee"], category: "Purine Alkaloids", superclass: "Alkaloids", biosyntheticPathway: "Alkaloid Biosynthesis", pharmacologicalActions: ["stimulant", "analgesic"], typicalConcentration: "1-5% of dry leaf", pubchemCid: 2519, chebiId: "CHEBI:27732" },

  // Berberine-containing plants
  { name: "Berberine", herbs: ["berberine", "berberis vulgaris", "goldenseal"], category: "Alkaloids", superclass: "Alkaloids", biosyntheticPathway: "Alkaloid Biosynthesis", pharmacologicalActions: ["antimicrobial", "antidiabetic", "antioxidant", "hepatoprotective"], isMajorConstituent: true, typicalConcentration: "2-6% of root bark", pubchemCid: 2353, chebiId: "CHEBI:16118" },

  // Ashwagandha (Withania somnifera)
  { name: "Withaferin A", herbs: ["ashwagandha", "withania somnifera"], category: "Steroidal Lactones", superclass: "Terpenoids", biosyntheticPathway: "Mevalonate Pathway", pharmacologicalActions: ["anticancer", "anti-inflammatory", "adaptogenic"], isMajorConstituent: true, typicalConcentration: "0.1-0.5% of root", pubchemCid: 265237, chebiId: "CHEBI:69052" },
  { name: "Withanolide D", herbs: ["ashwagandha", "withania somnifera"], category: "Steroidal Lactones", superclass: "Terpenoids", biosyntheticPathway: "Mevalonate Pathway", pharmacologicalActions: ["anti-inflammatory", "immunomodulatory"], typicalConcentration: "0.05-0.2% of root", pubchemCid: 112251 },

  // Kava (Piper methysticum)
  { name: "Kavain", herbs: ["kava", "piper methysticum"], category: "Lactones", superclass: "Terpenoids", biosyntheticPathway: "Polyketide Pathway", pharmacologicalActions: ["anxiolytic", "sedative", "antispasmodic"], isMajorConstituent: true, typicalConcentration: "1-3% of root", pubchemCid: 108143, chebiId: "CHEBI:38268" },
  { name: "Dihydrokavain", herbs: ["kava", "piper methysticum"], category: "Lactones", superclass: "Terpenoids", biosyntheticPathway: "Polyketide Pathway", pharmacologicalActions: ["sedative", "anxiolytic"], typicalConcentration: "0.5-2% of root", pubchemCid: 108144 },

  // Licorice (Glycyrrhiza glabra)
  { name: "Glycyrrhizin", herbs: ["licorice", "glycyrrhiza glabra"], category: "Saponins", superclass: "Terpenoids", biosyntheticPathway: "Mevalonate Pathway", pharmacologicalActions: ["anti-inflammatory", "hepatoprotective", "antiviral", "expectorant"], isMajorConstituent: true, typicalConcentration: "2-14% of root", pubchemCid: 14982, chebiId: "CHEBI:27761" },
  { name: "Glabridin", herbs: ["licorice", "glycyrrhiza glabra"], category: "Flavonoids", superclass: "Flavonoids", biosyntheticPathway: "Shikimate Pathway", pharmacologicalActions: ["antioxidant", "anti-inflammatory", "estrogenic"], isMajorConstituent: true, typicalConcentration: "0.1-1% of root", pubchemCid: 101053, chebiId: "CHEBI:5341" },
  { name: "Liquiritin", herbs: ["licorice", "glycyrrhiza glabra"], category: "Flavonoids", superclass: "Flavonoids", biosyntheticPathway: "Shikimate Pathway", pharmacologicalActions: ["antioxidant", "anti-inflammatory"], typicalConcentration: "1-3% of root", pubchemCid: 395662 },

  // Echinacea (Echinacea purpurea)
  { name: "Echinacoside", herbs: ["echinacea", "echinacea purpurea"], category: "Phenylpropanoids", superclass: "Phenylpropanoids", biosyntheticPathway: "Shikimate Pathway", pharmacologicalActions: ["immunomodulatory", "antioxidant", "antimicrobial"], isMajorConstituent: true, typicalConcentration: "0.3-1.5% of aerial parts", pubchemCid: 5281771, chebiId: "CHEBI:30769" },
  { name: "Cichoric acid", herbs: ["echinacea", "echinacea purpurea"], category: "Phenylpropanoids", superclass: "Phenylpropanoids", biosyntheticPathway: "Shikimate Pathway", pharmacologicalActions: ["immunomodulatory", "antioxidant"], isMajorConstituent: true, typicalConcentration: "1-3% of aerial parts", pubchemCid: 6476590 },

  // Valerian (Valeriana officinalis)
  { name: "Valerenic acid", herbs: ["valerian", "valeriana officinalis"], category: "Sesquiterpenes", superclass: "Terpenoids", biosyntheticPathway: "Mevalonate Pathway", pharmacologicalActions: ["sedative", "anxiolytic", "antispasmodic"], isMajorConstituent: true, typicalConcentration: "0.5-1.5% of root", pubchemCid: 6440865, chebiId: "CHEBI:9926" },
  { name: "Valeranone", herbs: ["valerian", "valeriana officinalis"], category: "Sesquiterpenes", superclass: "Terpenoids", biosyntheticPathway: "Mevalonate Pathway", pharmacologicalActions: ["sedative"], typicalConcentration: "0.2-0.5% of root", pubchemCid: 94298 },

  // Rosemary (Rosmarinus officinalis)
  { name: "Carnosic acid", herbs: ["rosemary"], category: "Diterpenes", superclass: "Terpenoids", biosyntheticPathway: "Mevalonate Pathway", pharmacologicalActions: ["antioxidant", "anti-inflammatory", "neuroprotective"], isMajorConstituent: true, typicalConcentration: "1-3% of leaf", pubchemCid: 442025 },
  { name: "Rosmarinic acid", herbs: ["rosemary"], category: "Phenylpropanoids", superclass: "Phenylpropanoids", biosyntheticPathway: "Shikimate Pathway", pharmacologicalActions: ["antioxidant", "anti-inflammatory", "antimicrobial"], isMajorConstituent: true, typicalConcentration: "1-3% of leaf", pubchemCid: 5281792, chebiId: "CHEBI:5073" },

  // Black Pepper (Piper nigrum)
  { name: "Piperine", herbs: ["black pepper", "pepper"], category: "Alkaloids", superclass: "Alkaloids", biosyntheticPathway: "Alkaloid Biosynthesis", pharmacologicalActions: ["anti-inflammatory", "antioxidant", "analgesic"], isMajorConstituent: true, typicalConcentration: "5-10% of fruit", pubchemCid: 638024, chebiId: "CHEBI:28521" },

  // Saffron (Crocus sativus)
  { name: "Crocin", herbs: ["saffron"], category: "Carotenoids", superclass: "Terpenoids", biosyntheticPathway: "Mevalonate Pathway", pharmacologicalActions: ["antioxidant", "antidepressant", "neuroprotective"], isMajorConstituent: true, typicalConcentration: "1-2% of stigma", pubchemCid: 5281234 },
  { name: "Safranal", herbs: ["saffron"], category: "Monoterpenes", superclass: "Terpenoids", biosyntheticPathway: "Mevalonate Pathway", pharmacologicalActions: ["antioxidant", "antidepressant"], isMajorConstituent: true, typicalConcentration: "0.3-1% of stigma", pubchemCid: 61041 },

  // Chamomile (Matricaria chamomilla)
  { name: "Apigenin", herbs: ["chamomile"], category: "Flavonoids", superclass: "Flavonoids", biosyntheticPathway: "Shikimate Pathway", pharmacologicalActions: ["anxiolytic", "anti-inflammatory", "antioxidant"], isMajorConstituent: true, typicalConcentration: "0.5-1% of flower", pubchemCid: 5280443, chebiId: "CHEBI:18388" },
  { name: "Bisabolol", herbs: ["chamomile"], category: "Sesquiterpenes", superclass: "Terpenoids", biosyntheticPathway: "Mevalonate Pathway", pharmacologicalActions: ["anti-inflammatory", "antimicrobial"], isMajorConstituent: true, typicalConcentration: "10-50% of essential oil", pubchemCid: 10597 },

  // Additional notable compounds
  { name: "Resveratrol", herbs: ["grapes", "red wine", "japanese knotweed"], category: "Stilbenes", superclass: "Polyketides", biosyntheticPathway: "Polyketide Pathway", pharmacologicalActions: ["antioxidant", "anti-inflammatory", "cardioprotective", "anticancer"], isMajorConstituent: true, typicalConcentration: "0.1-10 mg/L in wine", pubchemCid: 445154, chebiId: "CHEBI:45697" },
  { name: "Capsaicin", herbs: ["chili", "cayenne"], category: "Vanilloids", superclass: "Alkaloids", biosyntheticPathway: "Alkaloid Biosynthesis", pharmacologicalActions: ["analgesic", "anti-inflammatory", "antimicrobial"], isMajorConstituent: true, typicalConcentration: "0.1-1% of fruit", pubchemCid: 1548943, chebiId: "CHEBI:3375" },
  { name: "Eugenol", herbs: ["cloves", "clove"], category: "Phenylpropanoids", superclass: "Phenylpropanoids", biosyntheticPathway: "Shikimate Pathway", pharmacologicalActions: ["antimicrobial", "analgesic", "anti-inflammatory"], isMajorConstituent: true, typicalConcentration: "80-90% of clove oil", pubchemCid: 3314, chebiId: "CHEBI:4918" },
  { name: "Cinnamaldehyde", herbs: ["cinnamon"], category: "Phenylpropanoids", superclass: "Phenylpropanoids", biosyntheticPathway: "Shikimate Pathway", pharmacologicalActions: ["antimicrobial", "anti-inflammatory", "antidiabetic"], isMajorConstituent: true, typicalConcentration: "60-80% of bark oil", pubchemCid: 553, chebiId: "CHEBI:33175" },
  { name: "Paclitaxel", herbs: ["yew", "pacific yew"], category: "Taxanes", superclass: "Terpenoids", biosyntheticPathway: "Mevalonate Pathway", pharmacologicalActions: ["anticancer"], isMajorConstituent: true, typicalConcentration: "0.01-0.05% of bark", pubchemCid: 36314, chebiId: "CHEBI:45863" },
  { name: "Artemisinin", herbs: ["sweet wormwood"], category: "Sesquiterpene Lactones", superclass: "Terpenoids", biosyntheticPathway: "Mevalonate Pathway", pharmacologicalActions: ["antiviral", "antimicrobial", "anticancer"], isMajorConstituent: true, typicalConcentration: "0.1-1% of aerial parts", pubchemCid: 68827, chebiId: "CHEBI:223316" },
  { name: "Morphine", herbs: ["opium", "opium poppy"], category: "Alkaloids", superclass: "Alkaloids", biosyntheticPathway: "Alkaloid Biosynthesis", pharmacologicalActions: ["analgesic", "sedative"], isMajorConstituent: true, typicalConcentration: "10-16% of opium", pubchemCid: 5288826, chebiId: "CHEBI:17303" },
  { name: "Quinine", herbs: ["cinchona"], category: "Alkaloids", superclass: "Alkaloids", biosyntheticPathway: "Alkaloid Biosynthesis", pharmacologicalActions: ["antimicrobial", "antipyretic"], isMajorConstituent: true, typicalConcentration: "5-8% of bark", pubchemCid: 3034034, chebiId: "CHEBI:15854" },
  { name: "Digoxin", herbs: ["foxglove"], category: "Cardiac Glycosides", superclass: "Terpenoids", biosyntheticPathway: "Mevalonate Pathway", pharmacologicalActions: ["cardioprotective"], isMajorConstituent: true, typicalConcentration: "0.1-0.3% of leaf", pubchemCid: 2724385, chebiId: "CHEBI:4551" },
  { name: "Sulforaphane", herbs: ["broccoli"], category: "Isothiocyanates", superclass: "Glucosinolates", biosyntheticPathway: "Mixed Biosynthesis", pharmacologicalActions: ["anticancer", "antioxidant", "hepatoprotective"], isMajorConstituent: true, typicalConcentration: "10-100 umol/g dry weight", pubchemCid: 5350, chebiId: "CHEBI:8034" },
  { name: "Genistein", herbs: ["soy", "soybean"], category: "Isoflavones", superclass: "Flavonoids", biosyntheticPathway: "Shikimate Pathway", pharmacologicalActions: ["estrogenic", "anticancer", "antioxidant"], isMajorConstituent: true, typicalConcentration: "0.1-1 mg/g dry weight", pubchemCid: 5280961, chebiId: "CHEBI:17529" },
  { name: "Oleuropein", herbs: ["olive oil"], category: "Iridoids", superclass: "Terpenoids", biosyntheticPathway: "Mevalonate Pathway", pharmacologicalActions: ["antioxidant", "cardioprotective", "anti-inflammatory"], isMajorConstituent: true, typicalConcentration: "1-14% of leaf", pubchemCid: 5281544, chebiId: "CHEBI:6706" },
  { name: "Linalool", herbs: ["lavender"], category: "Monoterpenes", superclass: "Terpenoids", biosyntheticPathway: "Mevalonate Pathway", pharmacologicalActions: ["anxiolytic", "sedative", "antimicrobial"], isMajorConstituent: true, typicalConcentration: "20-40% of essential oil", pubchemCid: 6549, chebiId: "CHEBI:2892" },
  { name: "Menthol", herbs: ["peppermint"], category: "Monoterpenes", superclass: "Terpenoids", biosyntheticPathway: "Mevalonate Pathway", pharmacologicalActions: ["analgesic", "antispasmodic", "antimicrobial"], isMajorConstituent: true, typicalConcentration: "30-50% of essential oil", pubchemCid: 16666, chebiId: "CHEBI:15410" },
  { name: "Thymol", herbs: ["thyme"], category: "Monoterpenes", superclass: "Terpenoids", biosyntheticPathway: "Mevalonate Pathway", pharmacologicalActions: ["antimicrobial", "antifungal", "antioxidant"], isMajorConstituent: true, typicalConcentration: "20-50% of essential oil", pubchemCid: 6989, chebiId: "CHEBI:27907" },
  { name: "Aloe-emodin", herbs: ["aloe", "aloe vera"], category: "Anthraquinones", superclass: "Polyketides", biosyntheticPathway: "Polyketide Pathway", pharmacologicalActions: ["antimicrobial", "anticancer", "anti-inflammatory"], isMajorConstituent: true, typicalConcentration: "0.1-1% of leaf", pubchemCid: 10207, chebiId: "CHEBI:2548" },
  { name: "Azadirachtin", herbs: ["neem"], category: "Limonoids", superclass: "Terpenoids", biosyntheticPathway: "Mevalonate Pathway", pharmacologicalActions: ["antimicrobial", "antifungal", "anti-inflammatory"], isMajorConstituent: true, typicalConcentration: "0.1-0.6% of seed", pubchemCid: 11477707 },
  { name: "Ursolic acid", herbs: ["basil"], category: "Triterpenes", superclass: "Terpenoids", biosyntheticPathway: "Mevalonate Pathway", pharmacologicalActions: ["anti-inflammatory", "anticancer", "antioxidant"], isMajorConstituent: true, typicalConcentration: "0.5-2% of leaf", pubchemCid: 64945, chebiId: "CHEBI:22773" },
  { name: "Ellagic acid", herbs: ["pomegranate", "berries"], category: "Tannins", superclass: "Polyketides", biosyntheticPathway: "Shikimate Pathway", pharmacologicalActions: ["antioxidant", "anticancer", "anti-inflammatory"], isMajorConstituent: true, typicalConcentration: "0.2-2% of fruit", pubchemCid: 5281855, chebiId: "CHEBI:4775" },
  { name: "Naringenin", herbs: ["grapefruit"], category: "Flavanones", superclass: "Flavonoids", biosyntheticPathway: "Shikimate Pathway", pharmacologicalActions: ["antioxidant", "anti-inflammatory", "antidiabetic"], isMajorConstituent: true, typicalConcentration: "0.1-1% of fruit", pubchemCid: 932, chebiId: "CHEBI:5021" },
  { name: "Vinblastine", herbs: ["madagascar periwinkle"], category: "Alkaloids", superclass: "Alkaloids", biosyntheticPathway: "Alkaloid Biosynthesis", pharmacologicalActions: ["anticancer"], isMajorConstituent: true, typicalConcentration: "0.001% of leaf", pubchemCid: 241903, chebiId: "CHEBI:27717" },
  { name: "Salicin", herbs: ["willow", "willow bark"], category: "Glycosides", superclass: "Phenylpropanoids", biosyntheticPathway: "Shikimate Pathway", pharmacologicalActions: ["analgesic", "antipyretic", "anti-inflammatory"], isMajorConstituent: true, typicalConcentration: "1-10% of bark", pubchemCid: 439505, chebiId: "CHEBI:16881" },
  { name: "Theobromine", herbs: ["cocoa"], category: "Purine Alkaloids", superclass: "Alkaloids", biosyntheticPathway: "Alkaloid Biosynthesis", pharmacologicalActions: ["stimulant", "diuretic"], isMajorConstituent: true, typicalConcentration: "1-3% of cacao bean", pubchemCid: 5429, chebiId: "CHEBI:2898" },
];

/** Herb metadata for PhytoInsight botanical context */
export const HERB_METADATA: Record<string, { family: string; partUsed: string; botanicalName: string }> = {
  "turmeric": { family: "Zingiberaceae", partUsed: "Rhizome", botanicalName: "Curcuma longa" },
  "curcuma longa": { family: "Zingiberaceae", partUsed: "Rhizome", botanicalName: "Curcuma longa" },
  "ginger": { family: "Zingiberaceae", partUsed: "Rhizome", botanicalName: "Zingiber officinale" },
  "zingiber officinale": { family: "Zingiberaceae", partUsed: "Rhizome", botanicalName: "Zingiber officinale" },
  "st. john's wort": { family: "Hypericaceae", partUsed: "Aerial parts", botanicalName: "Hypericum perforatum" },
  "hypericum perforatum": { family: "Hypericaceae", partUsed: "Aerial parts", botanicalName: "Hypericum perforatum" },
  "ginkgo biloba": { family: "Ginkgoaceae", partUsed: "Leaf", botanicalName: "Ginkgo biloba" },
  "ginkgo": { family: "Ginkgoaceae", partUsed: "Leaf", botanicalName: "Ginkgo biloba" },
  "ginseng": { family: "Araliaceae", partUsed: "Root", botanicalName: "Panax ginseng" },
  "panax ginseng": { family: "Araliaceae", partUsed: "Root", botanicalName: "Panax ginseng" },
  "garlic": { family: "Amaryllidaceae", partUsed: "Bulb", botanicalName: "Allium sativum" },
  "allium sativum": { family: "Amaryllidaceae", partUsed: "Bulb", botanicalName: "Allium sativum" },
  "milk thistle": { family: "Asteraceae", partUsed: "Seed", botanicalName: "Silybum marianum" },
  "silybum marianum": { family: "Asteraceae", partUsed: "Seed", botanicalName: "Silybum marianum" },
  "green tea": { family: "Theaceae", partUsed: "Leaf", botanicalName: "Camellia sinensis" },
  "camellia sinensis": { family: "Theaceae", partUsed: "Leaf", botanicalName: "Camellia sinensis" },
  "berberine": { family: "Berberidaceae", partUsed: "Root bark", botanicalName: "Berberis vulgaris" },
  "berberis vulgaris": { family: "Berberidaceae", partUsed: "Root bark", botanicalName: "Berberis vulgaris" },
  "ashwagandha": { family: "Solanaceae", partUsed: "Root", botanicalName: "Withania somnifera" },
  "withania somnifera": { family: "Solanaceae", partUsed: "Root", botanicalName: "Withania somnifera" },
  "kava": { family: "Piperaceae", partUsed: "Root", botanicalName: "Piper methysticum" },
  "piper methysticum": { family: "Piperaceae", partUsed: "Root", botanicalName: "Piper methysticum" },
  "licorice": { family: "Fabaceae", partUsed: "Root", botanicalName: "Glycyrrhiza glabra" },
  "glycyrrhiza glabra": { family: "Fabaceae", partUsed: "Root", botanicalName: "Glycyrrhiza glabra" },
  "echinacea": { family: "Asteraceae", partUsed: "Aerial parts / Root", botanicalName: "Echinacea purpurea" },
  "echinacea purpurea": { family: "Asteraceae", partUsed: "Aerial parts / Root", botanicalName: "Echinacea purpurea" },
  "valerian": { family: "Caprifoliaceae", partUsed: "Root", botanicalName: "Valeriana officinalis" },
  "valeriana officinalis": { family: "Caprifoliaceae", partUsed: "Root", botanicalName: "Valeriana officinalis" },
  "rosemary": { family: "Lamiaceae", partUsed: "Leaf", botanicalName: "Rosmarinus officinalis" },
  "chamomile": { family: "Asteraceae", partUsed: "Flower", botanicalName: "Matricaria chamomilla" },
  "black pepper": { family: "Piperaceae", partUsed: "Fruit", botanicalName: "Piper nigrum" },
  "saffron": { family: "Iridaceae", partUsed: "Stigma", botanicalName: "Crocus sativus" },
  "cinnamon": { family: "Lauraceae", partUsed: "Bark", botanicalName: "Cinnamomum verum" },
  "cloves": { family: "Myrtaceae", partUsed: "Flower bud", botanicalName: "Syzygium aromaticum" },
  "clove": { family: "Myrtaceae", partUsed: "Flower bud", botanicalName: "Syzygium aromaticum" },
  "lavender": { family: "Lamiaceae", partUsed: "Flower", botanicalName: "Lavandula angustifolia" },
  "peppermint": { family: "Lamiaceae", partUsed: "Leaf", botanicalName: "Mentha x piperita" },
  "thyme": { family: "Lamiaceae", partUsed: "Leaf", botanicalName: "Thymus vulgaris" },
  "neem": { family: "Meliaceae", partUsed: "Seed / Leaf", botanicalName: "Azadirachta indica" },
  "basil": { family: "Lamiaceae", partUsed: "Leaf", botanicalName: "Ocimum basilicum" },
  "aloe": { family: "Asphodelaceae", partUsed: "Leaf", botanicalName: "Aloe vera" },
  "aloe vera": { family: "Asphodelaceae", partUsed: "Leaf", botanicalName: "Aloe vera" },
  "chili": { family: "Solanaceae", partUsed: "Fruit", botanicalName: "Capsicum annuum" },
  "grapefruit": { family: "Rutaceae", partUsed: "Fruit", botanicalName: "Citrus paradisi" },
  "broccoli": { family: "Brassicaceae", partUsed: "Floret", botanicalName: "Brassica oleracea var. italica" },
  "soy": { family: "Fabaceae", partUsed: "Seed", botanicalName: "Glycine max" },
  "soybean": { family: "Fabaceae", partUsed: "Seed", botanicalName: "Glycine max" },
  "pomegranate": { family: "Lythraceae", partUsed: "Fruit", botanicalName: "Punica granatum" },
  "olive oil": { family: "Oleaceae", partUsed: "Fruit / Leaf", botanicalName: "Olea europaea" },
  "yew": { family: "Taxaceae", partUsed: "Bark", botanicalName: "Taxus brevifolia" },
  "pacific yew": { family: "Taxaceae", partUsed: "Bark", botanicalName: "Taxus brevifolia" },
  "sweet wormwood": { family: "Asteraceae", partUsed: "Aerial parts", botanicalName: "Artemisia annua" },
  "opium": { family: "Papaveraceae", partUsed: "Latex", botanicalName: "Papaver somniferum" },
  "opium poppy": { family: "Papaveraceae", partUsed: "Latex", botanicalName: "Papaver somniferum" },
  "cinchona": { family: "Rubiaceae", partUsed: "Bark", botanicalName: "Cinchona officinalis" },
  "foxglove": { family: "Plantaginaceae", partUsed: "Leaf", botanicalName: "Digitalis purpurea" },
  "willow": { family: "Salicaceae", partUsed: "Bark", botanicalName: "Salix alba" },
  "willow bark": { family: "Salicaceae", partUsed: "Bark", botanicalName: "Salix alba" },
  "cocoa": { family: "Malvaceae", partUsed: "Seed", botanicalName: "Theobroma cacao" },
  "coffee": { family: "Rubiaceae", partUsed: "Seed", botanicalName: "Coffea arabica" },
  "madagascar periwinkle": { family: "Apocynaceae", partUsed: "Leaf", botanicalName: "Catharanthus roseus" },
  "grapes": { family: "Vitaceae", partUsed: "Fruit", botanicalName: "Vitis vinifera" },
  "red wine": { family: "Vitaceae", partUsed: "Fruit", botanicalName: "Vitis vinifera" },
  "japanese knotweed": { family: "Polygonaceae", partUsed: "Root", botanicalName: "Reynoutria japonica" },
  "berries": { family: "Various", partUsed: "Fruit", botanicalName: "Various species" },
  "apple": { family: "Rosaceae", partUsed: "Fruit", botanicalName: "Malus domestica" },
  "onion": { family: "Amaryllidaceae", partUsed: "Bulb", botanicalName: "Allium cepa" },
  "capers": { family: "Capparaceae", partUsed: "Flower bud", botanicalName: "Capparis spinosa" },
  "buckwheat": { family: "Polygonaceae", partUsed: "Seed", botanicalName: "Fagopyrum esculentum" },
  "citrus": { family: "Rutaceae", partUsed: "Fruit", botanicalName: "Citrus spp." },
  "goldenseal": { family: "Ranunculaceae", partUsed: "Root", botanicalName: "Hydrastis canadensis" },
};

/** Quick example herbs for the PhytoInsight page */
export const EXAMPLE_PHYTOINSIGHT_HERBS = [
  "Turmeric",
  "Ginkgo biloba",
  "Green Tea",
  "St. John's Wort",
  "Ginseng",
  "Milk Thistle",
  "Ashwagandha",
  "Licorice",
  "Rosemary",
  "Saffron",
];

/** Map compound categories to color classes for visualization */
export const PHYTO_CLASS_COLORS: Record<string, string> = {
  "Curcuminoids": "#D97706",
  "Sesquiterpenes": "#059669",
  "Phenols": "#DC2626",
  "Anthraquinones": "#7C3AED",
  "Phthalides": "#2563EB",
  "Flavonoids": "#EC4899",
  "Flavonolignans": "#F59E0B",
  "Catechins": "#10B981",
  "Amino Acids": "#6366F1",
  "Saponins": "#8B5CF6",
  "Sulfur Compounds": "#F97316",
  "Terpenoids": "#14B8A6",
  "Alkaloids": "#EF4444",
  "Steroidal Lactones": "#6D28D9",
  "Lactones": "#0EA5E9",
  "Phenylpropanoids": "#84CC16",
  "Diterpenes": "#22C55E",
  "Carotenoids": "#FBBF24",
  "Monoterpenes": "#34D399",
  "Vanilloids": "#FB923C",
  "Isothiocyanates": "#A3E635",
  "Isoflavones": "#F472B6",
  "Iridoids": "#2DD4BF",
  "Tannins": "#78716C",
  "Taxanes": "#4F46E5",
  "Sesquiterpene Lactones": "#06B6D4",
  "Purine Alkaloids": "#A855F7",
  "Cardiac Glycosides": "#E11D48",
  "Glycosides": "#65A30D",
  "Flavanones": "#DB2777",
  "Limonoids": "#0891B2",
  "Triterpenes": "#15803D",
};

/** Map compound categories to superclass for grouping */
export const CATEGORY_TO_SUPERCLASS: Record<string, string> = {
  "Curcuminoids": "Polyketides",
  "Sesquiterpenes": "Terpenoids",
  "Phenols": "Polyketides",
  "Anthraquinones": "Polyketides",
  "Phthalides": "Polyketides",
  "Flavonoids": "Flavonoids",
  "Flavonolignans": "Flavonoids",
  "Catechins": "Flavonoids",
  "Amino Acids": "Other",
  "Saponins": "Terpenoids",
  "Sulfur Compounds": "Sulfur Compounds",
  "Terpenoids": "Terpenoids",
  "Alkaloids": "Alkaloids",
  "Steroidal Lactones": "Terpenoids",
  "Lactones": "Terpenoids",
  "Phenylpropanoids": "Phenylpropanoids",
  "Diterpenes": "Terpenoids",
  "Carotenoids": "Terpenoids",
  "Monoterpenes": "Terpenoids",
  "Vanilloids": "Alkaloids",
  "Isothiocyanates": "Glucosinolates",
  "Isoflavones": "Flavonoids",
  "Iridoids": "Terpenoids",
  "Tannins": "Polyketides",
  "Taxanes": "Terpenoids",
  "Sesquiterpene Lactones": "Terpenoids",
  "Purine Alkaloids": "Alkaloids",
  "Cardiac Glycosides": "Terpenoids",
  "Glycosides": "Phenylpropanoids",
  "Flavanones": "Flavonoids",
  "Limonoids": "Terpenoids",
  "Triterpenes": "Terpenoids",
  "Polyphenols": "Flavonoids",
  "Volatile Compounds": "Terpenoids",
};

/** Map compound categories to biosynthetic pathways */
export const CATEGORY_TO_PATHWAY: Record<string, string> = {
  "Curcuminoids": "Polyketide Pathway",
  "Sesquiterpenes": "Mevalonate Pathway",
  "Phenols": "Polyketide Pathway",
  "Anthraquinones": "Polyketide Pathway",
  "Phthalides": "Polyketide Pathway",
  "Flavonoids": "Shikimate Pathway",
  "Flavonolignans": "Shikimate Pathway",
  "Catechins": "Shikimate Pathway",
  "Amino Acids": "Shikimate Pathway",
  "Saponins": "Mevalonate Pathway",
  "Sulfur Compounds": "Mixed Biosynthesis",
  "Terpenoids": "Mevalonate Pathway",
  "Alkaloids": "Alkaloid Biosynthesis",
  "Steroidal Lactones": "Mevalonate Pathway",
  "Lactones": "Polyketide Pathway",
  "Phenylpropanoids": "Shikimate Pathway",
  "Diterpenes": "Mevalonate Pathway",
  "Carotenoids": "Mevalonate Pathway",
  "Monoterpenes": "Mevalonate Pathway",
  "Vanilloids": "Alkaloid Biosynthesis",
  "Isothiocyanates": "Mixed Biosynthesis",
  "Isoflavones": "Shikimate Pathway",
  "Iridoids": "Mevalonate Pathway",
  "Tannins": "Shikimate Pathway",
  "Taxanes": "Mevalonate Pathway",
  "Sesquiterpene Lactones": "Mevalonate Pathway",
  "Purine Alkaloids": "Alkaloid Biosynthesis",
  "Cardiac Glycosides": "Mevalonate Pathway",
  "Glycosides": "Shikimate Pathway",
  "Flavanones": "Shikimate Pathway",
  "Limonoids": "Mevalonate Pathway",
  "Triterpenes": "Mevalonate Pathway",
  "Polyphenols": "Shikimate Pathway",
  "Volatile Compounds": "Mevalonate Pathway",
};

// ─── Chemical Structure Feature ───

/** Map common natural product / drug queries to PubChem-friendly search terms */
export const COMPOUND_SEARCH_ALIASES: Record<string, string> = {
  // Herbs → main active compound
  "egcg": "Epigallocatechin gallate",
  "st. john's wort": "Hypericin",
  "turmeric": "Curcumin",
  "ginseng": "Ginsenoside Rb1",
  "garlic": "Allicin",
  "milk thistle": "Silymarin",
  "ginkgo": "Ginkgolide A",
  "ginkgo biloba": "Ginkgolide A",
  "ginger": "Gingerol",
  "licorice": "Glycyrrhizin",
  "green tea": "Epigallocatechin gallate",
  "ashwagandha": "Withaferin A",
  "kava": "Kavain",
  "echinacea": "Echinacoside",
  "valerian": "Valerenic acid",
  "black cohosh": "Actein",
  // Additional herbs & plants
  "rosemary": "Carnosic acid",
  "cinnamon": "Cinnamaldehyde",
  "pepper": "Piperine",
  "black pepper": "Piperine",
  "chili": "Capsaicin",
  "cayenne": "Capsaicin",
  "lavender": "Linalool",
  "chamomile": "Apigenin",
  "peppermint": "Menthol",
  "saffron": "Crocin",
  "aloe": "Aloe-emodin",
  "aloe vera": "Aloe-emodin",
  "neem": "Azadirachtin",
  "basil": "Ursolic acid",
  "thyme": "Thymol",
  "cloves": "Eugenol",
  "clove": "Eugenol",
  "coffee": "Caffeine",
  "cocoa": "Theobromine",
  "grapefruit": "Naringenin",
  "soy": "Genistein",
  "soybean": "Genistein",
  "broccoli": "Sulforaphane",
  "blueberry": "Anthocyanin",
  "pomegranate": "Ellagic acid",
  "red wine": "Resveratrol",
  "grapes": "Resveratrol",
  "olive oil": "Oleuropein",
  "willow": "Salicin",
  "willow bark": "Salicin",
  "opium": "Morphine",
  "opium poppy": "Morphine",
  "coca": "Cocaine",
  "cinchona": "Quinine",
  "foxglove": "Digoxin",
  "yew": "Paclitaxel",
  "pacific yew": "Paclitaxel",
  "sweet wormwood": "Artemisinin",
  "madagascar periwinkle": "Vinblastine",
  // Common drug abbreviations
  "tylenol": "Acetaminophen",
  "paracetamol": "Acetaminophen",
  "advil": "Ibuprofen",
  "motrin": "Ibuprofen",
  "aspirin": "Acetylsalicylic acid",
  "lipitor": "Atorvastatin",
  "zocor": "Simvastatin",
  "penicillin g": "Benzylpenicillin",
  "vitamin c": "Ascorbic acid",
  "vitamin e": "Alpha-tocopherol",
  "vitamin d": "Cholecalciferol",
  "vitamin a": "Retinol",
  "vitamin b1": "Thiamine",
  "vitamin b12": "Cyanocobalamin",
  "vitamin k": "Phylloquinone",
};

/**
 * Expand herb name into all known aliases.
 */
export function expandHerb(herb: string): string[] {
  const lower = (herb || '').toLowerCase();
  for (const [canonical, aliases] of Object.entries(HERB_ALIASES)) {
    if (lower.includes(canonical) || aliases.some((a) => lower.includes((a || '').toLowerCase()))) {
      return [canonical, ...aliases];
    }
  }
  return [herb];
}
