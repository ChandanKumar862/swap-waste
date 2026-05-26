import { motion } from "framer-motion"
import { ArrowRight, Leaf, ShieldCheck, Zap, Recycle, MapPin, Database, Award, CheckCircle2, TrendingUp, Star, Users } from "lucide-react"
import { Button } from "../components/Button"
import { Link } from "react-router-dom"

export default function Landing() {
    return (
        <div className="flex flex-col gap-32 py-8 relative overflow-hidden bg-slate-50">
            {/* Elegant Soft SaaS Background Gradients */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none z-0" />
            <div className="absolute bottom-40 right-10 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

            {/* 1. Hero Section */}
            <section className="flex flex-col items-center text-center space-y-10 mt-12 max-w-5xl mx-auto relative z-10 px-6">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center rounded-full border border-emerald-200 px-4 py-1.5 text-xs font-semibold tracking-wide bg-emerald-50/55 text-emerald-850 backdrop-blur-md shadow-sm"
                >
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 border border-white animate-pulse"></span>
                    Now Active: ISO 14001 Circular Material Exchange
                </motion.div>

                <motion.h1
                    className="text-4xl md:text-7xl font-display font-extrabold tracking-tight leading-[1.05] text-slate-900"
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    Reducing Industrial Waste.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700">Maximizing Circular Yield.</span>
                </motion.h1>

                <motion.p
                    className="text-base md:text-xl text-slate-600 max-w-3xl leading-relaxed font-normal"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    The premium B2B circular economy platform for modern factories. Turn production byproducts into active revenue, automate ESG compliance logs, and match surplus materials with certified nearby buyers.
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md pt-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Link to="/dashboard" className="w-full sm:w-auto">
                        <Button size="lg" className="w-full sm:px-8 h-13 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-2xl shadow-lg shadow-slate-950/10 border-0 transition-all">
                            Enter Dashboard
                        </Button>
                    </Link>
                    <Link to="/dashboard" className="w-full sm:w-auto">
                        <Button size="lg" variant="outline" className="w-full sm:px-8 h-13 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-2xl shadow-sm transition-all">
                            Explore Marketplace
                        </Button>
                    </Link>
                </motion.div>
            </section>

            {/* 2. Sleek Interactive Platform Cockpit Demo */}
            <section className="max-w-6xl mx-auto w-full px-6 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="border border-slate-200 bg-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden"
                >
                    {/* Simulated App Top bar */}
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6 text-xs text-slate-400 font-semibold">
                        <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-slate-700">Swap Waste Enterprise Suite</span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-500 font-bold border border-slate-200/50">NODE_04 ACTIVE</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Demo Panel 1 */}
                        <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-5 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-400 font-bold tracking-wider uppercase">Active Telemetry</span>
                                <TrendingUp className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center border-b border-slate-100/80 pb-2">
                                    <span className="text-xs text-slate-600">Total Carbon Saved</span>
                                    <span className="text-sm font-bold text-slate-900">14,290.4 t</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-100/80 pb-2">
                                    <span className="text-xs text-slate-600">Exchange Success Rate</span>
                                    <span className="text-sm font-bold text-emerald-600">98.42%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-600">Avg Matching Latency</span>
                                    <span className="text-sm font-bold text-slate-900">14 ms</span>
                                </div>
                            </div>
                        </div>

                        {/* Demo Panel 2 */}
                        <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden min-h-[140px]">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03)_0%,transparent_70%)]" />
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                    <Recycle className="h-6 w-6 animate-spin-slow" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">AI Swap Search</div>
                                    <div className="text-sm font-bold text-slate-900 mt-0.5">Calculating optimal matches...</div>
                                    <div className="text-xs text-emerald-600 mt-0.5 font-medium">Bypassing standard landfills &rarr; 12.8t Plastics matched</div>
                                </div>
                            </div>
                        </div>

                        {/* Demo Panel 3 */}
                        <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-5 flex flex-col justify-between">
                            <div className="flex flex-col gap-1.5">
                                <span className="text-xs text-slate-400 font-bold tracking-wider uppercase">Active Pipeline Swaps</span>
                                <p className="text-xs leading-relaxed text-slate-600 mt-1">
                                    Bilateral contract finalized: **125t Chemical Byproducts** successfully swapped with **Industrial Cleaners Ltd** in real-time.
                                </p>
                            </div>
                            <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100/50 rounded-lg px-2.5 py-1 mt-3 w-fit">
                                Status: Handshake Verified
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* 3. Platform Key Statistics */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto w-full relative z-10 px-6">
                {[
                    { icon: Leaf, label: "Audited CO2 Prevented", value: "14,290 t", desc: "Carbon offsets registered directly inside standard enterprise ESG reporting dashboards.", color: "emerald" },
                    { icon: ShieldCheck, label: "Landfill Waste Bypassed", value: "8,520 t", desc: "Raw industrial sludge and manufacturing surplus diverted directly to active reuse factories.", color: "emerald" },
                    { icon: Zap, label: "Grid Energy Reclaimed", value: "240+ GWh", desc: "Repurposing high-energy waste materials to replace high-cost raw materials in logistics.", color: "emerald" },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.15 }}
                        className="bg-white border border-slate-200/80 p-8 rounded-3xl flex flex-col hover-lift relative animate-fade-in"
                    >
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit mb-6 border border-emerald-100/30">
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <h3 className="text-4xl font-display font-extrabold mb-1.5 text-slate-900 tracking-tight">{stat.value}</h3>
                        <p className="text-sm font-bold text-slate-800 tracking-wide">{stat.label}</p>
                        <p className="text-xs text-slate-500 leading-relaxed mt-2">{stat.desc}</p>
                    </motion.div>
                ))}
            </section>

            {/* 4. How the Platform Works */}
            <section className="max-w-6xl mx-auto w-full px-6 space-y-16">
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-display font-extrabold text-slate-900 tracking-tight">How swapwaste Works</h2>
                    <p className="text-sm md:text-base text-slate-500 leading-relaxed font-normal">
                        Establishing circular industrial partnerships has never been simpler. Four secure, automated steps to achieve total material neutrality.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                        {
                            icon: Recycle,
                            index: "01",
                            title: "List Excess Byproducts",
                            desc: "Log your industrial surplus or processing waste. Input core variables (moisture content, chemical purity, raw tonnage) into our secure catalog interface."
                        },
                        {
                            icon: ArrowRight,
                            index: "02",
                            title: "Automated Smart Matching",
                            desc: "Our AI matching engine queries active manufacturing operations, pairing your material outputs with nearby factories requiring those exact raw items."
                        },
                        {
                            icon: Database,
                            index: "03",
                            title: "Track Carbon Offsets",
                            desc: "Automatically logs transport distances, landfill diversion, and chemical processing variables to calculate real circular credits for compliance audits."
                        },
                        {
                            icon: Award,
                            index: "04",
                            title: "Compliant & Legal Shipping",
                            desc: "The system generates end-to-end legal shipping logs, hazardous material clearances, and verified carbon transfer deeds in compliance with local environmental laws."
                        }
                    ].map((feat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="bg-white border border-slate-200/80 p-6 rounded-3xl flex gap-5 items-start hover:border-emerald-300 hover:shadow-md transition-all duration-300"
                        >
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0 relative border border-emerald-100/50">
                                <feat.icon className="h-6 w-6" />
                                <span className="absolute -top-2 -right-2 text-[10px] bg-slate-900 text-white font-bold rounded-full w-5 h-5 flex items-center justify-center">{feat.index}</span>
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-display font-bold text-base text-slate-900 tracking-tight">{feat.title}</h4>
                                <p className="text-xs md:text-sm leading-relaxed text-slate-500">{feat.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* 5. Benefits for Industries */}
            <section className="bg-slate-900 py-24 text-white -mx-6 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="max-w-6xl mx-auto w-full flex flex-col lg:flex-row gap-16 items-center">
                    <div className="space-y-6 max-w-xl">
                        <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/40 rounded-full px-4 py-1.5 tracking-wider uppercase w-fit">
                            Built for Operations Managers & CFOs
                        </span>
                        <h2 className="text-3xl md:text-5xl font-display font-extrabold leading-tight tracking-tight">
                            The Bottom Line Benefits of Going Circular
                        </h2>
                        <p className="text-sm md:text-base text-slate-400 leading-relaxed font-normal">
                            Swap Waste is designed to seamlessly integrate into standard factory supply chains, lowering overhead expenses while delivering measurable sustainability offsets.
                        </p>
                        <div className="flex flex-col gap-4 pt-4">
                            {[
                                "Bypass expensive landfill and commercial waste disposal fees.",
                                "Source industrial raw materials at a fraction of standard extraction costs.",
                                "Minimize raw cargo shipping distances through localized geospatial pairing.",
                                "Audit-ready ESG impact logs fully compliant with global carbon standards."
                            ].map((benefit, idx) => (
                                <div key={idx} className="flex items-start gap-3 text-sm">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                                    <span className="text-slate-300 font-medium">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
                        {[
                            { title: "Reduce Overhead", icon: Zap, text: "Save up to 42% on waste management and transport logistics." },
                            { title: "Localized Supply", icon: MapPin, text: "Match raw surpluses within an average 50km logistics radius." },
                            { title: "Compliance Ready", icon: ShieldCheck, text: "Automatic creation of compliant waste shipment audit logs." },
                            { title: "Brand Reputation", icon: Award, text: "Boost sustainability status for corporate audits and investor reviews." }
                        ].map((card, i) => (
                            <div key={i} className="bg-slate-800/60 border border-slate-700/50 p-6 rounded-2xl space-y-3">
                                <div className="h-10 w-10 bg-emerald-950 text-emerald-400 border border-emerald-900/50 rounded-xl flex items-center justify-center">
                                    <card.icon className="h-5 w-5" />
                                </div>
                                <h3 className="font-display font-bold text-lg text-white">{card.title}</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">{card.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 6. Testimonials Section (New SaaS trust asset) */}
            <section className="max-w-6xl mx-auto w-full px-6 space-y-16">
                <div className="text-center space-y-4 max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-display font-extrabold text-slate-900 tracking-tight">Trusted by Industry Leaders</h2>
                    <p className="text-sm md:text-base text-slate-500 leading-relaxed">
                        See how factories and chemical processing operations are optimizing raw materials while tracking complete offset audibility.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            quote: "Swap Waste reduced our fly ash disposal fees by over $40,005 in the first quarter alone. Pairing with a nearby cement processing plant saved us massive logistics complexity.",
                            author: "Sarah Jenkins",
                            role: "Director of Operations, Titan Steel Corp",
                            stars: 5
                        },
                        {
                            quote: "The automated ESG register is a lifesaver. When it comes to compliance checks, being able to pull verified emissions savings reports instantly keeps our audits stress-free.",
                            author: "Rajesh Kumar",
                            role: "Head of Sustainability, Bengaluru Chemicals Ltd",
                            stars: 5
                        },
                        {
                            quote: "Finding buyers for our manufacturing scrap plastic used to take weeks of calling around. Now the AI matching engine pairs us with local recyclers automatically in minutes.",
                            author: "Michael Vance",
                            role: "Plant Operations Manager, Advanced Polymers Co",
                            stars: 5
                        }
                    ].map((t, idx) => (
                        <div key={idx} className="bg-white border border-slate-200/80 p-8 rounded-3xl flex flex-col justify-between hover-lift">
                            <div className="space-y-4">
                                <div className="flex gap-1">
                                    {[...Array(t.stars)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-xs md:text-sm italic text-slate-600 leading-relaxed">
                                    &ldquo;{t.quote}&rdquo;
                                </p>
                            </div>
                            <div className="flex items-center gap-3 mt-6 border-t border-slate-100 pt-4">
                                <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                                    <Users className="h-5 w-5 text-slate-500" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900">{t.author}</h4>
                                    <p className="text-[10px] text-slate-500">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 7. Registration Banner */}
            <section className="max-w-6xl mx-auto w-full px-6 pb-12">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="w-full bg-slate-900 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 rounded-3xl border border-slate-800 relative overflow-hidden"
                >
                    <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
                    <div className="space-y-4 max-w-xl text-left">
                        <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-900/50 rounded-full px-3.5 py-1">
                            Enterprise Onboarding
                        </span>
                        <h3 className="text-2xl md:text-4xl font-display font-extrabold text-white leading-tight">Join the Swap Waste Network</h3>
                        <p className="text-xs md:text-sm leading-relaxed text-slate-400">
                            Stop spending overhead on wasteful processing fees. Establish circular logistics pipelines, swapping verified byproducts in our certified enterprise ecosystem.
                        </p>
                    </div>
                    <div className="flex gap-4 shrink-0 w-full md:w-auto">
                        <Link to="/register" className="w-full md:w-auto">
                            <Button size="lg" className="w-full md:w-auto text-xs font-bold h-13 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg shadow-emerald-600/10 border-0 transition-all px-8">
                                Initiate Enterprise Registration
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </section>
        </div>
    )
}
