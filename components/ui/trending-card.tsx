'use client'

import { useState } from 'react'
import { HeartIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardDescription, CardTitle, CardFooter, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface TrendingCardProps {
    title: string;
    description: string;
    badges: string[];
    price: string;
    imageUrl: string;
    author?: string;
    date?: string;
    className?: string; // Add className prop
}

const TrendingCard = ({ title, description, badges, price, imageUrl, author, date, className }: TrendingCardProps) => {
    const [liked, setLiked] = useState<boolean>(false)

    return (
        <div className={cn('relative w-full max-w-sm rounded-xl overflow-hidden bg-white dark:bg-zinc-900 shadow-md transition-all hover:shadow-xl dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] group', className)}>
            {/* Image Container */}
            <div className='flex h-48 w-full items-center justify-center overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative'>
                {/* Image Background */}
                <div
                    className='absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105'
                    style={{ backgroundImage: `url('${imageUrl}')` }}
                />
                {/* Overlay Gradient (Optional for readability if needed, but styling prefers clean) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Like Button */}
            <Button
                size='icon'
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }}
                className='absolute top-3 right-3 rounded-full bg-background/80 hover:bg-background backdrop-blur-sm shadow-sm z-10 h-8 w-8'
            >
                <HeartIcon className={cn('size-4 transition-colors', liked ? 'fill-red-500 stroke-red-500' : 'stroke-zinc-700 dark:stroke-zinc-300')} />
                <span className='sr-only'>Like</span>
            </Button>

            <Card className='border-none shadow-none bg-transparent rounded-none pt-2'>
                <CardHeader className="px-5 pb-2 pt-2">
                    <CardTitle className="line-clamp-2 text-lg leading-tight mb-1">{title}</CardTitle>
                    <div className='flex flex-wrap items-center gap-2 mt-1'>
                        {badges.map((badge, idx) => (
                            <Badge key={idx} variant='secondary' className="text-[10px] px-1.5 py-0 h-5 font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                {badge}
                            </Badge>
                        ))}
                    </div>
                </CardHeader>
                <CardContent className="px-5 py-2">
                    <p className='text-sm text-muted-foreground line-clamp-3 leading-relaxed'>
                        {description}
                    </p>
                    {/* Author/Date Info (Optional add-on to match original style) */}
                    {(author || date) && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-3">
                            {author && <span className="font-medium text-foreground">{author}</span>}
                            {author && date && <span>•</span>}
                            {date && <span>{date}</span>}
                        </div>
                    )}
                </CardContent>
                <CardFooter className='px-5 pb-5 pt-2 flex items-center justify-between gap-3'>
                    {/* Price Section */}
                    <div className='flex flex-col'>
                        <span className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>Access Fee</span>
                        <span className='text-lg font-bold text-primary'>{price}</span>
                    </div>
                    <Button size='sm' className="font-semibold shadow-sm">
                        Get Access
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

export default TrendingCard
