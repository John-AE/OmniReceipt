-- Create price_lists table
CREATE TABLE public.price_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  template TEXT DEFAULT '1',
  slug TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  primary_color TEXT,
  accent_color TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create price_list_items table
CREATE TABLE public.price_list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  price_list_id UUID NOT NULL REFERENCES public.price_lists(id) ON DELETE CASCADE,
  category TEXT,
  item_name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0.00,
  note TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.price_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_list_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for price_lists
CREATE POLICY "Users can view their own price lists" 
ON public.price_lists 
FOR SELECT 
USING (auth.uid() = user_id);

-- Public Policy for sharing
CREATE POLICY "Anyone can view active price lists by slug" 
ON public.price_lists 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can create their own price list" 
ON public.price_lists 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own price list" 
ON public.price_lists 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own price list" 
ON public.price_lists 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for price_list_items
CREATE POLICY "Users can view their own price list items" 
ON public.price_list_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.price_lists 
  WHERE public.price_lists.id = public.price_list_items.price_list_id 
  AND public.price_lists.user_id = auth.uid()
));

CREATE POLICY "Anyone can view items of active price lists" 
ON public.price_list_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.price_lists 
  WHERE public.price_lists.id = public.price_list_items.price_list_id 
  AND public.price_lists.is_active = true
));

CREATE POLICY "Users can manage items of their own price list" 
ON public.price_list_items 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.price_lists 
  WHERE public.price_lists.id = public.price_list_items.price_list_id 
  AND public.price_lists.user_id = auth.uid()
));

-- Trigger for updated_at
CREATE TRIGGER update_price_lists_updated_at
BEFORE UPDATE ON public.price_lists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_price_list_items_updated_at
BEFORE UPDATE ON public.price_list_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
