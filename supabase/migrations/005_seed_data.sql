-- Migration: 005_seed_data
-- Description: Seeds initial data for NCR platform
-- Seeds: venues (journals + imprint), submission_types, taxonomies, terms, workflows

-- ============================================
-- WORKFLOWS
-- ============================================
INSERT INTO public.workflows (id, key, name, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'double_blind_review', 'Double-Blind Peer Review', 'Standard double-blind review process with 2+ reviewers'),
  ('22222222-2222-2222-2222-222222222222', 'editorial_review', 'Editorial Review', 'Lighter editorial-only review for book proposals'),
  ('33333333-3333-3333-3333-333333333333', 'single_blind_review', 'Single-Blind Peer Review', 'Single-blind review where reviewers know author identity');

-- ============================================
-- WORKFLOW STEPS
-- ============================================
-- Double-blind review workflow
INSERT INTO public.workflow_steps (workflow_id, step_order, step_type, label, required_role, is_required) VALUES
  ('11111111-1111-1111-1111-111111111111', 1, 'INITIAL_SCREENING', 'Initial Screening', 'MANAGING_EDITOR', true),
  ('11111111-1111-1111-1111-111111111111', 2, 'PLAGIARISM_CHECK', 'Plagiarism Check', 'MANAGING_EDITOR', true),
  ('11111111-1111-1111-1111-111111111111', 3, 'EDITOR_ASSIGNMENT', 'Editor Assignment', 'EDITOR_IN_CHIEF', true),
  ('11111111-1111-1111-1111-111111111111', 4, 'REVIEWER_ASSIGNMENT', 'Reviewer Assignment', 'EDITOR', true),
  ('11111111-1111-1111-1111-111111111111', 5, 'PEER_REVIEW', 'Peer Review', 'REVIEWER', true),
  ('11111111-1111-1111-1111-111111111111', 6, 'FINAL_DECISION', 'Final Decision', 'EDITOR', true),
  ('11111111-1111-1111-1111-111111111111', 7, 'PRODUCTION', 'Production', 'MANAGING_EDITOR', true),
  ('11111111-1111-1111-1111-111111111111', 8, 'PUBLICATION', 'Publication', 'MANAGING_EDITOR', true);

-- Editorial review workflow
INSERT INTO public.workflow_steps (workflow_id, step_order, step_type, label, required_role, is_required) VALUES
  ('22222222-2222-2222-2222-222222222222', 1, 'INITIAL_SCREENING', 'Initial Screening', 'MANAGING_EDITOR', true),
  ('22222222-2222-2222-2222-222222222222', 2, 'EDITORIAL_REVIEW', 'Editorial Review', 'EDITOR', true),
  ('22222222-2222-2222-2222-222222222222', 3, 'FINAL_DECISION', 'Final Decision', 'EDITOR_IN_CHIEF', true);

-- ============================================
-- VENUES: JOURNALS
-- ============================================
INSERT INTO public.venues (id, type, name, slug, abbreviation, description, scope, contact_email) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'JOURNAL',
    'Nkiza International Journal of Economics',
    'nije',
    'NIJE',
    'A peer-reviewed, open-access academic journal dedicated to high-quality research in economics and related disciplines.',
    'Development economics, macroeconomics, microeconomics, public economics, international trade, monetary and financial economics, labor economics, agricultural and environmental economics, econometrics, and applied economic policy analysis.',
    'nije@nkizacenter.org'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'JOURNAL',
    'Nkiza International Journal of Natural Sciences',
    'nijns',
    'NIJNS',
    'A peer-reviewed, open-access academic journal dedicated to high-quality research in the natural sciences and related interdisciplinary fields.',
    'Biology, chemistry, physics, environmental sciences, earth and geological sciences, agricultural and life sciences, biotechnology, mathematics, applied statistics.',
    'nijns@nkizacenter.org'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'JOURNAL',
    'Nkiza International Journal of Medical Sciences',
    'nijms',
    'NIJMS',
    'A peer-reviewed, open-access academic journal dedicated to high-quality research in medical sciences and related health disciplines.',
    'Clinical medicine, public health, epidemiology, biomedical sciences, nursing and midwifery, pharmacology, medical laboratory sciences, health systems research, mental health, nutrition, allied health sciences.',
    'nijms@nkizacenter.org'
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'JOURNAL',
    'Nkiza International Journal of Social Sciences, Law and Humanities',
    'nijslh',
    'NIJSLH',
    'A peer-reviewed, open-access academic journal dedicated to high-quality research in the social sciences, legal studies, and humanities.',
    'Sociology, finance, management, entrepreneurship, political science, public administration, international relations, anthropology, demography, psychology, development studies, law, criminology, human rights, jurisprudence, philosophy, history, literature, linguistics, cultural studies, ethics.',
    'nijslh@nkizacenter.org'
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'JOURNAL',
    'Nkiza International Journal of Computer Sciences, Engineering and Data Sciences',
    'nijceds',
    'NIJCEDS',
    'A peer-reviewed, open-access academic journal dedicated to high-quality research in computer sciences, engineering, and data-driven disciplines.',
    'Computer science, software engineering, information systems, artificial intelligence, machine learning, data science, big data analytics, computer networks, cybersecurity, cloud computing, Internet of Things, embedded systems, electrical and electronic engineering, mechanical engineering, civil and environmental engineering, telecommunications, robotics, automation, computational mathematics.',
    'nijceds@nkizacenter.org'
  );

-- ============================================
-- VENUES: BOOK IMPRINT
-- ============================================
INSERT INTO public.venues (id, type, name, slug, abbreviation, description, contact_email) VALUES
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'BOOK_IMPRINT',
    'Nkiza eBook Publications',
    'nkiza-ebooks',
    'NKEP',
    'The digital academic and professional publishing arm of Nkiza, supporting the creation, dissemination, and long-term preservation of high-quality scholarly and applied eBooks.',
    'ebooks@nkizacenter.org'
  );

-- ============================================
-- JOURNALS DATA
-- ============================================
INSERT INTO public.journals (venue_id, publisher, citation_style, peer_review_type, author_revenue_share) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Nkiza Center for Research', 'APA', 'double-blind', 50.00),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Nkiza Center for Research', 'APA', 'double-blind', 50.00),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Nkiza Center for Research', 'APA', 'double-blind', 50.00),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Nkiza Center for Research', 'APA', 'double-blind', 50.00),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Nkiza Center for Research', 'APA', 'double-blind', 50.00);

-- ============================================
-- IMPRINTS DATA
-- ============================================
INSERT INTO public.imprints (venue_id, publisher, author_royalty_share) VALUES
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Nkiza Center for Research', 70.00);

-- ============================================
-- SUBMISSION TYPES
-- ============================================
INSERT INTO public.submission_types (id, key, label, description, allowed_venue_types, default_workflow_id) VALUES
  (
    '77777777-7777-7777-7777-777777777771',
    'journal_article',
    'Journal Article',
    'Original research article for peer-reviewed publication',
    ARRAY['JOURNAL']::public.venue_type[],
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    '77777777-7777-7777-7777-777777777772',
    'review_article',
    'Review Article',
    'Comprehensive review of existing literature on a topic',
    ARRAY['JOURNAL']::public.venue_type[],
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    '77777777-7777-7777-7777-777777777773',
    'case_study',
    'Case Study',
    'In-depth analysis of a specific case or phenomenon',
    ARRAY['JOURNAL']::public.venue_type[],
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    '77777777-7777-7777-7777-777777777774',
    'ebook_proposal',
    'eBook Proposal',
    'Initial proposal for a scholarly eBook project',
    ARRAY['BOOK_IMPRINT']::public.venue_type[],
    '22222222-2222-2222-2222-222222222222'
  ),
  (
    '77777777-7777-7777-7777-777777777775',
    'ebook_manuscript',
    'eBook Full Manuscript',
    'Complete manuscript for eBook publication',
    ARRAY['BOOK_IMPRINT']::public.venue_type[],
    '22222222-2222-2222-2222-222222222222'
  );

-- ============================================
-- TAXONOMIES
-- ============================================
INSERT INTO public.taxonomies (id, key, label, description, is_hierarchical, is_multiple) VALUES
  ('88888888-8888-8888-8888-888888888881', 'discipline', 'Discipline', 'Academic discipline or field of study', true, true),
  ('88888888-8888-8888-8888-888888888882', 'sdg', 'Sustainable Development Goal', 'UN Sustainable Development Goals alignment', false, true),
  ('88888888-8888-8888-8888-888888888883', 'methodology', 'Research Methodology', 'Type of research methodology used', false, true),
  ('88888888-8888-8888-8888-888888888884', 'article_type', 'Article Type', 'Type of article or publication', false, false),
  ('88888888-8888-8888-8888-888888888885', 'book_category', 'Book Category', 'Category of book publication', false, false),
  ('88888888-8888-8888-8888-888888888886', 'target_audience', 'Target Audience', 'Primary audience for eBooks', false, true);

-- ============================================
-- TERMS: SDGs
-- ============================================
INSERT INTO public.terms (taxonomy_id, slug, name, description, display_order) VALUES
  ('88888888-8888-8888-8888-888888888882', 'sdg-4', 'SDG 4 – Quality Education', 'Ensure inclusive and equitable quality education', 4),
  ('88888888-8888-8888-8888-888888888882', 'sdg-9', 'SDG 9 – Industry, Innovation, Infrastructure', 'Build resilient infrastructure, promote sustainable industrialization', 9),
  ('88888888-8888-8888-8888-888888888882', 'sdg-10', 'SDG 10 – Reduced Inequalities', 'Reduce inequality within and among countries', 10),
  ('88888888-8888-8888-8888-888888888882', 'sdg-16', 'SDG 16 – Peace, Justice, Strong Institutions', 'Promote peaceful and inclusive societies', 16),
  ('88888888-8888-8888-8888-888888888882', 'sdg-17', 'SDG 17 – Partnerships for the Goals', 'Strengthen means of implementation', 17),
  ('88888888-8888-8888-8888-888888888882', 'sdg-3', 'SDG 3 – Good Health and Well-being', 'Ensure healthy lives and promote well-being', 3),
  ('88888888-8888-8888-8888-888888888882', 'sdg-13', 'SDG 13 – Climate Action', 'Take urgent action to combat climate change', 13);

-- ============================================
-- TERMS: DISCIPLINES
-- ============================================
INSERT INTO public.terms (taxonomy_id, slug, name, display_order) VALUES
  ('88888888-8888-8888-8888-888888888881', 'economics', 'Economics', 1),
  ('88888888-8888-8888-8888-888888888881', 'natural-sciences', 'Natural Sciences', 2),
  ('88888888-8888-8888-8888-888888888881', 'medical-sciences', 'Medical Sciences', 3),
  ('88888888-8888-8888-8888-888888888881', 'social-sciences', 'Social Sciences', 4),
  ('88888888-8888-8888-8888-888888888881', 'law', 'Law', 5),
  ('88888888-8888-8888-8888-888888888881', 'humanities', 'Humanities', 6),
  ('88888888-8888-8888-8888-888888888881', 'computer-science', 'Computer Science', 7),
  ('88888888-8888-8888-8888-888888888881', 'engineering', 'Engineering', 8),
  ('88888888-8888-8888-8888-888888888881', 'data-science', 'Data Science', 9);

-- ============================================
-- TERMS: METHODOLOGY
-- ============================================
INSERT INTO public.terms (taxonomy_id, slug, name, display_order) VALUES
  ('88888888-8888-8888-8888-888888888883', 'quantitative', 'Quantitative Research', 1),
  ('88888888-8888-8888-8888-888888888883', 'qualitative', 'Qualitative Research', 2),
  ('88888888-8888-8888-8888-888888888883', 'mixed-methods', 'Mixed Methods', 3),
  ('88888888-8888-8888-8888-888888888883', 'experimental', 'Experimental', 4),
  ('88888888-8888-8888-8888-888888888883', 'observational', 'Observational', 5),
  ('88888888-8888-8888-8888-888888888883', 'systematic-review', 'Systematic Review', 6),
  ('88888888-8888-8888-8888-888888888883', 'meta-analysis', 'Meta-Analysis', 7),
  ('88888888-8888-8888-8888-888888888883', 'case-study', 'Case Study', 8),
  ('88888888-8888-8888-8888-888888888883', 'simulation', 'Simulation/Modeling', 9);

-- ============================================
-- TERMS: ARTICLE TYPES
-- ============================================
INSERT INTO public.terms (taxonomy_id, slug, name, display_order) VALUES
  ('88888888-8888-8888-8888-888888888884', 'original-research', 'Original Research', 1),
  ('88888888-8888-8888-8888-888888888884', 'review', 'Review Article', 2),
  ('88888888-8888-8888-8888-888888888884', 'case-report', 'Case Report', 3),
  ('88888888-8888-8888-8888-888888888884', 'short-communication', 'Short Communication', 4),
  ('88888888-8888-8888-8888-888888888884', 'commentary', 'Commentary', 5),
  ('88888888-8888-8888-8888-888888888884', 'perspective', 'Perspective', 6);

-- ============================================
-- TERMS: BOOK CATEGORIES
-- ============================================
INSERT INTO public.terms (taxonomy_id, slug, name, display_order) VALUES
  ('88888888-8888-8888-8888-888888888885', 'monograph', 'Scholarly Monograph', 1),
  ('88888888-8888-8888-8888-888888888885', 'edited-volume', 'Edited Volume', 2),
  ('88888888-8888-8888-8888-888888888885', 'textbook', 'Academic Textbook', 3),
  ('88888888-8888-8888-8888-888888888885', 'handbook', 'Handbook/Reference', 4),
  ('88888888-8888-8888-8888-888888888885', 'professional-guide', 'Professional Guide', 5),
  ('88888888-8888-8888-8888-888888888885', 'policy-publication', 'Policy Publication', 6);

-- ============================================
-- TERMS: TARGET AUDIENCE (for eBooks)
-- ============================================
INSERT INTO public.terms (taxonomy_id, slug, name, display_order) VALUES
  ('88888888-8888-8888-8888-888888888886', 'undergraduate', 'Undergraduate Students', 1),
  ('88888888-8888-8888-8888-888888888886', 'postgraduate', 'Postgraduate/Graduate Students', 2),
  ('88888888-8888-8888-8888-888888888886', 'researchers', 'Researchers & Academics', 3),
  ('88888888-8888-8888-8888-888888888886', 'professionals', 'Professionals/Practitioners', 4),
  ('88888888-8888-8888-8888-888888888886', 'policymakers', 'Policymakers', 5);

-- ============================================
-- LINK TAXONOMIES TO SUBMISSION TYPES
-- ============================================
-- Journal articles get: discipline, sdg, methodology, article_type
INSERT INTO public.submission_type_taxonomies (submission_type_id, taxonomy_id, is_required, max_terms, display_order) VALUES
  ('77777777-7777-7777-7777-777777777771', '88888888-8888-8888-8888-888888888881', true, null, 1),
  ('77777777-7777-7777-7777-777777777771', '88888888-8888-8888-8888-888888888882', false, 3, 2),
  ('77777777-7777-7777-7777-777777777771', '88888888-8888-8888-8888-888888888883', true, null, 3),
  ('77777777-7777-7777-7777-777777777771', '88888888-8888-8888-8888-888888888884', true, 1, 4);

-- Review articles
INSERT INTO public.submission_type_taxonomies (submission_type_id, taxonomy_id, is_required, max_terms, display_order) VALUES
  ('77777777-7777-7777-7777-777777777772', '88888888-8888-8888-8888-888888888881', true, null, 1),
  ('77777777-7777-7777-7777-777777777772', '88888888-8888-8888-8888-888888888882', false, 3, 2);

-- eBook proposals get: discipline, book_category, target_audience
INSERT INTO public.submission_type_taxonomies (submission_type_id, taxonomy_id, is_required, max_terms, display_order) VALUES
  ('77777777-7777-7777-7777-777777777774', '88888888-8888-8888-8888-888888888881', true, null, 1),
  ('77777777-7777-7777-7777-777777777774', '88888888-8888-8888-8888-888888888885', true, 1, 2),
  ('77777777-7777-7777-7777-777777777774', '88888888-8888-8888-8888-888888888886', true, null, 3);

-- ============================================
-- LINK VENUES TO DISCIPLINE TERMS
-- ============================================
INSERT INTO public.venue_terms (venue_id, term_id, is_primary)
SELECT 
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  id,
  slug = 'economics'
FROM public.terms WHERE slug = 'economics';

INSERT INTO public.venue_terms (venue_id, term_id, is_primary)
SELECT 
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  id,
  slug = 'natural-sciences'
FROM public.terms WHERE slug = 'natural-sciences';

INSERT INTO public.venue_terms (venue_id, term_id, is_primary)
SELECT 
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  id,
  slug = 'medical-sciences'
FROM public.terms WHERE slug = 'medical-sciences';

INSERT INTO public.venue_terms (venue_id, term_id, is_primary)
SELECT 
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  id,
  true
FROM public.terms WHERE slug IN ('social-sciences', 'law', 'humanities');

INSERT INTO public.venue_terms (venue_id, term_id, is_primary)
SELECT 
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  id,
  true
FROM public.terms WHERE slug IN ('computer-science', 'engineering', 'data-science');
