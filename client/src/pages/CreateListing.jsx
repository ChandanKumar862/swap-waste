/* eslint-disable no-unused-vars */
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "../components/Card"
import { Button } from "../components/Button"
import { CheckCircle2, Factory, Calendar, ShieldAlert, Cpu, ArrowLeft, ArrowRight, Activity, Plus } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { api } from "../lib/api"

export default function CreateListing() {
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()
    const { user } = useAuth()

    const [formData, setFormData] = useState({
        waste_type: "",
        waste_category: "Mineral Waste",
        average_quantity_per_month: "",
        unit: "Tons / month",
        frequency: "Continuous / Recurring",
        hazardous: false,
        hazard_level: "no",
        storage_condition: "dry",
        available_from: "",
        transport_required: true,
        location: "",
        expected_price: "",
    })

    const handle = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
    }

    const handleNext = (e) => { e.preventDefault(); setStep(s => s + 1) }
    const handleBack = () => setStep(s => s - 1)
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setIsSubmitting(true)
        try {
            await api.post("/api/waste-profiles", {
                user_id: user.id || user._id,
                factory_id: user.factory_id || user.id || user._id,
                waste_type: formData.waste_type,
                waste_category: formData.waste_category,
                average_quantity_per_month: parseFloat(formData.average_quantity_per_month) || 0,
                unit: formData.unit,
                hazardous: formData.hazard_level !== "no",
                storage_condition: formData.storage_condition,
            })
            setIsSuccess(true)
        } catch (err) {
            setError(err.message || "Failed to submit listing. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto mt-20 text-center space-y-6"
            >
                <div className="bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-100/40 text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-emerald-50 border-2 border-emerald-500 text-emerald-600 rounded-2xl flex items-center justify-center mb-2 animate-bounce-slow dark:bg-emerald-950/20">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div className="space-y-1">
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40">Resource Node Live</span>
                        <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-slate-100 leading-tight">Listing Created!</h2>
                    </div>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                        Your secondary resource node has been successfully cataloged. The circular matching engine is now scanning the ecosystem for compatible buyer profiles.
                    </p>
                    <div className="pt-4 flex gap-3 justify-center">
                        <Button 
                            onClick={() => { setIsSuccess(false); setStep(1); setFormData({ ...formData, waste_type: "" }) }} 
                            variant="outline"
                            className="rounded-xl text-xs font-bold border-slate-200 text-slate-650 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/50 h-10 px-4 cursor-pointer"
                        >
                            Add Another Stream
                        </Button>
                        <Link to="/dashboard">
                            <Button className="rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white h-10 px-5 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200 cursor-pointer">
                                Go to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </motion.div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto py-8 space-y-8 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none z-0" />
            
            {/* Form Header */}
            <div className="pb-6 relative z-10 space-y-3 text-center border-b border-slate-100 dark:border-slate-800">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl shadow-sm dark:bg-emerald-950/20 dark:border-emerald-900/30">
                    <Plus className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="space-y-1">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100/50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40">Resource Registration</span>
                    <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                        List New Byproduct
                    </h1>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Provision physical waste material streams. AI analysis will evaluate potential carbon offsets and establish fast circular commerce routes.
                </p>
            </div>

            {/* Custom Steps Progress Matrix */}
            <div className="grid grid-cols-3 gap-2.5 text-xs relative z-10 w-full mb-2">
                {[
                    { n: 1, label: "Byproduct Specifications" },
                    { n: 2, label: "Safety & Audit logs" },
                    { n: 3, label: "Logistics Details" }
                ].map(item => {
                    const isActive = step === item.n
                    const isPassed = step > item.n
                    return (
                        <div 
                            key={item.n} 
                            className={`py-3 px-1.5 rounded-2xl border text-center transition-all font-semibold text-[11px] tracking-tight ${
                                isActive 
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm dark:bg-emerald-950/20 dark:border-emerald-900/60 dark:text-emerald-400"
                                    : isPassed
                                        ? "bg-white border-slate-200 text-emerald-600 dark:bg-slate-900 dark:border-slate-800 dark:text-emerald-400"
                                        : "bg-slate-50 border-slate-250/20 text-slate-400 dark:bg-slate-800/40 dark:border-slate-850 dark:text-slate-500"
                            }`}
                        >
                            <span className="block font-bold text-xs">Step 0{item.n}</span>
                            <span className="hidden sm:inline-block text-[10px] mt-0.5">{item.label}</span>
                        </div>
                    )
                })}
            </div>

            {/* Main Input Form Container */}
            <div className="bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-100/40 dark:shadow-none relative z-10">
                <form onSubmit={step < 3 ? handleNext : handleSubmit} className="space-y-6">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="s1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                                    <Factory className="text-emerald-600 dark:text-emerald-400 w-4.5 h-4.5" />
                                    <h3 className="font-bold text-sm uppercase tracking-wide">Material Core Metrics</h3>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide">Byproduct Species</label>
                                        <select 
                                            name="waste_type" 
                                            value={formData.waste_type} 
                                            onChange={handle}
                                            className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-1.5 text-sm text-slate-800 dark:text-slate-100 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all dark:bg-slate-800/40 dark:border-slate-800 dark:focus:bg-slate-900 cursor-pointer"
                                            required
                                        >
                                            <option value="" disabled className="text-slate-400 bg-white dark:bg-slate-900">Select Material...</option>
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
                                    
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide">Recycling Category</label>
                                        <select 
                                            name="waste_category" 
                                            value={formData.waste_category} 
                                            onChange={handle}
                                            className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-1.5 text-sm text-slate-850 dark:text-slate-100 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all dark:bg-slate-800/40 dark:border-slate-800 dark:focus:bg-slate-900 cursor-pointer"
                                        >
                                            <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Mineral Waste</option>
                                            <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Organic</option>
                                            <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Metals</option>
                                            <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Heat / Exothermic</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide">Volume Metric / Month</label>
                                        <input 
                                            type="number" 
                                            name="average_quantity_per_month" 
                                            value={formData.average_quantity_per_month} 
                                            onChange={handle}
                                            placeholder="e.g. 250" 
                                            className="flex h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all dark:bg-slate-800/40 dark:border-slate-850 dark:text-slate-350 dark:focus:bg-slate-900" 
                                            required 
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide">Unit Envelope</label>
                                        <select 
                                            name="unit" 
                                            value={formData.unit} 
                                            onChange={handle}
                                            className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-1.5 text-sm text-slate-850 dark:text-slate-100 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all dark:bg-slate-800/40 dark:border-slate-800 dark:focus:bg-slate-900 cursor-pointer"
                                        >
                                            <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Tons / month</option>
                                            <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">kg / month</option>
                                            <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Liters / month</option>
                                            <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">MWh (for heat)</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="s2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                                    <ShieldAlert className="text-emerald-650 dark:text-emerald-450 w-4.5 h-4.5" />
                                    <h3 className="font-bold text-sm uppercase tracking-wide">Safety & Environment Audit</h3>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide">Toxic / Hazardous Index</label>
                                        <select 
                                            name="hazard_level" 
                                            value={formData.hazard_level} 
                                            onChange={handle}
                                            className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-1.5 text-sm text-slate-850 dark:text-slate-100 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all dark:bg-slate-800/40 dark:border-slate-800 dark:focus:bg-slate-900 cursor-pointer"
                                        >
                                            <option value="no" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">No - Non Hazardous / Clear Stream</option>
                                            <option value="low" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Yes - Low Risk Controlled Byproduct</option>
                                            <option value="high" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Yes - High Risk / Requires Chemical Shielding</option>
                                        </select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide">Storage Containment Protocol</label>
                                        <select 
                                            name="storage_condition" 
                                            value={formData.storage_condition} 
                                            onChange={handle}
                                            className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-1.5 text-sm text-slate-850 dark:text-slate-100 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all dark:bg-slate-800/40 dark:border-slate-800 dark:focus:bg-slate-900 cursor-pointer"
                                        >
                                            <option value="dry" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Dry / Covered Warehouse Enclosure</option>
                                            <option value="sealed" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Sealed Isolation Barrels / Containers</option>
                                            <option value="open" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Open Factory Yard Storage</option>
                                            <option value="temp" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">Temperature Controlled Thermal Vault</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="s3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                                    <Calendar className="text-emerald-650 dark:text-emerald-450 w-4.5 h-4.5" />
                                    <h3 className="font-bold text-sm uppercase tracking-wide">Logistics & Discharge Location</h3>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide">Ready Discharge Date</label>
                                        <input 
                                            type="month" 
                                            name="available_from" 
                                            value={formData.available_from} 
                                            onChange={handle}
                                            className="flex h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all dark:bg-slate-800/40 dark:border-slate-800 dark:text-slate-350 dark:focus:bg-slate-900" 
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide">Discharge Location Node</label>
                                        <input 
                                            type="text" 
                                            name="location" 
                                            value={formData.location} 
                                            onChange={handle}
                                            placeholder="e.g. Nagpur Facility C" 
                                            className="flex h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all dark:bg-slate-800/40 dark:border-slate-800 dark:text-slate-350 dark:focus:bg-slate-900" 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide">Expected Valuation Per Unit (₹)</label>
                                    <div className="relative flex items-center">
                                        <span className="absolute left-4 text-slate-450 text-sm font-bold z-10">₹</span>
                                        <input 
                                            type="number" 
                                            name="expected_price" 
                                            value={formData.expected_price} 
                                            onChange={handle}
                                            placeholder="Leave empty for zero-cost environmental swap"
                                            className="flex h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all dark:bg-slate-800/40 dark:border-slate-800 dark:text-slate-350 dark:focus:bg-slate-900" 
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && (
                        <div className="text-xs text-red-750 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 flex items-start gap-2.5 leading-relaxed dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-400">
                            <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5 animate-pulse" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Form Controls */}
                    <div className="flex justify-between mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                        {step === 1 ? (
                            <Link to="/dashboard">
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    className="rounded-xl text-xs font-bold border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-450 dark:hover:bg-slate-800/50 h-10 px-5 cursor-pointer"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1.5" /> Cancel Swap
                                </Button>
                            </Link>
                        ) : (
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={handleBack} 
                                disabled={isSubmitting}
                                className="rounded-xl text-xs font-bold border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-450 dark:hover:bg-slate-800/50 h-10 px-5 cursor-pointer"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1.5" /> Go Back
                            </Button>
                        )}
                        
                        <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-5 border-none shadow-md shadow-emerald-500/10 transition-all cursor-pointer"
                        >
                            {isSubmitting ? (
                                "Transmitting..."
                            ) : step < 3 ? (
                                <span className="flex items-center gap-1.5">Next Matrix <ArrowRight className="w-4 h-4" /></span>
                            ) : (
                                <span className="flex items-center gap-1.5">Publish Resource Node <Plus className="w-4 h-4 text-emerald-100" /></span>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
