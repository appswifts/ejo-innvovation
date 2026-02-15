export enum ViewState {
  LOGIN = 'LOGIN',
  SIGNUP = 'SIGNUP',
  LANDING = 'LANDING',
  JOURNAL_LIST = 'JOURNAL_LIST',
  JOURNAL_DETAIL = 'JOURNAL_DETAIL',
  ARTICLE_VIEW = 'ARTICLE_VIEW',
  SUBMISSION = 'SUBMISSION',
  AUTHOR_DASHBOARD = 'AUTHOR_DASHBOARD',
  EDITOR_DASHBOARD = 'EDITOR_DASHBOARD',
  REVIEWER_PORTAL = 'REVIEWER_PORTAL',
  BOOKS_PAGE = 'BOOKS_PAGE',
  ADMIN_USERS = 'ADMIN_USERS',
  ADMIN_ROLES = 'ADMIN_ROLES',
  ADMIN_JOURNALS = 'ADMIN_JOURNALS',
  FINANCE_DASHBOARD = 'FINANCE_DASHBOARD'
}

export interface NavItem {
  label: string;
  view: ViewState;
  icon?: string;
}

export interface Journal {
  id: string;
  title: string;
  slug: string;
  issn: string;
  description: string;
  aims_scope: string;
  cover_image_url: string;
  discipline: string;
  editor_in_chief_name?: string;
  impact_factor: number;
  is_open_access: boolean;
  subscription_package_id?: string | null;
  created_at: string;
  guidelines?: string;
}

export interface Article {
  id: string;
  journal_id: string;
  title: string;
  slug: string;
  abstract: string;
  publication_date: string;
  views: number;
  downloads: number;
  access_level: 'open' | 'paid' | 'institutional';
  authors?: { name: string }[]; // Simplified for UI
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Permission {
  id: string;
  slug: string;
  description: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  institution?: string;
  avatar_url: string;
  role?: Role; // Now an object relation
  permissions?: string[]; // Computed list of permission slugs for easy checking
}

export type ManuscriptStatus = 'draft' | 'submitted' | 'under_review' | 'revision_required' | 'accepted' | 'rejected' | 'published';

export interface Manuscript {
  id: string;
  submitter_id: string;
  journal_id?: string;
  title: string;
  abstract?: string;
  status: ManuscriptStatus;
  submission_date: string;
  updated_at: string;
  price?: number;
  currency?: string;
}

export type BookType = 'scholarly' | 'creative_content' | 'general_nonfiction';

export const BOOK_TYPES: { label: string; value: BookType; icon: string }[] = [
  { label: 'Scholarly', value: 'scholarly', icon: 'school' },
  { label: 'Creative Content', value: 'creative_content', icon: 'auto_stories' },
  { label: 'General Nonfiction', value: 'general_nonfiction', icon: 'menu_book' },
];