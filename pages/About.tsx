import React from 'react';
import DashboardLayout from '../src/layouts/DashboardLayout';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CheckCircle2, Globe, Users, BookOpen } from 'lucide-react';

const About: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="bg-primary text-primary-foreground py-20 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                            Advancing Knowledge, <br /> Empowering Innovation
                        </h1>
                        <p className="text-xl md:text-2xl opacity-90 leading-relaxed max-w-2xl mx-auto">
                            Nkiza Center for Research is a premier institution dedicated to high-quality academic publishing and widespread dissemination of knowledge across Africa and the globe.
                        </p>
                    </div>
                </section>

                {/* Mission & Vision */}
                <section className="py-20 bg-background">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <div className="bg-blue-500/10 w-fit p-3 rounded-xl text-blue-600">
                                    <Globe className="h-8 w-8" />
                                </div>
                                <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    To bridge the gap between researchers and the public by providing a robust, open-access platform for scholarly communication. We aim to democratize access to information and foster a culture of evidence-based policymaking and innovation.
                                </p>
                                <ul className="space-y-3 pt-4">
                                    <li className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                        <span>Promote African scholarship on the global stage</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                        <span>Ensure rigorous peer-review standards</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                        <span>Support interdisciplinary collaboration</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="relative">
                                <div className="aspect-[4/3] bg-secondary rounded-2xl overflow-hidden shadow-2xl">
                                    <img
                                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop"
                                        alt="Team working together"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-xl border border-border hidden md:block">
                                    <div className="flex items-center gap-4">
                                        <div className="text-4xl font-bold text-primary">10+</div>
                                        <div className="text-sm font-medium text-muted-foreground w-20">Years of Excellence</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats / Impact */}
                <section className="py-16 bg-secondary/30 border-y border-border">
                    <div className="max-w-6xl mx-auto px-4 text-center">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
                                <BookOpen className="h-10 w-10 text-primary mx-auto mb-4" />
                                <div className="text-3xl font-bold mb-2">5+</div>
                                <div className="text-muted-foreground">Active Peer-Reviewed Journals</div>
                            </div>
                            <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
                                <Users className="h-10 w-10 text-blue-500 mx-auto mb-4" />
                                <div className="text-3xl font-bold mb-2">200+</div>
                                <div className="text-muted-foreground">Expert Reviewers & Editors</div>
                            </div>
                            <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
                                <Globe className="h-10 w-10 text-green-500 mx-auto mb-4" />
                                <div className="text-3xl font-bold mb-2">50+</div>
                                <div className="text-muted-foreground">Countries Reached</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Info (Simple) */}
                <section className="py-20 bg-background">
                    <div className="max-w-2xl mx-auto text-center px-4">
                        <h2 className="text-3xl font-bold mb-6">Connect With Us</h2>
                        <p className="text-muted-foreground mb-8">
                            Interested in publishing with us or have questions about our journals?
                            Reach out to our editorial team.
                        </p>
                        <a href="mailto:info@nkizacenter.org" className="text-primary font-bold text-lg hover:underline decoration-2 underline-offset-4">
                            info@nkizacenter.org
                        </a>
                        <p className="mt-4 text-sm text-muted-foreground">
                            Kigali, Rwanda
                        </p>
                    </div>
                </section>

            </main>
            <Footer />
        </div>
    );
};

export default About;
