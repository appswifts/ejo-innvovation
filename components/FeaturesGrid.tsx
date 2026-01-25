"use client";

import React from "react";
import { Microscope, LineChart, School, ArrowRight } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export function FeaturesGrid() {
    return (
        <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
            <GridItem
                area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
                icon={<Microscope className="h-6 w-6 text-foreground" />}
                title="For Researchers"
                description="Submit your work and get peer-reviewed faster with our modern tools. Track citations and impact in real-time."
                href="/submit"
            />

            <GridItem
                area="md:[grid-area:1/7/2/13] xl:[grid-area:1/5/3/9]"
                icon={<LineChart className="h-6 w-6 text-foreground" />}
                title="For Librarians"
                description="Manage institutional access, subscriptions, and view detailed analytics on usage and cost-per-download."
                href="/analytics"
            />

            <GridItem
                area="md:[grid-area:2/1/3/13] xl:[grid-area:1/9/2/13]"
                icon={<School className="h-6 w-6 text-foreground" />}
                title="For Institutions"
                description="Showcase your university's research output to the world. Build custom repositories and attract top talent."
                href="/search"
            />

            {/* Extra grid item to fill layout nicely if needed or we can stretch the last one */}
            <GridItem
                area="md:[grid-area:3/1/4/13] xl:[grid-area:2/1/3/13]" // Spans full width at bottom
                icon={<ArrowRight className="h-6 w-6 text-foreground" />}
                title="Join the Network"
                description="Connect with over 2.5 million researchers and 5,000 institutions globally. Access the future of scientific discovery today."
                href="/signup"
            />
        </ul>
    );
}

interface GridItemProps {
    area: string;
    icon: React.ReactNode;
    title: string;
    description: React.ReactNode;
    href?: string;
}

const GridItem = ({ area, icon, title, description, href }: GridItemProps) => {
    return (
        <li className={cn("min-h-[14rem] list-none", area)}>
            <Link to={href || "#"} className="block h-full cursor-pointer group">
                <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
                    <GlowingEffect
                        spread={40}
                        glow={true}
                        disabled={false}
                        proximity={64}
                        inactiveZone={0.01}
                        borderWidth={3}
                    />
                    <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] bg-background p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-6 transition-colors group-hover:bg-accent/5">
                        <div className="relative flex flex-1 flex-col justify-between gap-3">
                            <div className="w-fit rounded-lg border-[0.75px] border-border bg-muted p-2">
                                {icon}
                            </div>
                            <div className="space-y-3">
                                <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-serif tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-foreground group-hover:text-primary transition-colors">
                                    {title}
                                </h3>
                                <h2 className="[&_b]:md:font-semibold [&_strong]:md:font-semibold font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-muted-foreground">
                                    {description}
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </li>
    );
};
