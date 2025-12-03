import { createClient } from "@/lib/supabase/server";
import { transformSheetData, SheetDataStructure } from "@/lib/sheet-data-transformer";
import { NextRequest, NextResponse } from "next/server";
import { getGoogleTokens } from "@/lib/google-tokens";
import { google } from "googleapis";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const spreadsheetId = searchParams.get("spreadsheetId");

    if (!spreadsheetId) {
        return NextResponse.json(
            { error: "Spreadsheet ID is required" },
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

    try {
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
            const tabName = ranges[index];
            const rawData = valueRange.values;

            if (rawData && rawData.length > 0) {
                try {
                    const structuredData = transformSheetData(rawData as string[][]);
                    combinedData[tabName] = structuredData;
                } catch (e) {
                    console.warn(`Failed to transform data for tab ${tabName}:`, e);
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: combinedData,
        });

    } catch (error) {
        console.error("Error in bulk data endpoint:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
