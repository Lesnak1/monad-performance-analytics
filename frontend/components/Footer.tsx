'use client'
import { motion } from 'framer-motion'
import { 
  Github, 
  Twitter, 
  ExternalLink,
  Zap,
  Heart,
  Code,
  Globe,
  Book,
  Users,
  Shield,
  TrendingUp,
  BarChart3,
  Database,
  Clock,
  Activity,
  Building,
  Lock,
  FileText,
  Cookie,
  Settings,
  HelpCircle
} from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { name: 'Dashboard', href: '/', icon: TrendingUp },
    { name: 'Benchmarks', href: '/benchmarks', icon: BarChart3 },
    { name: 'About', href: '/about', icon: Building },
    { name: 'Contact', href: '/contact', icon: Users },
    { name: 'FAQ', href: '/faq', icon: HelpCircle },
    { name: 'Privacy', href: '/privacy', icon: Lock }
  ]

  const monadLinks = [
    { name: 'Monad Official', href: 'https://monad.xyz', external: true },
    { name: 'Testnet Explorer', href: 'https://monad-testnet.socialscan.io', external: true },
    { name: 'Official Explorer', href: 'https://testnet.monadexplorer.com', external: true },
    { name: 'Documentation', href: 'https://docs.monad.xyz', external: true }
  ]

  const legalLinks = [
    { name: 'Terms', href: '/terms', icon: FileText },
    { name: 'Privacy', href: '/privacy', icon: Lock },
    { name: 'Cookies', href: '/cookies', icon: Cookie },
    { name: 'Security', href: '/security', icon: Shield }
  ]

  return (
    <footer className="relative z-10 mt-16">
      {/* Gradient Border */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyber-blue via-monad-300 to-transparent opacity-60"></div>
      
      <div className="glass-strong border-t border-white/10 relative overflow-hidden">
        
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-cyber-blue/3 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-monad-300/3 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6 py-8 relative">
          
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            
            {/* Brand Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-1"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-cyber-gradient rounded-xl flex items-center justify-center shadow-lg shadow-cyber-blue/30">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-cyber-blue to-monad-300 bg-clip-text text-transparent">
                    MPAS
                  </h3>
                  <p className="text-xs text-monad-300 font-medium">Performance Analytics</p>
                </div>
              </div>
              
              <p className="text-white/70 text-sm mb-4 leading-relaxed">
                Real-time blockchain analytics for the Monad ecosystem.
              </p>
              
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
                <span className="text-white/60">Live Testnet • ~100 TPS</span>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h4 className="text-white font-semibold text-sm mb-4 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-cyber-blue" />
                <span>Platform</span>
              </h4>
              <ul className="space-y-2">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href}
                      className="flex items-center space-x-2 text-white/60 hover:text-cyber-blue transition-colors text-sm group"
                    >
                      <link.icon className="w-3 h-3 group-hover:scale-110 transition-transform" />
                      <span>{link.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Monad Ecosystem */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h4 className="text-white font-semibold text-sm mb-4 flex items-center space-x-2">
                <Globe className="w-4 h-4 text-monad-300" />
                <span>Monad</span>
              </h4>
              <ul className="space-y-2">
                {monadLinks.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href}
                      target={link.external ? "_blank" : "_self"}
                      rel={link.external ? "noopener noreferrer" : ""}
                      className="flex items-center space-x-2 text-white/60 hover:text-monad-300 transition-colors text-sm group"
                    >
                      <Globe className="w-3 h-3 group-hover:scale-110 transition-transform" />
                      <span>{link.name}</span>
                      {link.external && <ExternalLink className="w-2 h-2 opacity-60" />}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Legal & Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h4 className="text-white font-semibold text-sm mb-4 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Legal</span>
              </h4>
              <ul className="space-y-2">
                {legalLinks.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href}
                      className="flex items-center space-x-2 text-white/60 hover:text-emerald-400 transition-colors text-sm group"
                    >
                      <link.icon className="w-3 h-3 group-hover:scale-110 transition-transform" />
                      <span>{link.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Bottom Section - Compact */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 pt-6 border-t border-white/10"
          >
            
            {/* Left: Copyright & Built by */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-white/60 text-sm">
              <div className="flex items-center space-x-2">
                <span>© {currentYear} MPAS. Made with</span>
                <Heart className="w-3 h-3 text-red-400 animate-pulse" />
                <span>for Monad</span>
              </div>
              
              {/* Built by Leknax */}
              <div className="flex items-center space-x-2">
                <span className="text-white/40">•</span>
                <span className="text-white/40">Built by</span>
                <a 
                  href="https://github.com/Lesnak1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-cyber-blue hover:text-monad-300 transition-colors duration-300 flex items-center space-x-1 group"
                >
                  <Code className="w-3 h-3 group-hover:rotate-12 transition-transform" />
                  <span>Leknax</span>
                  <ExternalLink className="w-2 h-2 opacity-60 group-hover:opacity-100" />
                </a>
              </div>
            </div>

            {/* Center: Network Status */}
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-2 px-3 py-1 glass rounded-full">
                <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
                <span className="text-white/70 font-medium">Testnet Live</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 glass rounded-full">
                <Activity className="w-3 h-3 text-white/50" />
                <span className="text-white/50">~100 TPS</span>
              </div>
            </div>

            {/* Right: Social & Version */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-xs text-white/50">
                <Book className="w-3 h-3" />
                <span>v2.0.0</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <a
                  href="https://github.com/Lesnak1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 glass rounded-lg hover:bg-cyber-blue/20 transition-colors group"
                  title="GitHub"
                >
                  <Github className="w-4 h-4 text-white/50 group-hover:text-cyber-blue transition-colors" />
                </a>
                <a
                  href="#"
                  className="p-2 glass rounded-lg hover:bg-blue-500/20 transition-colors group"
                  title="Twitter"
                >
                  <Twitter className="w-4 h-4 text-white/50 group-hover:text-blue-400 transition-colors" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-blue via-monad-300 to-purple-500 opacity-50"></div>
      </div>
    </footer>
  )
} 