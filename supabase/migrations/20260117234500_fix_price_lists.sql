-- Create price_lists table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.price_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  template TEXT DEFAULT '1',
  slug TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  primary_color TEXT,
  accent_color TEXT,
  logo_url TEXT,
  email TEXT,
  whatsapp TEXT,
  show_phone BOOLEAN DEFAULT true,
  show_email BOOLEAN DEFAULT true,
  show_whatsapp BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(slug)
);

-- Create price_list_items table
CREATE TABLE IF NOT EXISTS public.price_list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  price_list_id UUID NOT NULL REFERENCES public.price_lists(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  note TEXT,
  category TEXT DEFAULT 'General',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.price_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_list_items ENABLE ROW LEVEL SECURITY;

-- Policies for price_lists
CREATE POLICY "Users can view their own price lists" ON public.price_lists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own price lists" ON public.price_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own price lists" ON public.price_lists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own price lists" ON public.price_lists
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Public can view active price lists" ON public.price_lists
  FOR SELECT USING (is_active = true);


-- Policies for price_list_items
CREATE POLICY "Users can view their own price list items" ON public.price_list_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.price_lists
      WHERE price_lists.id = price_list_items.price_list_id
      AND price_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own price list items" ON public.price_list_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.price_lists
      WHERE price_lists.id = price_list_items.price_list_id
      AND price_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own price list items" ON public.price_list_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.price_lists
      WHERE price_lists.id = price_list_items.price_list_id
      AND price_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own price list items" ON public.price_list_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.price_lists
      WHERE price_lists.id = price_list_items.price_list_id
      AND price_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view items of active price lists" ON public.price_list_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.price_lists
      WHERE price_lists.id = price_list_items.price_list_id
      AND price_lists.is_active = true
    )
  );
