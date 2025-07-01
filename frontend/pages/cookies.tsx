import { motion } from 'framer-motion'
import { Cookie, Settings, Shield, Eye, ToggleLeft, ToggleRight } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useState } from 'react'

export default function Cookies() {
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    marketing: false,
    functional: false
  })

  const cookieTypes = [
    {
      name: 'Essential Cookies',
      key: 'essential' as keyof typeof preferences,
      icon: Shield,
      color: 'text-green-400',
      description: 'Required for basic website functionality and security',
      required: true,
      examples: [
        'Session management',
        'Security tokens',
        'Load balancing',
        'Basic functionality'
      ]
    },
    {
      name: 'Analytics Cookies',
      key: 'analytics' as keyof typeof preferences,
      icon: Eye,
      color: 'text-blue-400',
      description: 'Help us understand how visitors interact with our website',
      required: false,
      examples: [
        'Page view tracking',
        'User behavior analysis',
        'Performance monitoring',
        'Error reporting'
      ]
    },
    {
      name: 'Marketing Cookies',
      key: 'marketing' as keyof typeof preferences,
      icon: Cookie,
      color: 'text-purple-400',
      description: 'Used to deliver relevant advertisements and track campaign effectiveness',
      required: false,
      examples: [
        'Advertising targeting',
        'Campaign tracking',
        'Social media integration',
        'Cross-site tracking'
      ]
    },
    {
      name: 'Functional Cookies',
      key: 'functional' as keyof typeof preferences,
      icon: Settings,
      color: 'text-orange-400',
      description: 'Enable enhanced functionality and personalization features',
      required: false,
      examples: [
        'User preferences',
        'Theme settings',
        'Language selection',
        'Customization options'
      ]
    }
  ]

  const togglePreference = (key: keyof typeof preferences) => {
    if (key === 'essential') return // Essential cookies cannot be disabled
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-800">
      <Header />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-yellow-500/10"></div>
          
          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <Cookie className="w-20 h-20 text-orange-400 mx-auto mb-8" />
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent mb-6">
                Cookie Policy
              </h1>
              <p className="text-xl text-white/80 leading-relaxed mb-8">
                Learn about how MPAS uses cookies and similar technologies to enhance your experience 
                and provide better services.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Cookie Overview */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="glass-strong rounded-3xl p-8 mb-16"
              >
                <h2 className="text-3xl font-bold text-white mb-6">What Are Cookies?</h2>
                <p className="text-white/80 text-lg leading-relaxed mb-6">
                  Cookies are small text files stored on your device when you visit websites. They help websites 
                  remember your preferences, improve functionality, and provide analytics insights. MPAS uses 
                  cookies responsibly to enhance your experience while respecting your privacy.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-subtle rounded-xl p-4 text-center">
                    <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-white font-semibold">Privacy First</div>
                    <div className="text-white/60 text-sm">No personal data in cookies</div>
                  </div>
                  <div className="glass-subtle rounded-xl p-4 text-center">
                    <Settings className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-white font-semibold">Your Control</div>
                    <div className="text-white/60 text-sm">Manage preferences anytime</div>
                  </div>
                  <div className="glass-subtle rounded-xl p-4 text-center">
                    <Eye className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-white font-semibold">Transparency</div>
                    <div className="text-white/60 text-sm">Clear about what we collect</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Cookie Types & Preferences */}
        <section className="py-20 bg-black/20">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Cookie Preferences</h2>
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                Control which types of cookies you want to allow. Essential cookies are required for basic functionality.
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto space-y-8">
              {cookieTypes.map((type, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-subtle rounded-2xl p-8"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <type.icon className={`w-10 h-10 ${type.color}`} />
                      <div>
                        <h3 className="text-2xl font-bold text-white">{type.name}</h3>
                        <p className="text-white/70">{type.description}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => togglePreference(type.key)}
                      disabled={type.required}
                      className={`flex items-center space-x-2 p-2 rounded-xl transition-colors ${
                        preferences[type.key] 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-gray-500/20 text-gray-400'
                      } ${type.required ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}
                    >
                      {preferences[type.key] ? (
                        <ToggleRight className="w-8 h-8" />
                      ) : (
                        <ToggleLeft className="w-8 h-8" />
                      )}
                      <span className="font-medium">
                        {preferences[type.key] ? 'Enabled' : 'Disabled'}
                      </span>
                    </button>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3">Examples include:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {type.examples.map((example, exampleIndex) => (
                        <div key={exampleIndex} className="glass rounded-lg p-3 text-center">
                          <span className="text-white/70 text-sm">{example}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {type.required && (
                    <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                      <Shield className="w-4 h-4" />
                      <span>Required for website functionality - cannot be disabled</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Save Preferences Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mt-12"
            >
              <button className="px-12 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-xl shadow-orange-500/30">
                Save Cookie Preferences
              </button>
              <p className="text-white/60 text-sm mt-4">
                Your preferences will be saved locally and applied immediately
              </p>
            </motion.div>
          </div>
        </section>

        {/* Additional Information */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="glass-subtle rounded-2xl p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Managing Cookies in Your Browser</h2>
                <p className="text-white/80 mb-6">
                  You can also control cookies directly through your browser settings. Here's how to manage 
                  cookies in popular browsers:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Desktop Browsers</h3>
                    <ul className="space-y-2 text-white/70">
                      <li>• <strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                      <li>• <strong>Firefox:</strong> Settings → Privacy & Security → Cookies</li>
                      <li>• <strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                      <li>• <strong>Edge:</strong> Settings → Site permissions → Cookies</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Mobile Browsers</h3>
                    <ul className="space-y-2 text-white/70">
                      <li>• <strong>iOS Safari:</strong> Settings → Safari → Privacy & Security</li>
                      <li>• <strong>Android Chrome:</strong> Chrome → Settings → Site Settings</li>
                      <li>• <strong>Mobile Firefox:</strong> Settings → Privacy → Cookies</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-8 p-4 glass-strong rounded-xl">
                  <p className="text-white/80 text-sm">
                    <strong>Note:</strong> Disabling certain cookies may affect website functionality. 
                    Essential cookies are always required for MPAS to work properly.
                  </p>
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