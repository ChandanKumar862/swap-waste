import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../components/Card"
import { Button } from "../components/Button"
import { Truck, MapPin, PackageCheck, Phone, CheckCircle2, User, Building2, ExternalLink, Loader2, AlertTriangle } from "lucide-react"
import { api, BASE_URL } from "../lib/api"

// ── Mappls Credentials ──────────────────────────────────────────────────────────
const MAPPLS_CLIENT_ID = "96dHZVzsAusuMxRjLswRBUTTM1rQVG8fIC68rQbgIrts6zvpO-sPU-2UbQnYgt9IEvLjJOp-08-pbWiCOrXN6g=="
const MAPPLS_CLIENT_SECRET = "lrFxI-iSEg8piwCW2MoujeMeTg-61ruMnPjvw0RQ5j1VxPoIFN0-s1lqfJKTtgH4mXDtm06k6oTBcHrZB5D_kI8TVMA-lVp2"

// ── Deals (with lat/lng for source) ─────────────────────────────────────────────
const DEALS = [
    {
        id: "M-092",
        material: "Fly Ash",
        quantity: "200 Tons",
        source: {
            name: "Tata Power",
            address: "Trombay, Mumbai, Maharashtra",
            lat: 19.0544,
            lng: 72.8402,
            distance: "4.2 km away"
        },
        destination: {
            name: "Ambuja Cements",
            address: "Chandrapur, Maharashtra"
        },
        date: "Oct 24, 2026",
        status: "Transport Pending"
    },
    {
        id: "M-084",
        material: "Steel Offcuts",
        quantity: "12 Tons",
        source: {
            name: "Tata Motors",
            address: "Pimpri-Chinchwad, Pune, Maharashtra",
            lat: 18.6298,
            lng: 73.7997,
            distance: "1.5 km away"
        },
        destination: {
            name: "EcoSteel Refineries",
            address: "Nagpur, Maharashtra"
        },
        date: "Oct 22, 2026",
        status: "Transport Pending"
    }
]

// ── Mappls API helpers ──────────────────────────────────────────────────────────
let cachedToken = null
let tokenExpiry = 0

async function getMapplsToken() {
    if (cachedToken && Date.now() < tokenExpiry) return cachedToken

    const res = await fetch(`${BASE_URL}/mappls-auth`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: MAPPLS_CLIENT_ID,
            client_secret: MAPPLS_CLIENT_SECRET,
        }),
    })

    if (!res.ok) throw new Error(`Token request failed: ${res.status}`)

    const data = await res.json()
    cachedToken = data.access_token
    // expire 5 minutes early to be safe
    tokenExpiry = Date.now() + (data.expires_in ? (data.expires_in - 300) * 1000 : 23 * 60 * 60 * 1000)
    return cachedToken
}

// ── Known courier brand contacts (publicly available) ───────────────────────────
const KNOWN_COURIER_CONTACTS = [
    { match: ["dtdc"], phone: "1800-209-3282", website: "dtdc.in" },
    { match: ["fedex", "fed ex"], phone: "1800-209-6161", website: "fedex.com/in" },
    { match: ["professional couriers", "professional courier"], phone: "1800-112-345", website: "tpcindia.com" },
    { match: ["blue dart"], phone: "1860-233-1234", website: "bluedart.com" },
    { match: ["delhivery"], phone: "011-4004-4004", website: "delhivery.com" },
    { match: ["ekart", "flipkart"], phone: "1800-208-9898", website: "ekartlogistics.com" },
    { match: ["india post", "speed post"], phone: "1800-111-363", website: "indiapost.gov.in" },
    { match: ["first flight"], phone: "022-2827-1334", website: "firstflight.net" },
    { match: ["trackon"], phone: "011-4141-4141", website: "trackon.in" },
    { match: ["xpressbees"], phone: "1800-419-8888", website: "xpressbees.com" },
    { match: ["ecom express"], phone: "011-4141-2345", website: "ecomexpress.in" },
    { match: ["shree anjani"], phone: "079-2657-2100", website: "shreeanjanicourier.com" },
    { match: ["shree maruti"], phone: "079-2220-2983", website: "shreemaruticourier.com" },
    { match: ["gati"], phone: "1860-123-4284", website: "gati.com" },
    { match: ["safexpress"], phone: "011-2626-0000", website: "safexpress.com" },
    { match: ["vrl logistics", "vrl"], phone: "0836-237-4114", website: "vrlgroup.in" },
    { match: ["rivigo"], phone: "1800-102-9888", website: "rivigo.com" },
    { match: ["spoton"], phone: "1800-113-113", website: "spoton.co.in" },
    { match: ["dp international"], phone: "022-6691-5555", website: "dpex.com" },
    { match: ["konnellion"], phone: null, website: null },
]

function matchKnownContact(placeName) {
    const lower = (placeName || "").toLowerCase()
    for (const entry of KNOWN_COURIER_CONTACTS) {
        if (entry.match.some(m => lower.includes(m))) {
            return { phone: entry.phone, website: entry.website }
        }
    }
    return null
}

async function fetchNearbyTransporters(lat, lng, radius = 5000) {
    const token = await getMapplsToken()

    const params = new URLSearchParams({
        keywords: "courier;logistics;cargo;transport;freight",
        refLocation: `${lat},${lng}`,
        radius: String(radius),
        explain: "true",
        richData: "true",
    })

    const res = await fetch(`${BASE_URL}/mappls-search?${params}`, {
        headers: { Authorization: `bearer ${token}` },
    })
    if (!res.ok) throw new Error(`Nearby search failed: ${res.status}`)

    const data = await res.json()
    const places = data.suggestedLocations || data.results || []

    return places.map((p, i) => {
        const known = matchKnownContact(p.placeName || p.name)
        return {
            id: p.eLoc || `T-${i}`,
            name: p.placeName || p.name || "Unknown Service",
            driver: p.addressTokens?.houseNumber || "Contact for details",
            vehicle: p.typeName || p.keywords || "Logistics Service",
            rating: p.rating || "—",
            phone: p.pds?.mobile || p.richInfo?.contact || p.phone || p.mobile || known?.phone || "Not available",
            website: known?.website || null,
            distance: p.distance ? `${(p.distance / 1000).toFixed(1)} km from Source` : "Nearby",
            address: p.placeAddress || p.address || "",
        }
    })
}

// ── Component ───────────────────────────────────────────────────────────────────
export default function Logistics() {
    const [selectedDealId, setSelectedDealId] = useState(DEALS[0].id)
    const [transporters, setTransporters] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const selectedDeal = DEALS.find(d => d.id === selectedDealId)

    const loadTransporters = useCallback(async (deal) => {
        if (!deal) return
        setLoading(true)
        setError(null)
        setTransporters([])
        try {
            const results = await fetchNearbyTransporters(deal.source.lat, deal.source.lng)
            setTransporters(results)
        } catch (err) {
            console.error("Failed to fetch transporters:", err)
            setError(err.message || "Failed to load nearby transporters")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadTransporters(selectedDeal)
    }, [selectedDealId, selectedDeal, loadTransporters])

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 min-h-screen relative z-10 font-sans text-slate-800">
            {/* Header Telematics */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-6 mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-display text-slate-900">
                        Logistics & <span className="text-emerald-600">Transit Control</span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-2">
                        Coordinate circular cargo distribution, schedule materials dispatch, and locate verified transporters.
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 border border-slate-100 rounded-2xl shadow-sm text-sm">
                    <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-slate-600 font-medium">Network Status:</span>
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold font-sans">
                        ONLINE
                    </span>
                    <div className="h-4 w-[1px] bg-slate-200" />
                    <span className="text-xs text-slate-500 font-medium">Mappls Geo API Connected</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left Column: Deals List */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="pb-2 border-b border-slate-100">
                        <h2 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            Agreed Streams Index
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Select an active deal to arrange dispatch logistics</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        {DEALS.map((deal) => (
                            <motion.div
                                key={deal.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div
                                    className={`cursor-pointer transition-all p-5 relative rounded-2xl border ${
                                        selectedDealId === deal.id
                                            ? 'border-emerald-500 bg-emerald-50/20 shadow-md ring-1 ring-emerald-500/20'
                                            : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                                    }`}
                                    onClick={() => setSelectedDealId(deal.id)}
                                >
                                    {selectedDealId === deal.id && (
                                        <div className="absolute right-4 top-4">
                                            <span className="h-2 w-2 rounded-full bg-emerald-500 block" />
                                        </div>
                                    )}
                                    <div className="space-y-3 relative">
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <p className="font-bold text-base font-display text-slate-900 leading-tight">{deal.material}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">Stream: #{deal.id}</p>
                                            </div>
                                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg font-sans">
                                                {deal.quantity}
                                            </span>
                                        </div>
                                        
                                        <div className="border-t border-slate-50 pt-3 flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                                <span className="truncate font-semibold text-slate-700">{deal.source.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                                <span className="truncate">{deal.source.address}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Deal Details & Nearby Transporters */}
                <div className="lg:col-span-2 space-y-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedDealId}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Selected Deal Details Card */}
                            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 px-4 py-1.5 bg-slate-900 text-white text-xs font-bold tracking-wider rounded-bl-xl font-display">
                                    TRANSIT DIAGNOSIS
                                </div>
                                <div className="flex flex-col md:flex-row gap-8 items-center pt-4 justify-between">
                                    {/* Pickup */}
                                    <div className="flex-1 space-y-2 text-center md:text-left w-full">
                                        <p className="text-xs uppercase tracking-wider text-slate-400 font-bold font-sans">
                                            [01] PICKUP HUB
                                        </p>
                                        <div className="flex items-start gap-3 justify-center md:justify-start">
                                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex-shrink-0">
                                                <Building2 className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold font-display text-slate-800 text-base leading-tight">
                                                    {selectedDeal.source.name}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {selectedDeal.source.address}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Transit Indicator */}
                                    <div className="flex flex-col items-center px-4 w-full md:w-auto my-4 md:my-0">
                                        <span className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase mb-1.5 animate-pulse font-sans">
                                            IN_TRANSIT
                                        </span>
                                        <div className="p-2.5 bg-emerald-50 rounded-full mb-2">
                                            <Truck className="w-6 h-6 text-emerald-600 animate-bounce" />
                                        </div>
                                        <div className="w-full md:w-32 h-[3px] bg-slate-100 relative rounded-full">
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-slate-900 rounded-full" />
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-600 rounded-full" />
                                        </div>
                                    </div>

                                    {/* Destination */}
                                    <div className="flex-1 space-y-2 text-center md:text-right w-full">
                                        <p className="text-xs uppercase tracking-wider text-slate-400 font-bold font-sans">
                                            [02] DESTINATION
                                        </p>
                                        <div className="flex items-start gap-3 justify-center md:justify-end">
                                            <div className="text-center md:text-right md:order-1">
                                                <p className="font-bold font-display text-slate-800 text-base leading-tight">
                                                    {selectedDeal.destination.name}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {selectedDeal.destination.address}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 md:order-2 flex-shrink-0">
                                                <MapPin className="w-5 h-5 text-slate-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Simulated active RADAR tracking */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-white border border-slate-100 p-6 rounded-2xl shadow-sm relative overflow-hidden">
                                {/* Real-time telemetry scanner */}
                                <div className="md:col-span-1 flex flex-col items-center justify-center relative p-5 border border-slate-100 bg-slate-50/50 rounded-2xl">
                                    <div className="absolute top-3 left-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">GEOSPATIAL RADAR</div>
                                    <div className="w-32 h-32 rounded-full border border-slate-200 flex items-center justify-center relative radar-sweep overflow-hidden bg-white shadow-inner">
                                        {/* Radar Grid Lines */}
                                        <div className="absolute inset-0 border-t border-slate-100 top-1/2" />
                                        <div className="absolute inset-0 border-l border-slate-100 left-1/2" />
                                        <div className="absolute w-20 h-20 rounded-full border border-slate-200" />
                                        <div className="absolute w-10 h-10 rounded-full border border-slate-200" />
                                        
                                        {/* Blip elements representing transporters */}
                                        <div className="absolute w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(5,150,105,0.4)] top-8 left-12 animate-pulse" />
                                        <div className="absolute w-2.5 h-2.5 bg-slate-800 rounded-full shadow-[0_0_8px_rgba(15,23,42,0.3)] bottom-10 right-8 animate-pulse" />
                                        <div className="absolute w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(5,150,105,0.4)] top-20 right-14 animate-pulse" />
                                    </div>
                                    <p className="text-[10px] font-bold text-emerald-600 mt-4 animate-pulse uppercase tracking-wider font-sans">
                                        SCANNING COURIER NODES...
                                    </p>
                                </div>
                                
                                <div className="md:col-span-2 space-y-4">
                                    <h3 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-emerald-600" />
                                        Geospatial Courier Search
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Querying vetted transporters via the <span className="font-semibold text-slate-800">Mappls Geo API</span> within a <span className="text-emerald-600 font-semibold">5.0 km radius</span> of the source coordinates (<span className="text-slate-800 font-mono text-xs">{selectedDeal.source.lat.toFixed(4)}, {selectedDeal.source.lng.toFixed(4)}</span>).
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 text-xs font-sans text-slate-500 pt-3 border-t border-slate-100">
                                        <div>Target Hub: <span className="font-semibold text-slate-800">{selectedDeal.source.address.split(',')[0].toUpperCase()}</span></div>
                                        <div>Scan Area: <span className="font-semibold text-emerald-600">5,000 Meters</span></div>
                                        <div>Active Services: <span className="font-semibold text-slate-800">{loading ? 'Scanning...' : transporters.length}</span></div>
                                        <div>Verification: <span className="font-semibold text-emerald-600">ISO 14001 Safe</span></div>
                                    </div>
                                </div>
                            </div>

                            {/* Nearby Transporters Section */}
                            <div>
                                {/* Loading State */}
                                {loading && (
                                    <div className="flex flex-col items-center justify-center py-16 gap-4 border border-dashed border-slate-200 bg-white rounded-2xl shadow-sm">
                                        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                                        <p className="text-sm text-slate-500 uppercase tracking-widest font-semibold font-sans animate-pulse">Querying Geospatial Database...</p>
                                    </div>
                                )}

                                {/* Error State */}
                                {error && !loading && (
                                    <div className="border border-red-100 bg-red-50 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
                                        <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="font-bold font-display text-red-900 uppercase">Geospatial Scan Failed</p>
                                            <p className="text-xs text-red-700 mt-1">{error}</p>
                                        </div>
                                        <Button variant="outline" className="border-red-200 hover:bg-red-100 text-red-800 text-xs font-semibold rounded-xl cursor-pointer" onClick={() => loadTransporters(selectedDeal)}>
                                            Retry Scan
                                        </Button>
                                    </div>
                                )}

                                {/* Empty State */}
                                {!loading && !error && transporters.length === 0 && (
                                    <div className="border border-slate-100 p-12 text-center bg-white rounded-2xl shadow-sm">
                                        <Truck className="w-10 h-10 text-slate-300 mx-auto mb-3 opacity-50" />
                                        <p className="font-bold font-display text-slate-800 uppercase">No Vetted Couriers Found</p>
                                        <p className="text-xs text-slate-500 mt-1">Try updating the source coordinate vectors or increasing the search radius threshold.</p>
                                    </div>
                                )}

                                {/* Results Grid */}
                                {!loading && !error && transporters.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {transporters.map((transporter) => (
                                            <div key={transporter.id} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[240px] hover:border-emerald-100 hover:-translate-y-0.5 group">
                                                <div className="space-y-4">
                                                    {/* Top Info Header */}
                                                    <div className="flex justify-between items-start gap-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                                                                <User className="w-5 h-5 text-slate-500 group-hover:text-emerald-600 transition-colors" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-bold font-display text-slate-800 text-sm leading-tight truncate max-w-[140px]">{transporter.name}</p>
                                                                <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mt-0.5">{transporter.vehicle || 'Logistics Partner'}</p>
                                                            </div>
                                                        </div>
                                                        {transporter.rating !== "—" && (
                                                            <span className="text-[10px] font-bold bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                                                                ★ {transporter.rating}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Address */}
                                                    {transporter.address && (
                                                        <p className="text-xs text-slate-500 line-clamp-2 border-t border-slate-50 pt-3">
                                                            {transporter.address}
                                                        </p>
                                                    )}

                                                    {/* Distance Offset */}
                                                    <div className="flex justify-between text-xs border-t border-slate-50 pt-3">
                                                        <span className="text-slate-400 font-medium">Distance Offset:</span>
                                                        <span className="font-semibold text-slate-800">{transporter.distance}</span>
                                                    </div>
                                                </div>

                                                {/* Interactive Buttons */}
                                                <div className="pt-4 flex flex-col gap-2">
                                                    {transporter.phone && transporter.phone !== "Not available" ? (
                                                        <Button 
                                                            variant="outline" 
                                                            className="w-full gap-2 justify-center border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 rounded-xl text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-all font-sans cursor-pointer h-10"
                                                            onClick={() => window.location.href = `tel:${transporter.phone.replace(/[^0-9+]/g, '')}`}
                                                        >
                                                            <Phone className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                                                            Call {transporter.phone}
                                                        </Button>
                                                    ) : (
                                                        <p className="text-[11px] text-center text-slate-400 italic py-2 rounded-xl bg-slate-50 border border-slate-100">
                                                            Contact Number Unavailable
                                                        </p>
                                                    )}
                                                    {transporter.website && (
                                                        <Button 
                                                            variant="outline" 
                                                            className="w-full gap-2 justify-center border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-xl text-xs font-medium cursor-pointer h-9 transition-colors"
                                                            onClick={() => window.open(`https://${transporter.website}`, '_blank')}
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                                            Visit Website
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-6 p-4 border border-emerald-100 bg-emerald-50/50 rounded-xl flex gap-3 text-sm text-emerald-800 items-start">
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="font-bold text-emerald-900 font-display">Dispatcher Instructions</p>
                                        <p className="text-xs text-emerald-700 leading-normal">
                                            Please contact your selected logistics provider directly to negotiate delivery rates, schedule specific pickup hours, and finalize hazardous materials compliance clearances for physical transport.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}