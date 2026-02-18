-- Function to safely delete a book by unlinking transactions first
CREATE OR REPLACE FUNCTION delete_book_safely(p_book_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check permissions: User must be owner of the book OR an admin/editor
  -- Note: We check 'books' table for owner. 
  -- We also check for 'super_admin' or 'editor' role.
  IF NOT EXISTS (
    SELECT 1 FROM public.books 
    WHERE id = p_book_id 
    AND (
      -- Check if user is the seller/owner
      seller_id = auth.uid() 
      OR 
      -- Check if user is an admin/editor via profiles->roles
      EXISTS (
        SELECT 1 FROM public.profiles p 
        JOIN public.roles r ON p.role_id = r.id 
        WHERE p.id = auth.uid() AND r.slug IN ('super_admin', 'editor')
      )
    )
  ) THEN
    RAISE EXCEPTION 'Not authorized to delete this book';
  END IF;

  -- Unlink transactions (assuming book_id represents the book in transactions)
  -- We set book_id to NULL to preserve transaction history but remove the constraint
  UPDATE public.transactions 
  SET book_id = NULL 
  WHERE book_id = p_book_id;

  -- Delete the book
  DELETE FROM public.books WHERE id = p_book_id;
END;
$$;
