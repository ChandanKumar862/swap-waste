import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Recycle, MapPin, FileCheck, CheckCircle2, ShieldAlert, FileText, ArrowRight, ArrowLeft, ChevronDown, X } from "lucide-react"
import { Button } from "../components/Button"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { api } from "../lib/api"

export default function Register() {
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [licenseFile, setLicenseFile] = useState(null)
    const [selectedTargets, setSelectedTargets] = useState([])
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: "", industryType: "", location: "", email: "", password: ""
    })
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    useEffect(() => {
        if (!isDropdownOpen) return;
        const handleOutsideClick = (e) => {
            if (!e.target.closest(".custom-multiselect")) {
                setIsDropdownOpen(false);
            }
        };
        window.addEventListener("click", handleOutsideClick);
        return () => window.removeEventListener("click", handleOutsideClick);
    }, [isDropdownOpen]);

    const toggleTarget = (target) => {
        if (selectedTargets.includes(target)) {
            setSelectedTargets(selectedTargets.filter(t => t !== target))
        } else {
            setSelectedTargets([...selectedTargets, target])
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setIsSubmitting(true)
        try {
            // Step 1: Create user account
            const data = await api.post("/api/auth/register", {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: "factory_manager"
            })
            login(data.token, data.user)

            // Step 2: Create factory profile — best-effort, won't block registration
            try {
                const factoryData = new FormData();
                factoryData.append("name", formData.name);
                factoryData.append("industry_type", formData.industryType || "Other");
                factoryData.append("email", formData.email);
                factoryData.append("city", formData.location.split(",")[0]?.trim() || "");
                factoryData.append("state", formData.location.split(",")[1]?.trim() || "");
                factoryData.append("circular_targets", JSON.stringify(selectedTargets));
                if (licenseFile) {
                    factoryData.append("licenseFile", licenseFile);
                }
                await api.post("/api/factories", factoryData)
            } catch (factoryErr) {
                console.warn("Factory profile creation failed (non-fatal):", factoryErr.message)
            }

            setStep(3) // Show success screen
        } catch (err) {
            setError(err.message || "Registration failed. Please check inputs.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-xl mx-auto py-12 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none z-0" />
            
            <div className="mb-8 text-center relative z-10 space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl shadow-sm">
                    <Recycle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100/50">Factory Onboarding</span>
                    <h1 className="text-3xl font-display font-extrabold text-slate-900 leading-tight">Register Your Facility</h1>
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">Join our high-trust circular network to securely swap byproducts with nearby verified factories.</p>
            </div>

            {/* Custom Steps Matrix */}
            <div className="grid grid-cols-3 gap-2.5 text-xs relative z-10 w-full mb-8">
                {[
                    { n: 1, label: "Core Facility Details" },
                    { n: 2, label: "Compliance & Clearance" },
                    { n: 3, label: "Onboarding Finalized" }
                ].map(item => {
                    const isActive = step === item.n
                    const isPassed = step > item.n
                    return (
                        <div 
                            key={item.n} 
                            className={`py-3 px-1.5 rounded-2xl border text-center transition-all font-semibold text-[11px] tracking-tight ${
                                isActive 
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                                    : isPassed
                                        ? "bg-white border-slate-200 text-emerald-600"
                                        : "bg-slate-50 border-slate-200/60 text-slate-400"
                            }`}
                        >
                            <span className="block font-bold text-xs">Step 0{item.n}</span>
                            <span className="hidden sm:inline-block text-[10px] mt-0.5">{item.label}</span>
                        </div>
                    )
                })}
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="relative z-10">
                        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl shadow-slate-100/40">
                            <form className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Factory / Facility Name</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleChange}
                                        className="flex h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-450 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                                        placeholder="e.g. Nagpur Metal Refinery" 
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Industrial Sector</label>
                                    <select 
                                        name="industryType" 
                                        value={formData.industryType} 
                                        onChange={handleChange}
                                        className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-1.5 text-sm text-slate-800 dark:text-slate-100 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all dark:bg-slate-900/60 dark:border-slate-800 cursor-pointer"
                                    >
                                        <option value="" className="text-slate-400 bg-white dark:bg-slate-900">Select industry classification...</option>
                                        <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Cement</option>
                                        <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Steel / Metal</option>
                                        <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Textile</option>
                                        <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Pharmaceutical</option>
                                        <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Chemical</option>
                                        <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Agriculture & Food</option>
                                    </select>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Geographical Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                                        <input 
                                            type="text" 
                                            name="location" 
                                            value={formData.location} 
                                            onChange={handleChange}
                                            className="flex h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-450 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                                            placeholder="City, State" 
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Corporate Email</label>
                                        <input 
                                            type="email" 
                                            name="email" 
                                            value={formData.email} 
                                            onChange={handleChange}
                                            className="flex h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-450 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                                            placeholder="admin@factory.com" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Account Password</label>
                                        <input 
                                            type="password" 
                                            name="password" 
                                            value={formData.password} 
                                            onChange={handleChange}
                                            className="flex h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-450 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                                            placeholder="••••••••" 
                                        />
                                    </div>
                                </div>
                            </form>
                            
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-100 pt-5 mt-6">
                                <p className="text-xs text-slate-500">
                                    Already have an account? <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors">Sign In</Link>
                                </p>
                                <Button 
                                    onClick={() => setStep(2)} 
                                    disabled={!formData.name || !formData.email || !formData.password}
                                    className="w-full sm:w-auto rounded-2xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white h-11 px-6 shadow-md transition-all"
                                >
                                    Proceed to Compliance <ArrowRight className="w-4 h-4 ml-1.5" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="relative z-10">
                        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl shadow-slate-100/40">
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="space-y-2 relative custom-multiselect">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide">Primary Circular Output Targets</label>
                                    
                                    {/* Trigger Button Field */}
                                    <div 
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                setIsDropdownOpen(!isDropdownOpen);
                                            } else if (e.key === "Escape") {
                                                setIsDropdownOpen(false);
                                            }
                                        }}
                                        tabIndex={0}
                                        className={`flex min-h-11 w-full items-center justify-between rounded-2xl border px-4 py-2.5 text-sm text-slate-800 transition-all cursor-pointer focus:outline-none dark:text-slate-300 ${
                                            isDropdownOpen 
                                                ? "border-emerald-500 bg-white ring-2 ring-emerald-500/10 dark:border-emerald-500 dark:bg-slate-900" 
                                                : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-slate-700"
                                        }`}
                                    >
                                        {selectedTargets.length === 0 ? (
                                            <span className="text-slate-400 text-xs">Select circular output targets...</span>
                                        ) : (
                                            <div className="flex flex-wrap gap-1.5 max-w-[90%]">
                                                {selectedTargets.map(target => (
                                                    <span 
                                                        key={target} 
                                                        className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-bold px-2.5 py-0.5 rounded-full dark:bg-emerald-950/40 dark:border-emerald-900/60 dark:text-emerald-300"
                                                    >
                                                        {target}
                                                        <button 
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleTarget(target);
                                                            }}
                                                            className="hover:bg-emerald-100 dark:hover:bg-emerald-900 p-0.5 rounded-full text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer"
                                                        >
                                                            <X className="w-2.5 h-2.5" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </div>
 
                                    {/* Dropdown Options List */}
                                    <AnimatePresence>
                                        {isDropdownOpen && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                                transition={{ duration: 0.18, ease: "easeOut" }}
                                                className="absolute left-0 right-0 z-50 mt-2 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/30 dark:shadow-black/50 rounded-2xl p-1.5 max-h-60 overflow-y-auto scrollbar-thin"
                                            >
                                                {[
                                                    "Mineral Waste / Ash",
                                                    "Chemical / Hazardous Liquids",
                                                    "Organic Byproducts / Biomass",
                                                    "Thermal Surpluses",
                                                    "Scrap Metals"
                                                ].map((target) => {
                                                    const isSelected = selectedTargets.includes(target);
                                                    return (
                                                        <div
                                                            key={target}
                                                            onClick={() => toggleTarget(target)}
                                                            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                                                                isSelected 
                                                                    ? "bg-emerald-50/70 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300" 
                                                                    : "text-slate-700 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-800/50"
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all duration-200 ${
                                                                    isSelected 
                                                                        ? "bg-emerald-600 border-emerald-600 text-white dark:bg-emerald-500 dark:border-emerald-500" 
                                                                        : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                                                                }`}>
                                                                    {isSelected && (
                                                                        <svg className="w-2.5 h-2.5 stroke-[3] stroke-current" fill="none" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                                <span>{target}</span>
                                                            </div>
                                                            {isSelected && (
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <p className="text-[10px] text-slate-450 font-medium">Click above to open the dropdown menu and select targets for your facility.</p>
                                </div>

                                <div className="border-2 border-dashed border-slate-200 p-6 text-center space-y-4 bg-slate-50/50 rounded-2xl relative hover:border-emerald-300 transition-colors">
                                    <div className="mx-auto w-10 h-10 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                                        <FileCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 tracking-tight">Upload Industrial License</h3>
                                        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                                            Clearance certification documents verify factory safety regulations (PDF or JPEG format supported).
                                        </p>
                                    </div>
                                    <div>
                                        <input
                                            type="file"
                                            id="licenseUpload"
                                            className="hidden"
                                            accept=".pdf,.png,.jpg,.jpeg"
                                            onChange={(e) => setLicenseFile(e.target.files[0])}
                                        />
                                        <label htmlFor="licenseUpload">
                                            <Button type="button" variant="outline" size="sm" asChild className="rounded-xl text-xs font-bold border-slate-200 hover:bg-slate-100/50 h-9 px-4 cursor-pointer">
                                                <span>{licenseFile ? licenseFile.name.substring(0, 20) + "..." : "Select Certificate File"}</span>
                                            </Button>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3.5">
                                    <input type="checkbox" id="terms" className="rounded-md border-slate-350 text-emerald-600 h-4.5 w-4.5 focus:ring-0 focus:outline-none accent-emerald-600 cursor-pointer" required />
                                    <label htmlFor="terms" className="text-xs font-semibold text-slate-600 tracking-tight cursor-pointer select-none">
                                        I authorize compliance data exchanges for auditing swaps.
                                    </label>
                                </div>

                                {error && (
                                    <div className="text-xs text-red-750 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 flex items-start gap-2.5 leading-relaxed">
                                        <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5 animate-pulse" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="flex justify-between pt-5 border-t border-slate-100">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => setStep(1)} 
                                        disabled={isSubmitting}
                                        className="rounded-xl text-xs font-bold border-slate-200 hover:bg-slate-50 text-slate-600 h-11 px-5"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white h-11 px-6 shadow-md shadow-emerald-500/10 border-0 transition-all"
                                    >
                                        {isSubmitting ? "Activating Vault..." : "Seal Registration"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 pb-12 relative z-10">
                        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl shadow-slate-100/40 text-center space-y-6">
                            <div className="mx-auto w-16 h-16 bg-emerald-50 border-2 border-emerald-500 text-emerald-600 rounded-2xl flex items-center justify-center mb-2 animate-bounce-slow">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100/50">Establishment Finalized</span>
                                <h2 className="text-2xl font-display font-extrabold text-slate-900 leading-tight">Registration Complete</h2>
                            </div>
                            <p className="text-xs md:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                                Your factory node is now authorized on the Swap Waste marketplace. Welcome to verified B2B material exchanges.
                            </p>
                            <div className="pt-4">
                                <Button 
                                    onClick={() => navigate("/dashboard")}
                                    className="rounded-2xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white h-12 px-8 shadow-md shadow-slate-900/10"
                                >
                                    Go to Dashboard
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
