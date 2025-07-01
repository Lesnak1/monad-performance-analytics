import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Database, Clock, Users, FileText, AlertTriangle } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Privacy() {
  const sections = [
    {
      title: 'Information We Collect',
      icon: Database,
      content: [
        'Blockchain analytics data (public blockchain information)',
        'Usage patterns and performance metrics',
        'Technical information about your device and browser',
        'IP addresses for security and analytics purposes',
        'Cookies and similar tracking technologies'
      ]
    },
    {
      title: 'How We Use Your Information',
      icon: Eye,
      content: [
        'Provide real-time blockchain analytics and monitoring',
        'Improve platform performance and user experience',
        'Ensure security and prevent fraud',
        'Comply with legal obligations',
        'Communicate important updates and notifications'
      ]
    },
    {
      title: 'Data Protection & Security',
      icon: Lock,
      content: [
        'Industry-standard encryption for data transmission',
        'Regular security audits and vulnerability assessments',
        'Access controls and authentication systems',
        'Data minimization and anonymization practices',
        'Secure cloud infrastructure with backup systems'
      ]
    },
    {
      title: 'Your Rights',
      icon: Users,
      content: [
        'Access your personal data and usage information',
        'Request correction of inaccurate data',
        'Delete your account and associated data',
        'Data portability and export options',
        'Opt-out of non-essential communications'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-800">
      <Header />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue/10 via-transparent to-monad-300/10"></div>
          
          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <Shield className="w-20 h-20 text-green-400 mx-auto mb-8" />
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-6">
                Privacy Policy
              </h1>
              <p className="text-xl text-white/80 leading-relaxed mb-8">
                Your privacy is our priority. This policy explains how we collect, use, and protect your data 
                while providing world-class blockchain analytics services.
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-white/60">
                <Clock className="w-4 h-4" />
                <span>Last updated: December 2024</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              
              {/* Overview */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="glass-strong rounded-3xl p-8 mb-12"
              >
                <AlertTriangle className="w-12 h-12 text-yellow-400 mb-6" />
                <h2 className="text-3xl font-bold text-white mb-6">Privacy Overview</h2>
                <p className="text-white/80 text-lg leading-relaxed mb-6">
                  MPAS (Monad Performance Analytics System) is committed to protecting your privacy and ensuring 
                  transparency in our data practices. As a blockchain analytics platform, we handle public 
                  blockchain data alongside some personal information to provide our services.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-subtle rounded-xl p-4 text-center">
                    <Lock className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-white font-semibold">Encrypted</div>
                    <div className="text-white/60 text-sm">End-to-end security</div>
                  </div>
                  <div className="glass-subtle rounded-xl p-4 text-center">
                    <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-white font-semibold">GDPR Compliant</div>
                    <div className="text-white/60 text-sm">EU data protection</div>
                  </div>
                  <div className="glass-subtle rounded-xl p-4 text-center">
                    <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-white font-semibold">User Control</div>
                    <div className="text-white/60 text-sm">Your data, your choice</div>
                  </div>
                </div>
              </motion.div>

              {/* Main Sections */}
              <div className="space-y-12">
                {sections.map((section, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="glass-subtle rounded-2xl p-8"
                  >
                    <div className="flex items-center space-x-4 mb-6">
                      <section.icon className="w-10 h-10 text-cyber-blue" />
                      <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                    </div>
                    <ul className="space-y-3">
                      {section.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-cyber-blue rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-white/80">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>

              {/* Additional Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="glass-subtle rounded-2xl p-8"
                >
                  <FileText className="w-10 h-10 text-green-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-4">Cookies & Tracking</h3>
                  <p className="text-white/80 mb-4">
                    We use essential cookies to ensure platform functionality and optional analytics cookies 
                    to improve user experience. You can control cookie preferences in your browser settings.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Essential Cookies</span>
                      <span className="text-green-400">Always Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Analytics Cookies</span>
                      <span className="text-yellow-400">Optional</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Marketing Cookies</span>
                      <span className="text-red-400">Disabled</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="glass-subtle rounded-2xl p-8"
                >
                  <Database className="w-10 h-10 text-blue-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-4">Data Retention</h3>
                  <p className="text-white/80 mb-4">
                    We retain data only as long as necessary to provide services or comply with legal obligations. 
                    You can request data deletion at any time.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Account Data</span>
                      <span className="text-cyan-400">Until deletion request</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Analytics Data</span>
                      <span className="text-cyan-400">26 months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Security Logs</span>
                      <span className="text-cyan-400">90 days</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Contact Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="glass-strong rounded-3xl p-8 mt-12 text-center"
              >
                <h2 className="text-3xl font-bold text-white mb-6">Questions About Your Privacy?</h2>
                <p className="text-white/80 text-lg mb-8">
                  We're here to help. Contact our privacy team for any questions or concerns about your data.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <a
                    href="/contact"
                    className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors"
                  >
                    Contact Privacy Team
                  </a>
                  <a
                    href="/user-guide"
                    className="px-8 py-4 glass border border-white/20 text-white hover:bg-white/10 rounded-xl transition-colors"
                  >
                    Data Management Guide
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
} 