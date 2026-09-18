import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, MessageSquare, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { SHOP_INFO } from '../../utils/constants';

export const Navbar = ({ onOpenChat }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdown, setUserDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Collections', path: '/products' },
    { name: 'Store Gallery', path: '/gallery' },
    { name: 'About Shop', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 glass-nav transition-all">
      {/* Top micro-announcement banner with verified store facts */}
      <div className="bg-brand-navy text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-1">
          <span>✨ <strong>Rainbow Ready Mades:</strong> Quality Menswear & Family Clothing • 12 Gandhi Road</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>🚚 Local delivery within 10 km</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">🔄 10-Day Exchanges & Returns</span>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-600 via-accent-500 to-amber-400 flex items-center justify-center text-white font-display font-black text-xl shadow-md shadow-accent-500/20 group-hover:scale-105 transition-transform">
              R
            </div>
            <div>
              <span className="block font-display font-bold text-lg sm:text-xl text-slate-900 tracking-tight leading-none group-hover:text-accent-600 transition-colors">
                {SHOP_INFO.name}
              </span>
              <span className="block text-[11px] font-medium text-slate-700 tracking-wider uppercase mt-0.5">
                Menswear & Retail
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-accent-600 bg-accent-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xs xl:max-w-sm relative">
            <input
              type="text"
              placeholder="Search shirts, trousers, fabrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border border-transparent rounded-full focus:bg-white focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 outline-none transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          {/* Actions: Chatbot, Auth, Cart */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Ask Chatbot Button */}
            {onOpenChat && (
              <button
                onClick={onOpenChat}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-accent-700 bg-accent-50 hover:bg-accent-100 border border-accent-200 rounded-full transition shadow-sm"
                title="Ask Store AI Assistant"
              >
                <MessageSquare className="w-3.5 h-3.5 text-accent-600" />
                <span>Store Assistant</span>
              </button>
            )}

            {/* User Account / Auth Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 uppercase text-[11px]">
                    {user?.full_name ? user.full_name[0] : 'U'}
                  </div>
                  <span className="hidden xl:inline max-w-[100px] truncate">{user?.full_name?.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdown && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 text-sm z-50 animate-in fade-in slide-in-from-top-1"
                    onMouseLeave={() => setUserDropdown(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100 text-xs text-slate-500">
                      Signed in as<br />
                      <strong className="text-slate-800 truncate block">{user?.email}</strong>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdown(false)}
                      className="block px-4 py-2 text-slate-700 hover:bg-slate-50 transition"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setUserDropdown(false)}
                      className="block px-4 py-2 text-slate-700 hover:bg-slate-50 transition"
                    >
                      My Orders & Tracking
                    </Link>
                    <Link
                      to="/returns"
                      onClick={() => setUserDropdown(false)}
                      className="block px-4 py-2 text-slate-700 hover:bg-slate-50 transition"
                    >
                      Returns & Exchanges
                    </Link>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={() => {
                        setUserDropdown(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Shopping Cart Drawer Trigger */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-600 text-white font-bold text-[11px] rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 py-4 px-2 space-y-3 bg-white/95 backdrop-blur-md rounded-b-2xl shadow-xl">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:border-accent-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </form>

            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive(link.path)
                      ? 'text-accent-600 bg-accent-50'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Chatbot trigger in mobile menu */}
            {onOpenChat && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenChat();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-accent-700 bg-accent-50 rounded-lg border border-accent-200"
              >
                <MessageSquare className="w-4 h-4" />
                Ask Store AI Assistant
              </button>
            )}

            {/* User Links on Mobile */}
            <div className="border-t border-slate-200 pt-2 space-y-1">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg"
                  >
                    My Account ({user?.full_name})
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg"
                  >
                    My Orders & Tracking
                  </Link>
                  <Link
                    to="/returns"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg"
                  >
                    Returns & Exchanges
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 text-sm font-medium text-white bg-accent-600 rounded-lg"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
