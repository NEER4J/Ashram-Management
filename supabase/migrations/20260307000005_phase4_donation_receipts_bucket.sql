-- Phase 4: Storage bucket for donation receipts (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('donation-receipts', 'donation-receipts', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated read donation-receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated insert donation-receipts" ON storage.objects;
CREATE POLICY "Authenticated read donation-receipts" ON storage.objects FOR SELECT
USING (bucket_id = 'donation-receipts' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated insert donation-receipts" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'donation-receipts' AND auth.role() = 'authenticated');
