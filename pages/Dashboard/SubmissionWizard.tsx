import React, { useState, useEffect } from 'react';
import { ViewState, Journal } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';

import { useNavigate } from 'react-router-dom';

const SubmissionWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [journals, setJournals] = useState<Journal[]>([]);
  const [selectedJournalId, setSelectedJournalId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');

  // Fetch Data on Mount
  useEffect(() => {
    const fetchData = async () => {
      const { data: journalData } = await supabase.from('journals').select('*');
      setJournals(journalData || []);

      const { data: packageData } = await supabase.from('publication_packages').select('*').eq('type', 'apc').eq('is_active', true);
      setPackages(packageData || []);
      if (packageData && packageData.length > 0) setSelectedPackageId(packageData[0].id);
    };
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!file || !title || !selectedJournalId || !selectedPackageId) {
      setError("Please complete all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Upload File to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('manuscripts')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 3. Insert Record into Database
      const { data: dbData, error: dbError } = await supabase
        .from('manuscripts')
        .insert({
          submitter_id: user.id,
          journal_id: selectedJournalId,
          title,
          abstract,
          file_url: fileName,
          cover_letter: coverLetter,
          status: 'submitted'
        })
        .select();

      if (dbError) throw dbError;
      if (!dbData || dbData.length === 0) throw new Error("Failed to retrieve manuscript ID");

      // 4. Success! Navigate to Checkout
      navigate(`/checkout?type=manuscript&id=${dbData[0].id}&package_id=${selectedPackageId}`);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1: return !!selectedJournalId;
      case 2: return !!title && !!abstract;
      case 3: return !!file;
      case 4: return !!selectedPackageId;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-background-light text-slate-900 flex flex-col">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 bg-white px-10 py-3">
        <div className="flex items-center gap-4 text-primary cursor-pointer" onClick={() => navigate('/')}>
          <div className="size-8 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">auto_stories</span>
          </div>
          <h2 className="text-slate-900 text-lg font-bold leading-tight">Nkiza Academic Journals</h2>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate('/dashboard/my-manuscripts')} className="text-sm font-bold text-slate-500 hover:text-primary">Exit</button>
        </div>
      </header>

      <main className="flex-1 flex justify-center py-10 px-4">
        <div className="w-full max-w-[960px] flex flex-col">
          {/* Stepper */}
          <div className="grid grid-cols-4 gap-4 mb-10 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            {[
              { id: 1, label: 'Journal', icon: 'menu_book' },
              { id: 2, label: 'Metadata', icon: 'description' },
              { id: 3, label: 'Upload', icon: 'upload_file' },
              { id: 4, label: 'Payment', icon: 'payments' }
            ].map((s) => (
              <div key={s.id} className={`flex items-center gap-3 ${step >= s.id ? 'opacity-100' : 'opacity-50'}`}>
                <div className={`flex items-center justify-center size-10 rounded-full ${step === s.id ? 'bg-primary text-white' : step > s.id ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                  <span className="material-symbols-outlined text-xl">{step > s.id ? 'check' : s.icon}</span>
                </div>
                <div className="flex flex-col">
                  <p className="text-slate-900 text-sm font-semibold">{s.id}. {s.label}</p>
                  <p className="text-xs font-medium text-slate-500">{step === s.id ? 'In Progress' : step > s.id ? 'Completed' : 'Pending'}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}

            {step === 1 && (
              <div className="animate-fade-in">
                <h1 className="text-slate-900 text-2xl font-bold mb-2">Select a Journal</h1>
                <p className="text-slate-500 text-sm mb-8">Choose the journal that best fits the scope of your research.</p>

                <div className="space-y-4">
                  {journals.map(journal => (
                    <div
                      key={journal.id}
                      onClick={() => setSelectedJournalId(journal.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all flex items-start gap-4 ${selectedJournalId === journal.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                      <div className={`size-5 rounded-full border flex items-center justify-center mt-1 bg-white ${selectedJournalId === journal.id ? 'border-primary' : 'border-slate-300'}`}>
                        {selectedJournalId === journal.id && <div className="size-2.5 bg-primary rounded-full" />}
                      </div>
                      <div>
                        <h3 className="text-slate-900 font-bold">{journal.title}</h3>
                        <p className="text-slate-500 text-sm mt-1">{journal.discipline}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in">
                <h1 className="text-slate-900 text-2xl font-bold mb-2">Manuscript Metadata</h1>
                <p className="text-slate-500 text-sm mb-8">Please provide the core details of your research work.</p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-slate-900 text-sm font-bold mb-2">Manuscript Title</label>
                    <input
                      className="w-full p-4 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="e.g. Impact of Artificial Intelligence on Healthcare Economics"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-900 text-sm font-bold mb-2">Abstract</label>
                    <textarea
                      className="w-full p-4 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all h-40 resize-none"
                      placeholder="Paste your abstract here (max 250 words)..."
                      value={abstract}
                      onChange={(e) => setAbstract(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-in">
                <h1 className="text-slate-900 text-2xl font-bold mb-2">Upload Files</h1>
                <p className="text-slate-500 text-sm mb-8">Upload your manuscript PDF.docx. Max 25MB.</p>

                {!file ? (
                  <label htmlFor="file-upload" className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 hover:border-primary transition-colors cursor-pointer group">
                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                    </div>
                    <div className="flex max-w-[480px] flex-col items-center gap-1">
                      <p className="text-slate-900 text-lg font-semibold text-center">Click to browse your files</p>
                      <p className="text-slate-500 text-sm text-center">Supports PDF, DOCX</p>
                    </div>
                    <input id="file-upload" type="file" className="hidden" accept=".pdf,.docx,.doc" onChange={handleFileChange} />
                  </label>
                ) : (
                  <div className="flex items-center justify-between bg-slate-50 rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center gap-4">
                      <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 size-12">
                        <span className="material-symbols-outlined text-2xl">description</span>
                      </div>
                      <div>
                        <p className="text-slate-900 font-bold">{file.name}</p>
                        <p className="text-slate-500 text-xs text-left">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button onClick={() => setFile(null)} className="text-red-500 hover:text-red-700">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="animate-fade-in">
                <h1 className="text-slate-900 text-2xl font-bold mb-2">Select Publication Package</h1>
                <p className="text-slate-500 text-sm mb-8">Choose your preferred publication fee package.</p>

                <div className="space-y-4">
                  {packages.map(pkg => (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${selectedPackageId === pkg.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`size-5 rounded-full border flex items-center justify-center ${selectedPackageId === pkg.id ? 'border-primary' : 'border-slate-300'}`}>
                          {selectedPackageId === pkg.id && <div className="size-2.5 bg-primary rounded-full" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 uppercase text-xs tracking-widest mb-1">Package</p>
                          <p className="font-bold text-slate-900">{pkg.name}</p>
                          <p className="text-xs text-slate-500">{pkg.description || 'Standard publication fee'}</p>
                        </div>
                      </div>
                      <p className="text-lg font-black text-slate-900">{pkg.currency} {pkg.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-8 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => step > 1 && setStep(step - 1)}
              disabled={step === 1 || loading}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold text-sm transition-all ${step === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span> Back
            </button>

            {step < 4 ? (
              <button
                onClick={() => isStepValid() && setStep(step + 1)}
                disabled={!isStepValid()}
                className={`flex items-center gap-2 px-8 py-2 rounded-lg bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 transition-all ${!isStepValid() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'}`}
              >
                Next Step <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isStepValid() || loading}
                className={`flex items-center gap-2 px-8 py-2 rounded-lg bg-green-600 text-white font-bold text-sm shadow-lg shadow-green-600/20 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-700'}`}
              >
                {loading ? (
                  <>Processing <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span></>
                ) : (
                  <>Submit & Pay <span className="material-symbols-outlined text-sm">payments</span></>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubmissionWizard;