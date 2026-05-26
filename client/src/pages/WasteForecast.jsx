/* eslint-disable no-unused-vars */
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine, Area, AreaChart, Legend
} from "recharts"
import { Button } from "../components/Button"
import {
    Package, TrendingUp, TrendingDown, AlertTriangle, Users,
    Upload, Loader2, CheckCircle, Zap, MapPin, Clock, Leaf,
    BarChart3, ChevronRight, Star, Info, ShieldAlert, Cpu
} from "lucide-react"

// ─── Mock Data ────────────────────────────────────────────────────────────────
const allData = {
    "3M": [
        { month: "Oct", historical: 4.2, forecast: null, upper: null, lower: null },
        { month: "Nov", historical: 4.8, forecast: null, upper: null, lower: null },
        { month: "Dec", historical: 5.1, forecast: null, upper: null, lower: null },
        { month: "Jan", historical: null, forecast: 5.8, upper: 6.3, lower: 5.3 },
        { month: "Feb", historical: null, forecast: 6.1, upper: 6.8, lower: 5.4 },
        { month: "Mar", historical: null, forecast: 5.9, upper: 6.7, lower: 5.1 },
    ],
    "6M": [
        { month: "Aug", historical: 3.5, forecast: null, upper: null, lower: null },
        { month: "Sep", historical: 3.9, forecast: null, upper: null, lower: null },
        { month: "Oct", historical: 4.2, forecast: null, upper: null, lower: null },
        { month: "Nov", historical: 4.8, forecast: null, upper: null, lower: null },
        { month: "Dec", historical: 5.1, forecast: null, upper: null, lower: null },
        { month: "Jan", historical: null, forecast: 5.8, upper: 6.3, lower: 5.3 },
        { month: "Feb", historical: null, forecast: 6.1, upper: 6.8, lower: 5.4 },
        { month: "Mar", historical: null, forecast: 5.9, upper: 6.7, lower: 5.1 },
        { month: "Apr", historical: null, forecast: 6.4, upper: 7.2, lower: 5.6 },
        { month: "May", historical: null, forecast: 6.0, upper: 6.9, lower: 5.1 },
    ],
    "12M": [
        { month: "Feb'24", historical: 2.8, forecast: null, upper: null, lower: null },
        { month: "Mar", historical: 3.0, forecast: null, upper: null, lower: null },
        { month: "Apr", historical: 3.3, forecast: null, upper: null, lower: null },
        { month: "May", historical: 3.1, forecast: null, upper: null, lower: null },
        { month: "Jun", historical: 3.6, forecast: null, upper: null, lower: null },
        { month: "Jul", historical: 3.4, forecast: null, upper: null, lower: null },
        { month: "Aug", historical: 3.5, forecast: null, upper: null, lower: null },
        { month: "Sep", historical: 3.9, forecast: null, upper: null, lower: null },
        { month: "Oct", historical: 4.2, forecast: null, upper: null, lower: null },
        { month: "Nov", historical: 4.8, forecast: null, upper: null, lower: null },
        { month: "Dec", historical: 5.1, forecast: null, upper: null, lower: null },
        { month: "Jan'25", historical: null, forecast: 5.8, upper: 6.3, lower: 5.3 },
        { month: "Feb", historical: null, forecast: 6.1, upper: 6.8, lower: 5.4 },
        { month: "Mar", historical: null, forecast: 5.9, upper: 6.7, lower: 5.1 },
    ],
}

const kpiCards = [
    {
        icon: Package,
        label: "Predicted Volume Next Month",
        value: "5.8 tons",
        sub: "Based on 6-month trend",
        id: "SUITE-01"
    },
    {
        icon: TrendingUp,
        label: "Expected Deviation Rate",
        value: "+14.2%",
        sub: "Increased output vs last month",
        id: "SUITE-02"
    },
    {
        icon: AlertTriangle,
        label: "Storage Overload Risk",
        value: "Optimal Capacity",
        badge: true,
        sub: "Within physical warehouse limits",
        id: "SUITE-03"
    },
    {
        icon: Users,
        label: "Market Matches Active",
        value: "7 Buyers",
        sub: "Pre-matched circular partners",
        id: "SUITE-04"
    },
]

const buyers = [
    {
        id: "PARTNER-42",
        name: "GreenTech Industries",
        score: 96,
        distance: 42,
        quantity: "5–8 tons",
        emissions: "0.21 t CO₂",
        contract: "6 months",
        top: true,
    },
    {
        id: "PARTNER-7B",
        name: "EcoFusion Pvt Ltd",
        score: 88,
        distance: 78,
        quantity: "4–6 tons",
        emissions: "0.38 t CO₂",
        contract: "3 months",
        top: false,
    },
    {
        id: "PARTNER-8C",
        name: "Recyclax Corp",
        score: 81,
        distance: 120,
        quantity: "3–5 tons",
        emissions: "0.59 t CO₂",
        contract: "1 month",
        top: false,
    },
    {
        id: "PARTNER-9A",
        name: "BlueSky Materials",
        score: 74,
        distance: 195,
        quantity: "6–10 tons",
        emissions: "0.92 t CO₂",
        contract: "12 months",
        top: false,
    },
]

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="border border-slate-200 bg-white p-3.5 text-xs text-slate-800 shadow-xl min-w-[170px] space-y-2 rounded-xl">
            <p className="font-bold border-b border-slate-100 pb-1 text-slate-900 font-display">Target Month: {label}</p>
            {payload.map((p) => {
                const isForecast = p.dataKey === "forecast" || p.dataKey === "upper" || p.dataKey === "lower"
                const colorClass = isForecast ? "text-emerald-600" : "text-indigo-600"
                return (
                    <div key={p.dataKey} className="flex justify-between items-center gap-4">
                        <span className="text-slate-400 uppercase text-[10px] font-semibold">{p.name || p.dataKey}:</span>
                        <span className={`font-bold text-right ${colorClass}`}>
                            {p.value != null ? `${p.value} tons` : "—"}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WasteForecast() {
    const [range, setRange] = useState("6M")
    const [dragOver, setDragOver] = useState(false)
    const [uploadedFile, setUploadedFile] = useState(null)
    const [generating, setGenerating] = useState(false)
    const [generated, setGenerated] = useState(false)
    const [form, setForm] = useState({ production: "", wasteRatio: "", seasonality: "" })
    const fileRef = useRef()

    const handleDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) setUploadedFile(file)
    }

    const handleGenerate = () => {
        setGenerating(true)
        setGenerated(false)
        setTimeout(() => { setGenerating(false); setGenerated(true) }, 2200)
    }

    const chartData = allData[range]

    return (
        <div className="max-w-7xl mx-auto py-8 space-y-8 px-4 font-sans text-slate-800 relative z-10">

            {/* ── Header ── */}
            <div className="flex flex-col gap-2">
                <div className="inline-flex items-center rounded-full border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 w-fit font-display">
                    <span className="flex h-2 w-2 bg-emerald-500 mr-2 rounded-full animate-ping"></span>
                    AI Intelligence Suite
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-display">
                            Waste Forecasting &amp; Pre-Match Hub
                        </h1>
                        <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                            Forecast industrial byproduct output volumes and secure vetted recycling contracts before waste is generated.
                        </p>
                    </div>
                    <Button 
                        className="gap-2 shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold tracking-wide h-10 px-4 transition-all border-none cursor-pointer shadow-sm shadow-emerald-500/10"
                        onClick={() => fileRef.current?.click()}
                    >
                        <Upload className="h-4 w-4 inline" /> Upload Production Log
                    </Button>
                </div>
            </div>

            {/* ── KPI Telemetry Panel Grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((k, i) => (
                    <motion.div
                        key={k.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="hud-panel p-5 flex flex-col justify-between min-h-[160px] bg-white rounded-2xl border border-slate-200 shadow-sm"
                    >
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] text-slate-400 font-bold tracking-wider">{k.id}</span>
                            <div className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        
                        <div className="space-y-1 my-3">
                            <p className="text-xs text-slate-500 font-medium leading-tight">{k.label}</p>
                            {k.badge ? (
                                <div className="pt-1">
                                    <span className="text-xs font-bold px-2.5 py-0.5 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-full">
                                        {k.value}
                                    </span>
                                </div>
                            ) : (
                                <p className={`text-2xl font-bold tracking-tight text-slate-900 font-display`}>{k.value}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 border-t border-slate-100 pt-2">
                            <k.icon className="h-4 w-4 text-emerald-600" />
                            <span>{k.sub}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── Forecast Chart + Insights ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual Forecast Plot Block */}
                <div className="lg:col-span-2 hud-panel p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-4 mb-4">
                            <div className="flex items-center gap-2">
                                <Cpu className="h-4 w-4 text-emerald-600 animate-spin" />
                                <span className="text-sm font-bold text-slate-900 font-display">Predictive Volume Analytics</span>
                            </div>
                            <div className="flex gap-1.5 border border-slate-200 p-1 rounded-xl bg-slate-50">
                                {["3M", "6M", "12M"].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => setRange(r)}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                                            range === r 
                                                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/10" 
                                                : "text-slate-500 hover:text-slate-900"
                                        }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mb-4 leading-relaxed font-display">
                            <span className="inline-block w-3 h-3 bg-indigo-600 rounded-full mr-1.5 align-middle"></span> 
                            <strong className="text-slate-800">Historical Volume</strong>
                            <span className="inline-block w-3 h-3 border-2 border-dashed border-emerald-500 rounded-full mx-1.5 align-middle"></span> 
                            <strong className="text-slate-800">AI Projected Forecast</strong>
                        </p>
                    </div>

                    <div className="pt-2">
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(222, 47%, 11%)" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="hsl(222, 47%, 11%)" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 23, 42, 0.05)" />
                                <XAxis 
                                    dataKey="month" 
                                    tick={{ fill: 'rgba(15, 23, 42, 0.6)', fontSize: 10, fontFamily: 'Inter' }}
                                    stroke="rgba(15, 23, 42, 0.1)"
                                />
                                <YAxis 
                                    tick={{ fill: 'rgba(15, 23, 42, 0.6)', fontSize: 10, fontFamily: 'Inter' }}
                                    unit=" t" 
                                    stroke="rgba(15, 23, 42, 0.1)"
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99, 102, 241, 0.3)', strokeWidth: 1.5 }} />
                                <Legend wrapperStyle={{ fontSize: 10, color: '#334155', paddingTop: 10, fontFamily: 'Inter' }} />
                                
                                <Area dataKey="upper" stroke="none" fill="url(#confGrad)" name="Upper confidence margin" connectNulls />
                                <Area dataKey="lower" stroke="none" fill="#f8fafc" name="Lower confidence margin" connectNulls fillOpacity={1} />
                                
                                <Line
                                    type="monotone"
                                    dataKey="historical"
                                    stroke="hsl(222, 47%, 11%)"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: "hsl(222, 47%, 11%)", stroke: "#fff", strokeWidth: 1.5 }}
                                    name="Historical Output"
                                    connectNulls
                                    activeDot={{ r: 6, shadow: "0 0 10px rgba(15, 23, 42, 0.5)" }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="forecast"
                                    stroke="hsl(150, 84%, 37%)"
                                    strokeWidth={3}
                                    strokeDasharray="6 4"
                                    dot={{ r: 4, fill: "hsl(150, 84%, 37%)", stroke: "#fff", strokeWidth: 1.5 }}
                                    name="AI Forecast Output"
                                    connectNulls
                                    activeDot={{ r: 6, shadow: "0 0 10px rgba(5, 150, 105, 0.5)" }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Telemetry Logs Insights Panel */}
                <div className="hud-panel p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
                            <Zap className="h-4 w-4 text-emerald-600 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-display">AI Forecast Analysis</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            Based on your manufacturing index parameters and seasonal fluctuations, waste byproduct volume is projected to increase by <strong className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-100 rounded-full font-bold text-xs">+14.2%</strong> next month. Metal and physical feedstock streams dominate the upcoming output trend.
                        </p>
                    </div>

                    {/* Confidence Telemetry */}
                    <div className="my-5 border-t border-slate-100 pt-4">
                        <div className="flex justify-between text-xs mb-2 font-semibold uppercase tracking-wider">
                            <span className="text-slate-500">Confidence Integrity Index</span>
                            <span className="text-emerald-600 font-bold">87% Score</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-emerald-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: "87%" }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        {/* Dynamic Suggested Action Box */}
                        <div className="border border-emerald-100 bg-emerald-50/50 p-3.5 rounded-xl text-xs">
                            <p className="font-bold text-emerald-800 mb-1 flex items-center gap-1.5 font-display">
                                <span className="flex h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
                                Core AI Recommendation
                            </p>
                            <p className="text-slate-600 leading-normal">
                                Schedule an automated byproduct pickup agreement with GreenTech Industries for Jan 28 to prevent local warehouse overaccumulation.
                            </p>
                        </div>

                        {/* Capacity Risk Block */}
                        <div className="border border-rose-100 bg-rose-50/50 p-3.5 rounded-xl text-xs">
                            <p className="font-bold text-rose-800 mb-1 flex items-center gap-1.5 font-display">
                                <AlertTriangle className="h-4 w-4 text-rose-600 animate-pulse inline" />
                                Storage Capacity Warning
                            </p>
                            <p className="text-slate-600 leading-normal">
                                Projected volumes peak at 6.4t in April, exceeding ordinary warehouse safety tolerances by 8%. Early negotiation is strongly advised.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Production Data Injector Panel ── */}
            <div className="hud-panel p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-5">
                    <BarChart3 className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-display">Production Log Injector</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Drag-and-drop csv scanner pad */}
                    <div>
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => fileRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 py-12 cursor-pointer transition-all relative overflow-hidden ${
                                dragOver 
                                    ? "border-emerald-500 bg-emerald-50" 
                                    : "border-slate-200 bg-slate-50/50 hover:border-emerald-500 hover:bg-emerald-50/30"
                            }`}
                        >
                            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => setUploadedFile(e.target.files[0])} />
                            
                            {uploadedFile ? (
                                <>
                                    <CheckCircle className="h-8 w-8 text-emerald-600 animate-pulse" />
                                    <p className="text-xs font-bold text-emerald-800 uppercase">File Loaded: {uploadedFile.name}</p>
                                    <p className="text-[10px] text-slate-400">Click to upload a different file</p>
                                </>
                            ) : (
                                <>
                                    <Upload className="h-8 w-8 text-slate-400 animate-bounce" />
                                    <p className="text-xs font-bold text-slate-700 tracking-wide font-display">Drag &amp; drop your production CSV log here</p>
                                    <p className="text-[10px] text-slate-400">or browse local node directory</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Manual Telemetry Forms */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs text-slate-600 font-semibold font-display">Monthly Production (units)</label>
                                <input
                                    type="number" min="0" placeholder="e.g. 2400"
                                    value={form.production}
                                    onChange={(e) => setForm({ ...form, production: e.target.value })}
                                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-slate-600 font-semibold font-display">Waste Byproduct Ratio (%)</label>
                                <input
                                    type="number" min="0" max="100" step="0.1" placeholder="e.g. 3.2"
                                    value={form.wasteRatio}
                                    onChange={(e) => setForm({ ...form, wasteRatio: e.target.value })}
                                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-1.5">
                            <label className="text-xs text-slate-600 font-semibold font-display">Seasonality Adjustment (%)</label>
                            <input
                                type="number" step="0.1" placeholder="e.g. +5 or -3"
                                value={form.seasonality}
                                onChange={(e) => setForm({ ...form, seasonality: e.target.value })}
                                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>

                        <Button 
                            className="w-full gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-xs tracking-wider transition-all h-11 border-none cursor-pointer shadow-sm shadow-emerald-500/10" 
                            onClick={handleGenerate} 
                            disabled={generating}
                        >
                            {generating ? (
                                <><Loader2 className="h-4 w-4 animate-spin text-white inline" /> Generating Predictive Model...</>
                            ) : generated ? (
                                <><CheckCircle className="h-4 w-4 text-white inline" /> Forecast Models Injected Successfully</>
                            ) : (
                                <><BarChart3 className="h-4 w-4 inline" /> Calculate Predictive Forecast</>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── AI Pre-Match Recommendations ── */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
                    <Star className="h-5 w-5 text-emerald-600 animate-pulse" />
                    <h2 className="text-lg font-bold text-slate-900 font-display">AI Pre-Match circular Deals</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {buyers.map((b, i) => (
                        <motion.div
                            key={b.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`hud-panel p-5 flex flex-col justify-between min-h-[280px] bg-white rounded-2xl border shadow-sm ${
                                b.top ? "border-emerald-500 ring-1 ring-emerald-500/20" : "border-slate-200"
                            }`}
                        >
                            <div className="space-y-4">
                                {/* Top Badge Banner */}
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] text-slate-400 font-bold">{b.id}</span>
                                    {b.top ? (
                                        <span className="text-[9px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5 w-fit">
                                            ⭐ TOP MATCH
                                        </span>
                                    ) : (
                                        <span className="text-[9px] font-bold uppercase tracking-wide text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full px-2.5 py-0.5 w-fit">
                                            ACTIVE STREAM
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <p className="font-bold text-slate-900 text-sm font-display leading-tight uppercase truncate">{b.name}</p>
                                    <div className="flex justify-between items-center text-[11px] font-medium">
                                        <span className="text-slate-400">MATCH PROBABILITY:</span>
                                        <span className={`font-bold font-display ${b.score >= 90 ? "text-emerald-600" : "text-indigo-600"}`}>
                                            {b.score}%
                                        </span>
                                    </div>
                                    
                                    {/* Score visual metric progress indicator */}
                                    <div className="w-full h-1.5 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full rounded-full ${b.score >= 90 ? "bg-emerald-500" : "bg-indigo-600"}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${b.score}%` }}
                                            transition={{ duration: 0.9, delay: i * 0.1 + 0.3 }}
                                        />
                                    </div>
                                </div>

                                {/* Detailed node specifications */}
                                <div className="grid grid-cols-2 gap-y-2.5 gap-x-3 text-[11px] text-slate-500 border-t border-slate-100 pt-3.5">
                                    <div className="flex items-center gap-1.5 font-medium"><MapPin className="h-3.5 w-3.5 text-emerald-500" /> {b.distance} km</div>
                                    <div className="flex items-center gap-1.5 font-medium"><Package className="h-3.5 w-3.5 text-indigo-500" /> {b.quantity}</div>
                                    <div className="flex items-center gap-1.5 font-medium"><Leaf className="h-3.5 w-3.5 text-emerald-500" /> {b.emissions}</div>
                                    <div className="flex items-center gap-1.5 font-medium"><Clock className="h-3.5 w-3.5 text-indigo-500" /> {b.contract}</div>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-slate-100 mt-4">
                                <Button 
                                    size="sm" 
                                    className="flex-1 text-[11px] h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 border-none text-white font-semibold transition-all cursor-pointer shadow-sm shadow-emerald-500/10"
                                >
                                    Negotiate
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="flex-1 text-[11px] h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer"
                                >
                                    Details <ChevronRight className="h-3 w-3" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

        </div>
    )
}
