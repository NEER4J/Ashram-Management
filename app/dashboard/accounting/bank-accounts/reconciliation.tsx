"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"

export default function BankReconciliationPage() {
    const searchParams = useSearchParams()
    const accountId = searchParams.get("account")
    const supabase = createClient()
    
    const [bankAccount, setBankAccount] = useState<any>(null)
    const [bankTransactions, setBankTransactions] = useState<any[]>([])
    const [ledgerEntries, setLedgerEntries] = useState<any[]>([])
    const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set())
    const [selectedLedgerEntries, setSelectedLedgerEntries] = useState<Set<string>>(new Set())

    useEffect(() => {
        if (accountId) {
            fetchBankAccount()
            fetchBankTransactions()
            fetchLedgerEntries()
        }
    }, [accountId])

    const fetchBankAccount = async () => {
        if (!accountId) return
        const { data } = await supabase
            .from("bank_accounts")
            .select("*")
            .eq("id", accountId)
            .single()
        
        if (data) setBankAccount(data)
    }

    const fetchBankTransactions = async () => {
        if (!accountId) return
        const { data } = await supabase
            .from("bank_transactions")
            .select("*")
            .eq("bank_account_id", accountId)
            .eq("is_reconciled", false)
            .order("transaction_date", { ascending: false })
        
        if (data) setBankTransactions(data)
    }

    const fetchLedgerEntries = async () => {
        if (!accountId) return
        // Find the chart of accounts entry for this bank account
        const { data: account } = await supabase
            .from("chart_of_accounts")
            .select("id")
            .ilike("account_name", `%${bankAccount?.account_name || ""}%`)
            .eq("account_type", "Asset")
            .maybeSingle()

        if (account) {
            const { data: entries } = await supabase
                .from("general_ledger")
                .select("*")
                .eq("account_id", account.id)
                .order("transaction_date", { ascending: false })
            
            if (entries) setLedgerEntries(entries)
        }
    }

    const handleReconcile = async () => {
        if (!accountId) return

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            toast.error("User not authenticated")
            return
        }

        try {
            // Mark bank transactions as reconciled
            for (const transId of selectedTransactions) {
                await supabase
                    .from("bank_transactions")
                    .update({
                        is_reconciled: true,
                        reconciled_at: new Date().toISOString(),
                        reconciled_by: user.id,
                    })
                    .eq("id", transId)
            }

            toast.success("Reconciliation completed successfully")
            fetchBankTransactions()
            setSelectedTransactions(new Set())
            setSelectedLedgerEntries(new Set())
        } catch (error) {
            toast.error("Failed to reconcile transactions")
        }
    }

    if (!accountId) {
        return (
            <div className="p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Bank Reconciliation</CardTitle>
                        <CardDescription>Please select a bank account to reconcile</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div>
                <h2 className="text-3xl font-medium tracking-tight">Bank Reconciliation</h2>
                <p className="text-muted-foreground">
                    Reconcile bank statement transactions with ledger entries.
                </p>
            </div>

            {bankAccount && (
                <Card>
                    <CardHeader>
                        <CardTitle>{bankAccount.account_name}</CardTitle>
                        <CardDescription>
                            {bankAccount.bank_name} - {bankAccount.account_number || "N/A"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-muted-foreground">Current Balance</div>
                                <div className="text-2xl font-bold">
                                    {new Intl.NumberFormat("en-IN", {
                                        style: "currency",
                                        currency: "INR",
                                    }).format(bankAccount.current_balance || 0)}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Bank Statement Transactions</CardTitle>
                        <CardDescription>Unreconciled transactions from bank statement</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Select</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bankTransactions.map((trans) => (
                                    <TableRow key={trans.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedTransactions.has(trans.id)}
                                                onCheckedChange={(checked) => {
                                                    const newSet = new Set(selectedTransactions)
                                                    if (checked) {
                                                        newSet.add(trans.id)
                                                    } else {
                                                        newSet.delete(trans.id)
                                                    }
                                                    setSelectedTransactions(newSet)
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>{new Date(trans.transaction_date).toLocaleDateString()}</TableCell>
                                        <TableCell>{trans.transaction_type}</TableCell>
                                        <TableCell className="text-right">
                                            {new Intl.NumberFormat("en-IN", {
                                                style: "currency",
                                                currency: "INR",
                                            }).format(trans.amount)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Ledger Entries</CardTitle>
                        <CardDescription>Matching ledger entries</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Debit</TableHead>
                                    <TableHead className="text-right">Credit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ledgerEntries.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell>{new Date(entry.transaction_date).toLocaleDateString()}</TableCell>
                                        <TableCell>{entry.description}</TableCell>
                                        <TableCell className="text-right text-green-700">
                                            {entry.debit_amount > 0 ? new Intl.NumberFormat("en-IN", {
                                                style: "currency",
                                                currency: "INR",
                                            }).format(entry.debit_amount) : "-"}
                                        </TableCell>
                                        <TableCell className="text-right text-red-700">
                                            {entry.credit_amount > 0 ? new Intl.NumberFormat("en-IN", {
                                                style: "currency",
                                                currency: "INR",
                                            }).format(entry.credit_amount) : "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <Button
                        onClick={handleReconcile}
                        disabled={selectedTransactions.size === 0}
                        style={{ backgroundColor: "#3c0212", color: "#fef9fb" }}
                    >
                        Reconcile Selected Transactions
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

