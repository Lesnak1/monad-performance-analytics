import { motion } from 'framer-motion'
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, Key, Server, Bug } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Security() {
  const securityMeasures = [
    {
      icon: Lock,
      title: 'Data Encryption',
      description: 'All data transmission encrypted with TLS 1.3 and AES-256',
      features: ['End-to-end encryption', 'Perfect forward secrecy', 'HSTS enforcement']
    },
    {
      icon: Server,
      title: 'Infrastructure Security',
      description: 'Enterprise-grade cloud security with multi-layer protection',
      features: ['DDoS protection', 'WAF filtering', 'Regular security audits']
    },
    {
      icon: Key,
      title: 'Access Control',
      description: 'Strict authentication and authorization protocols',
      features: ['Multi-factor authentication', 'Role-based access', 'API rate limiting']
    },
    {
      icon: Eye,
      title: 'Monitoring & Logging',
      description: 'Comprehensive security monitoring and incident response',
      features: ['24/7 monitoring', 'Intrusion detection', 'Audit logging']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-800">
      <Header />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-orange-500/10"></div>
          
          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <Shield className="w-20 h-20 text-red-400 mx-auto mb-8" />
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-6">
                Security Policy
              </h1>
              <p className="text-xl text-white/80 leading-relaxed mb-8">
                Your security is our top priority. Learn about our comprehensive security measures 
                and how we protect your data and privacy.
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm text-white/60">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>SOC 2 Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>GDPR Ready</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Security Measures */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Security Framework</h2>
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                Multi-layered security architecture designed to protect against modern threats
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {securityMeasures.map((measure, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-subtle rounded-2xl p-8 hover:bg-white/10 transition-colors"
                >
                  <measure.icon className="w-12 h-12 text-red-400 mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">{measure.title}</h3>
                  <p className="text-white/80 mb-6">{measure.description}</p>
                  <ul className="space-y-2">
                    {measure.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-white/70">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Vulnerability Disclosure */}
        <section className="py-20 bg-black/20">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <div className="glass-strong rounded-3xl p-8">
                <Bug className="w-16 h-16 text-orange-400 mx-auto mb-8" />
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Responsible Disclosure</h2>
                <p className="text-white/80 text-lg text-center mb-8">
                  We welcome security researchers to help us maintain the highest security standards. 
                  If you discover a vulnerability, please report it responsibly.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">How to Report</h3>
                    <ul className="space-y-2 text-white/80">
                      <li>• Email: security@mpas.analytics</li>
                      <li>• Include detailed steps to reproduce</li>
                      <li>• Provide proof of concept if possible</li>
                      <li>• Allow 90 days for resolution</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white">Our Commitment</h3>
                    <ul className="space-y-2 text-white/80">
                      <li>• 24-hour acknowledgment</li>
                      <li>• Regular updates on progress</li>
                      <li>• Credit for responsible disclosure</li>
                      <li>• No legal action for good faith research</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Security Best Practices */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Security Best Practices</h2>
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                Tips to help you stay secure while using MPAS
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="glass-subtle rounded-2xl p-8"
                >
                  <AlertTriangle className="w-10 h-10 text-yellow-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-4">For Users</h3>
                  <ul className="space-y-3 text-white/80">
                    <li>• Use HTTPS connections only</li>
                    <li>• Keep your browser updated</li>
                    <li>• Be cautious of phishing attempts</li>
                    <li>• Report suspicious activity</li>
                    <li>• Use strong, unique passwords</li>
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="glass-subtle rounded-2xl p-8"
                >
                  <Key className="w-10 h-10 text-blue-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-4">For Developers</h3>
                  <ul className="space-y-3 text-white/80">
                    <li>• Use API keys securely</li>
                    <li>• Implement rate limiting</li>
                    <li>• Validate all inputs</li>
                    <li>• Monitor API usage</li>
                    <li>• Follow OWASP guidelines</li>
                  </ul>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
} 