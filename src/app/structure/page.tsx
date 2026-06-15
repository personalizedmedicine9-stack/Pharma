'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Atom, Hexagon, Box, RotateCcw, ZoomIn, ZoomOut, Maximize2,
  Database, ExternalLink, ChevronDown, ChevronUp, Beaker, AlertTriangle,
  Info, Bookmark, BookmarkCheck, Copy, Leaf, Upload, Type,
  FileUp, X, CheckCircle2, Loader2, Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  type CompoundResult, type StructureSearchResponse,
  type SearchMode, type ViewerMode,
  EXAMPLE_COMPOUNDS, SUPPORTED_FORMATS, ACCEPTED_EXTENSIONS,
} from '@/lib/structure-types';

// ─── 3Dmol.js CDN Loader ─────────────────────────────────────────────────────

async function load3DmolCDN(): Promise<unknown> {
  const win = window as Record<string, unknown>;
  if (win.$3Dmol) return win.$3Dmol;

  const existingScript = document.getElementById('3dmol-script');
  if (existingScript) {
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (win.$3Dmol) { clearInterval(check); resolve(win.$3Dmol); }
      }, 100);
      setTimeout(() => { clearInterval(check); resolve(null); }, 10000);
    });
  }

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.id = '3dmol-script';
    script.src = 'https://cdn.jsdelivr.net/npm/3dmol@2.5.4/build/3Dmol-min.js';
    script.async = true;
    script.onload = () => setTimeout(() => resolve(win.$3Dmol || null), 100);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function StructurePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<StructureSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>('exact');
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [isSaved, setIsSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [parsedSmiles, setParsedSmiles] = useState<string | null>(null);
  const [parsedInchi, setParsedInchi] = useState<string | null>(null);
  const [parsedFormula, setParsedFormula] = useState<string | null>(null);
  const [parsedCompoundName, setParsedCompoundName] = useState<string | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [activeTab, setActiveTab] = useState('text');
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // ─── Search Handler ───────────────────────────────────────────────────────

  const handleSearch = useCallback(async (query: string, mode: SearchMode = 'exact') => {
    if (!query.trim()) return;
    setIsSearching(true);
    setError(null);
    setSearchResult(null);
    setHasSearched(false);
    setIsSaved(false);
    setExpandedCards(new Set());
    setSearchQuery(query);

    try {
      const res = await fetch('/api/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), searchMode: mode }),
      });
      const data: StructureSearchResponse = await res.json();
      if (data.compounds && data.compounds.length > 0) {
        setExpandedCards(new Set([0]));
      }
      setSearchResult(data);
    } catch {
      setError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  }, []);

  // ─── File Upload Handler ──────────────────────────────────────────────────

  const handleFileUpload = useCallback(async (file: File) => {
    setUploadedFileName(file.name);
    setIsParsingFile(true);
    setParsedSmiles(null);
    setParsedInchi(null);
    setParsedFormula(null);
    setParsedCompoundName(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/structure/upload', {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        body: formData,
      });
      const data = await res.json();

      if (data.success && (data.smiles || data.inchi)) {
        if (data.smiles) setParsedSmiles(data.smiles);
        if (data.inchi) setParsedInchi(data.inchi);
        if (data.molecularFormula) setParsedFormula(data.molecularFormula);
        if (data.compoundName) setParsedCompoundName(data.compoundName);

        const desc = [
          data.atomCount ? `${data.atomCount} atoms, ${data.bondCount} bonds` : '',
          data.molecularFormula || '',
          data.format ? `(${data.format})` : '',
        ].filter(Boolean).join(' · ');

        toast.success(`Parsed: ${data.compoundName || data.molecularFormula || file.name}`, {
          description: desc,
        });
      } else {
        toast.error(data.error || 'Could not parse the uploaded file.');
        if (data.hint) toast.info(data.hint, { duration: 6000 });
        setUploadedFileName(null);
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload file. Check that the API route exists at src/app/api/structure/upload/route.ts');
      setUploadedFileName(null);
    } finally {
      setIsParsingFile(false);
    }
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleUploadedFileSearch = useCallback(() => {
    const query = parsedSmiles || parsedInchi;
    if (query) handleSearch(query, searchMode);
  }, [parsedSmiles, parsedInchi, handleSearch, searchMode]);

  const clearUpload = useCallback(() => {
    setUploadedFileName(null);
    setParsedSmiles(null);
    setParsedInchi(null);
    setParsedFormula(null);
    setParsedCompoundName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  // ─── Copy to Clipboard ────────────────────────────────────────────────────

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success(`${label} copied to clipboard`),
      () => toast.error('Failed to copy')
    );
  };

  // ─── Toggle Card Expansion ────────────────────────────────────────────────

  const toggleCard = (index: number) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });
  };

  const canSearch = mounted && !isSearching;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 antialiased">
      {/* Header — PhytoInsight Original Branding */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center">
            <Atom size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-extrabold text-slate-800 tracking-tight">PhytoInsight</h1>
            <p className="text-[11px] text-slate-400 font-medium">Chemical Structure Search</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-8">
        {/* ─── Search Section ─────────────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-8">
            {/* Title */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-cyan-600 flex items-center justify-center flex-shrink-0">
                <Hexagon size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-extrabold text-slate-800">Chemical Structure Search</h2>
                <p className="text-slate-400 text-xs md:text-sm">Search by name or upload a structure file</p>
              </div>
            </div>

            {/* Search Mode Selector */}
            <div className="flex flex-wrap gap-2 mb-4">
              {([
                { mode: 'exact' as SearchMode, label: 'Exact Match', icon: CheckCircle2 },
                { mode: 'similarity' as SearchMode, label: 'Similarity', icon: Search },
              ]).map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  onClick={() => setSearchMode(mode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    searchMode === mode
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>

            {/* Input Mode Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="text" className="flex items-center gap-1.5">
                  <Type size={14} /> Text Search
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center gap-1.5">
                  <Upload size={14} /> Attach File
                </TabsTrigger>
              </TabsList>

              {/* ─── Text Search Tab ───────────────────────────────────────── */}
              <TabsContent value="text">
                <form onSubmit={(e) => { e.preventDefault(); handleSearch(searchQuery, searchMode); }} className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm md:text-base font-semibold text-slate-600 uppercase tracking-wide">
                      <Atom size={15} className="text-cyan-500" />
                      Compound Name, CAS, SMILES, InChI, or CID
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. Curcumin, 458-37-7, CC1=CC=C(C=C1), InChI=1S/C21H20O6..."
                      required
                      className="w-full px-4 py-3 md:py-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm md:text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all shadow-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!canSearch || !searchQuery.trim()}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3.5 md:py-4 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-md shadow-cyan-200 hover:shadow-lg hover:shadow-cyan-200 active:scale-[0.98] text-sm md:text-base"
                  >
                    {isSearching ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Searching Chemical Structures...
                      </>
                    ) : (
                      <>
                        <Search size={18} />
                        Search Chemical Structure
                      </>
                    )}
                  </button>
                </form>

                {/* Quick Examples */}
                <div className="mt-4">
                  <p className="text-[11px] md:text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Quick examples</p>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLE_COMPOUNDS.map(compound => (
                      <button
                        key={compound}
                        onClick={() => { setSearchQuery(compound); handleSearch(compound, searchMode); }}
                        className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs md:text-sm text-slate-600 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 transition-all"
                      >
                        <Atom size={12} className="text-cyan-400" />
                        {compound}
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* ─── File Upload Tab ────────────────────────────────────────── */}
              <TabsContent value="upload">
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-sm md:text-base font-semibold text-slate-600 uppercase tracking-wide">
                    <FileUp size={15} className="text-cyan-500" />
                    Attach Chemical Structure File
                  </label>

                  {/* Drop Zone */}
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all cursor-pointer ${
                      isDragOver
                        ? 'border-cyan-500 bg-cyan-50/50'
                        : 'border-slate-300 hover:border-cyan-400 hover:bg-cyan-50/30'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED_EXTENSIONS}
                      className="hidden"
                      onChange={handleFileInputChange}
                    />
                    {isParsingFile ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 size={32} className="text-cyan-500 animate-spin" />
                        <p className="text-sm text-slate-500 font-medium">Parsing structure file...</p>
                      </div>
                    ) : uploadedFileName ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                          <CheckCircle2 size={24} className="text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{uploadedFileName}</p>
                          {parsedCompoundName && (
                            <p className="text-xs text-cyan-700 font-bold mt-1">{parsedCompoundName}</p>
                          )}
                          {parsedFormula && (
                            <p className="text-xs text-slate-500 font-mono mt-0.5">{parsedFormula}</p>
                          )}
                          {parsedSmiles && (
                            <p className="text-xs text-slate-500 mt-1 font-mono break-all">
                              SMILES: {parsedSmiles.substring(0, 60)}{parsedSmiles.length > 60 ? '...' : ''}
                            </p>
                          )}
                          {parsedInchi && !parsedSmiles && (
                            <p className="text-xs text-slate-500 mt-1 font-mono break-all">
                              InChI: {parsedInchi.substring(0, 60)}{parsedInchi.length > 60 ? '...' : ''}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleUploadedFileSearch(); }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg text-xs transition-all"
                          >
                            <Search size={14} /> Search This Structure
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); clearUpload(); }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-600 hover:text-red-600 font-bold rounded-lg text-xs transition-all"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                          <Upload size={28} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">Click to upload or drag & drop</p>
                          <p className="text-xs text-slate-400 mt-1">Chemical structure files from ChemDraw, Marvin, or any chemistry software</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Supported Formats Grid */}
                  <div className="bg-slate-900 border border-slate-800 p-4 md:p-5 rounded-xl shadow-xl">
                    <div className="flex items-start gap-3">
                      <Info size={18} className="text-white mt-0.5 flex-shrink-0" />
                      <div className="w-full">
                        <p className="text-xs md:text-sm text-gray-300 leading-relaxed mb-3">
                          <span className="font-extrabold text-white">Supported formats: </span>
                          Upload structure files exported from ChemDraw, Marvin JS, RDKit, Open Babel, or any chemical software.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          {SUPPORTED_FORMATS.map(fmt => (
                            <div key={fmt.ext} className="bg-slate-800 rounded-lg px-2 py-1.5 text-center">
                              <span className="text-cyan-300 font-bold text-[11px]">{fmt.ext}</span>
                              <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">{fmt.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
                <AlertTriangle size={18} className="text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-rose-700 text-sm md:text-base">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Search Results ────────────────────────────────────────────── */}
          <AnimatePresence>
            {hasSearched && searchResult && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
                {searchResult.spellingCorrection && (
                  <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <Info size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs md:text-sm text-amber-800 font-medium">
                      Showing results for <strong>{searchResult.spellingCorrection.corrected}</strong>
                    </p>
                  </div>
                )}

                {searchResult.confidenceReasoning && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <h4 className="text-xs font-extrabold text-blue-800 uppercase tracking-wider mb-1">Confidence Assessment</h4>
                    <p className="text-xs md:text-sm text-blue-900 leading-relaxed">{searchResult.confidenceReasoning}</p>
                  </div>
                )}

                {searchResult.compounds.length === 0 && searchResult.noResultsMessage && (
                  <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <AlertTriangle size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-500 text-sm md:text-base">{searchResult.noResultsMessage}</p>
                  </div>
                )}

                {searchResult.compounds.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Hexagon size={18} className="text-cyan-600" />
                          <h3 className="text-base md:text-lg font-extrabold text-slate-800">{searchResult.query}</h3>
                        </div>
                        <p className="text-slate-400 text-xs md:text-sm">
                          Chemical structure data — {searchResult.totalResults} compound{searchResult.totalResults > 1 ? 's' : ''} found
                          {searchResult.searchMode && searchResult.searchMode !== 'exact' && (
                            <span className="ml-2 px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded text-[10px] font-bold uppercase">
                              {searchResult.searchMode}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {searchResult.sourcesUsed.map(source => (
                          <span key={source} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] md:text-xs font-bold bg-cyan-600 text-white">
                            <Database size={10} /> {source}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => { setIsSaved(true); toast.success('Structure report saved!'); }}
                      disabled={isSaved}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 hover:border-cyan-500 disabled:border-cyan-400 rounded-xl text-sm font-bold text-gray-700 hover:text-cyan-700 disabled:text-cyan-600 transition-all shadow-sm mb-4"
                    >
                      {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                      {isSaved ? 'Saved' : 'Save Report'}
                    </button>

                    <div className="space-y-4">
                      {searchResult.compounds.map((compound, index) => (
                        <CompoundCard
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Empty State ───────────────────────────────────────────────── */}
          {!hasSearched && !isSearching && !error && (
            <div className="text-center py-12 md:py-16 px-4 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-cyan-700 text-white px-4 md:px-5 py-2 rounded-full text-[10px] md:text-xs font-extrabold mb-6 md:mb-8 tracking-widest shadow-sm">
                  2D & 3D CHEMICAL STRUCTURE RETRIEVAL
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 md:mb-6 tracking-tight leading-tight">
                  Any Compound.<br />2D & 3D Structures.
                </h2>
                <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed mb-8 md:mb-10 text-sm md:text-lg font-medium">
                  Search by compound name, CAS number, SMILES, InChI, InChIKey, or PubChem CID.
                  <strong className="text-cyan-700"> Upload a .mol/.sdf/.cdxml file</strong> from ChemDraw or any chemical software.
                </p>
                <div className="flex justify-center gap-3 md:gap-4 flex-wrap">
                  <span className="px-4 md:px-5 py-2 md:py-2.5 bg-cyan-700 text-white rounded-lg text-[10px] md:text-xs font-extrabold tracking-widest shadow-sm">
                    100M+ COMPOUNDS
                  </span>
                  <span className="px-4 md:px-5 py-2 md:py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-[10px] md:text-xs font-extrabold tracking-widest">
                    TEXT + FILE UPLOAD
                  </span>
                  <span className="px-4 md:px-5 py-2 md:py-2.5 bg-emerald-600 text-white rounded-lg text-[10px] md:text-xs font-extrabold tracking-widest shadow-sm">
                    10 FILE FORMATS
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-6 text-center">
          <p className="text-xs text-slate-400">PhytoInsight Chemical Structure Search — Data sourced from PubChem, ChEBI, NPAtlas, and PubMed</p>
        </div>
      </footer>
    </div>
  );
}

// ─── Compound Card Component ──────────────────────────────────────────────────

function CompoundCard({
  compound,
  index,
  expanded,
  onToggle,
  onCopy,
}: {
  compound: CompoundResult;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onCopy: (text: string, label: string) => void;
}) {
  const pubchemUrl = compound.cid > 0
    ? `https://pubchem.ncbi.nlm.nih.gov/compound/${compound.cid}`
    : '';
  const chebiUrl = compound.chebiId
    ? `https://www.ebi.ac.uk/chebi/searchId.do?chebiId=${compound.chebiId}`
    : '';

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Beaker size={16} className="text-cyan-700" />
          </div>
          <div>
            <h4 className="text-sm md:text-base font-bold text-slate-800">{compound.name}</h4>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              {compound.molecularFormula && (
                <span className="text-[11px] md:text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{compound.molecularFormula}</span>
              )}
              {compound.molecularWeight > 0 && (
                <span className="text-[11px] md:text-xs text-slate-500">MW: {compound.molecularWeight.toFixed(2)}</span>
              )}
              {compound.compoundClass && (
                <span className="text-[11px] md:text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">{compound.compoundClass}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {compound.cid > 0 && (
            <a href={pubchemUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-[10px] md:text-xs font-bold text-cyan-600 hover:text-cyan-800 flex items-center gap-1">
              PubChem <ExternalLink size={10} />
            </a>
          )}
          {expanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-4 md:px-5 pb-5 pt-1 border-t border-slate-100">
              <CompoundDetail compound={compound} onCopy={onCopy} pubchemUrl={pubchemUrl} chebiUrl={chebiUrl} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Compound Detail Component ────────────────────────────────────────────────

function CompoundDetail({
  compound,
  onCopy,
  pubchemUrl,
  chebiUrl,
}: {
  compound: CompoundResult;
  onCopy: (text: string, label: string) => void;
  pubchemUrl: string;
  chebiUrl: string;
}) {
  const [viewerMode, setViewerMode] = useState<ViewerMode>('2d');
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewer3DRef = useRef<unknown>(null);
  const [viewerState, setViewerState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [viewerError, setViewerError] = useState('');

  useEffect(() => {
    if (viewerMode !== '3d' || !compound.cid || compound.cid === 0) return;
    let cancelled = false;

    const load3D = async () => {
      setViewerState('loading');
      setViewerError('');

      try {
        const $3Dmol = await load3DmolCDN();
        if (!$3Dmol) {
          if (!cancelled) { setViewerState('error'); setViewerError('3Dmol.js library could not be loaded.'); }
          return;
        }

        let sdf = '';
        let recordType = '';
        try {
          const res = await fetch('/api/structure/sdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cid: compound.cid, record_type: '3d' }),
            signal: AbortSignal.timeout(30000),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.sdf && data.sdf.trim().length > 50) {
              sdf = data.sdf;
              recordType = data.recordType;
            }
          }
        } catch { /* ignore */ }

        if (!sdf) {
          if (!cancelled) { setViewerState('error'); setViewerError('Could not fetch 3D structure data.'); }
          return;
        }

        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        if (cancelled) return;

        const container = viewerRef.current;
        if (!container) { if (!cancelled) { setViewerState('error'); setViewerError('Viewer container not available.'); } return; }

        const viewer = ($3Dmol as Record<string, unknown>).createViewer(container, { backgroundColor: '#ffffff', antialias: true });
        if (!viewer) { if (!cancelled) { setViewerState('error'); setViewerError('Failed to create 3D viewer.'); } return; }

        viewer3DRef.current = viewer;
        (viewer as Record<string, unknown>).addModel(sdf, 'sdf');
        const style = recordType === '3d'
          ? { stick: { radius: 0.12 }, sphere: { scale: 0.25 } }
          : { stick: { radius: 0.15 } };
        (viewer as Record<string, unknown>).setStyle({}, style);
        (viewer as Record<string, unknown>).zoomTo();
        (viewer as Record<string, unknown>).render();
        if (recordType === '3d') (viewer as Record<string, unknown>).spin(true);

        if (!cancelled) setViewerState('ready');
      } catch (err) {
        if (!cancelled) {
          setViewerState('error');
          setViewerError(err instanceof Error ? err.message : 'Unknown error');
        }
      }
    };

    load3D();
    return () => {
      cancelled = true;
      if (viewer3DRef.current) {
        try { (viewer3DRef.current as Record<string, unknown>).clear(); } catch { /* ignore */ }
      }
      if (viewerRef.current) viewerRef.current.innerHTML = '';
      viewer3DRef.current = null;
    };
  }, [viewerMode, compound.cid]);

  const hasPubchemData = compound.cid > 0;
  const image2DUrl = hasPubchemData
    ? `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${compound.cid}/PNG?image_size=large`
    : compound.imageUrl2D;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => setViewerMode('2d')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewerMode === '2d' ? 'bg-cyan-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
            <Hexagon size={12} /> 2D Structure
          </button>
          <button onClick={() => { if (hasPubchemData) setViewerMode('3d'); }} disabled={!hasPubchemData} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewerMode === '3d' ? 'bg-cyan-600 text-white shadow-sm' : hasPubchemData ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-slate-50 text-slate-300 cursor-not-allowed'}`}>
            <Box size={12} /> 3D Conformer
          </button>
        </div>

        {viewerMode === '2d' && (
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-center min-h-[280px]">
            {image2DUrl && !imgError ? (
              <>
                {!imgLoaded && <div className="absolute inset-0 flex items-center justify-center"><div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div>}
                <img src={image2DUrl} alt={`2D structure of ${compound.name}`} className="max-w-full max-h-[320px] object-contain" loading="lazy" referrerPolicy="no-referrer" onLoad={() => setImgLoaded(true)} onError={() => { setImgError(true); setImgLoaded(true); }} />
              </>
            ) : (
              <div className="text-center text-slate-400">
                <Hexagon size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs">{imgError ? 'Could not load 2D structure image' : '2D structure not available'}</p>
              </div>
            )}
          </div>
        )}

        {viewerMode === '3d' && (
          <div className="relative" style={{ height: '420px' }}>
            <div ref={viewerRef} className="bg-white border border-slate-200 rounded-xl" style={{ width: '100%', height: '100%', position: 'relative' }} />
            {viewerState === 'ready' && (
              <div className="absolute top-2 right-2 flex gap-1 bg-white/90 rounded-lg border border-slate-200 p-1 shadow-sm z-10">
                <button onClick={() => { if (viewer3DRef.current) try { (viewer3DRef.current as Record<string, unknown>).zoom(1.2); (viewer3DRef.current as Record<string, unknown>).render(); } catch {} }} className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Zoom In"><ZoomIn size={14} className="text-slate-600" /></button>
                <button onClick={() => { if (viewer3DRef.current) try { (viewer3DRef.current as Record<string, unknown>).zoom(0.8); (viewer3DRef.current as Record<string, unknown>).render(); } catch {} }} className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Zoom Out"><ZoomOut size={14} className="text-slate-600" /></button>
                <button onClick={() => { if (viewer3DRef.current) try { (viewer3DRef.current as Record<string, unknown>).zoomTo(); (viewer3DRef.current as Record<string, unknown>).render(); } catch {} }} className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Reset"><RotateCcw size={14} className="text-slate-600" /></button>
                <button onClick={() => { viewerRef.current?.requestFullscreen?.(); }} className="p-1.5 hover:bg-slate-100 rounded transition-colors" title="Fullscreen"><Maximize2 size={14} className="text-slate-600" /></button>
              </div>
            )}
            {viewerState === 'loading' && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl pointer-events-none z-10">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Loading 3D conformer...</p>
                </div>
              </div>
            )}
            {viewerState === 'error' && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl z-10">
                <div className="text-center text-slate-400">
                  <Box size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-medium">3D conformer not available</p>
                  {viewerError && <p className="text-[10px] text-slate-400 mt-1 max-w-[240px]">{viewerError}</p>}
                </div>
              </div>
            )}
            {viewerState === 'ready' && (
              <div className="absolute bottom-2 left-2 bg-white/90 rounded-md px-2 py-1 border border-slate-200 z-10">
                <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1"><RotateCcw size={10} /> Drag to rotate · Scroll to zoom</p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-2">
          {compound.cid > 0 && (
            <a href={pubchemUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2 py-1 bg-cyan-50 border border-cyan-200 rounded text-[11px] font-bold text-cyan-700 hover:bg-cyan-100">
              <Database size={10} /> CID: {compound.cid}
            </a>
          )}
          {compound.chebiId && (
            <a href={chebiUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-2 py-1 bg-teal-50 border border-teal-200 rounded text-[11px] font-bold text-teal-700 hover:bg-teal-100">
              <Database size={10} /> {compound.chebiId}
            </a>
          )}
        </div>
      </div>

      <div>
        <h5 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <CheckCircle2 size={12} className="text-emerald-500" /> Molecular Properties
        </h5>
        <div className="space-y-2">
          {compound.iupacName && <PropertyRow label="IUPAC Name" value={compound.iupacName} copyable onCopy={onCopy} />}
          {compound.molecularFormula && <PropertyRow label="Molecular Formula" value={compound.molecularFormula} copyable onCopy={onCopy} />}
          {compound.molecularWeight > 0 && <PropertyRow label="Molecular Weight" value={`${compound.molecularWeight.toFixed(2)} g/mol`} />}
          {compound.smiles && <PropertyRow label="SMILES" value={compound.smiles} copyable mono onCopy={onCopy} />}
          {compound.inchi && <PropertyRow label="InChI" value={compound.inchi} copyable mono onCopy={onCopy} />}
          {compound.inchiKey && <PropertyRow label="InChI Key" value={compound.inchiKey} copyable mono onCopy={onCopy} />}
          {compound.casNumber && <PropertyRow label="CAS Number" value={compound.casNumber} copyable onCopy={onCopy} />}
          {compound.sourceOrganism && <PropertyRow label="Source Organism" value={compound.sourceOrganism} />}
          {compound.compoundClass && <PropertyRow label="Compound Class" value={compound.compoundClass} />}
        </div>

        {compound.pubmedReferences.length > 0 && (
          <div className="mt-4">
            <h5 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Leaf size={12} className="text-emerald-500" /> PubMed References
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {compound.pubmedReferences.map(pmid => (
                <a key={pmid} href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`} target="_blank" rel="noreferrer" className="text-[11px] md:text-xs underline text-emerald-700 hover:text-emerald-900">
                  PMID:{pmid}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <h5 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ExternalLink size={12} className="text-slate-400" /> External Links
          </h5>
          <div className="flex flex-wrap gap-2">
            {compound.cid > 0 && (
              <a href={pubchemUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-2.5 py-1.5 bg-cyan-50 border border-cyan-200 rounded-lg text-xs font-bold text-cyan-700 hover:bg-cyan-100 transition-colors">
                <Database size={12} /> PubChem
              </a>
            )}
            {compound.chebiId && (
              <a href={chebiUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-2.5 py-1.5 bg-teal-50 border border-teal-200 rounded-lg text-xs font-bold text-teal-700 hover:bg-teal-100 transition-colors">
                <Database size={12} /> ChEBI
              </a>
            )}
            {compound.inchiKey && (
              <a href={`https://www.npatlas.org/api/v1/compounds?inchikey=${compound.inchiKey}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-2.5 py-1.5 bg-lime-50 border border-lime-200 rounded-lg text-xs font-bold text-lime-700 hover:bg-lime-100 transition-colors">
                <Database size={12} /> NPAtlas
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Property Row Component ───────────────────────────────────────────────────

function PropertyRow({ label, value, copyable, mono, onCopy }: {
  label: string;
  value: string;
  copyable?: boolean;
  mono?: boolean;
  onCopy?: (text: string, label: string) => void;
}) {
  return (
    <div className="flex items-start gap-2 py-1.5 px-2 bg-slate-50 rounded-lg">
      <span className="text-[11px] font-bold text-slate-500 min-w-[100px] md:min-w-[120px] flex-shrink-0 pt-0.5">{label}</span>
      <span className={`text-[11px] md:text-xs text-slate-800 break-all flex-1 ${mono ? 'font-mono' : 'font-medium'}`}>{value}</span>
      {copyable && onCopy && (
        <button onClick={() => onCopy(value, label)} className="flex-shrink-0 p-1 hover:bg-slate-200 rounded transition-colors" title={`Copy ${label}`}>
          <Copy size={12} className="text-slate-400" />
        </button>
      )}
    </div>
  );
}
