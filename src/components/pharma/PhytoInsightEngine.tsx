'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  Hexagon,
  FlaskConical,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  Beaker,
  Atom,
  Search,
  Loader2,
  AlertCircle,
  Sparkles,
  TreePine,
  Database,
  Copy,
  Info,
  Bookmark,
  BookmarkCheck,
  CheckCircle,
  Box,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Zap,
} from 'lucide-react';
import type {
  PhytoInsightResponse,
  PhytoCompoundProfile,
  PhytoClassDistribution,
  PhytoPathwaySummary,
  PharmacologyAction,
  PharmacologyReference,
  SpellingCorrection,
  BiosyntheticPathway,
  CompoundSuperclass,
} from '@/lib/types';
import { EXAMPLE_PHYTOINSIGHT_HERBS, PHYTO_CLASS_COLORS } from '@/lib/knowledge-base';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

// ─── Style Maps ───

const EVIDENCE_STYLES: Record<string, string> = {
  High: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  Moderate: 'bg-amber-100 text-amber-800 border border-amber-200',
  Low: 'bg-rose-100 text-rose-800 border border-rose-200',
  'No Evidence': 'bg-slate-100 text-slate-500 border border-slate-200',
};

const CONFIDENCE_STYLES: Record<string, string> = {
  High: 'bg-blue-100 text-blue-800 border border-blue-200',
  Moderate: 'bg-sky-100 text-sky-800 border border-sky-200',
  Low: 'bg-slate-100 text-slate-500 border border-slate-200',
};

const PATHWAY_ICONS: Record<string, { icon: typeof Leaf; color: string; bg: string }> = {
  'Shikimate Pathway': { icon: TreePine, color: 'text-green-600', bg: 'bg-green-100' },
  'Mevalonate Pathway': { icon: Hexagon, color: 'text-purple-600', bg: 'bg-purple-100' },
  'Methylerythritol Phosphate Pathway': { icon: Atom, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  'Polyketide Pathway': { icon: FlaskConical, color: 'text-amber-600', bg: 'bg-amber-100' },
  'Alkaloid Biosynthesis': { icon: Beaker, color: 'text-rose-600', bg: 'bg-rose-100' },
  'Mixed Biosynthesis': { icon: Sparkles, color: 'text-teal-600', bg: 'bg-teal-100' },
};

// ─── Prop Interface ───

interface PhytoInsightEngineProps {
  onSearch: (herb: string) => Promise<PhytoInsightResponse | null>;
  onSignInRequired: () => void;
}

// ─── Main Component ───

export default function PhytoInsightEngine({ onSearch, onSignInRequired }: PhytoInsightEngineProps) {
  const { isAuthenticated, user } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PhytoInsightResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [spellingCorrection, setSpellingCorrection] = useState<SpellingCorrection | null>(null);
  const [confidenceReasoning, setConfidenceReasoning] = useState<string | null>(null);
  const [reportSaved, setReportSaved] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [expandedRefs, setExpandedRefs] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (herbName: string) => {
    if (!herbName.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSearched(false);
    setSpellingCorrection(null);
    setReportSaved(false);
    setConfidenceReasoning(null);
    setExpandedCards(new Set());
    setExpandedRefs(false);
    setQuery(herbName);

    try {
      const data = await onSearch(herbName.trim());
      if (!data) {
        setError('Search failed. Please try again.');
      } else {
        setResult(data);
        if (data.spellingCorrection) setSpellingCorrection(data.spellingCorrection);
        if (data.confidenceReasoning) setConfidenceReasoning(data.confidenceReasoning);
      }
    } catch {
      setError('Search failed. Please try again.');
    }

    setLoading(false);
    setSearched(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(query);
  };

  const toggleCard = (index: number) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`);
    }).catch(() => {
      toast.error('Failed to copy');
    });
  };

  const isSubmitDisabled = mounted ? (loading || !query.trim()) : true;

  // Deduplicate pharmacological actions
  const seenActionNames = new Set<string>();
  const actions: PharmacologyAction[] = (result?.pharmacologicalActions || [])
    .filter(item => {
      const key = item.name.toLowerCase();
      if (seenActionNames.has(key)) return false;
      seenActionNames.add(key);
      return true;
    })
    .map(item => ({
      name: item.name || 'Uncharacterized pharmacological action',
      pmids: item.pmids || [],
      score: item.score || 0,
      mechanisms: (() => {
        const seenMechNames = new Set<string>();
        return (item.mechanisms || [])
          .filter(m => {
            const mechKey = (typeof m === 'string' ? m : m.name).toLowerCase();
            if (seenMechNames.has(mechKey)) return false;
            seenMechNames.add(mechKey);
            return true;
          })
          .map(m => ({
            name: typeof m === 'string' ? m : m.name || 'Additional mechanistic pathway',
            pmids: typeof m === 'string' ? [] : m.pmids || [],
          }));
      })(),
    }));

  return (
    <div className="space-y-6">
      {/* ─── Search Form ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center flex-shrink-0">
            <Leaf size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-extrabold text-slate-800">PhytoInsight Engine</h2>
            <p className="text-slate-400 text-xs md:text-sm">Deep phytochemical intelligence — compound profiles, biosynthetic pathways &amp; pharmacological actions</p>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm md:text-base font-semibold text-slate-600 uppercase tracking-wide">
              <Leaf size={15} className="text-amber-500" />
              Herb / Plant Name
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Turmeric, Ginkgo biloba, Ashwagandha…"
              required
              className="w-full px-4 py-3 md:py-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm md:text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 md:py-4 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-md shadow-amber-200 hover:shadow-lg hover:shadow-amber-200 active:scale-[0.98] text-sm md:text-base"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing Phytochemical Profile…
              </>
            ) : (
              <>
                <Search size={18} />
                Analyze Phytochemical Profile
              </>
            )}
          </button>
        </form>

        <div className="mt-5">
          <p className="text-[11px] md:text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Quick examples</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PHYTOINSIGHT_HERBS.map((h) => (
              <button
                key={h}
                onClick={() => handleSubmit(h)}
                className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs md:text-sm text-slate-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 transition-all"
              >
                <Leaf size={12} className="text-amber-400" />
                {h}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Loading Skeleton ─── */}
      {loading && <PhytoInsightSkeleton />}

      {/* ─── Error ─── */}
      {error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
          <AlertCircle size={18} className="text-rose-500 flex-shrink-0 mt-0.5" />
          <p className="text-rose-700 text-sm md:text-base">{error}</p>
        </motion.div>
      )}

      {/* ─── Results ─── */}
      {searched && !loading && result && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-5">

          {/* ─ Herb Header Card ─ */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Leaf size={18} className="text-amber-600" />
                  <h3 className="text-base md:text-lg font-extrabold text-slate-800">{result.herb}</h3>
                </div>
                <p className="text-slate-400 text-xs md:text-sm">Phytochemical profile — deep phytochemical intelligence analysis</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${EVIDENCE_STYLES[result.evidenceLevel]}`}>
                  {result.evidenceLevel} Evidence
                </span>
                <span className={`px-2.5 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${CONFIDENCE_STYLES[result.confidence]}`}>
                  {result.confidence} Confidence
                </span>
                {result.sourcesUsed?.length > 0 && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] md:text-xs font-bold bg-amber-600 text-white">
                    <Zap size={10} /> {result.sourcesUsed.join(', ')}
                  </span>
                )}
              </div>
            </div>

            {/* Botanical Details */}
            <div className="flex flex-wrap gap-3 mb-4">
              {result.herbCanonicalName && result.herbCanonicalName !== result.herb && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs md:text-sm text-amber-800 font-medium italic">
                  <Leaf size={12} className="text-amber-500" />
                  {result.herbCanonicalName}
                </span>
              )}
              {result.herbFamily && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-lg text-xs md:text-sm text-green-800 font-medium">
                  <TreePine size={12} className="text-green-500" />
                  Family: {result.herbFamily}
                </span>
              )}
              {result.herbPartUsed && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 border border-sky-200 rounded-lg text-xs md:text-sm text-sky-800 font-medium">
                  <FlaskConical size={12} className="text-sky-500" />
                  Part used: {result.herbPartUsed}
                </span>
              )}
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs md:text-sm text-slate-700 font-medium">
                <Beaker size={12} className="text-slate-400" />
                {result.compounds.length} compound{result.compounds.length !== 1 ? 's' : ''} identified
              </span>
            </div>

            {/* Spelling Correction */}
            {spellingCorrection && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                <Info size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs md:text-sm text-amber-800 font-medium">
                  {spellingCorrection.wasAutoCorrected
                    ? <>Corrected <strong>{spellingCorrection.original}</strong> to <strong>{spellingCorrection.canonical || spellingCorrection.corrected}</strong></>
                    : <>Showing results for <strong>{spellingCorrection.canonical || spellingCorrection.corrected}</strong></>
                  }
                  {spellingCorrection.synonymApplied && spellingCorrection.canonical && (
                    <span className="text-amber-600 ml-1 text-xs">(scientific synonym)</span>
                  )}
                </p>
              </div>
            )}

            {/* Confidence Reasoning */}
            {confidenceReasoning && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 className="text-xs font-extrabold text-blue-800 uppercase tracking-wider mb-1">Confidence Assessment</h4>
                <p className="text-xs md:text-sm text-blue-900 leading-relaxed">{confidenceReasoning}</p>
              </div>
            )}

            {/* Save Report Button */}
            <button
              onClick={async () => {
                if (!isAuthenticated) {
                  onSignInRequired();
                  return;
                }
                try {
                  const res = await fetch('/api/saved-reports', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      reportId: `phytoinsight_${result.herb}_${Date.now()}`,
                      reportType: 'phytoinsight',
                      herbName: result.herb,
                      reportData: result,
                      userId: user?.id,
                      authMode: user?.authMode || 'local',
                    }),
                  });
                  if (res.ok) {
                    setReportSaved(true);
                    toast.success('PhytoInsight report saved successfully!');
                  } else {
                    toast.error('Failed to save report. Please try again.');
                  }
                } catch {
                  toast.error('Network error. Please try again.');
                }
              }}
              disabled={reportSaved}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:border-amber-500 disabled:border-amber-400 rounded-xl text-sm font-bold text-gray-700 hover:text-amber-700 disabled:text-amber-600 transition-all shadow-sm"
            >
              {reportSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              {reportSaved ? 'Saved' : 'Save Report'}
            </button>
          </div>

          {/* ─ No Evidence State ─ */}
          {result.evidenceLevel === 'No Evidence' && (
            <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <AlertCircle size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="text-slate-500 text-sm md:text-base">{result.noResultsMessage || 'No phytochemical evidence found for this herb.'}</p>
            </div>
          )}

          {/* ─ Compound Class Distribution ─ */}
          {result.classDistribution.length > 0 && result.evidenceLevel !== 'No Evidence' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Hexagon size={16} className="text-amber-600" />
                <h4 className="text-sm md:text-base font-extrabold text-slate-800">Compound Class Distribution</h4>
              </div>

              {/* Horizontal Stacked Bar */}
              <div className="mb-4">
                <div className="flex rounded-xl overflow-hidden h-10 md:h-12 shadow-inner border border-slate-100">
                  {result.classDistribution.map((cls, i) => {
                    const totalCompounds = result.classDistribution.reduce((sum, c) => sum + c.compoundCount, 0);
                    const widthPct = totalCompounds > 0 ? (cls.compoundCount / totalCompounds) * 100 : 0;
                    if (widthPct < 1) return null;
                    return (
                      <div
                        key={`${cls.className}-${i}`}
                        className="flex items-center justify-center px-1 transition-all duration-500 relative group"
                        style={{ width: `${widthPct}%`, backgroundColor: cls.color || PHYTO_CLASS_COLORS[cls.className] || '#94a3b8' }}
                        title={`${cls.className}: ${cls.compoundCount} compound${cls.compoundCount !== 1 ? 's' : ''}`}
                      >
                        {widthPct > 12 && (
                          <span className="text-[9px] md:text-[10px] font-bold text-white drop-shadow-sm truncate">
                            {cls.compoundCount}
                          </span>
                        )}
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                          {cls.className}: {cls.compoundCount}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {result.classDistribution.map((cls, i) => (
                  <div key={`${cls.className}-${i}`} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: cls.color || PHYTO_CLASS_COLORS[cls.className] || '#94a3b8' }}
                    />
                    <span className="text-[11px] md:text-xs text-slate-700 font-medium">{cls.className}</span>
                    <span className="text-[10px] md:text-[11px] text-slate-400">({cls.compoundCount})</span>
                    {cls.majorCompounds.length > 0 && (
                      <span className="text-[10px] text-slate-400 italic hidden md:inline">
                        — {cls.majorCompounds.slice(0, 2).join(', ')}{cls.majorCompounds.length > 2 ? '…' : ''}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─ Biosynthetic Pathway Summary ─ */}
          {result.pathwaySummary.length > 0 && result.evidenceLevel !== 'No Evidence' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <TreePine size={16} className="text-amber-600" />
                <h4 className="text-sm md:text-base font-extrabold text-slate-800">Biosynthetic Pathway Summary</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.pathwaySummary.map((pw, i) => {
                  const pathwayMeta = PATHWAY_ICONS[pw.pathway] || { icon: Sparkles, color: 'text-slate-600', bg: 'bg-slate-100' };
                  const PathwayIcon = pathwayMeta.icon;
                  return (
                    <motion.div
                      key={`${pw.pathway}-${i}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.3 }}
                      className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className={`w-8 h-8 rounded-lg ${pathwayMeta.bg} flex items-center justify-center flex-shrink-0`}>
                          <PathwayIcon size={16} className={pathwayMeta.color} />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs md:text-sm font-bold text-slate-800 truncate">{pw.pathway}</h5>
                          <p className="text-[10px] md:text-[11px] text-slate-400">{pw.compoundCount} compound{pw.compoundCount !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      {pw.representativeCompounds.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {pw.representativeCompounds.map((comp, ci) => (
                            <span key={ci} className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] md:text-[11px] text-slate-600 font-medium">
                              {comp}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─ Active Compounds Grid ─ */}
          {result.compounds.length > 0 && result.evidenceLevel !== 'No Evidence' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Beaker size={16} className="text-amber-600" />
                <h4 className="text-sm md:text-base font-extrabold text-slate-800">Active Compounds</h4>
                <span className="text-[11px] md:text-xs text-slate-400 ml-1">({result.compounds.length} identified)</span>
              </div>

              <div className="space-y-3 max-h-[40rem] md:max-h-[50rem] overflow-y-auto pr-1 custom-scrollbar">
                {result.compounds.map((compound, index) => (
                  <PhytoCompoundCard
                    key={`${compound.cid}-${compound.name}`}
                    compound={compound}
                    index={index}
                    expanded={expandedCards.has(index)}
                    onToggle={() => toggleCard(index)}
                    onCopy={copyToClipboard}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ─ Pharmacological Actions Summary ─ */}
          {actions.length > 0 && result.evidenceLevel !== 'No Evidence' && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={16} className="text-amber-600" />
                <span className="font-bold text-amber-800 text-sm md:text-base">Pharmacological Actions &amp; Mechanisms</span>
              </div>

              <div className="space-y-3 max-h-[24rem] md:max-h-96 overflow-y-auto">
                {actions.map((action, index) => (
                  <div key={`${action.name}-${index}`} className="bg-white border border-amber-200 rounded-xl p-3">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2 md:px-2.5 py-1 bg-amber-100 border border-amber-200 rounded-lg text-xs md:text-sm text-amber-800 font-medium capitalize">{action.name}</span>
                      {action.score > 0 && (
                        <span className={`px-2 py-0.5 rounded text-[11px] md:text-xs font-bold ${
                          action.score >= 80 ? 'bg-emerald-200 text-emerald-800' :
                          action.score >= 50 ? 'bg-amber-200 text-amber-800' :
                          'bg-slate-200 text-slate-600'
                        }`}>
                          Score: {action.score}
                        </span>
                      )}
                      {action.pmids.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {action.pmids.map(pmid => (
                            <a key={pmid} href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`} target="_blank" rel="noreferrer" className="text-[11px] md:text-xs underline text-amber-700">PMID:{pmid}</a>
                          ))}
                        </div>
                      )}
                    </div>

                    {action.mechanisms.length > 0 && (
                      <div className="mt-2 ml-2 space-y-1.5">
                        {action.mechanisms.map((mech, mechIndex) => (
                          <div key={`${mech.name}-${mechIndex}`} className="border-l-2 border-blue-200 pl-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] md:text-xs text-slate-500">Mechanism:</span>
                              <span className="px-2 py-0.5 bg-blue-100 border border-blue-200 rounded text-[11px] md:text-xs text-blue-800">{mech.name}</span>
                              {mech.pmids.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {mech.pmids.slice(0, 2).map(pmid => (
                                    <a key={pmid} href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`} target="_blank" rel="noreferrer" className="text-[11px] md:text-xs underline text-blue-700">PMID:{pmid}</a>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─ References Section ─ */}
          {result.references && result.references.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6">
              <button
                onClick={() => setExpandedRefs(!expandedRefs)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-amber-600" />
                  <h4 className="text-sm md:text-base font-extrabold text-slate-800">References</h4>
                  <span className="text-[11px] md:text-xs text-slate-400">({result.references.length})</span>
                </div>
                {expandedRefs ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>

              <AnimatePresence>
                {expandedRefs && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
                      {result.references.map((ref, i) => (
                        <ReferenceItem key={`${ref.pmid}-${i}`} reference={ref} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      )}

      {/* ─── Initial State ─── */}
      {!searched && !loading && !error && (
        <div className="space-y-8 mt-4">
          <div className="text-center py-12 md:py-16 px-4 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-amber-700 text-white px-4 md:px-5 py-2 rounded-full text-[10px] md:text-xs font-extrabold mb-6 md:mb-8 tracking-widest shadow-sm">
                DEEP PHYTOCHEMICAL INTELLIGENCE
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 md:mb-6 tracking-tight leading-tight">
                Plant Chemistry.<br />Decoded.
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed mb-8 md:mb-10 text-sm md:text-lg font-medium">
                Explore the complete phytochemical profile of medicinal plants — compound structures, biosynthetic pathways, pharmacological actions, and evidence from PubMed literature.
              </p>
              <div className="flex justify-center gap-3 md:gap-4 flex-wrap">
                <span className="px-4 md:px-5 py-2 md:py-2.5 bg-amber-700 text-white rounded-lg text-[10px] md:text-xs font-extrabold tracking-widest shadow-sm">COMPOUND PROFILES</span>
                <span className="px-4 md:px-5 py-2 md:py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-[10px] md:text-xs font-extrabold tracking-widest">BIOSYNTHETIC PATHWAYS</span>
                <span className="px-4 md:px-5 py-2 md:py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-[10px] md:text-xs font-extrabold tracking-widest">2D &amp; 3D STRUCTURES</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Loading Skeleton ───

function PhytoInsightSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-amber-200 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-amber-100 rounded w-2/5" />
            <div className="h-3 bg-slate-100 rounded w-3/5" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="h-5 w-24 rounded-full bg-amber-100" />
          <div className="h-5 w-28 rounded-full bg-slate-100" />
          <div className="h-5 w-20 rounded-full bg-slate-50" />
        </div>
        <div className="h-3 bg-slate-100 rounded w-full mb-2" />
        <div className="h-3 bg-slate-50 rounded w-2/3" />
      </div>

      {/* Distribution bar skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
        <div className="h-4 bg-slate-200 rounded w-48 mb-4" />
        <div className="h-10 rounded-xl bg-slate-100 mb-4" />
        <div className="flex gap-4">
          <div className="h-3 bg-slate-100 rounded w-20" />
          <div className="h-3 bg-slate-100 rounded w-24" />
          <div className="h-3 bg-slate-100 rounded w-16" />
        </div>
      </div>

      {/* Compound cards skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="flex gap-2">
                <div className="h-4 bg-amber-50 rounded w-16" />
                <div className="h-4 bg-slate-50 rounded w-20" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-40 bg-slate-50 rounded-lg" />
            <div className="space-y-2">
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-50 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-5/6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── PhytoCompound Card ───

interface PhytoCompoundCardProps {
  compound: PhytoCompoundProfile;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onCopy: (text: string, label: string) => void;
}

function PhytoCompoundCard({ compound, index, expanded, onToggle, onCopy }: PhytoCompoundCardProps) {
  const pubchemUrl = compound.cid
    ? `https://pubchem.ncbi.nlm.nih.gov/compound/${compound.cid}`
    : '';
  const chebiUrl = compound.chebiId
    ? `https://www.ebi.ac.uk/chebi/searchId.do?chebiId=${compound.chebiId}`
    : '';

  const categoryColor = PHYTO_CLASS_COLORS[compound.compoundClass] || '#94a3b8';

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Card header — always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${categoryColor}18` }}>
            <Beaker size={16} style={{ color: categoryColor }} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm md:text-base font-bold text-slate-800 truncate">{compound.name}</h4>
              {compound.isMajorConstituent && (
                <span className="px-1.5 py-0.5 bg-amber-100 border border-amber-300 rounded text-[9px] md:text-[10px] font-bold text-amber-700 uppercase tracking-wide flex-shrink-0">
                  Major
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              {/* Category badge with color */}
              <span
                className="text-[11px] md:text-xs font-bold px-2 py-0.5 rounded border"
                style={{
                  color: categoryColor,
                  backgroundColor: `${categoryColor}14`,
                  borderColor: `${categoryColor}30`,
                }}
              >
                {compound.compoundClass}
              </span>
              {compound.molecularFormula && (
                <span className="text-[11px] md:text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {compound.molecularFormula}
                </span>
              )}
              {compound.molecularWeight > 0 && (
                <span className="text-[11px] md:text-xs text-slate-500">
                  MW: {compound.molecularWeight.toFixed(2)}
                </span>
              )}
              {compound.typicalConcentration && (
                <span className="text-[10px] md:text-[11px] text-slate-400 italic">
                  ~{compound.typicalConcentration}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {compound.cid > 0 && (
            <a
              href={pubchemUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[10px] md:text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1"
            >
              PubChem <ExternalLink size={10} />
            </a>
          )}
          {expanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 md:px-5 pb-5 pt-1 border-t border-slate-100">
              <PhytoStructureViewer
                compound={compound}
                index={index}
                onCopy={onCopy}
                pubchemUrl={pubchemUrl}
                chebiUrl={chebiUrl}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── 2D/3D Structure Viewer with Tabs ───

type ViewMode = '2d' | '3d';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Viewer3D = any;

interface PhytoStructureViewerProps {
  compound: PhytoCompoundProfile;
  index: number;
  onCopy: (text: string, label: string) => void;
  pubchemUrl: string;
  chebiUrl: string;
}

function PhytoStructureViewer({ compound, index, onCopy, pubchemUrl, chebiUrl }: PhytoStructureViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('2d');
  const [image2dLoaded, setImage2dLoaded] = useState(false);
  const [image2dError, setImage2dError] = useState(false);
  const viewer3dContainerRef = useRef<HTMLDivElement>(null);
  const viewer3dRef = useRef<Viewer3D>(null);
  const [viewer3dState, setViewer3dState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [viewer3dError, setViewer3dError] = useState<string>('');

  // ─── Initialize 3D viewer when switching to 3D tab ───
  useEffect(() => {
    if (viewMode !== '3d' || !compound.cid || compound.cid === 0) return;

    let cancelled = false;
    setViewer3dState('loading');
    setViewer3dError('');

    const init3D = async () => {
      try {
        // 1. Import 3Dmol from npm package (client-side only)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let $3Dmol: any = null;
        try {
          const mod = await import('3dmol');
          $3Dmol = mod.default || mod;
          if (!$3Dmol.createViewer && $3Dmol.$3Dmol) {
            $3Dmol = $3Dmol.$3Dmol;
          }
        } catch (importErr) {
          console.error('[3D Viewer] npm import failed:', importErr);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          $3Dmol = (window as any).$3Dmol;
        }

        if (!$3Dmol || !$3Dmol.createViewer) {
          // Fallback: try loading from CDN
          console.log('[3D Viewer] Trying CDN fallback...');
          const cdnLoaded = await new Promise<boolean>((resolve) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const w = window as any;
            if (w.$3Dmol) { resolve(true); return; }
            const existing = document.getElementById('3dmol-script');
            if (existing) {
              const check = setInterval(() => {
                if (w.$3Dmol) { clearInterval(check); resolve(true); }
              }, 100);
              setTimeout(() => { clearInterval(check); resolve(false); }, 10000);
              return;
            }
            const script = document.createElement('script');
            script.id = '3dmol-script';
            script.src = 'https://cdn.jsdelivr.net/npm/3dmol@2.5.4/build/3Dmol-min.js';
            script.async = true;
            script.onload = () => setTimeout(() => resolve(!!w.$3Dmol), 100);
            script.onerror = () => resolve(false);
            document.head.appendChild(script);
          });

          if (cdnLoaded) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            $3Dmol = (window as any).$3Dmol;
          }
        }

        if (!$3Dmol || !$3Dmol.createViewer || cancelled) {
          if (!cancelled) {
            setViewer3dState('error');
            setViewer3dError('3Dmol.js library could not be loaded. Try refreshing the page.');
          }
          return;
        }

        // 2. Fetch SDF data through our server-side proxy
        let sdfData = '';
        let is3dData = false;

        try {
          const proxyRes = await fetch('/api/structure/sdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cid: compound.cid, record_type: '3d' }),
            signal: AbortSignal.timeout(30000),
          });

          if (proxyRes.ok) {
            const data = await proxyRes.json();
            if (data.sdf && data.sdf.trim().length > 50) {
              sdfData = data.sdf;
              is3dData = data.recordType === '3d';
            }
          } else {
            console.warn('[3D Viewer] SDF proxy HTTP error:', proxyRes.status);
          }
        } catch (err) {
          console.warn('[3D Viewer] SDF proxy fetch failed:', err instanceof Error ? err.message : String(err));
        }

        if (!sdfData || cancelled) {
          if (!cancelled) {
            setViewer3dState('error');
            setViewer3dError('Could not fetch structure data. The compound may not have 3D conformer data in PubChem.');
          }
          return;
        }

        // 3. Wait for the container to be fully laid out
        await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

        if (cancelled) return;

        // 4. Create the viewer
        const container = viewer3dContainerRef.current;
        if (!container) {
          if (!cancelled) { setViewer3dState('error'); setViewer3dError('Viewer container not available.'); }
          return;
        }

        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
          const rect2 = container.getBoundingClientRect();
          if (rect2.width === 0 || rect2.height === 0) {
            if (!cancelled) { setViewer3dState('error'); setViewer3dError('Viewer container has no dimensions.'); }
            return;
          }
        }

        // 5. Create viewer and add model
        let viewer = null;
        try {
          viewer = $3Dmol.createViewer(container, {
            backgroundColor: '#ffffff',
            antialias: true,
          });
        } catch (viewerErr) {
          console.error('[3D Viewer] createViewer threw:', viewerErr);
          if (!cancelled) {
            setViewer3dState('error');
            setViewer3dError('3Dmol.js createViewer failed: ' + (viewerErr instanceof Error ? viewerErr.message : String(viewerErr)));
          }
          return;
        }

        if (!viewer || cancelled) {
          if (!cancelled) { setViewer3dState('error'); setViewer3dError('3Dmol.js createViewer returned null.'); }
          return;
        }

        viewer3dRef.current = viewer;

        try {
          viewer.addModel(sdfData, 'sdf');

          if (is3dData) {
            viewer.setStyle({}, { stick: { radius: 0.12 }, sphere: { scale: 0.25 } });
          } else {
            viewer.setStyle({}, { stick: { radius: 0.15 } });
          }

          viewer.zoomTo();
          viewer.render();
          if (is3dData) viewer.spin(true);
        } catch (modelErr) {
          console.error('[3D Viewer] Error rendering model:', modelErr);
          if (!cancelled) {
            setViewer3dState('error');
            setViewer3dError('Error rendering 3D model: ' + (modelErr instanceof Error ? modelErr.message : String(modelErr)));
          }
          return;
        }

        if (!cancelled) setViewer3dState('ready');
      } catch (err) {
        console.error('[3D Viewer] Unexpected error:', err);
        if (!cancelled) {
          setViewer3dState('error');
          setViewer3dError(err instanceof Error ? err.message : 'Unknown error initializing 3D viewer');
        }
      }
    };

    init3D();

    return () => {
      cancelled = true;
      if (viewer3dRef.current) {
        try { viewer3dRef.current.clear(); } catch { /* ignore */ }
        try {
          const container = viewer3dContainerRef.current;
          if (container) container.innerHTML = '';
        } catch { /* ignore */ }
        viewer3dRef.current = null;
      }
    };
  }, [viewMode, compound.cid]);

  // ─── 3D Controls ───
  const handleResetView = () => {
    if (viewer3dRef.current) {
      try { viewer3dRef.current.zoomTo(); viewer3dRef.current.render(); } catch { /* */ }
    }
  };
  const handleZoomIn = () => {
    if (viewer3dRef.current) {
      try { viewer3dRef.current.zoom(1.2); viewer3dRef.current.render(); } catch { /* */ }
    }
  };
  const handleZoomOut = () => {
    if (viewer3dRef.current) {
      try { viewer3dRef.current.zoom(0.8); viewer3dRef.current.render(); } catch { /* */ }
    }
  };

  const has3D = compound.cid > 0;

  // Build 2D image URL — use PubChem PNG endpoint
  const image2dUrl = compound.cid > 0
    ? `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${compound.cid}/PNG?image_size=large`
    : compound.imageUrl2D;

  const categoryColor = PHYTO_CLASS_COLORS[compound.compoundClass] || '#94a3b8';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {/* Structure Viewer */}
      <div>
        {/* 2D / 3D Toggle Tabs */}
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => setViewMode('2d')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === '2d'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <Hexagon size={12} /> 2D Structure
          </button>
          <button
            onClick={() => { if (has3D) setViewMode('3d'); }}
            disabled={!has3D}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === '3d'
                ? 'bg-amber-600 text-white shadow-sm'
                : has3D
                  ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  : 'bg-slate-50 text-slate-300 cursor-not-allowed'
            }`}
          >
            <Box size={12} /> 3D Conformer
          </button>
          {!has3D && (
            <span className="text-[10px] text-slate-400 italic">3D not available</span>
          )}
        </div>

        {/* 2D Viewer */}
        {viewMode === '2d' && (
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center min-h-[280px] relative">
            {image2dUrl && !image2dError ? (
              <>
                {!image2dLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <img
                  src={image2dUrl}
                  alt={`2D chemical structure of ${compound.name}`}
                  className="max-w-full max-h-[320px] object-contain"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onLoad={() => setImage2dLoaded(true)}
                  onError={() => { setImage2dError(true); setImage2dLoaded(true); }}
                />
              </>
            ) : (
              <div className="text-center text-slate-400">
                <Hexagon size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs">
                  {image2dError ? 'Could not load 2D structure image' : '2D structure not available'}
                </p>
                {compound.cid > 0 && (
                  <a
                    href={`https://pubchem.ncbi.nlm.nih.gov/compound/${compound.cid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-amber-600 hover:underline mt-1 inline-block"
                  >
                    View on PubChem instead
                  </a>
                )}
              </div>
            )}
            {/* Figure caption */}
            {image2dUrl && !image2dError && image2dLoaded && (
              <p className="text-[10px] md:text-[11px] text-slate-400 mt-2 italic text-center">
                Figure {index + 1}: 2D Chemical Structure of {compound.name}
              </p>
            )}
          </div>
        )}

        {/* 3D Viewer */}
        {viewMode === '3d' && (
          <div className="relative" style={{ height: '420px' }}>
            <div
              ref={viewer3dContainerRef}
              className="bg-white border border-slate-200 rounded-xl"
              style={{ width: '100%', height: '100%', position: 'relative' }}
            />
            {/* 3D Controls */}
            {viewer3dState === 'ready' && (
              <div className="absolute top-2 right-2 flex gap-1 bg-white/90 rounded-lg border border-slate-200 p-1 shadow-sm z-10">
                <button onClick={handleZoomIn} className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Zoom In">
                  <ZoomIn size={14} className="text-slate-600" />
                </button>
                <button onClick={handleZoomOut} className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Zoom Out">
                  <ZoomOut size={14} className="text-slate-600" />
                </button>
                <button onClick={handleResetView} className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Reset View">
                  <RotateCcw size={14} className="text-slate-600" />
                </button>
                <button
                  onClick={() => {
                    if (viewer3dContainerRef.current?.requestFullscreen) {
                      viewer3dContainerRef.current.requestFullscreen();
                    }
                  }}
                  className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                  title="Fullscreen"
                >
                  <Maximize2 size={14} className="text-slate-600" />
                </button>
              </div>
            )}
            {/* Loading overlay */}
            {viewer3dState === 'loading' && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl pointer-events-none z-10">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Loading 3D conformer…</p>
                  <p className="text-[10px] text-slate-400 mt-1">Fetching structure data from PubChem</p>
                </div>
              </div>
            )}
            {/* Error overlay */}
            {viewer3dState === 'error' && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl z-10">
                <div className="text-center text-slate-400">
                  <Box size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-medium">3D conformer not available</p>
                  {viewer3dError && (
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[240px]">{viewer3dError}</p>
                  )}
                  {!viewer3dError && (
                    <p className="text-[10px] text-slate-400 mt-1">This compound may not have 3D data in PubChem</p>
                  )}
                  {compound.cid > 0 && (
                    <a
                      href={`https://pubchem.ncbi.nlm.nih.gov/compound/${compound.cid}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-amber-600 hover:underline mt-1 inline-block"
                    >
                      View on PubChem
                    </a>
                  )}
                </div>
              </div>
            )}
            {/* Spin hint */}
            {viewer3dState === 'ready' && (
              <div className="absolute bottom-2 left-2 bg-white/90 rounded-md px-2 py-1 border border-slate-200 z-10">
                <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                  <RotateCcw size={10} /> Drag to rotate · Scroll to zoom
                </p>
              </div>
            )}
            {/* Figure caption for 3D */}
            <div className="absolute bottom-2 right-2 bg-white/90 rounded-md px-2 py-1 border border-slate-200 z-10">
              <p className="text-[10px] text-slate-400 italic">
                Figure {index + 1}: 3D Conformer of {compound.name}
              </p>
            </div>
          </div>
        )}

        {/* Quick identifiers below structure */}
        <div className="flex flex-wrap gap-2 mt-2">
          {compound.cid > 0 && (
            <a
              href={pubchemUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-[11px] font-bold text-amber-700 hover:bg-amber-100"
            >
              <Database size={10} /> CID: {compound.cid}
            </a>
          )}
          {compound.chebiId && (
            <a
              href={chebiUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-2 py-1 bg-teal-50 border border-teal-200 rounded text-[11px] font-bold text-teal-700 hover:bg-teal-100"
            >
              <Database size={10} /> {compound.chebiId}
            </a>
          )}
        </div>
      </div>

      {/* Molecular Properties */}
      <div>
        <h5 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <CheckCircle size={12} className="text-amber-500" /> Molecular Properties
        </h5>
        <div className="space-y-2">
          {compound.iupacName && (
            <PropertyRow label="IUPAC Name" value={compound.iupacName} copyable onCopy={onCopy} />
          )}
          {compound.molecularFormula && (
            <PropertyRow label="Molecular Formula" value={compound.molecularFormula} copyable onCopy={onCopy} />
          )}
          {compound.molecularWeight > 0 && (
            <PropertyRow label="Molecular Weight" value={`${compound.molecularWeight.toFixed(2)} g/mol`} />
          )}
          {compound.smiles && (
            <PropertyRow label="SMILES" value={compound.smiles} copyable mono onCopy={onCopy} />
          )}
          {compound.inchi && (
            <PropertyRow label="InChI" value={compound.inchi} copyable mono onCopy={onCopy} />
          )}
          {compound.inchiKey && (
            <PropertyRow label="InChI Key" value={compound.inchiKey} copyable mono onCopy={onCopy} />
          )}
          {compound.casNumber && (
            <PropertyRow label="CAS Number" value={compound.casNumber} copyable onCopy={onCopy} />
          )}
          {compound.sourceOrganism && (
            <PropertyRow label="Source Organism" value={compound.sourceOrganism} />
          )}
          {compound.compoundClass && (
            <PropertyRow label="Compound Class" value={compound.compoundClass} />
          )}
          {compound.superclass && (
            <PropertyRow label="Superclass" value={compound.superclass} />
          )}
          {compound.biosyntheticPathway && (
            <PropertyRow label="Biosynthetic Pathway" value={compound.biosyntheticPathway} />
          )}
          {compound.typicalConcentration && (
            <PropertyRow label="Typical Concentration" value={compound.typicalConcentration} />
          )}
          {compound.abundanceRank && (
            <PropertyRow label="Abundance Rank" value={`#${compound.abundanceRank}`} />
          )}
        </div>

        {/* Pharmacological Action Tags */}
        {compound.pharmacologicalActions.length > 0 && (
          <div className="mt-4">
            <h5 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FlaskConical size={12} className="text-amber-500" /> Pharmacological Actions
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {compound.pharmacologicalActions.map((action, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded text-[10px] md:text-[11px] font-medium border"
                  style={{
                    color: categoryColor,
                    backgroundColor: `${categoryColor}14`,
                    borderColor: `${categoryColor}30`,
                  }}
                >
                  {action}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* PubMed References */}
        {compound.pubmedReferences.length > 0 && (
          <div className="mt-4">
            <h5 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Leaf size={12} className="text-emerald-500" /> PubMed References
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {compound.pubmedReferences.map(pmid => (
                <a
                  key={pmid}
                  href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] md:text-xs underline text-emerald-700 hover:text-emerald-900"
                >
                  PMID:{pmid}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* External Links */}
        <div className="mt-4">
          <h5 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ExternalLink size={12} className="text-slate-400" /> External Links
          </h5>
          <div className="flex flex-wrap gap-2">
            {compound.cid > 0 && (
              <a
                href={pubchemUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-700 hover:bg-amber-100 transition-colors"
              >
                <Database size={12} /> PubChem
              </a>
            )}
            {compound.chebiId && (
              <a
                href={chebiUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-teal-50 border border-teal-200 rounded-lg text-xs font-bold text-teal-700 hover:bg-teal-100 transition-colors"
              >
                <Database size={12} /> ChEBI
              </a>
            )}
            {compound.inchiKey && (
              <a
                href={`https://www.npatlas.org/api/v1/compounds?inchikey=${compound.inchiKey}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-lime-50 border border-lime-200 rounded-lg text-xs font-bold text-lime-700 hover:bg-lime-100 transition-colors"
              >
                <Database size={12} /> NPAtlas
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Property Row Component ───

interface PropertyRowProps {
  label: string;
  value: string;
  copyable?: boolean;
  mono?: boolean;
  onCopy?: (text: string, label: string) => void;
}

function PropertyRow({ label, value, copyable, mono, onCopy }: PropertyRowProps) {
  return (
    <div className="flex items-start gap-2 py-1.5 px-2 bg-slate-50 rounded-lg">
      <span className="text-[11px] font-bold text-slate-500 min-w-[100px] md:min-w-[130px] flex-shrink-0 pt-0.5">{label}</span>
      <span className={`text-[11px] md:text-xs text-slate-800 break-all flex-1 ${mono ? 'font-mono' : 'font-medium'}`}>
        {value}
      </span>
      {copyable && onCopy && (
        <button
          onClick={() => onCopy(value, label)}
          className="flex-shrink-0 p-1 hover:bg-slate-200 rounded transition-colors"
          title={`Copy ${label}`}
        >
          <Copy size={12} className="text-slate-400" />
        </button>
      )}
    </div>
  );
}

// ─── Reference Item Component ───

interface ReferenceItemProps {
  reference: PharmacologyReference;
}

function ReferenceItem({ reference }: ReferenceItemProps) {
  return (
    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
      <div className="flex items-start gap-2">
        <BookOpen size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          {reference.title && (
            <p className="text-xs md:text-sm font-semibold text-slate-800 mb-1 leading-snug">{reference.title}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] md:text-[11px] text-slate-500">
            {reference.authors.length > 0 && (
              <span className="truncate max-w-[200px]">{reference.authors.slice(0, 3).join(', ')}{reference.authors.length > 3 ? ' et al.' : ''}</span>
            )}
            {reference.journal && (
              <span className="italic">{reference.journal}</span>
            )}
            {reference.pubYear && (
              <span>({reference.pubYear})</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <a
              href={`https://pubmed.ncbi.nlm.nih.gov/${reference.pmid}/`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[10px] md:text-[11px] font-bold text-amber-700 hover:text-amber-900"
            >
              PMID:{reference.pmid} <ExternalLink size={9} />
            </a>
            {reference.doi && (
              <a
                href={`https://doi.org/${reference.doi}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[10px] md:text-[11px] font-bold text-sky-700 hover:text-sky-900"
              >
                DOI:{reference.doi} <ExternalLink size={9} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
