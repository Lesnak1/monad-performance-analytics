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
  Mail,
  Book,
  Users,
  Shield,
  TrendingUp
} from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const links = {
    product: [
      { name: 'Dashboard', href: '/', icon: TrendingUp },
      { name: 'Benchmarks', href: '/benchmarks', icon: Code },
      { name: 'Analytics', href: '/#analytics', icon: Globe },
      { name: 'Export Tools', href: '/#export', icon: ExternalLink }
    ],
    monad: [
      { name: 'Monad Official', href: 'https://monad.xyz', external: true },
      { name: 'Testnet Explorer', href: 'https://monad-testnet.socialscan.io', external: true },
      { name: 'Documentation', href: 'https://docs.monad.xyz', external: true },
      { name: 'GitHub', href: 'https://github.com/monad-labs', external: true }
    ],
    community: [
      { name: 'Discord', href: '#', icon: Users },
      { name: 'Telegram', href: '#', icon: Mail },
      { name: 'Twitter', href: '#', icon: Twitter },
      { name: 'GitHub', href: '#', icon: Github }
    ],
    legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
      { name: 'Security', href: '#', icon: Shield }
    ]
  }

  return (
    <footer className="relative z-10 mt-24">
      {/* Gradient Border */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyber-blue to-transparent opacity-50"></div>
      
      <div className="glass-strong border-t border-white/10">
        <div className="container mx-auto px-6 py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            
            {/* Brand Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-cyber-gradient rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">MPAS</h3>
                  <p className="text-xs text-monad-300">Monad Performance Analytics</p>
                </div>
              </div>
              
              <p className="text-sm text-white/70 leading-relaxed">
                Real-time performance insights from the world's fastest EVM blockchain. 
                Built for the Monad community with ❤️
              </p>
              
              <div className="flex items-center space-x-2 text-xs text-white/60">
                <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
                <span>Live Testnet Data</span>
              </div>
            </motion.div>

            {/* Product Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3">
                {links.product.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href}
                      className="flex items-center space-x-2 text-white/60 hover:text-cyber-blue transition-colors group"
                    >
                      {link.icon && <link.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                      <span className="text-sm">{link.name}</span>
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
              <h4 className="text-white font-semibold mb-4">Monad Ecosystem</h4>
              <ul className="space-y-3">
                {links.monad.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href}
                      target={link.external ? "_blank" : "_self"}
                      rel={link.external ? "noopener noreferrer" : ""}
                      className="flex items-center space-x-2 text-white/60 hover:text-monad-300 transition-colors group"
                    >
                      <span className="text-sm">{link.name}</span>
                      {link.external && <ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform" />}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Community & Legal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              {/* Community */}
              <div>
                <h4 className="text-white font-semibold mb-4">Community</h4>
                <div className="flex items-center space-x-3">
                  {links.community.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      className="p-2 glass rounded-lg hover:bg-white/10 transition-colors group"
                      title={link.name}
                    >
                      <link.icon className="w-4 h-4 text-white/60 group-hover:text-cyber-blue transition-colors" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Legal */}
              <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <ul className="space-y-2">
                  {links.legal.map((link, index) => (
                    <li key={index}>
                      <a 
                        href={link.href}
                        className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors"
                      >
                        {link.icon && <link.icon className="w-3 h-3" />}
                        <span className="text-xs">{link.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Bottom Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-8 border-t border-white/10"
          >
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              
              {/* Copyright */}
              <div className="flex items-center space-x-2 text-white/60 text-sm">
                <span>© {currentYear} MPAS. Made with</span>
                <Heart className="w-4 h-4 text-red-400 animate-pulse" />
                <span>for the Monad community</span>
              </div>

              {/* Network Status */}
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
                  <span className="text-white/60">Monad Testnet</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Book className="w-3 h-3 text-white/40" />
                  <span className="text-white/60">v1.0.0</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Animated Background Element */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-blue via-monad-300 to-purple-500 opacity-50"></div>
      </div>
    </footer>
  )
} 