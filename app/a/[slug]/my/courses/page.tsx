import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { BookOpen, VideoCamera, File, Headphones, GraduationCap, ArrowRight } from "@phosphor-icons/react/dist/ssr"

interface Props { params: Promise<{ slug: string }> }

const TYPE_CONFIG: Record<string, { Icon: typeof BookOpen; color: string }> = {
  Course:  { Icon: GraduationCap, color: "bg-violet-50 text-violet-600" },
  Video:   { Icon: VideoCamera,   color: "bg-blue-50 text-blue-600" },
  PDF:     { Icon: File,          color: "bg-orange-50 text-orange-600" },
  Book:    { Icon: BookOpen,      color: "bg-emerald-50 text-emerald-600" },
  Audio:   { Icon: Headphones,    color: "bg-pink-50 text-pink-600" },
}

export default async function MyCoursesPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: enrollments } = await supabase
    .from("course_enrollments")
    .select("id, progress_percent, payment_status, created_at, study_materials(id, title, type, cover_image_url, author)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-zinc-950">My Courses</h2>
          <p className="text-sm text-zinc-400 mt-0.5">Your enrolled materials</p>
        </div>
        <Link
          href={`/a/${slug}/courses`}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#DC2626] hover:underline"
        >
          Browse More
          <ArrowRight size={14} />
        </Link>
      </div>

      {!enrollments || enrollments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-100 p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
            <BookOpen size={26} weight="fill" className="text-violet-500" />
          </div>
          <p className="text-zinc-500 font-medium mb-1">No enrollments yet</p>
          <p className="text-sm text-zinc-400 mb-6">Explore our courses and study materials</p>
          <Link
            href={`/a/${slug}/courses`}
            className="inline-flex items-center gap-2 bg-[#DC2626] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#B91C1C] transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {enrollments.map(e => {
            const material = Array.isArray(e.study_materials) ? e.study_materials[0] : e.study_materials
            if (!material) return null
            const config = TYPE_CONFIG[material.type] || { Icon: File, color: "bg-zinc-50 text-zinc-500" }
            const { Icon, color } = config
            return (
              <Link
                key={e.id}
                href={`/a/${slug}/courses/${material.id}`}
                className="group bg-white rounded-2xl border border-zinc-100 p-5 hover:shadow-md hover:border-zinc-200 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={20} weight="fill" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">{material.type}</p>
                    <p className="font-semibold text-zinc-950 leading-snug text-sm line-clamp-2">{material.title}</p>
                    {material.author && <p className="text-xs text-zinc-400 mt-1">by {material.author}</p>}
                    {typeof e.progress_percent === "number" && (
                      <div className="mt-3">
                        <div className="flex justify-between text-[10px] font-semibold text-zinc-400 mb-1.5">
                          <span>Progress</span>
                          <span>{e.progress_percent}%</span>
                        </div>
                        <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#DC2626] rounded-full transition-all"
                            style={{ width: `${e.progress_percent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {e.payment_status === "pending" && (
                  <div className="mt-3 pt-3 border-t border-zinc-50">
                    <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                      Payment Pending
                    </span>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
