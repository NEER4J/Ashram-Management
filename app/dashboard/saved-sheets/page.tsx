"use client";

import { SavedSheetsList } from "@/components/saved-sheets-list";

export default function SavedSheetsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Saved Sheets</h1>
                <p className="text-slate-600 mt-1">
                    View and manage your saved Google Sheets data.
                </p>
            </div>
            <SavedSheetsList />
        </div>
    );
}
