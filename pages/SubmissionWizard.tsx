import React, { useState, useEffect, useRef } from 'react';
// Re-triggering HMR
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles, Check, ChevronRight, Upload, FileText,
  Users, Send, AlertCircle, Save, X, File as FileIcon, Trash2,
  Plus, User, Mail, School, Edit2
} from 'lucide-react';
import {
  useAuth,
  useVenues,
  useSubmissionTypes,
  useCreateSubmission,
  useUpdateSubmission,
  useSubmissionFields,
  useFileUpload,
  useSubmissionAuthors
} from '../src/hooks';
import DashboardLayout from '../src/layouts/DashboardLayout';

const STEPS = [
  { id: 'start', label: 'Start', icon: Sparkles },
  { id: 'upload', label: 'Upload Files', icon: Upload },
  { id: 'metadata', label: 'Metadata', icon: FileText },
  { id: 'contributors', label: 'Contributors', icon: Users },
  { id: 'review', label: 'Review & Submit', icon: Send },
];

const SubmissionWizard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Data
  const [selectedVenueId, setSelectedVenueId] = useState(searchParams.get('venue') || '');
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  // Author Form State
  const [showAuthorForm, setShowAuthorForm] = useState(false);
  const [newAuthor, setNewAuthor] = useState({
    external_name: '',
    external_email: '',
    external_affiliation: '',
    contribution: '',
    is_corresponding: false
  });

  // Hooks
  const { venues, loading: venuesLoading } = useVenues({ activeOnly: true });
  const { types, loading: typesLoading } = useSubmissionTypes();
  const { fields, fieldsBySection, loading: fieldsLoading } = useSubmissionFields(selectedTypeId);
  const { createSubmission, loading: createLoading } = useCreateSubmission();
  const { updateSubmission, loading: updateLoading } = useUpdateSubmission();
  const { uploadFile, uploading, error: uploadError } = useFileUpload();
  const {
    authors,
    loading: authorsLoading,
    addAuthor,
    removeAuthor,
    fetchAuthors
  } = useSubmissionAuthors(submissionId);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/signin?redirect=/submit');
    }
  }, [user, authLoading, navigate]);

  const handleNext = async () => {
    if (currentStep === 0) {
      if (!selectedVenueId || !selectedTypeId) return;


      // Create draft submission if not exists
      if (!submissionId) {
        const { data, error } = await createSubmission({
          title: title || 'Untitled Submission',
          venue_id: selectedVenueId,
          submission_type_id: selectedTypeId,
          status: 'DRAFT',
          metadata: { ...formData, submission_step: 'UPLOAD' }
        });

        if (data) {
          setSubmissionId(data.id);
          setTitle(data.title);
          setCurrentStep(prev => prev + 1);
        }
      } else {
        // Update if exists
        setCurrentStep(prev => prev + 1);
      }
    } else if (currentStep === 1) {
      // Validate at least one primary file
      if (uploadedFiles.length === 0) {
        alert("Please upload at least one file to proceed.");
        return;
      }
      // Update step progress in metadata
      if (submissionId) {
        await updateSubmission(submissionId, {
          metadata: { ...formData, submission_step: 'METADATA' }
        });
      }
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === 2) {
      // Save metadata
      if (submissionId) {
        await updateSubmission(submissionId, {
          title,
          abstract,
          metadata: { ...formData, submission_step: 'CONTRIBUTORS' }
        });
      }
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === 3) {
      // Validate at least one author
      if (authors.length === 0) {
        // Add current user as first author if list is empty
        if (user && submissionId) {
          await addAuthor({
            external_name: user.user_metadata?.full_name || 'Author',
            external_email: user.email || '',
            author_order: 1,
            is_corresponding: true
          });
        }
      }
      if (submissionId) {
        await updateSubmission(submissionId, {
          metadata: { ...formData, submission_step: 'REVIEW' }
        });
      }
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === 4) {
      // Final Submission
      if (submissionId) {
        await updateSubmission(submissionId, {
          status: 'SUBMITTED',
          submitted_at: new Date().toISOString(),
          metadata: { ...formData, submission_step: 'COMPLETE' }
        });
        alert("Submission Successful! Redirecting to dashboard...");
        navigate('/dashboard');
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processUpload(e.target.files[0]);
    }
  };

  const processUpload = async (file: File) => {
    if (!submissionId) return;

    const result = await uploadFile(file, submissionId, 'MANUSCRIPT');

    if (result.data) {
      setUploadedFiles(prev => [...prev, result.data]);
    }
  };

  const handleAddAuthor = async () => {
    if (!newAuthor.external_name || !newAuthor.external_email) {
      alert("Name and Email are required");
      return;
    }

    const { error } = await addAuthor({
      ...newAuthor,
      author_order: authors.length + 1
    });

    if (!error) {
      setNewAuthor({
        external_name: '',
        external_email: '',
        external_affiliation: '',
        contribution: '',
        is_corresponding: false
      });
      setShowAuthorForm(false);
    }
  };

  // Render Helpers
  const renderStepIndicator = () => (
    <div className="flex flex-col gap-6 bg-card p-6 rounded-xl border border-border shadow-sm sticky top-28">
      <div className="flex flex-col">
        <h1 className="text-foreground text-lg font-semibold">Submission Wizard</h1>
        <p className="text-primary text-sm font-medium">
          {submissionId ? 'Editing Draft' : 'New Submission'}
        </p>
      </div>
      <nav className="flex flex-col gap-2">
        {STEPS.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <button
              key={step.id}
              disabled={!submissionId && index > 0}
              onClick={() => submissionId && setCurrentStep(index)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-accent'
                } ${!submissionId && index > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className={`flex items-center justify-center size-6 rounded-full shrink-0 ${isActive ? 'bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30' :
                isCompleted ? 'bg-primary text-primary-foreground' :
                  'bg-muted text-muted-foreground'
                }`}>
                {isCompleted ? <Check className="size-3.5" strokeWidth={3} /> : <span className="text-xs font-bold">{index + 1}</span>}
              </span>
              <p className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {step.label}
              </p>
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="w-full max-w-7xl mx-auto p-6 md:p-8 flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-72 shrink-0">
          {renderStepIndicator()}
        </aside>

        <main className="flex-1 min-w-0">
          <div className="bg-card rounded-xl border border-border shadow-sm min-h-[600px] flex flex-col">
            <div className="border-b border-border p-6 pb-6">
              <h2 className="text-2xl font-bold mb-1">{STEPS[currentStep].label}</h2>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-4">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col gap-6">
              {/* Step 1: Start */}
              {currentStep === 0 && (
                <div className="space-y-6 max-w-xl">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Target Journal/Venue</label>
                    <select
                      className="w-full p-3 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/50 outline-none"
                      value={selectedVenueId}
                      onChange={(e) => setSelectedVenueId(e.target.value)}
                    >
                      <option value="">-- Select Venue --</option>
                      {venues.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Submission Type</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {types.map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSelectedTypeId(t.id)}
                          className={`p-4 rounded-lg border text-left transition-all ${selectedTypeId === t.id
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border hover:border-primary/50'
                            }`}
                        >
                          <div className="font-semibold">{t.label}</div>
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {t.description || 'Standard submission'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Provisional Title</label>
                    <input
                      type="text"
                      className="w-full p-3 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/50 outline-none"
                      placeholder="Enter the title of your work"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Upload Files */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                    <Upload className="size-12 md:size-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Upload Manuscript</h3>
                    <p className="text-muted-foreground mb-6 text-center max-w-sm">
                      Supported formats: PDF, Word (DOCX). Max size: 50MB.
                    </p>

                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileSelect}
                    />

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium shadow-lg shadow-primary/20 hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50"
                    >
                      {uploading ? 'Uploading...' : 'Select File'}
                    </button>

                    {uploadError && (
                      <div className="flex items-center gap-2 mt-4 text-destructive text-sm font-medium bg-destructive/10 px-4 py-2 rounded-md">
                        <AlertCircle className="size-4" />
                        {uploadError}
                      </div>
                    )}
                  </div>

                  {/* File List */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Uploaded Files</h4>
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-card rounded-lg border border-border shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-md">
                              <FileIcon className="size-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{file.file_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.file_size / 1024 / 1024).toFixed(2)} MB • {new Date().toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button className="text-muted-foreground hover:text-destructive transition-colors p-2">
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Metadata */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium">Abstract</label>
                    <textarea
                      className="w-full p-3 rounded-lg bg-background border border-border h-32 focus:ring-2 focus:ring-primary/50 outline-none"
                      placeholder="Paste your abstract here..."
                      value={abstract}
                      onChange={(e) => setAbstract(e.target.value)}
                    />
                  </div>

                  {Object.entries(fieldsBySection).map(([section, sectionFields]) => (
                    <div key={section} className="space-y-4">
                      <h3 className="font-semibold text-lg border-b border-border pb-2">{section}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sectionFields.map(field => (
                          <div key={field.key} className={field.field_type === 'TEXTAREA' ? 'md:col-span-2' : ''}>
                            <label className="block text-sm font-medium mb-1">
                              {field.label} {field.is_required && <span className="text-destructive">*</span>}
                            </label>
                            {field.field_type === 'TEXTAREA' ? (
                              <textarea
                                className="w-full p-3 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/50 outline-none"
                                rows={3}
                                onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                              />
                            ) : field.field_type === 'SELECT' ? (
                              <select className="w-full p-3 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/50 outline-none">
                                <option value="">Select option...</option>
                                {(field.options?.choices || []).map((opt: any) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={field.field_type === 'NUMBER' ? 'number' : 'text'}
                                className="w-full p-3 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/50 outline-none"
                                onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                              />
                            )}
                            {field.description && (
                              <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 4: Contributors (Real) */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Authors & Contributors</h3>
                    {!showAuthorForm && (
                      <button
                        onClick={() => setShowAuthorForm(true)}
                        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
                      >
                        <Plus className="size-4" /> Add Author
                      </button>
                    )}
                  </div>

                  {showAuthorForm && (
                    <div className="bg-muted/30 p-6 rounded-lg border border-border space-y-4 animate-in fade-in slide-in-from-top-2">
                      <h4 className="font-medium text-sm">Add New Author</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium mb-1">Full Name</label>
                          <input
                            type="text"
                            className="w-full p-2 rounded-md border border-border"
                            value={newAuthor.external_name}
                            onChange={e => setNewAuthor(prev => ({ ...prev, external_name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Email</label>
                          <input
                            type="email"
                            className="w-full p-2 rounded-md border border-border"
                            value={newAuthor.external_email}
                            onChange={e => setNewAuthor(prev => ({ ...prev, external_email: e.target.value }))}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium mb-1">Affiliation</label>
                          <input
                            type="text"
                            className="w-full p-2 rounded-md border border-border"
                            value={newAuthor.external_affiliation}
                            onChange={e => setNewAuthor(prev => ({ ...prev, external_affiliation: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="is_corresponding"
                          checked={newAuthor.is_corresponding}
                          onChange={e => setNewAuthor(prev => ({ ...prev, is_corresponding: e.target.checked }))}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="is_corresponding" className="text-sm">Is Corresponding Author?</label>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => setShowAuthorForm(false)}
                          className="px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddAuthor}
                          className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
                          disabled={!newAuthor.external_name || !newAuthor.external_email}
                        >
                          Add Author
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {authorsLoading ? (
                      <p className="text-sm text-muted-foreground">Loading authors...</p>
                    ) : authors.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-border rounded-xl bg-muted/10">
                        <p className="text-muted-foreground text-sm">No authors added yet.</p>
                        <button onClick={() => setShowAuthorForm(true)} className="mt-2 text-primary text-sm font-medium hover:underline">
                          Add the first author
                        </button>
                      </div>
                    ) : (
                      authors.map((author, index) => (
                        <div key={author.id} className="flex items-center justify-between p-4 bg-card rounded-lg border border-border shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">{author.external_name || 'Unknown Name'}</p>
                                {author.is_corresponding && (
                                  <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">Corresponding</span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{author.external_email}</p>
                              <p className="text-xs text-muted-foreground/80">{author.external_affiliation}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeAuthor(author.id)}
                            className="text-muted-foreground hover:text-destructive p-2"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Step 5: Review & Submit */}
              {currentStep === 4 && (
                <div className="space-y-8">
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-2">{title}</h2>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{abstract}</p>

                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs px-2 py-1 bg-background border border-border rounded-md font-medium text-muted-foreground">
                        {venues.find(v => v.id === selectedVenueId)?.name}
                      </span>
                      <span className="text-xs px-2 py-1 bg-background border border-border rounded-md font-medium text-muted-foreground">
                        {types.find(t => t.id === selectedTypeId)?.label}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-border rounded-xl p-5 bg-card">
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <Users className="size-4 text-primary" /> Authors
                      </h4>
                      <ul className="space-y-2">
                        {authors.map(a => (
                          <li key={a.id} className="text-sm text-foreground flex justify-between">
                            <span>{a.external_name}</span>
                            {a.is_corresponding && <span className="text-xs text-muted-foreground">(Corr.)</span>}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border border-border rounded-xl p-5 bg-card">
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <FileIcon className="size-4 text-primary" /> Files
                      </h4>
                      <ul className="space-y-2">
                        {uploadedFiles.map((f, i) => (
                          <li key={i} className="text-sm text-foreground truncate">
                            {f.file_name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-yellow-500/10 text-yellow-700 rounded-lg border border-yellow-500/20">
                    <AlertCircle className="size-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold mb-1">Final Review</p>
                      <p className="text-sm opacity-90">
                        By submitting this manuscript, you confirm that all authors have approved the content and that the work has not been published elsewhere.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Footer Actions */}
            <div className="border-t border-border p-6 flex justify-between items-center bg-card rounded-b-xl">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className="px-6 py-2 rounded-lg hover:bg-accent disabled:opacity-50 transition-colors font-medium text-sm"
              >
                Back
              </button>

              <div className="flex gap-4">
                {submissionId && (
                  <button className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Save className="size-4" /> Save Draft
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={createLoading || updateLoading || (currentStep === 0 && (!selectedVenueId || !selectedTypeId))}
                  className="px-8 py-2 bg-primary text-primary-foreground rounded-lg font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                  {createLoading || updateLoading ? 'Processing...' : (
                    currentStep === STEPS.length - 1 ? 'Submit Manuscript' : 'Next Step'
                  )}
                  {!(createLoading || updateLoading) && <ChevronRight className="size-4" />}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
};

export default SubmissionWizard;