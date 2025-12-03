"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SheetChart } from "@/components/sheet-chart";
import { DataTable } from "@/components/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Table, RefreshCw } from "lucide-react";
import { SheetDataStructure } from "@/lib/sheet-data-transformer";
import Link from "next/link";

interface SavedSheet {
    id: string;
    sheet_name: string;
    tab_name: string;
    spreadsheet_id: string;
    data_json: SheetDataStructure | Record<string, SheetDataStructure>;
    created_at: string;
}

export default function VisualizationPage() {
    const params = useParams();
    const router = useRouter();
    const [sheet, setSheet] = useState<SavedSheet | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showTable, setShowTable] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchSheet(params.id as string);
        }
    }, [params.id]);

    const fetchSheet = async (id: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/sheets/saved/${id}?_t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                setSheet(data.savedSheet);
            } else {
                console.error("Failed to fetch sheet");
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("Error fetching sheet:", error);
            router.push("/dashboard");
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        if (!sheet) return;

        setRefreshing(true);
        try {
            // Check if it's a bulk sheet
            const isBulk = sheet.tab_name === "ALL_TABS";

            if (isBulk) {
                // For bulk refresh, we need to call the bulk save endpoint again?
                // Or we need a specific bulk refresh logic.
                // Since we don't have a bulk refresh endpoint yet that updates an existing ID,
                // and the user didn't explicitly ask for refresh logic update in the plan,
                // I will defer this complex logic or just re-fetch all tabs.

                // For now, let's just alert that refresh is not fully supported for bulk sheets yet
                // or try to implement a basic version.

                // Let's re-use the save-bulk logic but we need to update the existing record.
                // This is getting complicated for a simple "refresh".
                // I'll skip deep implementation of refresh for bulk for now to focus on visualization.
                alert("Refresh is not yet supported for bulk saved sheets.");
                setRefreshing(false);
                return;
            }

            // 1. Fetch fresh data from Google Sheets
            const dataRes = await fetch(
                `/api/sheets/data?spreadsheetId=${sheet.spreadsheet_id}&range=${sheet.tab_name}&_t=${Date.now()}`
            );

            if (!dataRes.ok) {
                throw new Error("Failed to fetch fresh data from Google Sheets");
            }

            const freshData = await dataRes.json();
            const sheetData = freshData.values || [];

            if (sheetData.length === 0) {
                throw new Error("No data found in the sheet");
            }

            const updateRes = await fetch(`/api/sheets/saved/${sheet.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sheetData,
                    spreadsheetId: sheet.spreadsheet_id,
                    tabName: sheet.tab_name,
                    sheetName: sheet.sheet_name,
                }),
            });

            if (updateRes.ok) {
                const updatedData = await updateRes.json();
                setSheet(updatedData.savedSheet);
                alert("Data refreshed successfully!");
            } else {
                throw new Error("Failed to update saved sheet");
            }

        } catch (error) {
            console.error("Error refreshing data:", error);
            alert("Failed to refresh data. Please check your connection and try again.");
        } finally {
            setRefreshing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
            </div>
        );
    }

    if (!sheet) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Sheet Not Found</CardTitle>
                    <CardDescription>The requested sheet could not be found.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Determine if we have multiple sheets
    const isBulk = sheet.tab_name === "ALL_TABS";
    const sheetsToRender: { name: string; data: SheetDataStructure }[] = [];

    if (isBulk) {
        const dataMap = sheet.data_json as Record<string, SheetDataStructure>;
        Object.entries(dataMap).forEach(([name, data]) => {
            sheetsToRender.push({ name, data });
        });
    } else {
        sheetsToRender.push({
            name: sheet.tab_name,
            data: sheet.data_json as SheetDataStructure
        });
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                        {sheet.sheet_name}
                    </h1>
                    <p className="text-slate-600 mt-1">
                        {isBulk ? "Visualizing all tabs" : `Visualizing ${sheet.tab_name}`}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        {refreshing ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Refresh Data
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/dashboard">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-8">
                {sheetsToRender.map((item, index) => (
                    <div key={index} className="space-y-4">
                        <SheetChart
                            sheetData={item.data}
                            sheetName={sheet.sheet_name}
                            tabName={item.name}
                        />

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Table className="h-4 w-4" />
                                            Data Table - {item.name}
                                        </CardTitle>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowTable(!showTable)}
                                    >
                                        {showTable ? "Hide" : "Show"} Table
                                    </Button>
                                </div>
                            </CardHeader>
                            {showTable && (
                                <CardContent>
                                    <DataTable data={transformToTableData(item.data)} />
                                </CardContent>
                            )}
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
}

function transformToTableData(data: SheetDataStructure): string[][] {
    const rawTableData: string[][] = [];
    if (data.type === "financial") {
        // Reconstruct table from structured data
        rawTableData.push(data.headers);
        data.data.forEach((row) => {
            const tableRow = [row.category];
            data.timePoints?.forEach((timePoint) => {
                tableRow.push(row[timePoint]?.toString() || "");
            });
            if (row.total !== undefined) {
                tableRow.push(row.total.toString());
            }
            rawTableData.push(tableRow);
        });
    } else {
        // Handle tabular data
        rawTableData.push(data.headers);
        data.data.forEach(row => {
            const tableRow = data.headers.map(header => row[header]?.toString() || "");
            rawTableData.push(tableRow);
        });
    }
    return rawTableData;
}

