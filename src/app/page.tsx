'use client';

import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, FlaskConical, FileText, ExternalLink, ArrowRight, Beaker, Leaf, Hexagon, TreePine, PlayCircle, Quote } from 'lucide-react';
import Link from 'next/link';
import AuthModal from '@/components/pharma/AuthModal';
import ScientificDisclaimer from '@/components/pharma/ScientificDisclaimer';
import { API_SOURCES, EXAMPLE_SEARCHES } from '@/lib/knowledge-base';

export default function Home() {
  const [consentGiven, setConsentGiven] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      const stored = localStorage.getItem('phytoinsight-consent');
      if (stored === 'true') {
        queueMicrotask(() => setConsentGiven(true));
      }
    }
  }, []);

  const handleAcceptConsent = () => {
    localStorage.setItem('phytoinsight-consent', 'true');
    setConsentGiven(true);
  };

  const evidencePreviews: Record<string, string> = {
    'WarfarinSt. John\'s Wort': 'Major CYP3A4 interaction · High risk bleeding',
    'CyclosporineGinkgo biloba': 'P-glycoprotein modulation · Immunosuppressant levels',
    'MetforminGinseng': 'Additive hypoglycemic effect · Monitor glucose',
    'AtorvastatinGarlic': 'CYP3A4 metabolism overlap · Moderate risk',
    'TacrolimusCurcumin': 'CYP3A4/PGP inhibition · Transplant concern',
  };

  return (
    <>
      {!consentGiven && <ConsentPopup onAccept={handleAcceptConsent} />}

      <div className="min-h-screen bg-[#f8fafc] text-gray-900 antialiased flex flex-col">
        <main className="flex-1 max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-8 w-full">
          <div className="space-y-8">

            {/* Hero */}
            <div className="text-center py-8 md:py-10 px-4 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-50 via-transparent to-transparent"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-[#0f172a] text-white px-3 md:px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-extrabold mb-4 md:mb-5 tracking-[0.2em] shadow-md">
                  EVIDENCE-BASED SCIENTIFIC PLATFORM
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-[#0f172a] mb-1 tracking-tight leading-tight">
                  HebInsight
                </h2>
                <p className="text-[10px] md:text-xs text-gray-400 font-semibold mb-3">Evidence-Based Scientific Intelligence Platform</p>
                <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed mb-4 md:mb-6 text-sm md:text-base font-medium">
                  Evaluate drug-herb interactions, explore pharmacological profiles, and retrieve chemical structures from global scientific databases. Powered by PubMed, CrossRef, OpenAlex, OpenFDA, PubChem, ChEBI, and NPAtlas.
                </p>

                <div className="flex justify-center gap-2 md:gap-3 flex-wrap">
                  <Link href="/interaction" className="flex items-center gap-2 px-4 md:px-6 py-3 bg-red-600 text-white rounded-xl text-xs md:text-sm font-bold shadow-lg hover:bg-red-700 transition-all hover:shadow-xl group">
                    <AlertTriangle size={16} /> Drug-Natural Product Interaction
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link href="/pharmacology" className="flex items-center gap-2 px-4 md:px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs md:text-sm font-bold shadow-lg hover:bg-emerald-700 transition-all hover:shadow-xl group">
                    <FlaskConical size={16} /> Pharmacology & Phytochemistry
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link href="/ HebInsight" className="flex items-center gap-2 px-4 md:px-6 py-3 bg-amber-600 text-white rounded-xl text-xs md:text-sm font-bold shadow-lg hover:bg-amber-700 transition-all hover:shadow-xl group">
                    <TreePine size={16} /> HerbInsight
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link href="/structure" className="flex items-center gap-2 px-4 md:px-6 py-3 bg-cyan-600 text-white rounded-xl text-xs md:text-sm font-bold shadow-lg hover:bg-cyan-700 transition-all hover:shadow-xl group">
                    <Hexagon size={16} /> Chemical Structure
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* How to Use - Link Card */}
            <Link
              href="/how-to-use"
              className="group block bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 rounded-2xl p-6 md:p-8 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 group-hover:scale-110 transition-transform">
                    <PlayCircle size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-black tracking-tight">How to Use PhytoInsight</h3>
                    <p className="text-white/80 text-sm font-medium mt-0.5">
                      Watch the video tutorial and follow step-by-step guides for all features
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white text-amber-700 px-4 py-2.5 rounded-xl text-sm font-bold group-hover:bg-amber-50 transition-all shadow-md">
                  View Tutorial <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* API Sources */}
            <div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Integrated Data Sources</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {API_SOURCES.map((s) => (
                  <div key={s.name} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${s.color}`}></div>
                      <span className="text-sm font-bold text-gray-900">{s.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Start */}
            <div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Quick Start Examples</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {EXAMPLE_SEARCHES.map(({ drug, herb }) => (
                  <Link key={drug + herb} href="/interaction" className="group bg-white/80 p-4 rounded-xl border border-gray-200/80 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-1.5 text-sm font-bold text-gray-800">
                      <Beaker size={14} className="text-red-400" />{drug}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                      <Leaf size={14} className="text-emerald-400" />{herb}
                    </div>
                    <div className="mt-2.5 text-[10px] font-bold text-violet-500 uppercase tracking-wider opacity-60 group-hover:opacity-100 transition-opacity">
                      {evidencePreviews[drug + herb] || 'Evidence-based analysis'}
                    </div>
                    <div className="mt-2 text-xs font-semibold text-slate-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Go to Interaction Engine <ExternalLink size={10} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Features - 3 boxes: Interaction, Pharmacology, Chemical Structure (NO HerbInsight box) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-9 h-9 bg-[#0f172a] rounded-lg flex items-center justify-center mb-3">
                  <AlertTriangle size={18} className="text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1.5 text-sm">Interaction Engine</h4>
                <p className="text-xs text-gray-500 leading-relaxed">Search for drug-herb interactions with weighted evidence scoring, FDA safety signals, and DOI resolution.</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center mb-3">
                  <FlaskConical size={18} className="text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1.5 text-sm">Pharmacology & Phytochemistry</h4>
                <p className="text-xs text-gray-500 leading-relaxed">Explore pharmacological actions, active compounds, and molecular mechanisms from PubMed literature.</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-9 h-9 bg-cyan-600 rounded-lg flex items-center justify-center mb-3">
                  <Hexagon size={18} className="text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1.5 text-sm">Chemical Structure Engine</h4>
                <p className="text-xs text-gray-500 leading-relaxed">Retrieve chemical structures, molecular properties, SMILES, InChI, and source organisms from PubChem, ChEBI, and NPAtlas.</p>
              </div>
            </div>
          </div>
        </main>

        {/* How to Cite */}
        <div className="w-full bg-white border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-4">
            <div className="flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
              <Quote size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800 leading-relaxed space-y-1.5">
                <p className="font-bold text-[13px]">Cite PhytoInsight</p>
                <p>For research and academic use, recommended citation format available in our reports and methodology documentation.</p>
                <p className="italic text-blue-700">
                  Mostafa, M., Alhaidari, R., &amp; Mohamed, S. (2026). PhytoInsight: An Evidence-Based Scientific Intelligence Platform. https://www.phytoinsight.com
                </p>
              </div>
            </div>
          </div>
        </div>

        <ScientificDisclaimer />
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
