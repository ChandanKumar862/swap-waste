import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BarChart3, Package, TrendingUp, AlertCircle, FileText, BadgeCheck, ArrowRight, Truck, ClipboardList, Plus, Pencil, X, Trash2, MessageSquare, Send, Sparkles, Loader2 } from "lucide-react"
import { Button } from "../components/Button"
import { Link } from "react-router-dom"
import { api, BASE_URL } from "../lib/api"
import { useAuth } from "../context/AuthContext"
import { io } from "socket.io-client"

function MatchRing({ percent }) {
    const radius = 20
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (percent / 100) * circumference
    const color = percent >= 90 ? "text-emerald-600" : percent >= 75 ? "text-amber-500" : "text-orange-500"
    return (
        <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: 56, height: 56 }}>
            <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
                <circle cx="28" cy="28" r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-100" />
                <motion.circle
                    cx="28" cy="28" r={radius} fill="none" strokeWidth="4" strokeLinecap="round"
                    className={color}
                    stroke="currentColor"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
            </svg>
            <span className={`absolute text-xs font-bold font-display ${color}`}>{percent}%</span>
        </div>
    )
}

export default function Dashboard() {
    const { user } = useAuth()
    const [requirements, setRequirements] = useState([])
    const [loadingReqs, setLoadingReqs] = useState(true)
    const [activeTab, setActiveTab] = useState("requirements")

    // Deals & Marketplace state
    const [myListings, setMyListings] = useState([])
    const [marketplaceListings, setMarketplaceListings] = useState([])
    const [deals, setDeals] = useState([])
    const [totalCO2, setTotalCO2] = useState(0)
    const [transportStatus, setTransportStatus] = useState({}) // dealId -> "Pending" | "Completed"

    // Socket.IO state
    const [socket, setSocket] = useState(null)
    const fetchDealsRef = useRef(null)

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editId, setEditId] = useState(null)

    // Chat state
    const [activeChat, setActiveChat] = useState(null) // Deal object
    const activeChatRef = useRef(null)
    useEffect(() => {
        activeChatRef.current = activeChat
    }, [activeChat])

    const [messages, setMessages] = useState([])
    const messagesEndRef = useRef(null)

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    const [newMessage, setNewMessage] = useState("")
    const [formData, setFormData] = useState({ material: "", qty: "", priority: "Medium" })
    const [isSubmitting, setIsSubmitting] = useState(false)

    // AI Matches state
    const [aiMatchesModal, setAiMatchesModal] = useState({ open: false, reqId: null, material: null })
    const [aiMatchesData, setAiMatchesData] = useState([])
    const [aiMatchesLoading, setAiMatchesLoading] = useState(false)

    useEffect(() => {
        const socketUrl = BASE_URL
        const newSocket = io(socketUrl)
        setSocket(newSocket)

        if (user) {
            newSocket.emit("identify", user.id || user._id)
        }

        newSocket.on("new_deal", (data) => {
            fetchDealsRef.current?.()
        })

        newSocket.on("deal_updated", (data) => {
            if (data.deal) {
                setDeals(prev => prev.map(d =>
                    d._id === data.deal._id ? { ...d, status: data.deal.status } : d
                ))
            }
            fetchDealsRef.current?.()
        })

        newSocket.on("deal_deleted", (data) => {
            if (data.dealId) {
                setDeals(prev => prev.filter(d => d._id !== data.dealId))
            }
            fetchDealsRef.current?.()
        })

        newSocket.on("chat_message", (message) => {
            setMessages(prev => {
                if (prev.some(m => m._id && m._id === message._id)) return prev
                const optimisticIdx = prev.findIndex(m =>
                    m._id?.startsWith("opt-") &&
                    m.sender_id === message.sender_id &&
                    m.text === message.text
                )
                if (optimisticIdx !== -1) {
                    const next = [...prev]
                    next[optimisticIdx] = message
                    return next
                }
                return [...prev, message]
            })
        })

        return () => newSocket.disconnect()
    }, [user])

    useEffect(() => {
        fetchRequirements()
        fetchMyListings()
        fetchMarketplace()
        fetchDeals()
    }, [user])

    const fetchRequirements = async () => {
        try {
            const res = await api.get("/api/requirements")
            setRequirements(Array.isArray(res) ? res : [])
        } catch (err) {
            console.error("Failed to fetch requirements:", err)
        } finally {
            setLoadingReqs(false)
        }
    }

    const fetchMyListings = async () => {
        if (!user) return
        try {
            const res = await api.get(`/api/waste-profiles?user_id=${user.id || user._id}`)
            setMyListings(Array.isArray(res) ? res : [])
        } catch (err) {
            console.error("Failed to fetch my listings:", err)
        }
    }

    const fetchMarketplace = async () => {
        try {
            const res = await api.get("/api/marketplace")
            setMarketplaceListings(Array.isArray(res) ? res : [])
        } catch (err) {
            console.error("Failed to fetch marketplace listings:", err)
        }
    }

    const fetchDeals = async () => {
        try {
            const openDeals = await api.get("/api/deals")
            const dealsArr = Array.isArray(openDeals) ? openDeals : []
            setDeals(dealsArr)

            const co2Sum = dealsArr.reduce((acc, deal) => acc + (deal.co2_saved || 0), 0)
            setTotalCO2(co2Sum)
        } catch (err) {
            console.error("Failed to fetch deals:", err)
        }
    }

    useEffect(() => {
        fetchDealsRef.current = fetchDeals
    })

    const handleInitiateDeal = async (listingId, quantityStr) => {
        const numQty = parseFloat(quantityStr) || 1;
        try {
            await api.post("/api/deals", { listing_id: listingId, quantity: numQty })
            alert("B2B circular transaction initiated! Partner node has been notified in real-time.")
            fetchDealsRef.current?.()
        } catch (err) {
            console.error(err)
            alert("Failed to initiate circular exchange.")
        }
    }

    const handleApproveDeal = async (dealId) => {
        setDeals(prev => prev.map(d =>
            d._id === dealId ? { ...d, status: "Completed" } : d
        ))
        try {
            await api.put(`/api/deals/${dealId}/status`, { status: "Completed" })
            fetchDealsRef.current?.()
        } catch (err) {
            console.error(err)
            alert("Failed to approve transaction contract.")
            fetchDealsRef.current?.()
        }
    }

    const handleDeleteDeal = async (dealId) => {
        if (!window.confirm("Are you sure you want to cancel and remove this exchange pipeline?")) {
            return
        }

        // Optimistic UI update
        setDeals(prev => prev.filter(d => d._id !== dealId))

        try {
            await api.delete(`/api/deals/${dealId}`)
            fetchDealsRef.current?.()
        } catch (err) {
            console.error(err)
            alert("Failed to cancel exchange pipeline: " + (err.message || err))
            fetchDealsRef.current?.()
        }
    }

    const handleOpenAiMatches = async (req) => {
        setAiMatchesModal({ open: true, reqId: req._id, material: req.material })
        setAiMatchesLoading(true)
        setAiMatchesData([])
        try {
            const res = await api.get(`/api/requirements/${req._id}/matches`)
            setAiMatchesData(Array.isArray(res) ? res : [])
        } catch (err) {
            console.error("Failed to fetch AI matches:", err)
            alert("AI circular matching service is currently resolving. Please try again.")
        } finally {
            setAiMatchesLoading(false)
        }
    }

    const closeAiMatches = () => {
        setAiMatchesModal({ open: false, reqId: null, material: null })
        setAiMatchesData([])
    }

    const handleOpenModal = (req = null) => {
        if (req) {
            setEditId(req._id)
            setFormData({ material: req.material, qty: req.qty, priority: req.priority })
        } else {
            setEditId(null)
            setFormData({ material: "", qty: "", priority: "Medium" })
        }
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditId(null)
    }

    const fetchChatHistory = async (dealId) => {
        try {
            const res = await api.get(`/api/messages/${dealId}`)
            setMessages(res || [])
        } catch (err) {
            console.error("Failed to fetch chat:", err)
            setMessages([])
        }
    }

    const handleOpenChat = (deal) => {
        setActiveChat(deal)
        fetchChatHistory(deal._id)
        if (socket) {
            socket.emit("join_chat", deal._id)
        }
    }

    const handleCloseChat = () => {
        if (socket && activeChat) {
            socket.emit("leave_chat", activeChat._id)
        }
        setActiveChat(null)
        setMessages([])
    }

    const handleSendMessage = (e) => {
        e.preventDefault()
        if (!newMessage.trim() || !socket || !activeChat || !user) return

        const dealId = activeChat._id
        const senderId = user.id || user._id
        const text = newMessage

        const optimisticMsg = {
            _id: `opt-${Date.now()}`,
            deal_id: dealId,
            sender_id: senderId,
            text,
            createdAt: new Date().toISOString()
        }
        setMessages(prev => [...prev, optimisticMsg])
        setNewMessage("")

        socket.emit("send_message", { deal_id: dealId, sender_id: senderId, text })
    }

    const handleSaveRequirement = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            if (editId) {
                await api.put(`/api/requirements/${editId}`, formData)
            } else {
                await api.post("/api/requirements", formData)
            }
            await fetchRequirements()
            handleCloseModal()
        } catch (err) {
            console.error("Failed to save requirement:", err)
            alert(err.message || "Failed to save requirement record.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteRequirement = async (id) => {
        if (!window.confirm("Are you sure you want to remove this requirement?")) return
        try {
            await api.delete(`/api/requirements/${id}`)
            await fetchRequirements()
        } catch (err) {
            console.error("Failed to delete requirement:", err)
            alert(err.message || "Failed to delete requirement.")
        }
    }

    const handleMarkTransportComplete = async (dealId) => {
        setTransportStatus(prev => ({ ...prev, [dealId]: "Completed" }))
    }

    const handleOpenCompliancePdf = async (dealId) => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${BASE_URL}/api/deals/${dealId}/compliance-pdf`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!res.ok) throw new Error("Failed to fetch compliance PDF")
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            window.open(url, "_blank")
        } catch (err) {
            console.error("Failed to open compliance PDF:", err)
            alert("Could not load secure compliance document. Please try again.")
        }
    }

    return (
        <div className="space-y-8 relative font-sans text-slate-800">
            {/* Ambient Background Blur */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none z-0" />

            {/* Dashboard Header Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-6 relative z-10">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-bold text-emerald-600 tracking-wider font-display">Active Swap Node • Verified Hub</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-none font-display">
                        Operations Dashboard
                    </h1>
                    <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
                        Manage industrial byproduct listings, coordinate verified recycling partnerships, review automated AI matches, and audit environmental compliance records.
                    </p>
                </div>
                <Link to="/list-waste" className="w-full md:w-auto shrink-0">
                    <Button className="w-full md:w-auto text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-500/10 transition-all h-11 px-5 border-none cursor-pointer">
                        List New Material
                    </Button>
                </Link>
            </div>

            {/* MAIN HUD LAYOUT: 2-COLUMN SPLIT DECK */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                
                {/* LEFT COLUMN: BIO-TELEMETRY & LOGISTICS UNIT */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Panel 1: Operations Telemetry */}
                    <div className="hud-panel p-6 space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <span className="text-xs font-bold text-slate-800 tracking-wider font-display uppercase">Sustainability Impact</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold tracking-wide">ONLINE</span>
                        </div>

                        {/* Impact Rings */}
                        <div className="flex justify-around items-center py-2">
                            <div className="flex flex-col items-center">
                                <div className="relative flex items-center justify-center" style={{ width: 84, height: 84 }}>
                                    <svg width="84" height="84" viewBox="0 0 84 84" className="-rotate-90">
                                        <circle cx="42" cy="42" r="34" fill="none" stroke="#f1f5f9" strokeWidth="5" />
                                        <motion.circle
                                            cx="42"
                                            cy="42"
                                            r="34"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="5"
                                            strokeLinecap="round"
                                            className="text-indigo-600"
                                            strokeDasharray={2 * Math.PI * 34}
                                            initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                                            animate={{ strokeDashoffset: (2 * Math.PI * 34) * (1 - Math.min(totalCO2 / 1000, 1)) }}
                                            transition={{ duration: 1.2, ease: "easeOut" }}
                                        />
                                    </svg>
                                    <div className="absolute flex flex-col items-center justify-center text-center">
                                        <span className="text-base font-bold text-slate-900 font-display">{totalCO2.toFixed(0)}t</span>
                                        <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">SAVED</span>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-600 mt-2.5 uppercase tracking-wide font-display">CO₂ Diverted</span>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="relative flex items-center justify-center" style={{ width: 84, height: 84 }}>
                                    <svg width="84" height="84" viewBox="0 0 84 84" className="-rotate-90">
                                        <circle cx="42" cy="42" r="34" fill="none" stroke="#f1f5f9" strokeWidth="5" />
                                        <motion.circle
                                            cx="42"
                                            cy="42"
                                            r="34"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="5"
                                            strokeLinecap="round"
                                            className="text-emerald-500"
                                            strokeDasharray={2 * Math.PI * 34}
                                            initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                                            animate={{ strokeDashoffset: (2 * Math.PI * 34) * 0.15 }}
                                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                                        />
                                    </svg>
                                    <div className="absolute flex flex-col items-center justify-center text-center">
                                        <span className="text-base font-bold text-slate-900 font-display">98.4%</span>
                                        <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">INTEG</span>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-600 mt-2.5 uppercase tracking-wide font-display">Swap Yield</span>
                            </div>
                        </div>

                        {/* Numeric stat reads */}
                        <div className="space-y-3 border-t border-slate-100 pt-4 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Enterprise Node:</span>
                                <span className="font-semibold text-slate-800 uppercase text-xs">{user?.name || "Factory Partner"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Active Listings:</span>
                                <span className="font-semibold text-slate-800 text-xs">{myListings.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Open Trades:</span>
                                <span className="font-semibold text-emerald-600 text-xs">{deals.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">API Response Time:</span>
                                <span className="font-semibold text-emerald-600 text-xs">14 ms</span>
                            </div>
                        </div>
                    </div>

                    {/* Panel 2: Active Logistics Radar */}
                    <div className="hud-panel p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <span className="text-xs font-bold text-slate-800 tracking-wider font-display uppercase">Logistics Pipeline</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold tracking-wide">ACTIVE</span>
                        </div>

                        {/* Concurring circular radar sweep grid */}
                        <div className="relative w-40 h-40 mx-auto border border-slate-100 rounded-full flex items-center justify-center bg-slate-50/50 overflow-hidden radar-sweep">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none" />
                            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-slate-200" />
                            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-slate-200" />
                            <div className="absolute w-32 h-32 border border-dashed border-slate-200 rounded-full" />
                            <div className="absolute w-20 h-20 border border-slate-200 rounded-full" />
                            <div className="absolute w-10 h-10 border border-dashed border-slate-200 rounded-full" />

                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.4, 1, 0.4] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className="absolute top-1/3 left-1/4 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"
                            />
                            <motion.div
                                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }}
                                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.5 }}
                                className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1]"
                            />
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.9, 0.5] }}
                                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut", delay: 1 }}
                                className="absolute top-1/4 right-1/4 w-1.5 h-1.5 bg-rose-500 rounded-full shadow-[0_0_6px_#f43f5e]"
                            />

                            <div className="absolute bottom-2 text-[9px] font-semibold text-slate-500 tracking-wider">ROUTING SYSTEM</div>
                        </div>

                        {/* Logistics alert quick panel */}
                        <div className="border border-slate-100 bg-slate-50 p-3.5 rounded-xl text-xs space-y-1.5">
                            <span className="text-[10px] text-indigo-600 font-bold tracking-wider uppercase font-display">Active Carrier</span>
                            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                                <span>Transit Status:</span>
                                <span className="font-semibold text-slate-800 uppercase">On Schedule</span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-normal">
                                Tata Motors cargo pickup scheduled in <strong className="text-slate-800 font-semibold">2 hours</strong>.
                            </p>
                        </div>
                    </div>

                    {/* Alert Panel: Urgent compliance task notification if missing docs exists */}
                    <div className="border border-rose-100 bg-rose-50/50 p-5 rounded-2xl space-y-2.5">
                        <div className="flex items-center gap-2 text-rose-700 font-semibold text-xs font-display">
                            <AlertCircle className="w-4 h-4 text-rose-600 animate-pulse" />
                            <span>COMPLIANCE ACTION REQUIRED</span>
                        </div>
                        <p className="text-xs text-rose-700/80 leading-normal">
                            Our automated audit flagged <strong className="font-semibold text-rose-800">1 missing transfer note</strong>. Confirm active trades to finalize carbon credits.
                        </p>
                        <button 
                            onClick={() => setActiveTab("compliance")}
                            className="text-xs text-rose-700 hover:text-white font-semibold tracking-wide uppercase border border-rose-200 hover:bg-rose-600 hover:border-rose-600 px-3 py-1.5 rounded-lg transition-all mt-1 w-full text-center bg-white shadow-sm cursor-pointer"
                        >
                            Access Audit Records
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN: DYNAMIC OPERATIONS DECK */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* Custom console tab bar selector */}
                    <div className="flex flex-wrap border border-slate-200 bg-white/80 backdrop-blur-md rounded-2xl p-1.5 gap-1.5 relative shadow-sm">
                        {[
                            { id: "requirements", label: "Requirements" },
                            { id: "listings", label: "My Listings" },
                            { id: "marketplace", label: "Marketplace" },
                            { id: "swaps", label: "Active Trades" },
                            { id: "compliance", label: "Compliance Logs" }
                        ].map((tab) => {
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 min-w-[120px] text-center py-2.5 px-4 rounded-xl transition-all duration-300 font-semibold text-xs tracking-wide font-display cursor-pointer ${
                                        isActive
                                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                                            : "bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>

                    {/* Dynamic Tabs Content Deck */}
                    <div className="min-h-[500px]">
                        
                        {/* TAB 1: REQUIREMENTS PANE */}
                        {activeTab === "requirements" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 font-display">Material Requirements</h3>
                                        <p className="text-xs text-slate-500">List byproducts your factory needs. Our AI pipeline matches corresponding waste streams in real-time.</p>
                                    </div>
                                    <Button 
                                        onClick={() => handleOpenModal()}
                                        className="text-xs font-semibold tracking-wide bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm transition-all h-9 cursor-pointer border-none px-4"
                                    >
                                        Add Requirement
                                    </Button>
                                </div>

                                {loadingReqs ? (
                                    <div className="flex items-center justify-center py-16 text-slate-400 text-xs font-semibold">
                                        <Loader2 className="h-5 w-5 animate-spin text-emerald-600 mr-2" /> Scanning active database...
                                    </div>
                                ) : requirements.length === 0 ? (
                                    <div className="hud-panel p-12 text-center text-slate-500 space-y-4">
                                        <p className="text-sm">No manufacturing requirements loaded in database.</p>
                                        <Button variant="outline" size="sm" onClick={() => handleOpenModal()} className="rounded-xl font-semibold text-xs border border-slate-200 hover:bg-slate-50 px-4 h-9 cursor-pointer">
                                            Register First Requirement
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {requirements.map((req, i) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.05 * i }}
                                                key={req._id}
                                                className="hud-panel p-5 flex flex-col justify-between h-44 hover:-translate-y-0.5"
                                            >
                                                <div>
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-bold text-sm text-slate-900 font-display">{req.material}</h4>
                                                        <span className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 border rounded-full ${
                                                            req.priority === "High" 
                                                                ? "bg-rose-50 text-rose-700 border-rose-200" 
                                                                : req.priority === "Medium"
                                                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                        }`}>
                                                            {req.priority} Priority
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-2">
                                                        Monthly Quantity Target: <span className="text-slate-800 font-semibold">{req.qty}</span>
                                                    </p>
                                                    <div className="mt-3">
                                                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider rounded-full px-2.5 py-0.5 border ${
                                                            req.matched 
                                                                ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                                                                : 'text-slate-500 bg-slate-50 border-slate-200'
                                                        }`}>
                                                            {req.matched ? (
                                                                <>
                                                                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                                                                    AI Match Found
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />
                                                                    Searching Market...
                                                                </>
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-4">
                                                    <Button 
                                                        size="sm" 
                                                        onClick={() => handleOpenAiMatches(req)}
                                                        className="h-8 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all px-3 cursor-pointer border-none shadow-sm shadow-emerald-500/10"
                                                    >
                                                        <Sparkles className="w-3.5 h-3.5 mr-1 inline" /> Match Insights
                                                    </Button>
                                                    <div className="flex items-center gap-1">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            className="h-8 w-8 p-0 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 cursor-pointer" 
                                                            onClick={() => handleOpenModal(req)}
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            className="h-8 w-8 p-0 border border-rose-200 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer" 
                                                            onClick={() => handleDeleteRequirement(req._id)}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* TAB 2: MY LISTINGS (SELLING) */}
                        {activeTab === "listings" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 font-display">Byproduct Sales Listings</h3>
                                        <p className="text-xs text-slate-500">Your listed manufacturing waste, byproducts, and secondary resources actively cataloged in the open market.</p>
                                    </div>
                                    <Link to="/list-waste">
                                        <Button className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm transition-all h-9 cursor-pointer border-none px-4">
                                            Create New Listing
                                        </Button>
                                    </Link>
                                </div>

                                {myListings.length === 0 ? (
                                    <div className="hud-panel p-12 text-center text-slate-500 space-y-4">
                                        <p className="text-sm">No sales listings registered in active directory.</p>
                                        <Link to="/list-waste">
                                            <Button variant="outline" size="sm" className="rounded-xl font-semibold text-xs border border-slate-200 hover:bg-slate-50 px-4 h-9 cursor-pointer">
                                                Create First Listing
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {myListings.map((listing, i) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.05 * i }}
                                                key={listing._id}
                                                className="hud-panel p-5 flex items-center justify-between border-l-4 border-l-emerald-500 hover:-translate-x-1"
                                            >
                                                <div className="space-y-1">
                                                    <p className="font-bold text-sm text-slate-900 font-display">{listing.waste_type}</p>
                                                    <p className="text-xs text-slate-500">
                                                        Rate: <strong className="text-slate-800 font-semibold">{listing.average_quantity_per_month} {listing.unit}</strong> per month
                                                    </p>
                                                    <span className="inline-flex items-center text-[10px] font-semibold text-indigo-700 uppercase tracking-wider border border-indigo-100 bg-indigo-50 rounded-full px-2.5 py-0.5 mt-2">
                                                        Active Supply Stream
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100 tracking-wide uppercase">Active</span>
                                                    <p className="text-[10px] text-slate-400 mt-2">Listed: {listing.createdAt?.substring(0, 10)}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* TAB 3: MARKETPLACE */}
                        {activeTab === "marketplace" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 font-display">B2B Circular Marketplace</h3>
                                    <p className="text-xs text-slate-500">Secondary resources and clean byproducts listed by other verified industry partners. Initiate exchange contracts directly.</p>
                                </div>

                                {marketplaceListings.length === 0 ? (
                                    <div className="hud-panel p-12 text-center text-slate-500">
                                        <p className="text-sm">No circular listings cataloged in active directory matching node parameters.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {marketplaceListings.map((item, i) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.05 * i }}
                                                key={item._id}
                                                className="hud-panel p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-slate-100"
                                            >
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                                        <h4 className="font-bold text-sm text-slate-900 font-display">{item.waste_type}</h4>
                                                        <span className="text-[10px] text-emerald-700 font-semibold uppercase border border-emerald-100 bg-emerald-50 rounded-full px-2.5 py-0.5">
                                                            ~{item.potential_co2_savings_per_ton?.toFixed(1)}t CO₂ Saved/t
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500">
                                                        Origin: <strong className="text-slate-700 font-semibold">{item.user_id?.name || item.factory_id?.name || "Verified Partner"}</strong> • Location: <strong className="text-slate-700 font-semibold">{item.factory_id?.city || "Maharashtra Hub"}</strong>
                                                    </p>
                                                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 flex-wrap pt-1">
                                                        <span className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-0.5 text-slate-700 text-[10px]">Supply: {item.average_quantity_per_month} /mo</span>
                                                        <span className="flex items-center gap-1 text-emerald-600 text-[10px] uppercase">
                                                            <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" /> Audited Byproduct Stream
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button 
                                                    size="sm" 
                                                    className="w-full md:w-auto flex-shrink-0 text-xs font-semibold h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-500/10 transition-all px-4 cursor-pointer border-none" 
                                                    onClick={() => handleInitiateDeal(item._id, item.average_quantity_per_month)}
                                                >
                                                    Initiate Exchange <ArrowRight className="w-3.5 h-3.5 ml-1.5 inline" />
                                                </Button>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* TAB 4: ACTIVE SWAPS */}
                        {activeTab === "swaps" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 font-display">Active Exchange Pipelines</h3>
                                    <p className="text-xs text-slate-500">Bilateral logistics agreements currently in progress. Access live telemetry coordinates and chat logs.</p>
                                </div>

                                {deals.length === 0 ? (
                                    <div className="hud-panel p-12 text-center text-slate-500">
                                        <p className="text-sm">No open swap agreements currently active in pipeline.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {deals.map((deal, i) => {
                                            const isSeller = user && deal.seller_id && (deal.seller_id._id === user.id || deal.seller_id._id === user._id)
                                            const isPending = deal.status === "Pending"
                                            const isCompleted = deal.status === "Completed"
                                            const transport = transportStatus[deal._id] || "Pending"
                                            const transportDone = transport === "Completed"

                                            return (
                                                <div 
                                                    key={deal._id} 
                                                    className={`hud-panel p-5 border-l-4 ${isCompleted ? 'border-l-emerald-500' : 'border-l-rose-500'} space-y-4 hover:shadow-md`}
                                                >
                                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 gap-4">
                                                        <div>
                                                            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-display">
                                                                {isSeller ? "Supply Contract" : "Procurement Contract"}
                                                            </span>
                                                            <h4 className="font-bold text-base text-slate-900 font-display mt-0.5">
                                                                {deal.listing_id?.waste_type || "Secondary Material"}
                                                            </h4>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[10px] font-bold uppercase tracking-wide border px-2.5 py-0.5 rounded-full ${
                                                                isCompleted 
                                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                                                    : "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                                                            }`}>
                                                                {deal.status}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-500 py-1 font-display">
                                                        <div>
                                                            Volume Diverted: <strong className="text-slate-800 font-semibold">{deal.quantity} tons</strong>
                                                        </div>
                                                        <div>
                                                            Audited Carbon Saved: <strong className="text-emerald-600 font-bold">{deal.co2_saved?.toFixed(1)} tons CO₂</strong>
                                                        </div>
                                                        <div>
                                                            Partner Node: <strong className="text-slate-800 font-semibold">{isSeller ? deal.buyer_id?.name || "Verified Buyer" : deal.seller_id?.name || "Verified Seller"}</strong>
                                                        </div>
                                                    </div>

                                                    {/* Transport Section for Completed deals */}
                                                    {isCompleted && (
                                                        <div className="border border-slate-100 bg-slate-50 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                                                                    transportDone 
                                                                        ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
                                                                        : "bg-amber-100 text-amber-800 border-amber-200"
                                                                }`}>
                                                                    <Truck className="w-3.5 h-3.5" />
                                                                    Logistics: {transport === "Completed" ? "Delivered" : "Dispatched"}
                                                                </span>

                                                                {transportDone && (
                                                                    <button
                                                                        onClick={() => handleOpenCompliancePdf(deal._id)}
                                                                        className="inline-flex items-center gap-1.5 text-[10px] text-indigo-700 hover:text-white font-bold uppercase tracking-wider border border-indigo-200 hover:bg-indigo-600 hover:border-indigo-600 px-2.5 py-1 rounded-lg bg-white ml-2 transition-all cursor-pointer shadow-sm"
                                                                    >
                                                                        <FileText className="w-3.5 h-3.5 text-indigo-500" />
                                                                        Audit Document
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {!transportDone && (
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline" 
                                                                    className="h-8 text-[11px] font-semibold border-slate-200 bg-white hover:bg-slate-50 rounded-lg cursor-pointer text-slate-700 px-3" 
                                                                    onClick={() => handleMarkTransportComplete(deal._id)}
                                                                >
                                                                    <Truck className="w-3.5 h-3.5 mr-1.5 inline" /> Confirm Delivery
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                                                        <div className="flex items-center gap-2">
                                                            {isSeller && isPending && (
                                                                <Button 
                                                                    size="sm" 
                                                                    className="h-8 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 border-none text-white rounded-lg transition-all px-3 cursor-pointer shadow-sm shadow-emerald-500/10" 
                                                                    onClick={() => handleApproveDeal(deal._id)}
                                                                >
                                                                    Approve Trade Contract
                                                                </Button>
                                                            )}
                                                            <button 
                                                                type="button" 
                                                                onClick={() => handleDeleteDeal(deal._id)}
                                                                className="inline-flex items-center gap-1.5 h-8 px-3 text-[11px] font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-100 rounded-lg transition-all cursor-pointer bg-white"
                                                                aria-label="Cancel Swap Pipeline"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" /> Cancel Swap
                                                            </button>
                                                        </div>
                                                        
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="h-8 gap-1.5 text-[11px] border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-lg font-semibold cursor-pointer px-3" 
                                                            onClick={() => handleOpenChat(deal)}
                                                        >
                                                            <MessageSquare className="w-3.5 h-3.5 mr-1.5 inline text-slate-400" /> Open Chat Channel
                                                        </Button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* TAB 5: COMPLIANCE DOCUMENTS */}
                        {activeTab === "compliance" && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 font-display">Compliance & Audit Archives</h3>
                                    <p className="text-xs text-slate-500">Auto-generated transfer certificates. Digitally signed and cataloged against national circular offset records.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[1, 2, 3].map((doc) => (
                                        <div 
                                            key={doc} 
                                            onClick={() => alert("Compliance transfer certificate fetched from secure registry hub.")}
                                            className="hud-panel p-4 flex items-center gap-3 cursor-pointer border border-slate-200 hover:border-emerald-500 hover:shadow-sm"
                                        >
                                            <div className="p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl shrink-0">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-900 truncate">Transfer_Certificate_#90{doc}</p>
                                                <p className="text-[10px] text-slate-400 mt-1">Audit status: Approved</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" className="w-full text-xs font-semibold border-slate-200 bg-white hover:bg-slate-50 rounded-xl py-3 mt-4 cursor-pointer text-slate-600">
                                    View Environmental Audit Ledger
                                </Button>
                            </motion.div>
                        )}

                    </div>
                </div>
            </div>

            {/* Custom Styled Add/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl relative overflow-hidden font-sans"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
                            <form onSubmit={handleSaveRequirement} className="space-y-5 pt-2">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <h2 className="font-bold text-slate-900 text-lg font-display">
                                        {editId ? "Update Material Requirement" : "Add Material Requirement"}
                                    </h2>
                                    <button 
                                        type="button" 
                                        onClick={handleCloseModal} 
                                        className="rounded-lg w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-all border-none bg-transparent cursor-pointer"
                                        aria-label="Close Modal"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 font-display">Material Class</label>
                                        <select
                                            name="material"
                                            value={formData.material}
                                            onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800 dark:text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer dark:bg-slate-900 dark:border-slate-800"
                                            required
                                        >
                                            <option value="" disabled className="bg-white dark:bg-slate-900 text-slate-400">Select Raw Input Stream</option>
                                            <option value="Plastic" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Plastic</option>
                                            <option value="Aluminum" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Aluminum</option>
                                            <option value="Steel" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Steel</option>
                                            <option value="Paper" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Paper</option>
                                            <option value="Glass" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Glass</option>
                                            <option value="Copper" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Copper</option>
                                            <option value="Cement" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Cement</option>
                                            <option value="FlyAsh" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Fly Ash</option>
                                            <option value="TextileWaste" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Textile Waste</option>
                                            <option value="ElectronicWaste" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Electronic Waste</option>
                                            <option value="Rubber" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Rubber</option>
                                            <option value="Wood" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Wood</option>
                                            <option value="Slag" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Slag</option>
                                            <option value="BatteryWaste" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Battery Waste</option>
                                            <option value="ChemicalSolvent" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Chemical Solvent</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 font-display">Target Monthly Quantity</label>
                                        <input
                                            required
                                            type="text"
                                            className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                                            placeholder="e.g. 50 tons, 1000 Litres"
                                            value={formData.qty}
                                            onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 font-display">Priority Tier</label>
                                        <select
                                            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800 dark:text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer dark:bg-slate-900 dark:border-slate-800"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        >
                                            <option value="Low" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Low Priority</option>
                                            <option value="Medium" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Medium Priority</option>
                                            <option value="High" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">High Priority</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
                                    <Button type="button" variant="outline" className="rounded-xl text-xs font-semibold border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer h-9 px-4" onClick={handleCloseModal} disabled={isSubmitting}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer h-9 px-4 border-none shadow-sm shadow-emerald-500/10" disabled={isSubmitting}>
                                        {isSubmitting ? "Saving..." : "Save Record"}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Styled AI Matches Modal */}
            <AnimatePresence>
                {aiMatchesModal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] relative overflow-hidden font-sans"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
                            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl">
                                        <Sparkles className="h-5 w-5 animate-pulse" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-slate-900 text-base leading-tight font-display">AI Circular Stream Matches</h2>
                                        <p className="text-xs text-slate-400 mt-0.5">Automated matches identified for material target: {aiMatchesModal.material}</p>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={closeAiMatches} 
                                    className="rounded-lg w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-all border-none bg-transparent cursor-pointer"
                                    aria-label="Close Matches"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-5 overflow-y-auto flex-1 bg-slate-50/30 space-y-4">
                                {aiMatchesLoading ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-4">
                                        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                                        <p className="text-xs font-semibold">Calculating matching efficiency paths...</p>
                                    </div>
                                ) : aiMatchesData.length === 0 ? (
                                    <div className="text-center py-12 text-slate-400 border border-dashed rounded-2xl border-slate-200 p-6 bg-white">
                                        <p className="font-semibold text-slate-700 text-sm">No matching supply streams active</p>
                                        <p className="text-xs text-slate-400 mt-1">Circular monitors will flag matching factory nodes automatically when they join the pool.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {aiMatchesData.map((match, i) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }} 
                                                animate={{ opacity: 1, y: 0 }} 
                                                transition={{ delay: 0.05 * i }}
                                                key={match._id}
                                                className={`p-5 rounded-2xl bg-white border transition-all hover:border-emerald-300 hover:shadow-md ${
                                                    i === 0 ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/20' : 'border-slate-200 shadow-sm'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 space-y-3">
                                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                                            <h3 className="font-bold text-sm text-slate-900 font-display flex items-center gap-2">
                                                                {match.waste_type}
                                                                {i === 0 && <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 border border-emerald-200 rounded-full font-bold uppercase tracking-wide">Top Match</span>}
                                                            </h3>
                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                <span className="text-xl font-bold text-emerald-600 font-display">{match.match_percentage}% Score</span>
                                                            </div>
                                                        </div>

                                                        <p className="text-xs text-slate-500 border-l-2 border-emerald-500 pl-3 py-0.5 italic bg-slate-50 rounded-r-lg font-medium">
                                                            "{match.match_reason}"
                                                        </p>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-xs border-t border-slate-100 pt-3 text-slate-500">
                                                            <div>Supplier: <span className="font-semibold text-slate-800">{match.factory_id?.name || match.user_id?.name || "Verified Partner"}</span></div>
                                                            <div>Location: <span className="font-semibold text-slate-800">{match.factory_id?.city || "Maharashtra"}</span></div>
                                                            <div>Quantity: <span className="font-semibold text-slate-800">{match.average_quantity_per_month} {match.unit}</span></div>
                                                            <div className="text-emerald-700 font-semibold flex items-center gap-1"><BadgeCheck className="w-4 h-4 text-emerald-500 inline" /> ~{match.potential_co2_savings_per_ton?.toFixed(1)}t CO₂ saved per ton</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-4 pt-3 border-t border-slate-100">
                                                    <Button 
                                                        size="sm" 
                                                        className="w-full gap-2 text-xs font-semibold h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-500/10 cursor-pointer border-none" 
                                                        onClick={() => { closeAiMatches(); handleInitiateDeal(match._id, match.average_quantity_per_month); }}
                                                    >
                                                        Initiate Exchange Contract <ArrowRight className="w-4 h-4 ml-1 inline" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Styled Chat modal */}
             <AnimatePresence>
                 {activeChat && (
                     <div 
                         className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm"
                         onClick={handleCloseChat}
                     >
                         <motion.div
                             onClick={(e) => e.stopPropagation()}
                             initial={{ x: "100%" }}
                             animate={{ x: 0 }}
                             exit={{ x: "100%" }}
                             transition={{ type: "spring", stiffness: 300, damping: 30 }}
                             className="w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full font-sans"
                         >
                             {/* Chat Header */}
                             <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                                 <div>
                                     <h3 className="font-bold flex items-center gap-2 text-sm text-slate-900 dark:text-slate-100 font-display">
                                         <MessageSquare className="w-4 h-4 text-emerald-600 animate-pulse" /> Secure Chat Channel
                                     </h3>
                                     <p className="text-xs text-slate-400 dark:text-slate-450 mt-0.5">
                                         Listing: {activeChat.listing_id?.waste_type} • Volume: {activeChat.quantity} tons
                                     </p>
                                 </div>
                                 <button 
                                     type="button"
                                     onClick={handleCloseChat} 
                                     className="rounded-lg w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-650 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-all border-none bg-transparent cursor-pointer"
                                     aria-label="Close Chat"
                                 >
                                     <X className="w-4.5 h-4.5" />
                                 </button>
                             </div>

                             {/* Messages Container */}
                             <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col min-h-0 bg-slate-50/30 dark:bg-slate-950/20">
                                 {messages.map((msg) => {
                                     const isMe = user && (msg.sender_id === (user.id || user._id))
                                     return (
                                         <div key={msg._id} className={`flex flex-col max-w-[85%] ${isMe ? "self-end items-end" : "self-start items-start"}`}>
                                             <div className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                                                 isMe 
                                                     ? "bg-emerald-600 text-white rounded-br-none shadow-sm" 
                                                     : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm"
                                             }`}>
                                                 {msg.text}
                                             </div>
                                             <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 tracking-wide">
                                                 {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                             </span>
                                         </div>
                                     )
                                 })}
                                 <div ref={messagesEndRef} />
                             </div>

                             {/* Chat Input */}
                             <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                 <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                     <input
                                         type="text"
                                         placeholder="Type secure message..."
                                         className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                         value={newMessage}
                                         onChange={(e) => setNewMessage(e.target.value)}
                                     />
                                     <Button type="submit" size="icon" className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white border-none w-10 h-10 flex-shrink-0 cursor-pointer shadow-md shadow-emerald-500/10" disabled={!newMessage.trim()}>
                                         <Send className="w-4 h-4 text-white" />
                                     </Button>
                                 </form>
                             </div>
                         </motion.div>
                     </div>
                 )}
             </AnimatePresence>
        </div>
    )
}
