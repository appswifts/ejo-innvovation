export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            editor_decisions: {
                Row: {
                    comments_to_author: string | null
                    created_at: string | null
                    decided_at: string | null
                    decision: Database["public"]["Enums"]["decision_type"]
                    editor_id: string
                    id: string
                    internal_notes: string | null
                    round_number: number | null
                    submission_id: string
                }
                Insert: {
                    comments_to_author?: string | null
                    created_at?: string | null
                    decided_at?: string | null
                    decision: Database["public"]["Enums"]["decision_type"]
                    editor_id: string
                    id?: string
                    internal_notes?: string | null
                    round_number?: number | null
                    submission_id: string
                }
                Update: {
                    comments_to_author?: string | null
                    created_at?: string | null
                    decided_at?: string | null
                    decision?: Database["public"]["Enums"]["decision_type"]
                    editor_id?: string
                    id?: string
                    internal_notes?: string | null
                    round_number?: number | null
                    submission_id?: string
                }
                Relationships: []
            }
            imprints: {
                Row: {
                    author_royalty_share: number | null
                    created_at: string | null
                    id: string
                    isbn_prefix: string | null
                    professional_fee_amount: number | null
                    publisher: string | null
                    student_fee_amount: number | null
                    updated_at: string | null
                    venue_id: string
                    access_models: string[] | null
                }
                Insert: {
                    author_royalty_share?: number | null
                    created_at?: string | null
                    id?: string
                    isbn_prefix?: string | null
                    professional_fee_amount?: number | null
                    publisher?: string | null
                    student_fee_amount?: number | null
                    updated_at?: string | null
                    venue_id: string
                    access_models?: string[] | null
                }
                Update: {
                    author_royalty_share?: number | null
                    created_at?: string | null
                    id?: string
                    isbn_prefix?: string | null
                    professional_fee_amount?: number | null
                    publisher?: string | null
                    student_fee_amount?: number | null
                    updated_at?: string | null
                    venue_id?: string
                    access_models?: string[] | null
                }
                Relationships: []
            }
            journals: {
                Row: {
                    author_revenue_share: number | null
                    citation_style: string | null
                    created_at: string | null
                    doi_prefix: string | null
                    editor_in_chief_id: string | null
                    eissn: string | null
                    frequency: string | null
                    id: string
                    indexing_info: string[] | null
                    issn: string | null
                    managing_editor_id: string | null
                    peer_review_type: string | null
                    publisher: string | null
                    researcher_fee_amount: number | null
                    student_fee_amount: number | null
                    updated_at: string | null
                    venue_id: string
                }
                Insert: {
                    author_revenue_share?: number | null
                    citation_style?: string | null
                    created_at?: string | null
                    doi_prefix?: string | null
                    editor_in_chief_id?: string | null
                    eissn?: string | null
                    frequency?: string | null
                    id?: string
                    indexing_info?: string[] | null
                    issn?: string | null
                    managing_editor_id?: string | null
                    peer_review_type?: string | null
                    publisher?: string | null
                    researcher_fee_amount?: number | null
                    student_fee_amount?: number | null
                    updated_at?: string | null
                    venue_id: string
                }
                Update: {
                    author_revenue_share?: number | null
                    citation_style?: string | null
                    created_at?: string | null
                    doi_prefix?: string | null
                    editor_in_chief_id?: string | null
                    eissn?: string | null
                    frequency?: string | null
                    id?: string
                    indexing_info?: string[] | null
                    issn?: string | null
                    managing_editor_id?: string | null
                    peer_review_type?: string | null
                    publisher?: string | null
                    researcher_fee_amount?: number | null
                    student_fee_amount?: number | null
                    updated_at?: string | null
                    venue_id?: string
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    affiliation: string | null
                    avatar_url: string | null
                    bio: string | null
                    country: string | null
                    created_at: string | null
                    display_name: string | null
                    email: string
                    full_name: string | null
                    google_scholar_url: string | null
                    id: string
                    is_student: boolean | null
                    orcid_id: string | null
                    updated_at: string | null
                }
                Insert: {
                    affiliation?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    country?: string | null
                    created_at?: string | null
                    display_name?: string | null
                    email: string
                    full_name?: string | null
                    google_scholar_url?: string | null
                    id: string
                    is_student?: boolean | null
                    orcid_id?: string | null
                    updated_at?: string | null
                }
                Update: {
                    affiliation?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    country?: string | null
                    created_at?: string | null
                    display_name?: string | null
                    email?: string
                    full_name?: string | null
                    google_scholar_url?: string | null
                    id?: string
                    is_student?: boolean | null
                    orcid_id?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            purchases: {
                Row: {
                    amount: number
                    created_at: string | null
                    currency: string
                    id: string
                    provider: string
                    status: string
                    submission_id: string
                    transaction_id: string | null
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    amount: number
                    created_at?: string | null
                    currency: string
                    id?: string
                    provider: string
                    status: string
                    submission_id: string
                    transaction_id?: string | null
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    amount?: number
                    created_at?: string | null
                    currency?: string
                    id?: string
                    provider?: string
                    status?: string
                    submission_id?: string
                    transaction_id?: string | null
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: []
            }
            submission_comments: {
                Row: {
                    id: string
                    submission_id: string
                    user_id: string
                    content: string
                    visibility: 'internal' | 'author' | 'public'
                    created_at: string
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    submission_id: string
                    user_id: string
                    content: string
                    visibility?: 'internal' | 'author' | 'public'
                    created_at?: string
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    submission_id?: string
                    user_id?: string
                    content?: string
                    visibility?: 'internal' | 'author' | 'public'
                    created_at?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "submission_comments_submission_id_fkey"
                        columns: ["submission_id"]
                        referencedRelation: "submissions"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "submission_comments_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            reviews: {
                Row: {
                    accepted_at: string | null
                    comments_to_author: string | null
                    comments_to_editor: string | null
                    created_at: string | null
                    declined_at: string | null
                    due_date: string | null
                    id: string
                    invited_at: string | null
                    is_anonymous: boolean | null
                    ratings: Json | null
                    recommendation: Database["public"]["Enums"]["review_recommendation"] | null
                    reviewer_id: string
                    round_number: number | null
                    submission_id: string
                    submitted_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    accepted_at?: string | null
                    comments_to_author?: string | null
                    comments_to_editor?: string | null
                    created_at?: string | null
                    declined_at?: string | null
                    due_date?: string | null
                    id?: string
                    invited_at?: string | null
                    is_anonymous?: boolean | null
                    ratings?: Json | null
                    recommendation?: Database["public"]["Enums"]["review_recommendation"] | null
                    reviewer_id: string
                    round_number?: number | null
                    submission_id: string
                    submitted_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    accepted_at?: string | null
                    comments_to_author?: string | null
                    comments_to_editor?: string | null
                    created_at?: string | null
                    declined_at?: string | null
                    due_date?: string | null
                    id?: string
                    invited_at?: string | null
                    is_anonymous?: boolean | null
                    ratings?: Json | null
                    recommendation?: Database["public"]["Enums"]["review_recommendation"] | null
                    reviewer_id?: string
                    round_number?: number | null
                    submission_id?: string
                    submitted_at?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            submission_authors: {
                Row: {
                    author_order: number
                    contribution: string | null
                    created_at: string | null
                    external_affiliation: string | null
                    external_email: string | null
                    external_name: string | null
                    external_orcid: string | null
                    id: string
                    is_corresponding: boolean | null
                    profile_id: string | null
                    submission_id: string
                }
                Insert: {
                    author_order: number
                    contribution?: string | null
                    created_at?: string | null
                    external_affiliation?: string | null
                    external_email?: string | null
                    external_name?: string | null
                    external_orcid?: string | null
                    id?: string
                    is_corresponding?: boolean | null
                    profile_id?: string | null
                    submission_id: string
                }
                Update: {
                    author_order?: number
                    contribution?: string | null
                    created_at?: string | null
                    external_affiliation?: string | null
                    external_email?: string | null
                    external_name?: string | null
                    external_orcid?: string | null
                    id?: string
                    is_corresponding?: boolean | null
                    profile_id?: string | null
                    submission_id?: string
                }
                Relationships: []
            }
            submission_field_values: {
                Row: {
                    created_at: string | null
                    field_id: string
                    id: string
                    submission_id: string
                    updated_at: string | null
                    value_boolean: boolean | null
                    value_date: string | null
                    value_json: Json | null
                    value_number: number | null
                    value_text: string | null
                }
                Insert: {
                    created_at?: string | null
                    field_id: string
                    id?: string
                    submission_id: string
                    updated_at?: string | null
                    value_boolean?: boolean | null
                    value_date?: string | null
                    value_json?: Json | null
                    value_number?: number | null
                    value_text?: string | null
                }
                Update: {
                    created_at?: string | null
                    field_id?: string
                    id?: string
                    submission_id?: string
                    updated_at?: string | null
                    value_boolean?: boolean | null
                    value_date?: string | null
                    value_json?: Json | null
                    value_number?: number | null
                    value_text?: string | null
                }
                Relationships: []
            }
            submission_fields: {
                Row: {
                    created_at: string | null
                    description: string | null
                    display_order: number | null
                    field_type: Database["public"]["Enums"]["field_type"]
                    id: string
                    is_required: boolean | null
                    key: string
                    label: string
                    max_length: number | null
                    max_value: number | null
                    min_length: number | null
                    min_value: number | null
                    options: Json | null
                    pattern: string | null
                    section: string | null
                    show_condition: Json | null
                    submission_type_id: string
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    display_order?: number | null
                    field_type: Database["public"]["Enums"]["field_type"]
                    id?: string
                    is_required?: boolean | null
                    key: string
                    label: string
                    max_length?: number | null
                    max_value?: number | null
                    min_length?: number | null
                    min_value?: number | null
                    options?: Json | null
                    pattern?: string | null
                    section?: string | null
                    show_condition?: Json | null
                    submission_type_id: string
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    display_order?: number | null
                    field_type?: Database["public"]["Enums"]["field_type"]
                    id?: string
                    is_required?: boolean | null
                    key?: string
                    label?: string
                    max_length?: number | null
                    max_value?: number | null
                    min_length?: number | null
                    min_value?: number | null
                    options?: Json | null
                    pattern?: string | null
                    section?: string | null
                    show_condition?: Json | null
                    submission_type_id?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            submission_files: {
                Row: {
                    created_at: string | null
                    description: string | null
                    file_name: string
                    file_path: string
                    file_size: number | null
                    file_type: Database["public"]["Enums"]["file_type"]
                    id: string
                    is_primary: boolean | null
                    label: string | null
                    mime_type: string | null
                    submission_id: string
                    updated_at: string | null
                    uploaded_by: string | null
                    version: number | null
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    file_name: string
                    file_path: string
                    file_size?: number | null
                    file_type: Database["public"]["Enums"]["file_type"]
                    id?: string
                    is_primary?: boolean | null
                    label?: string | null
                    mime_type?: string | null
                    submission_id: string
                    updated_at?: string | null
                    uploaded_by?: string | null
                    version?: number | null
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    file_name?: string
                    file_path?: string
                    file_size?: number | null
                    file_type?: Database["public"]["Enums"]["file_type"]
                    id?: string
                    is_primary?: boolean | null
                    label?: string | null
                    mime_type?: string | null
                    submission_id?: string
                    updated_at?: string | null
                    uploaded_by?: string | null
                    version?: number | null
                }
                Relationships: []
            }
            submission_terms: {
                Row: {
                    created_at: string | null
                    id: string
                    submission_id: string
                    term_id: string
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    submission_id: string
                    term_id: string
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    submission_id?: string
                    term_id?: string
                }
                Relationships: []
            }
            submission_type_taxonomies: {
                Row: {
                    created_at: string | null
                    display_order: number | null
                    id: string
                    is_required: boolean | null
                    max_terms: number | null
                    min_terms: number | null
                    submission_type_id: string
                    taxonomy_id: string
                }
                Insert: {
                    created_at?: string | null
                    display_order?: number | null
                    id?: string
                    is_required?: boolean | null
                    max_terms?: number | null
                    min_terms?: number | null
                    submission_type_id: string
                    taxonomy_id: string
                }
                Update: {
                    created_at?: string | null
                    display_order?: number | null
                    id?: string
                    is_required?: boolean | null
                    max_terms?: number | null
                    min_terms?: number | null
                    submission_type_id?: string
                    taxonomy_id?: string
                }
                Relationships: []
            }
            submission_types: {
                Row: {
                    allowed_venue_types: Database["public"]["Enums"]["venue_type"][]
                    created_at: string | null
                    default_workflow_id: string | null
                    description: string | null
                    id: string
                    is_active: boolean | null
                    key: string
                    label: string
                    settings: Json | null
                    updated_at: string | null
                }
                Insert: {
                    allowed_venue_types: Database["public"]["Enums"]["venue_type"][]
                    created_at?: string | null
                    default_workflow_id?: string | null
                    description?: string | null
                    id?: string
                    is_active?: boolean | null
                    key: string
                    label: string
                    settings?: Json | null
                    updated_at?: string | null
                }
                Update: {
                    allowed_venue_types?: Database["public"]["Enums"]["venue_type"][]
                    created_at?: string | null
                    default_workflow_id?: string | null
                    description?: string | null
                    id?: string
                    is_active?: boolean | null
                    key?: string
                    label?: string
                    settings?: Json | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            submission_workflow_progress: {
                Row: {
                    assigned_to: string | null
                    completed_at: string | null
                    created_at: string | null
                    id: string
                    notes: string | null
                    started_at: string | null
                    status: Database["public"]["Enums"]["step_status"] | null
                    submission_id: string
                    workflow_step_id: string
                }
                Insert: {
                    assigned_to?: string | null
                    completed_at?: string | null
                    created_at?: string | null
                    id?: string
                    notes?: string | null
                    started_at?: string | null
                    status?: Database["public"]["Enums"]["step_status"] | null
                    submission_id: string
                    workflow_step_id: string
                }
                Update: {
                    assigned_to?: string | null
                    completed_at?: string | null
                    created_at?: string | null
                    id?: string
                    notes?: string | null
                    started_at?: string | null
                    status?: Database["public"]["Enums"]["step_status"] | null
                    submission_id?: string
                    workflow_step_id?: string
                }
                Relationships: []
            }
            submissions: {
                Row: {
                    abstract: string | null
                    accepted_at: string | null
                    created_at: string | null
                    current_workflow_step_id: string | null
                    decision_date: string | null
                    doi: string | null
                    id: string
                    issue: string | null
                    keywords: string[] | null
                    metadata: Json | null
                    pages: string | null
                    preview_content: string | null
                    price: number | null
                    publication_date: string | null
                    published_at: string | null
                    revision_number: number | null
                    status: Database["public"]["Enums"]["submission_status"] | null
                    submission_type_id: string
                    submitted_at: string | null
                    submitter_id: string
                    title: string
                    updated_at: string | null
                    venue_id: string
                    volume: string | null
                    currency: string
                }
                Insert: {
                    abstract?: string | null
                    accepted_at?: string | null
                    created_at?: string | null
                    current_workflow_step_id?: string | null
                    decision_date?: string | null
                    doi?: string | null
                    id?: string
                    issue?: string | null
                    keywords?: string[] | null
                    metadata?: Json | null
                    pages?: string | null
                    preview_content?: string | null
                    price?: number | null
                    publication_date?: string | null
                    published_at?: string | null
                    revision_number?: number | null
                    status?: Database["public"]["Enums"]["submission_status"] | null
                    submission_type_id: string
                    submitted_at?: string | null
                    submitter_id: string
                    title: string
                    updated_at?: string | null
                    venue_id: string
                    volume?: string | null
                    currency?: string
                }
                Update: {
                    abstract?: string | null
                    accepted_at?: string | null
                    created_at?: string | null
                    current_workflow_step_id?: string | null
                    decision_date?: string | null
                    doi?: string | null
                    id?: string
                    issue?: string | null
                    keywords?: string[] | null
                    metadata?: Json | null
                    pages?: string | null
                    preview_content?: string | null
                    price?: number | null
                    publication_date?: string | null
                    published_at?: string | null
                    revision_number?: number | null
                    status?: Database["public"]["Enums"]["submission_status"] | null
                    submission_type_id?: string
                    submitted_at?: string | null
                    submitter_id?: string
                    title?: string
                    updated_at?: string | null
                    venue_id?: string
                    volume?: string | null
                    currency?: string
                }
                Relationships: []
            }
            taxonomies: {
                Row: {
                    created_at: string | null
                    description: string | null
                    display_order: number | null
                    id: string
                    is_active: boolean | null
                    is_hierarchical: boolean | null
                    is_multiple: boolean | null
                    key: string
                    label: string
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    display_order?: number | null
                    id?: string
                    is_active?: boolean | null
                    is_hierarchical?: boolean | null
                    is_multiple?: boolean | null
                    key: string
                    label: string
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    display_order?: number | null
                    id?: string
                    is_active?: boolean | null
                    is_hierarchical?: boolean | null
                    is_multiple?: boolean | null
                    key?: string
                    label?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            terms: {
                Row: {
                    color: string | null
                    created_at: string | null
                    description: string | null
                    display_order: number | null
                    icon: string | null
                    id: string
                    is_active: boolean | null
                    metadata: Json | null
                    name: string
                    parent_id: string | null
                    slug: string
                    taxonomy_id: string
                    updated_at: string | null
                }
                Insert: {
                    color?: string | null
                    created_at?: string | null
                    description?: string | null
                    display_order?: number | null
                    icon?: string | null
                    id?: string
                    is_active?: boolean | null
                    metadata?: Json | null
                    name: string
                    parent_id?: string | null
                    slug: string
                    taxonomy_id: string
                    updated_at?: string | null
                }
                Update: {
                    color?: string | null
                    created_at?: string | null
                    description?: string | null
                    display_order?: number | null
                    icon?: string | null
                    id?: string
                    is_active?: boolean | null
                    metadata?: Json | null
                    name?: string
                    parent_id?: string | null
                    slug?: string
                    taxonomy_id?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            user_roles: {
                Row: {
                    assigned_at: string | null
                    assigned_by: string | null
                    id: string
                    is_active: boolean | null
                    role: Database["public"]["Enums"]["user_role"]
                    user_id: string
                    venue_id: string | null
                }
                Insert: {
                    assigned_at?: string | null
                    assigned_by?: string | null
                    id?: string
                    is_active?: boolean | null
                    role: Database["public"]["Enums"]["user_role"]
                    user_id: string
                    venue_id?: string | null
                }
                Update: {
                    assigned_at?: string | null
                    assigned_by?: string | null
                    id?: string
                    is_active?: boolean | null
                    role?: Database["public"]["Enums"]["user_role"]
                    user_id?: string
                    venue_id?: string | null
                }
                Relationships: []
            }
            venue_terms: {
                Row: {
                    created_at: string | null
                    id: string
                    is_primary: boolean | null
                    term_id: string
                    venue_id: string
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    is_primary?: boolean | null
                    term_id: string
                    venue_id: string
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    is_primary?: boolean | null
                    term_id?: string
                    venue_id?: string
                }
                Relationships: []
            }
            venues: {
                Row: {
                    abbreviation: string | null
                    contact_email: string | null
                    cover_image_url: string | null
                    created_at: string | null
                    description: string | null
                    id: string
                    is_active: boolean | null
                    location: string | null
                    logo_url: string | null
                    mission: string | null
                    name: string
                    scope: string | null
                    settings: Json | null
                    slug: string
                    type: Database["public"]["Enums"]["venue_type"]
                    updated_at: string | null
                    website_url: string | null
                }
                Insert: {
                    abbreviation?: string | null
                    contact_email?: string | null
                    cover_image_url?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    is_active?: boolean | null
                    location?: string | null
                    logo_url?: string | null
                    mission?: string | null
                    name: string
                    scope?: string | null
                    settings?: Json | null
                    slug: string
                    type: Database["public"]["Enums"]["venue_type"]
                    updated_at?: string | null
                    website_url?: string | null
                }
                Update: {
                    abbreviation?: string | null
                    contact_email?: string | null
                    cover_image_url?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    is_active?: boolean | null
                    location?: string | null
                    logo_url?: string | null
                    mission?: string | null
                    name?: string
                    scope?: string | null
                    settings?: Json | null
                    slug?: string
                    type?: Database["public"]["Enums"]["venue_type"]
                    updated_at?: string | null
                    website_url?: string | null
                }
                Relationships: []
            }
            workflow_steps: {
                Row: {
                    auto_advance: boolean | null
                    created_at: string | null
                    description: string | null
                    id: string
                    is_required: boolean | null
                    label: string
                    required_role: Database["public"]["Enums"]["user_role"] | null
                    settings: Json | null
                    step_order: number
                    step_type: Database["public"]["Enums"]["workflow_step_type"]
                    timeout_days: number | null
                    workflow_id: string
                }
                Insert: {
                    auto_advance?: boolean | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    is_required?: boolean | null
                    label: string
                    required_role?: Database["public"]["Enums"]["user_role"] | null
                    settings?: Json | null
                    step_order: number
                    step_type: Database["public"]["Enums"]["workflow_step_type"]
                    timeout_days?: number | null
                    workflow_id: string
                }
                Update: {
                    auto_advance?: boolean | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    is_required?: boolean | null
                    label?: string
                    required_role?: Database["public"]["Enums"]["user_role"] | null
                    settings?: Json | null
                    step_order?: number
                    step_type?: Database["public"]["Enums"]["workflow_step_type"]
                    timeout_days?: number | null
                    workflow_id?: string
                }
                Relationships: []
            }
            workflows: {
                Row: {
                    created_at: string | null
                    description: string | null
                    id: string
                    is_active: boolean | null
                    key: string
                    name: string
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    is_active?: boolean | null
                    key: string
                    name: string
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    is_active?: boolean | null
                    key?: string
                    name?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            get_fields_for_type: {
                Args: { type_id: string }
                Returns: {
                    field_id: string
                    key: string
                    label: string
                    description: string
                    field_type: Database["public"]["Enums"]["field_type"]
                    is_required: boolean
                    options: Json
                    section: string
                }[]
            }
            get_taxonomies_for_type: {
                Args: { type_id: string }
                Returns: {
                    taxonomy_id: string
                    taxonomy_key: string
                    taxonomy_label: string
                    is_required: boolean
                    min_terms: number
                    max_terms: number
                    terms: Json
                }[]
            }
        }
        Enums: {
            decision_type:
            | "DESK_REJECT"
            | "SEND_FOR_REVIEW"
            | "ACCEPT"
            | "MINOR_REVISION"
            | "MAJOR_REVISION"
            | "REJECT"
            | "WITHDRAW"
            field_type:
            | "TEXT"
            | "TEXTAREA"
            | "NUMBER"
            | "DATE"
            | "BOOLEAN"
            | "SELECT"
            | "MULTISELECT"
            | "FILE"
            | "URL"
            | "EMAIL"
            | "ORCID"
            file_type:
            | "MANUSCRIPT"
            | "SUPPLEMENTARY"
            | "COVER_LETTER"
            | "RESPONSE_TO_REVIEWERS"
            | "REVISED_MANUSCRIPT"
            | "FIGURE"
            | "TABLE"
            | "DATA"
            | "PROOF"
            | "FINAL_PDF"
            | "OTHER"
            review_recommendation:
            | "ACCEPT"
            | "MINOR_REVISION"
            | "MAJOR_REVISION"
            | "REJECT"
            | "REJECT_RESUBMIT"
            step_status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED" | "FAILED"
            submission_status:
            | "DRAFT"
            | "SUBMITTED"
            | "UNDER_REVIEW"
            | "REVISION_REQUESTED"
            | "REVISION_SUBMITTED"
            | "ACCEPTED"
            | "REJECTED"
            | "WITHDRAWN"
            | "IN_PRODUCTION"
            | "PUBLISHED"
            user_role:
            | "AUTHOR"
            | "REVIEWER"
            | "ASSOCIATE_EDITOR"
            | "EDITOR"
            | "MANAGING_EDITOR"
            | "EDITOR_IN_CHIEF"
            | "ADMIN"
            venue_type: "JOURNAL" | "BOOK_IMPRINT" | "CONFERENCE" | "SERIES"
            workflow_step_type:
            | "INITIAL_SCREENING"
            | "PLAGIARISM_CHECK"
            | "EDITOR_ASSIGNMENT"
            | "REVIEWER_ASSIGNMENT"
            | "PEER_REVIEW"
            | "EDITORIAL_REVIEW"
            | "REVISION"
            | "FINAL_DECISION"
            | "PRODUCTION"
            | "PUBLICATION"
        }
    }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience types
export type Profile = Tables<'profiles'>
export type Venue = Tables<'venues'>
export type Journal = Tables<'journals'>
export type Imprint = Tables<'imprints'>
export type Submission = Tables<'submissions'>
export type SubmissionType = Tables<'submission_types'>
export type Taxonomy = Tables<'taxonomies'>
export type Term = Tables<'terms'>
export type Review = Tables<'reviews'>
export type Workflow = Tables<'workflows'>
export type WorkflowStep = Tables<'workflow_steps'>
export type EditorDecision = Tables<'editor_decisions'>
export type UserRole = Tables<'user_roles'>

// Status types
export type SubmissionStatus = Enums<'submission_status'>
export type VenueType = Enums<'venue_type'>
export type UserRoleType = Enums<'user_role'>
export type DecisionType = Enums<'decision_type'>
export type ReviewRecommendation = Enums<'review_recommendation'>
