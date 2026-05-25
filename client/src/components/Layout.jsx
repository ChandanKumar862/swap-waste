import { Outlet, Link, useNavigate, useLocation } from "react-router-dom"
import { ThemeToggle } from "./ThemeToggle"
import { Cpu, LogOut, User, Activity, CircleDot, Recycle } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { Button } from "./Button"

export default function Layout() {
    const { isAuthenticated, user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const isActive = (path) => location.pathname === path

    return (
        <div className="min-h-screen flex flex-col items-center bg-background text-foreground transition-colors duration-300">
            {/* Elegant SaaS Top Banner / Live Ticker */}
            <div className="w-full bg-slate-900 py-2 relative z-50 overflow-hidden shadow-sm">
                <div className="ticker-wrap flex items-center">
                    <div className="absolute left-0 bg-emerald-600 px-3 py-1 text-[10px] font-bold tracking-wider text-white flex items-center gap-1.5 z-10 rounded-r-md shadow-sm">
                        <Activity className="h-3 w-3 animate-pulse text-emerald-200" />
                        LIVE SWAP ACTIVITY
                    </div>
                    <div className="ticker-content flex whitespace-nowrap pl-40 gap-12 text-slate-300 text-xs">
                        <span className="ticker-item"><span className="text-emerald-400 font-bold">[VERIFIED SWAP]</span> 45.2t Fly Ash &rarr; Cement Mix (Bengaluru Eco Node 04)</span>
                        <span className="ticker-item"><span className="text-emerald-400 font-bold">[AI PRE-MATCH]</span> 12.8t High-Density Plastic matched with Bio-Recycling Corp</span>
                        <span className="ticker-item"><span className="text-emerald-400 font-bold">[COMPLETED]</span> Copper Slag Swap: 18.5t diverted from landfill</span>
                        <span className="ticker-item"><span className="text-emerald-400 font-bold">[VERIFIED SWAP]</span> 85.0t Chemical Solvents swapped with Industrial Cleaners Ltd</span>
                        <span className="ticker-item"><span className="text-emerald-400 font-bold">[SUSTAINABILITY IMPACT]</span> 14,290.4t total carbon offsets registered in Swap Waste</span>
                    </div>
                </div>
            </div>

            {/* Translucent SaaS Floating Header */}
            <header className="w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md justify-center flex sticky top-0 z-40">
                <div className="container flex h-20 items-center justify-between px-6 w-full max-w-7xl">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative flex items-center justify-center bg-emerald-600 text-white p-2.5 rounded-xl shadow-md shadow-emerald-500/10 group-hover:scale-105 transition-all duration-300">
                            <Recycle className="h-5 w-5 animate-spin-slow" />
                        </div>
                        <span className="font-display font-extrabold text-2xl tracking-tight flex items-center gap-0.5">
                            <span className="text-slate-900 dark:text-slate-100">swap</span>
                            <span className="text-emerald-600">waste</span>
                        </span>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-2">
                        {isAuthenticated ? (
                            <>
                                <Link 
                                    to="/dashboard" 
                                    className={`text-sm font-semibold tracking-wide py-2 px-4 rounded-xl transition-all duration-200 ${
                                        isActive("/dashboard") 
                                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 shadow-sm shadow-emerald-100 dark:shadow-none" 
                                            : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                                    }`}
                                  >
                                    Dashboard
                                </Link>
                                <Link 
                                    to="/list-waste" 
                                    className={`text-sm font-semibold tracking-wide py-2 px-4 rounded-xl transition-all duration-200 ${
                                        isActive("/list-waste") 
                                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 shadow-sm shadow-emerald-100 dark:shadow-none" 
                                             : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                                   }`}
                                >
                                    New Listing
                                </Link>
                                <Link 
                                    to="/forecast" 
                                    className={`text-sm font-semibold tracking-wide py-2 px-4 rounded-xl transition-all duration-200 ${
                                        isActive("/forecast") 
                                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 shadow-sm shadow-emerald-100 dark:shadow-none" 
                                             : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                                    }`}
                                >
                                    AI Forecast
                                </Link>
                                <Link 
                                    to="/docs" 
                                    className={`text-sm font-semibold tracking-wide py-2 px-4 rounded-xl transition-all duration-200 ${
                                        isActive("/docs") 
                                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 shadow-sm shadow-emerald-100 dark:shadow-none" 
                                             : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                                    }`}
                                >
                                    Compliance Docs
                                </Link>
                                <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-3" />
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-800/50 rounded-full px-4 py-2 hover:bg-slate-200/60 dark:hover:bg-slate-750 transition-colors">
                                    <span className="flex h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="uppercase">{user?.name || user?.email}</span>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={handleLogout} 
                                    className="text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50/80 dark:hover:bg-red-950/40 border border-transparent hover:border-red-100 dark:hover:border-red-900 h-9 px-4 rounded-xl transition-all ml-1"
                                >
                                    <LogOut className="h-3.5 w-3.5" />
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link 
                                    to="/login" 
                                    className={`text-sm font-semibold tracking-wide py-2 px-4 rounded-xl transition-all duration-200 ${
                                        isActive("/login") 
                                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 shadow-sm shadow-emerald-100 dark:shadow-none" 
                                             : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                                    }`}
                                >
                                    Sign In
                                </Link>
                                <Link to="/register">
                                    <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700 transition-all font-semibold text-xs tracking-wide rounded-xl px-5 py-2.5 shadow-md shadow-emerald-500/10 border-0">
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </nav>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* Immersive SaaS Layout App Body */}
            <main className="flex-1 w-full max-w-7xl px-6 py-12 relative z-10">
                <Outlet />
            </main>

            {/* High-Trust SaaS Footer */}
            <footer className="border-t border-slate-200 dark:border-slate-800/60 py-16 w-full flex justify-center bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400">
                <div className="container px-6 flex flex-col gap-10 max-w-7xl w-full">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-8">
                        <div className="flex flex-col gap-3 max-w-sm">
                            <span className="font-display font-black text-2xl tracking-tight text-slate-900">swap<span className="text-emerald-600">waste</span></span>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Swap Waste is a premium circular economy platform designed to help industries exchange raw materials, bypass landfills, minimize shipping distances, and track carbon offsets.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
                            <div className="flex flex-col gap-3">
                                <h4 className="text-xs font-bold text-slate-900 tracking-wider uppercase">Platform</h4>
                                <Link to="/dashboard" className="text-xs text-slate-500 hover:text-emerald-600 transition-colors">Marketplace</Link>
                                <Link to="/forecast" className="text-xs text-slate-500 hover:text-emerald-600 transition-colors">AI Predictor</Link>
                                <Link to="/docs" className="text-xs text-slate-500 hover:text-emerald-600 transition-colors">Compliance</Link>
                            </div>
                            <div className="flex flex-col gap-3">
                                <h4 className="text-xs font-bold text-slate-900 tracking-wider uppercase">Sustainability</h4>
                                <span className="text-xs text-slate-500">Audited Swaps</span>
                                <span className="text-xs text-slate-500">Carbon Offsets</span>
                                <span className="text-xs text-slate-500">Zero Landfill Initiative</span>
                            </div>
                            <div className="flex flex-col gap-3 col-span-2 sm:col-span-1">
                                <h4 className="text-xs font-bold text-slate-900 tracking-wider uppercase">Trust</h4>
                                <span className="text-xs text-slate-500">Secured Node Network</span>
                                <span className="text-xs text-slate-500">ISO 14001 Compliant</span>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                        <span>&copy; {new Date().getFullYear()} Swap Waste Platform. All rights reserved.</span>
                        <div className="flex items-center gap-1">
                            <span className="flex h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse mr-1" />
                            <span>ISO 14001 & ISO 9001 Certified System</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
