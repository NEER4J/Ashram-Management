-- Phase 1: Storage buckets for devotee KYC and photos
-- devotee-documents: private (KYC)
-- devotee-photos: public (profile photos)

INSERT INTO storage.buckets (id, name, public)
VALUES ('devotee-documents', 'devotee-documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('devotee-photos', 'devotee-photos', true)
ON CONFLICT (id) DO NOTHING;

-- devotee-documents: authenticated read/write only
DROP POLICY IF EXISTS "Authenticated read devotee-documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated insert devotee-documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update devotee-documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete devotee-documents" ON storage.objects;

CREATE POLICY "Authenticated read devotee-documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'devotee-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated insert devotee-documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'devotee-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated update devotee-documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'devotee-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete devotee-documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'devotee-documents' AND auth.role() = 'authenticated');

-- devotee-photos: public read, authenticated write
DROP POLICY IF EXISTS "Public read devotee-photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload devotee-photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update devotee-photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete devotee-photos" ON storage.objects;

CREATE POLICY "Public read devotee-photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'devotee-photos');

CREATE POLICY "Authenticated upload devotee-photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'devotee-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated update devotee-photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'devotee-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete devotee-photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'devotee-photos' AND auth.role() = 'authenticated');
