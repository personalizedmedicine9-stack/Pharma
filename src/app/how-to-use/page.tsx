'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  AlertTriangle, FlaskConical, Hexagon, Sparkles,
  PlayCircle, ChevronRight, BookOpen, ArrowRight, CheckCircle2,
  Circle, Video, HelpCircle, Lightbulb, Zap
} from 'lucide-react';
import AuthModal from '@/components/pharma/AuthModal';

/* ── Tutorial Steps Data ── */
const TUTORIAL_SECTIONS = [
  {
    id: 'interaction',
    title: 'Step 1: Drug-Natural Product Interaction Engine',
    shortTitle: 'Interaction Engine',
    icon: <AlertTriangle size={24} className="text-red-500" />,
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    accentBg: 'bg-red-600',
    description: 'Search any drug-herb combination to discover potential interactions with weighted evidence scoring and safety signals from FDA and PubMed.',
    steps: [
      'Navigate to the Interaction Engine page from the header menu or home page.',
      'Enter a drug name (e.g., "Warfarin") in the first search field.',
      'Enter a natural product or herb name (e.g., "St. John\'s Wort") in the second field.',
      'Click the "Analyze Interaction" button to start the search.',
      'Review the results: interaction severity level, evidence score, mechanism of action, and supporting literature from PubMed, CrossRef, and OpenAlex.',
      'Click on PMID or DOI links to read the original scientific articles.',
      'Export the results as a PDF report for your records.',
    ],
    tips: [
      'Try common drug-herb pairs first: Warfarin + St. John\'s Wort, Metformin + Ginseng.',
      'The evidence score (1-10) indicates how strong the scientific evidence is for that interaction.',
      'Red = High risk, Yellow = Moderate risk, Green = Low risk.',
    ],
    tryLink: '/interaction',
    tryLabel: 'Try Interaction Engine',
  },
  {
    id: 'pharmacology',
    title: 'Step 2: Pharmacology & Phytochemistry Engine',
    shortTitle: 'Pharmacology',
    icon: <FlaskConical size={24} className="text-emerald-500" />,
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    accentBg: 'bg-emerald-600',
    description: 'Explore the pharmacological actions, active compounds, and molecular mechanisms of medicinal plants using data from PubMed, CrossRef, and OpenAlex scientific literature databases.',
    steps: [
      'Navigate to the Pharmacology & Phytochemistry page.',
      'Enter a herb or natural product name (e.g., "Curcumin" or "Turmeric") in the search field.',
      'Click "Analyze" to search across scientific databases.',
      'Review the pharmacological actions summary — each action is backed by PubMed literature count.',
      'Explore the active compounds section with molecular details and SMILES notation.',
      'Check the mechanism of action cards showing enzyme interactions (CYP, P-gp, etc.).',
      'Use the PDF export button to save a professional report with all references.',
    ],
    tips: [
      'Search by common name (e.g., "Garlic") or scientific compound (e.g., "Allicin").',
      'The pharmacology engine covers 30+ million PubMed articles.',
      'Each pharmacological action shows the number of supporting studies.',
    ],
    tryLink: '/pharmacology',
    tryLabel: 'Try Pharmacology Engine',
  },
  {
    id: 'structure',
    title: 'Step 3: Chemical Structure Engine',
    shortTitle: 'Chemical Structure',
    icon: <Hexagon size={24} className="text-cyan-500" />,
    color: 'cyan',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    accentBg: 'bg-cyan-600',
    description: 'Retrieve and visualize chemical structures with molecular properties, SMILES, InChI, and source organism data from PubChem, ChEBI, and NPAtlas natural product databases.',
    steps: [
      'Navigate to the Chemical Structure Engine page.',
      'Enter a compound name (e.g., "Curcumin", "Quercetin", or "Paclitaxel") in the search field.',
      'Click "Search Structure" to query PubChem, ChEBI, and NPAtlas.',
      'View the 2D chemical structure image rendered from PubChem.',
      'Explore molecular properties: formula, weight, SMILES, InChI, InChIKey, and CAS number.',
      'Check the source organism information from NPAtlas for natural products.',
      'Use the interactive 3D molecular viewer to rotate and examine the structure.',
      'Export the structure data and properties as a PDF report.',
    ],
    tips: [
      'Search by IUPAC name, common name, or CAS number.',
      'NPAtlas provides source organism data for 50,000+ natural products.',
      'SMILES notation can be copied and used in other cheminformatics tools.',
    ],
    tryLink: '/structure',
    tryLabel: 'Try Structure Engine',
  },
];

export default function HowToUsePage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('interaction');

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <>
      <div className="min-h-screen bg-[#f8fafc] text-gray-900 antialiased">
        <main className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-8 w-full">
          <div className="space-y-8">

            {/* Page Header */}
            <div className="text-center py-8 md:py-10 px-4 bg-white rounded-2xl border border-gray-200 shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-50 via-transparent to-transparent"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-3 md:px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-extrabold mb-4 md:mb-5 tracking-[0.2em] shadow-md">
                  <Video size={12} /> VIDEO TUTORIAL & STEP-BY-STEP GUIDE
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-[#0f172a] mb-2 tracking-tight leading-tight">
                  How to Use PhytoInsight
                </h2>
                <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed text-sm md:text-base font-medium">
                  Watch the video overview or follow the step-by-step guide below to learn how to use all features of the platform.
                </p>
              </div>
            </div>

            {/* Video Section - HeyGen Embed */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="p-4 md:p-6 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <PlayCircle size={20} className="text-amber-600" />
                  <h3 className="text-lg font-black text-[#0f172a]">Platform Overview Video</h3>
                </div>
                <p className="text-sm text-gray-500 font-medium mt-1">
                  Watch a complete walkthrough of PhytoInsight&apos;s features and capabilities
                </p>
              </div>
              <div className="aspect-video bg-black">
                <iframe
                  src="https://app.heygen.com/embeds/5ae70eb72351423cbb7fabc114dc5d9f"
                  title="PhytoInsight — Evidence-Based Scientific Intelligence"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                  style={{ border: 'none' }}
                />
              </div>
              <div className="p-4 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h4 className="font-extrabold text-base md:text-lg tracking-tight">7 Scientific Databases. One Platform.</h4>
                    <p className="text-white/80 text-xs font-medium mt-0.5">
                      PubMed · CrossRef · OpenAlex · OpenFDA · PubChem · ChEBI · NPAtlas
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href="/interaction"
                      className="flex items-center gap-1.5 bg-white text-red-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-red-50 transition-all shadow-md"
                    >
                      <AlertTriangle size={12} /> Try Now <ChevronRight size={12} />
                    </a>
                    <a
                      href="https://github.com/personalizedmedicine9-stack/Pharma"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-white/30 transition-all border border-white/30"
                    >
                      <BookOpen size={12} /> Star on GitHub <ChevronRight size={12} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Step-by-Step Guide */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle size={16} className="text-amber-600" />
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Step-by-Step Tutorial</h3>
              </div>

              <div className="space-y-4">
                {TUTORIAL_SECTIONS.map((section, idx) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.3 }}
                    className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all ${
                      expandedSection === section.id ? 'shadow-md ring-1 ring-gray-200' : 'hover:shadow-md'
                    }`}
                  >
                    {/* Section Header - Clickable */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full text-left p-5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className={`w-12 h-12 rounded-xl ${section.accentBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <span className="text-white font-black text-lg">{idx + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-[#0f172a] text-sm md:text-base">{section.title}</h4>
                        <p className="text-xs text-gray-500 font-medium mt-0.5 line-clamp-1">{section.description}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${section.bgColor} ${section.borderColor} border`}>
                          {section.steps.length} steps
                        </span>
                        <ChevronRight
                          size={18}
                          className={`text-gray-400 transition-transform duration-200 ${
                            expandedSection === section.id ? 'rotate-90' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {expandedSection === section.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-100"
                      >
                        <div className="p-5 md:p-6 space-y-6">
                          {/* Description */}
                          <p className="text-sm text-gray-600 leading-relaxed font-medium">
                            {section.description}
                          </p>

                          {/* Steps */}
                          <div className="space-y-3">
                            <h5 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                              <Lightbulb size={12} className="text-amber-500" /> Instructions
                            </h5>
                            {section.steps.map((step, stepIdx) => (
                              <div
                                key={stepIdx}
                                className={`flex items-start gap-3 p-3 rounded-xl ${section.bgColor} border ${section.borderColor}`}
                              >
                                <div className="flex-shrink-0 mt-0.5">
                                  <CheckCircle2 size={18} className="text-gray-400" />
                                </div>
                                <div className="flex-1">
                                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Step {stepIdx + 1}</span>
                                  <p className="text-sm text-gray-700 font-medium mt-0.5">{step}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Tips */}
                          <div className="space-y-2">
                            <h5 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                              <Zap size={12} className="text-amber-500" /> Pro Tips
                            </h5>
                            {section.tips.map((tip, tipIdx) => (
                              <div key={tipIdx} className="flex items-start gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-100">
                                <Sparkles size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-800 font-medium">{tip}</p>
                              </div>
                            ))}
                          </div>

                          {/* Try It CTA */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <span className="text-xs text-gray-400 font-medium">Ready to try?</span>
                            <Link
                              href={section.tryLink}
                              className={`flex items-center gap-2 ${section.accentBg} text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-md`}
                            >
                              {section.tryLabel} <ArrowRight size={14} />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* FAQ / Quick Answers */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
              <h3 className="text-lg font-black text-[#0f172a] mb-4 flex items-center gap-2">
                <HelpCircle size={18} className="text-amber-600" /> Frequently Asked Questions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    q: 'What databases does PhytoInsight use?',
                    a: 'PubMed, CrossRef, OpenAlex, OpenFDA, PubChem, ChEBI, and NPAtlas — 7 global scientific databases integrated into one platform.',
                  },
                  {
                    q: 'Is PhytoInsight free to use?',
                    a: 'Yes, PhytoInsight is completely free and open source. All features are available without registration.',
                  },
                  {
                    q: 'How accurate are the interaction results?',
                    a: 'Results are sourced directly from peer-reviewed literature and FDA databases. Each interaction includes an evidence score and confidence level.',
                  },
                  {
                    q: 'Can I export results as PDF?',
                    a: 'Yes! Every analysis page has a PDF export button that generates a professional report with clickable PMID/DOI links and evidence breakdowns.',
                  },
                  {
                    q: 'How do I view 3D molecular structures?',
                    a: 'The Chemical Structure Engine includes an interactive 3D viewer. Search for any compound, then use mouse to rotate, scroll to zoom, and drag to pan.',
                  },
                ].map((faq, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <h4 className="text-sm font-bold text-gray-900 mb-1.5 flex items-start gap-2">
                      <Circle size={8} className="text-amber-500 flex-shrink-0 mt-1.5" fill="currentColor" />
                      {faq.q}
                    </h4>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed ml-5">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Back to Home CTA */}
            <div className="text-center py-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0f172a] text-white rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all"
              >
                ← Back to Home Page
              </Link>
            </div>

          </div>
        </main>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
