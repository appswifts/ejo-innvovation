import React from 'react';
import { ViewState } from '../../types';

import { useNavigate } from 'react-router-dom';

const ReviewerPortal: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer">
            <div className="bg-primary p-1.5 rounded-lg text-white">
              <span className="material-symbols-outlined text-xl">description</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-800">Reviewer Portal</span>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="hidden md:flex flex-col">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Manuscript ID</span>
            <span className="text-sm font-medium text-slate-800">MS-2024-0891-V2</span>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-red-50 px-4 py-1.5 rounded-full border border-red-100">
          <span className="text-xs font-bold text-red-500 uppercase">Deadline</span>
          <div className="flex gap-2 text-red-600 text-sm font-mono font-bold">
            03 <span className="text-red-300 text-[10px]">D</span> 14 <span className="text-red-300 text-[10px]">H</span>
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Left: PDF Simulator */}
        <section className="flex-1 bg-slate-200 p-4 overflow-y-auto">
          <div className="max-w-3xl mx-auto bg-white shadow-lg min-h-[1200px] p-12 text-slate-800">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold mb-4 font-serif">A Comprehensive Analysis of Neural Network Resilience in Adversarial Environments</h1>
              <p className="text-sm text-slate-500 italic mb-2">[BLINDED FOR PEER REVIEW]</p>
              <p className="text-sm text-slate-400">Keywords: Neural Networks, Robustness, Adversarial Attacks</p>
            </div>
            <div className="space-y-6 text-justify leading-relaxed font-serif">
              <h2 className="text-lg font-bold border-b border-slate-200 pb-2">Abstract</h2>
              <p>In this study, we investigate the structural vulnerabilities of contemporary convolutional neural networks (CNNs) when subjected to iterative fast gradient sign methods (I-FGSM). Our research identifies a novel correlation between layer density and the propagation of perturbations across latent spaces.</p>
              <h2 className="text-lg font-bold border-b border-slate-200 pb-2 pt-4">1. Introduction</h2>
              <p>The rapid advancement of machine learning has introduced significant efficiencies across various industrial sectors. However, the security implications of these models remain a critical concern. Previous literature has focused on defensive distillation, but these methods often lack scalability.</p>
              <div className="w-full h-64 bg-slate-50 rounded-lg flex items-center justify-center my-8 border-2 border-dashed border-slate-300">
                <div className="text-center">
                  <span className="material-symbols-outlined text-4xl text-slate-300">bar_chart</span>
                  <p className="text-xs text-slate-400 mt-2 font-medium">Figure 1: Accuracy vs. Noise Magnitude</p>
                </div>
              </div>
              <p>As illustrated in Figure 1, there is a precipitous drop in performance when the epsilon value exceeds 0.05. This suggests that the current architectural constraints are insufficient for maintaining integrity beyond certain empirical thresholds.</p>
            </div>
          </div>
        </section>

        {/* Right: Evaluation Form */}
        <section className="w-[450px] bg-white border-l border-slate-200 flex flex-col">
          <div className="p-5 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-bold text-slate-800">Evaluation Form</h2>
            <p className="text-xs text-slate-500 mt-1">Please provide your honest assessment.</p>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-8">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Scientific Originality</label>
                <div className="flex justify-between bg-slate-50 p-2 rounded-lg">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} className={`w-8 h-8 rounded text-sm font-bold transition-all ${n === 3 ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:bg-white'}`}>{n}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Methodological Rigor</label>
                <div className="flex justify-between bg-slate-50 p-2 rounded-lg">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} className={`w-8 h-8 rounded text-sm font-bold transition-all ${n === 4 ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:bg-white'}`}>{n}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                Comments to Author <span className="material-symbols-outlined text-slate-400 text-sm">info</span>
              </label>
              <textarea className="w-full h-32 p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none resize-none bg-slate-50" placeholder="Strengths and weaknesses..."></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary flex items-center gap-2">
                Confidential Comments to Editor <span className="material-symbols-outlined text-sm">lock</span>
              </label>
              <textarea className="w-full h-24 p-3 text-sm border border-primary/20 bg-primary/5 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none resize-none" placeholder="Ethical concerns..."></textarea>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Recommendation</label>
              <select className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-primary/50">
                <option>Major Revision</option>
                <option>Minor Revision</option>
                <option>Accept</option>
                <option>Reject</option>
              </select>
            </div>
          </div>
          <div className="p-5 border-t border-slate-200 bg-slate-50 flex gap-3">
            <button className="flex-1 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100">Save Draft</button>
            <button className="flex-1 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-dark shadow-lg shadow-primary/20">Submit Review</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ReviewerPortal;