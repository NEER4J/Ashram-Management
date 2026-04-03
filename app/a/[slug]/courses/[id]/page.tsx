import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"
import { CourseEnrollForm } from "@/components/public/course-enroll-form"
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr"

interface Props { params: Promise<{ slug: string; id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("study_materials").select("title").eq("id", id).single()
  return { title: data?.title || "Course" }
}


export default async function CourseDetailPage({ params }: Props) {
  const { slug, id } = await params
  const supabase = await createClient()

  const [{ data: material }, { data: { user } }] = await Promise.all([
    supabase
      .from("study_materials")
      .select("id, title, description, type, price, is_free, cover_image_url, author, language, created_at")
      .eq("id", id)
      .eq("is_published", true)
      .single(),
    supabase.auth.getUser(),
  ])

  if (!material) notFound()

  // Fetch modules if it's a course
  let modules: { id: string; title: string; order_index: number; content_type: string }[] = []
  if (material.type === "Course") {
    const { data } = await supabase
      .from("course_modules")
      .select("id, title, order_index, content_type")
      .eq("course_id", id)
      .order("order_index")
    modules = data || []
  }

  // Check enrollment
  let enrolled = false
  if (user) {
    const { data: enr } = await supabase
      .from("course_enrollments")
      .select("id")
      .eq("course_id", id)
      .eq("user_id", user.id)
      .maybeSingle()
    enrolled = !!enr
  }

  const isFree = material.is_free || Number(material.price) === 0
  const coverImage = material.cover_image_url || null

  return (
    <>
      {/* Header */}
      <section className="bg-[#3C0212] py-14 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <Link href={`/a/${slug}/courses`} className="inline-flex items-center gap-1.5 text-white/50 text-xs font-medium mb-6 hover:text-white transition-colors">
            <ArrowLeft size={13} />
            All Materials
          </Link>
          <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold tracking-wider uppercase text-white/50 bg-white/10 px-2 py-1 rounded-full">{material.type}</span>
                {material.language && material.language !== "English" && (
                  <span className="text-[10px] font-bold tracking-wider uppercase text-white/50 bg-white/10 px-2 py-1 rounded-full">
                    {material.language}
                  </span>
                )}
              </div>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-white leading-tight mb-3">{material.title}</h1>
              {material.author && <p className="text-white/50 text-sm">by {material.author}</p>}
            </div>
            {coverImage && (
              <div className="relative w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 hidden md:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverImage} alt={material.title} className="w-full h-full object-cover aspect-square" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="py-12 px-4 sm:px-6 bg-gray-100 min-h-[calc(100vh-300px)]">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr_340px] gap-10">

          {/* Left */}
          <div>
            {material.description && (
              <div className="mb-8">
                <h2 className="font-serif text-2xl font-bold text-zinc-950 mb-4">About</h2>
                <p className="text-zinc-600 leading-relaxed whitespace-pre-line">{material.description}</p>
              </div>
            )}

            {modules.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl font-bold text-zinc-950 mb-4">
                  Course Modules <span className="text-zinc-400 text-lg font-normal">({modules.length})</span>
                </h2>
                <div className="space-y-2">
                  {modules.map((m, i) => (
                    <div key={m.id} className="flex items-center gap-4 py-3.5 px-4 bg-white rounded-xl">
                      <span className="text-[11px] font-bold text-zinc-400 w-6 flex-shrink-0">{i + 1}</span>
                      <span className="text-sm font-medium text-zinc-700 flex-1">{m.title}</span>
                      <span className="text-[10px] uppercase text-zinc-400 font-semibold">{m.content_type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: enrollment card */}
          <div>
            <div className="bg-white rounded-3xl p-6 sticky top-[80px] shadow-sm">
              
              <div className="mb-4">
                {isFree ? (
                  <span className="text-3xl font-bold text-emerald-600">Free</span>
                ) : (
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-xl font-bold text-zinc-950">₹</span>
                    <span className="text-4xl font-bold text-zinc-950">
                      {Number(material.price).toLocaleString("en-IN")}
                    </span>
                    <span className="text-zinc-400 text-sm ml-1">one-time</span>
                  </div>
                )}
              </div>
              {enrolled ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="24" height="24" fill="currentColor" className="text-emerald-500">
                      <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/>
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-zinc-950 mb-1">You&apos;re enrolled</p>
                  <Link href={`/a/${slug}/my/courses`} className="inline-flex items-center gap-1.5 text-sm text-[#DC2626] font-semibold hover:underline">
                    View in My Portal <ArrowRight size={13} />
                  </Link>
                </div>
              ) : (
                <CourseEnrollForm
                  courseId={id}
                  slug={slug}
                  price={isFree ? 0 : Number(material.price)}
                  title={material.title}
                  isLoggedIn={!!user}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
