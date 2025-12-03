import { createClient } from "@/lib/supabase/server";
import { transformSheetData, SheetDataStructure } from "@/lib/sheet-data-transformer";
import { NextRequest, NextResponse } from "next/server";
import { getGoogleTokens } from "@/lib/google-tokens";
import { google } from "googleapis";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { spreadsheetId, sheetName } = body;

        if (!spreadsheetId || !sheetName) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get tokens from database
        const tokens = await getGoogleTokens(user.id);

        if (!tokens || !tokens.provider_token) {
            return NextResponse.json({ error: "Google account not connected" }, { status: 401 });
        }

        const auth = new google.auth.OAuth2();
        auth.setCredentials({ access_token: tokens.provider_token });
        const sheets = google.sheets({ version: "v4", auth });

        // 1. Fetch all tabs metadata
        const metaResponse = await sheets.spreadsheets.get({
            spreadsheetId,
            fields: "sheets.properties",
        });

        const tabs = metaResponse.data.sheets || [];
        if (tabs.length === 0) {
            return NextResponse.json({ error: "No tabs found in spreadsheet" }, { status: 404 });
        }

        // 2. Fetch data for all tabs
        const combinedData: Record<string, SheetDataStructure> = {};
        const ranges = tabs.map(tab => tab.properties?.title).filter(Boolean) as string[];

        // We can use batchGet to fetch all ranges at once
        const dataResponse = await sheets.spreadsheets.values.batchGet({
            spreadsheetId,
            ranges,
        });

        const valueRanges = dataResponse.data.valueRanges || [];

        // 3. Transform data for each tab
        valueRanges.forEach((valueRange, index) => {
            const range = valueRange.range; // e.g., "Sheet1!A1:Z100"
            // Extract tab name from range or use the index from our request list
            // batchGet returns ranges in the same order as requested
            const tabName = ranges[index];
            const rawData = valueRange.values;

            if (rawData && rawData.length > 0) {
                try {
                    const structuredData = transformSheetData(rawData as string[][]);
                    combinedData[tabName] = structuredData;
                } catch (e) {
                    console.warn(`Failed to transform data for tab ${tabName}:`, e);
                    // We skip tabs that fail transformation (e.g. empty)
                }
            }
        });

        if (Object.keys(combinedData).length === 0) {
            return NextResponse.json(
                { error: "No valid data found in any tab" },
                { status: 400 }
            );
        }

        // 4. Save to database as a single entry
        const { data, error } = await supabase
            .from("saved_sheets")
            .insert({
                user_id: user.id,
                sheet_name: sheetName,
                spreadsheet_id: spreadsheetId,
                tab_name: "ALL_TABS", // Special marker
                data_json: combinedData, // This will be stored as JSONB
                metadata: {
                    tabCount: Object.keys(combinedData).length,
                    savedAt: new Date().toISOString(),
                    isBulkSave: true
                },
            })
            .select()
            .single();

        if (error) {
            console.error("Error saving bulk sheet data:", error);
            return NextResponse.json(
                { error: "Failed to save sheet data" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            savedSheet: data,
        });

    } catch (error) {
        console.error("Error in bulk save endpoint:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
