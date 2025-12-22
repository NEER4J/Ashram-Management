"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                <p className="text-slate-600 mt-1">
                    Welcome to Ashram Management CRM
                </p>
            </div>

            <Card style={{ borderColor: "#3c0212" }}>
                <CardHeader>
                    <CardTitle style={{ color: "#3c0212" }}>Welcome</CardTitle>
                    <CardDescription>
                        Your dashboard is ready. Start managing your Ashram operations.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-600">
                        This is your starting point for managing your Ashram. Features and modules will be available here soon.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
