import { Link, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { LogOut, Home, TrendingDown, TrendingUp, Menu, X } from "lucide-react";
import logo from "../assets/logo-serg.png"

function Nav() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { path: "/home", label: "Accueil", icon: Home },
    { path: "/min", label: "Dijkstra Min", icon: TrendingDown },
    { path: "/max", label: "Dijkstra Max", icon: TrendingUp },
  ];

  return (
    <>
      {/* Barre de navigation */}
      <nav className={`
        fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300
        w-[95%] rounded-2xl
        ${isScrolled
          ? "bg-slate-900/95 shadow-lg backdrop-blur-md"
          : "bg-slate-900 shadow-md"
        }
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link
              to="/home"
              className="flex items-center space-x-3 group flex-shrink-0 transition-all duration-300 hover:scale-105"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <img
                  src={logo}
                  alt="Logo"
                  className="w-10 h-10 object-contain relative z-10 transition-transform duration-300 group-hover:rotate-6"
                />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Tag
              </h1>
            </Link>

            {/* Desktop Navigation - Centré */}
            <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
              <div className="flex items-center space-x-1 bg-white/10 rounded-full p-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`
                        relative px-5 py-2 rounded-full transition-all duration-300 font-medium flex items-center space-x-2
                        ${isActive(link.path)
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105"
                          : "text-gray-300 hover:text-white hover:bg-white/10"
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Desktop Déconnexion */}
            <Link
              to="/"
              className="hidden md:flex px-4 py-2 rounded-full text-red-400 hover:text-white hover:bg-red-500 transition-all duration-300 font-medium items-center space-x-2 flex-shrink-0 group border border-red-400/30 hover:border-transparent"
            >
              <LogOut className="w-4 h-4 transition-transform group-hover:rotate-12" />
              <span>Déconnexion</span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors relative z-50"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`
          md:hidden fixed inset-0 z-40 bg-slate-900/98 backdrop-blur-md transition-all duration-300
          ${isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"}
        `}>
          <div className="flex flex-col items-center justify-center min-h-screen space-y-4 p-4">

            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    w-full max-w-xs px-6 py-4 rounded-xl transition-all duration-300 font-medium flex items-center justify-center space-x-3 text-lg
                    ${isActive(link.path)
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg scale-105"
                      : "bg-white/10 text-gray-200 hover:bg-white/20 hover:text-white hover:scale-105"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full max-w-xs px-6 py-4 rounded-xl transition-all duration-300 font-medium flex items-center justify-center space-x-3 text-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500 hover:text-white hover:scale-105"
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </Link>

          </div>
        </div>
      </nav>

      {/* Espace pour compenser la navbar fixe */}
   

      {/* Contenu principal */}
      <main className="min-h-screen from-gray-900 via-gray-800 to-gray-900">
        <div className="w-full animate-fadeIn">
          <Outlet />
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </>
  );
}

export default Nav;