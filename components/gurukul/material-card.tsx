"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, FileText, Video, Music, GraduationCap } from "lucide-react"

interface MaterialCardProps {
    id: string
    title: string
    description: string | null
    type: string
    price: number
    is_free: boolean
    cover_image_url: string | null
    author: string | null
    category?: string | null
}

const typeIcons = {
    Book: BookOpen,
    PDF: FileText,
    Video: Video,
    Audio: Music,
    Course: GraduationCap,
}

export function MaterialCard({
    id,
    title,
    description,
    type,
    price,
    is_free,
    cover_image_url,
    author,
    category,
}: MaterialCardProps) {
    const Icon = typeIcons[type as keyof typeof typeIcons] || BookOpen
    const href = type === "Course" ? `/gurukul/courses/${id}` : `/gurukul/materials/${id}`

    return (
        <Link href={href}>
            <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-slate-200 group overflow-hidden transform hover:-translate-y-1">
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                    {cover_image_url ? (
                        <img
                            src={cover_image_url}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                            <Icon className="h-16 w-16 text-slate-300 group-hover:text-[#3c0212] transition-colors" />
                        </div>
                    )}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge
                            variant="secondary"
                            className="bg-white/95 backdrop-blur-sm text-slate-900 shadow-md"
                        >
                            {type}
                        </Badge>
                    </div>
                    {is_free && (
                        <div className="absolute top-2 left-2">
                            <Badge className="bg-green-600 text-white shadow-md">Free</Badge>
                        </div>
                    )}
                </div>
                <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-slate-900 group-hover:text-[#3c0212] transition-colors">
                        {title}
                    </h3>
                    {author && (
                        <p className="text-sm text-slate-600 mb-2">by {author}</p>
                    )}
                    {description && (
                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                            {description}
                        </p>
                    )}
                    <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-slate-900">
                            {is_free ? (
                                <span className="text-green-600">Free</span>
                            ) : (
                                <>₹{new Intl.NumberFormat("en-IN").format(price)}</>
                            )}
                        </div>
                        {category && (
                            <Badge variant="outline" className="text-xs">
                                {category}
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

