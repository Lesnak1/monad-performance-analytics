import { motion } from 'framer-motion'
import { FileText, Scale, Users, Shield, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Terms() {
  const sections = [
    {
      title: 'Acceptance of Terms',
      icon: CheckCircle,
      content: [
        'By accessing and using MPAS, you accept and agree to be bound by these Terms of Service',
        'If you do not agree to these terms, please do not use our platform',
        'These terms may be updated periodically, and continued use constitutes acceptance',
        'Users must be at least 18 years old or have parental consent to use this service'
      ]
    },
    {
      title: 'Service Description',
      icon: Info,
      content: [
        'MPAS provides real-time blockchain analytics and performance monitoring for Monad network',
        'Our platform offers data visualization, transaction monitoring, and performance benchmarking',
        'All blockchain data displayed is publicly available information from the Monad network',
        'We strive for accuracy but cannot guarantee 100% uptime or data precision'
      ]
    },
    {
      title: 'User Responsibilities',
      icon: Users,
      content: [
        'Use the platform in compliance with all applicable laws and regulations',
        'Do not attempt to reverse engineer, hack, or exploit our systems',
        'Respect intellectual property rights and do not redistribute our content without permission',
        'Report any security vulnerabilities or bugs through proper channels',
        'Maintain the confidentiality of your account credentials if applicable'
      ]
    },
    {
      title: 'Limitations & Disclaimers',
      icon: AlertCircle,
      content: [
        'MPAS is provided "as-is" without warranties of any kind',
        'We are not liable for investment decisions made based on our analytics',
        'Platform availability may be interrupted for maintenance or technical issues',
        'Data accuracy depends on external blockchain networks and may contain errors',
        'We reserve the right to modify or discontinue services at any time'
      ]
    },
    {
      title: 'Prohibited Activities',
      icon: XCircle,
      content: [
        'Automated scraping or bulk downloading of data without permission',
        'Using the platform for illegal activities or fraud',
        'Attempting to overwhelm our servers with excessive requests',
        'Sharing or reselling access to premium features if applicable',
        'Interfering with other users\' ability to access the platform'
      ]
    },
    {
      title: 'Intellectual Property',
      icon: Shield,
      content: [
        'MPAS platform design, code, and documentation are proprietary',
        'Blockchain data displayed is public information and not subject to our IP claims',
        'Our analytics algorithms and methodologies are trade secrets',
        'Users may not create derivative works without explicit permission',
        'Open source components are governed by their respective licenses'
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
              <Scale className="w-20 h-20 text-blue-400 mx-auto mb-8" />
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
                Terms of Service
              </h1>
              <p className="text-xl text-white/80 leading-relaxed mb-8">
                Clear and fair terms governing your use of MPAS blockchain analytics platform. 
                Please read carefully before using our services.
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-white/60">
                <FileText className="w-4 h-4" />
                <span>Effective Date: December 2024</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Quick Summary */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="glass-strong rounded-3xl p-8 mb-12"
              >
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Terms Summary</h2>
                <p className="text-white/80 text-lg text-center mb-8">
                  Here's what you need to know in simple terms:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="glass-subtle rounded-xl p-6 text-center">
                    <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-4" />
                    <h3 className="text-white font-bold mb-2">Free to Use</h3>
                    <p className="text-white/60 text-sm">Basic analytics features are completely free</p>
                  </div>
                  
                  <div className="glass-subtle rounded-xl p-6 text-center">
                    <Shield className="w-10 h-10 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-white font-bold mb-2">Your Data</h3>
                    <p className="text-white/60 text-sm">We respect your privacy and protect your data</p>
                  </div>
                  
                  <div className="glass-subtle rounded-xl p-6 text-center">
                    <Users className="w-10 h-10 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-white font-bold mb-2">Fair Use</h3>
                    <p className="text-white/60 text-sm">Use responsibly and respect our systems</p>
                  </div>
                  
                  <div className="glass-subtle rounded-xl p-6 text-center">
                    <AlertCircle className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-white font-bold mb-2">No Warranty</h3>
                    <p className="text-white/60 text-sm">Data is provided as-is for informational purposes</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
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
                    <ul className="space-y-4">
                      {section.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-cyber-blue rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-white/80 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>

              {/* Additional Important Sections */}
              <div className="space-y-8 mt-16">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="glass-subtle rounded-2xl p-8"
                >
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                    <Scale className="w-8 h-8 text-green-400" />
                    <span>Governing Law & Disputes</span>
                  </h2>
                  <div className="space-y-4 text-white/80">
                    <p>
                      These Terms of Service are governed by and construed in accordance with applicable 
                      international laws regarding digital services and blockchain technology.
                    </p>
                    <p>
                      Any disputes arising from the use of MPAS will be resolved through good faith 
                      negotiation. If resolution cannot be reached, disputes may be subject to binding 
                      arbitration in accordance with established digital commerce practices.
                    </p>
                    <p>
                      Users waive any right to participate in class action lawsuits against MPAS, 
                      though individual arbitration rights are preserved.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="glass-subtle rounded-2xl p-8"
                >
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-blue-400" />
                    <span>Changes to Terms</span>
                  </h2>
                  <div className="space-y-4 text-white/80">
                    <p>
                      We reserve the right to modify these Terms of Service at any time to reflect 
                      changes in our services, legal requirements, or business practices.
                    </p>
                    <p>
                      Users will be notified of material changes through the platform interface or 
                      other communication channels. Continued use after notification constitutes 
                      acceptance of the modified terms.
                    </p>
                    <p>
                      For significant changes affecting user rights, we may require explicit acceptance 
                      before continued use of the platform.
                    </p>
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
                <h2 className="text-3xl font-bold text-white mb-6">Questions About These Terms?</h2>
                <p className="text-white/80 text-lg mb-8">
                  Our legal team is available to clarify any provisions or address concerns about these terms.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <a
                    href="/contact"
                    className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors"
                  >
                    Contact Legal Team
                  </a>
                  <a
                    href="/privacy"
                    className="px-8 py-4 glass border border-white/20 text-white hover:bg-white/10 rounded-xl transition-colors"
                  >
                    Privacy Policy
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