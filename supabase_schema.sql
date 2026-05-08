CREATE TABLE IF NOT EXISTS public.Users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.Papers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.Users(id) ON DELETE CASCADE NOT NULL,
    pdf_url TEXT NOT NULL,
    analysis_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.Users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.Papers ENABLE ROW LEVEL SECURITY;

-- Policies for Users
CREATE POLICY "Users can view their own profile." ON public.Users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.Users FOR UPDATE USING (auth.uid() = id);

-- Policies for Papers
CREATE POLICY "Users can insert their own papers." ON public.Papers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own papers." ON public.Papers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own papers." ON public.Papers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own papers." ON public.Papers FOR DELETE USING (auth.uid() = user_id);

-- Create Storage bucket for papers
INSERT INTO storage.buckets (id, name, public) 
VALUES ('papers', 'papers', true) 
ON CONFLICT (id) DO NOTHING;

-- Policies for Storage (papers bucket)
CREATE POLICY "Users can upload their own papers" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'papers' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their own papers" ON storage.objects FOR SELECT USING (bucket_id = 'papers');

-- Auth trigger to insert into public.Users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.Users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
