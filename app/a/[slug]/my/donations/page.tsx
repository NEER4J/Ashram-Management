import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { HandHeart, ArrowRight, Receipt } from "@phosphor-icons/react/dist/ssr"

interface Props { params: Promise<{ slug: string }> }

export default async function MyDonationsPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: donations } = await supabase
    .from("donations")
    .select("id, donation_code, amount, payment_mode, donation_date, purpose, receipt_generated, master_donation_categories(name)")
    .eq("user_id", user.id)
    .order("donation_date", { ascending: false })

  const totalDonated = (donations || []).reduce((sum, d) => sum + Number(d.amount), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-zinc-950">My Donations</h2>
          <p className="text-sm text-zinc-400 mt-0.5">Your contribution history</p>
        </div>
        <Link
          href={`/a/${slug}/donate`}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#DC2626] hover:underline"
        >
          Donate Again
          <ArrowRight size={14} />
        </Link>
      </div>

      {totalDonated > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-2">Total Contributed</p>
          <p className="font-serif text-4xl font-bold text-zinc-950">
            ₹{totalDonated.toLocaleString("en-IN")}
          </p>
          <p className="text-sm text-amber-700 mt-2 font-medium">Thank you for your generous support</p>
        </div>
      )}

      {!donations || donations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <HandHeart size={26} weight="fill" className="text-amber-500" />
          </div>
          <p className="text-zinc-500 font-medium mb-1">No donations recorded yet</p>
          <p className="text-sm text-zinc-400 mb-6">Support the ashram and its sacred activities</p>
          <Link
            href={`/a/${slug}/donate`}
            className="inline-flex items-center gap-2 bg-[#DC2626] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#B91C1C] transition-colors"
          >
            Make a Donation
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {donations.map(d => {
            const category = Array.isArray(d.master_donation_categories) ? d.master_donation_categories[0] : d.master_donation_categories
            return (
              <div key={d.id} className="bg-white rounded-2xl border border-zinc-100 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <HandHeart size={18} weight="fill" className="text-amber-500" />
                    </div>
                    <div>
                      {d.donation_code && (
                        <p className="text-[10px] font-mono text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-100 inline-block mb-1">
                          {d.donation_code}
                        </p>
                      )}
                      <p className="font-semibold text-zinc-950">{category?.name || "General Donation"}</p>
                      {d.purpose && <p className="text-sm text-zinc-500 mt-0.5">{d.purpose}</p>}
                      <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                        <span>{new Date(d.donation_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        <span className="capitalize">{d.payment_mode}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-zinc-950 text-lg">₹{Number(d.amount).toLocaleString("en-IN")}</p>
                    {d.receipt_generated && (
                      <div className="flex items-center gap-1 justify-end mt-1">
                        <Receipt size={11} className="text-emerald-600" />
                        <span className="text-[10px] font-semibold text-emerald-600">Receipt</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
