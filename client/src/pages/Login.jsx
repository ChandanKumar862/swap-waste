import { useState } from "react"
import { motion } from "framer-motion"
import { ShieldAlert, KeyRound, Mail, Recycle } from "lucide-react"
import { Card, CardContent } from "../components/Card"
import { Button } from "../components/Button"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { api } from "../lib/api"

export default function Login() {
    const [formData, setFormData] = useState({ email: "", password: "" })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setIsSubmitting(true)
        try {
            const data = await api.post("/api/auth/login", formData)
            login(data.token, data.user)
            navigate("/dashboard")
        } catch (err) {
            setError(err.message || "Invalid credentials. Please verify your email and password.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-md mx-auto py-12 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[90px] pointer-events-none z-0" />
            
            <div className="mb-8 text-center relative z-10 space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl shadow-sm">
                    <Recycle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100/50">Secure Login Portal</span>
                    <h1 className="text-3xl font-display font-extrabold text-slate-900 leading-tight">Welcome Back</h1>
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">Access the circular exchange dashboard to manage your factory byproducts.</p>
            </div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
                <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl shadow-slate-100/40">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
                            </label>
                            <input 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                required
                                className="flex h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                                placeholder="name@company.com" 
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                                <KeyRound className="w-3.5 h-3.5 text-slate-400" /> Password
                            </label>
                            <input 
                                type="password" 
                                name="password" 
                                value={formData.password} 
                                onChange={handleChange} 
                                required
                                className="flex h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none transition-all"
                                placeholder="••••••••" 
                            />
                        </div>

                        {error && (
                            <div className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 flex items-start gap-2.5 leading-relaxed">
                                <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            className="w-full rounded-2xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white py-3.5 shadow-md shadow-slate-950/5 border-0 transition-all mt-4" 
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Authenticating Account..." : "Login to Platform"}
                        </Button>

                        <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-5 mt-6 leading-relaxed">
                            Don't have an enterprise account yet?{" "}
                            <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors">
                                Register Your Factory
                            </Link>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}
