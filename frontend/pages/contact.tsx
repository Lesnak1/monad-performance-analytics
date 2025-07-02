import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MessageSquare, Phone, MapPin, Send, Github, Twitter, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '', type: 'general' })
      
      // Reset status after 3 seconds
      setTimeout(() => setSubmitStatus('idle'), 3000)
    }, 2000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help with technical issues or general inquiries',
      contact: 'support@mpas.analytics',
      action: 'Send Email',
      color: 'text-blue-400'
    },
    {
      icon: Github,
      title: 'GitHub Issues',
      description: 'Report bugs or request features on our repository',
      contact: 'github.com/Lesnak1',
      action: 'Open Issue',
      color: 'text-purple-400'
    },
    {
      icon: MessageSquare,
      title: 'Community Chat',
      description: 'Join our Discord for real-time discussions',
      contact: 'Discord Community',
      action: 'Join Chat',
      color: 'text-green-400'
    },
    {
      icon: Twitter,
      title: 'Social Media',
      description: 'Follow us for updates and announcements',
      contact: '@MPAS_Analytics',
      action: 'Follow Us',
      color: 'text-cyan-400'
    }
  ]

  const officeHours = [
    { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM UTC', available: true },
    { day: 'Saturday', hours: '10:00 AM - 4:00 PM UTC', available: true },
    { day: 'Sunday', hours: 'Community Support Only', available: false }
  ]

  const responseTime = [
    { type: 'Critical Issues', time: '< 2 hours', priority: 'high' },
    { type: 'Technical Support', time: '< 24 hours', priority: 'medium' },
    { type: 'General Inquiries', time: '< 48 hours', priority: 'low' },
    { type: 'Feature Requests', time: '< 1 week', priority: 'low' }
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
              <MessageSquare className="w-20 h-20 text-blue-400 mx-auto mb-8" />
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent mb-6">
                Get in Touch
              </h1>
              <p className="text-xl text-white/80 leading-relaxed mb-8">
                Have questions about MPAS? Need technical support? Want to contribute to the project? 
                We're here to help and would love to hear from you!
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm text-white/60">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>24/7 Community Support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Dedicated Team</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">How Can We Help?</h2>
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                Choose the best way to reach us based on your needs
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {contactMethods.map((method, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-subtle rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 group text-center"
                >
                  <method.icon className={`w-12 h-12 ${method.color} mx-auto mb-6 group-hover:scale-110 transition-transform`} />
                  <h3 className="text-xl font-bold text-white mb-4">{method.title}</h3>
                  <p className="text-white/70 mb-6">{method.description}</p>
                  <div className="space-y-3">
                    <div className="text-white/60 font-mono text-sm">{method.contact}</div>
                    <button className={`w-full px-4 py-2 ${method.color ? method.color.replace('text-', 'bg-').replace('400', '500') : 'bg-blue-500'} hover:${method.color ? method.color.replace('text-', 'bg-').replace('400', '600') : 'bg-blue-600'} text-white rounded-lg transition-colors font-medium`}>
                      {method.action}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-20 bg-black/20">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="glass-strong rounded-3xl p-8"
              >
                <h2 className="text-3xl font-bold text-white mb-8">Send us a Message</h2>
                
                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 glass-subtle rounded-xl border border-green-400/20"
                  >
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                      <span className="text-green-400 font-medium">Message sent successfully! We'll get back to you soon.</span>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white font-medium mb-2">Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/50 border border-white/20 focus:border-cyber-blue focus:outline-none transition-colors"
                        placeholder="Your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/50 border border-white/20 focus:border-cyber-blue focus:outline-none transition-colors"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Inquiry Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 glass rounded-xl text-white border border-white/20 focus:border-cyber-blue focus:outline-none transition-colors"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Support</option>
                      <option value="bug">Bug Report</option>
                      <option value="feature">Feature Request</option>
                      <option value="partnership">Partnership</option>
                      <option value="press">Press & Media</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/50 border border-white/20 focus:border-cyber-blue focus:outline-none transition-colors"
                      placeholder="Brief description of your inquiry"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 glass rounded-xl text-white placeholder-white/50 border border-white/20 focus:border-cyber-blue focus:outline-none transition-colors resize-none"
                      placeholder="Please provide details about your inquiry, including any relevant information that might help us assist you better..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-8 py-4 bg-cyber-gradient text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-xl shadow-cyber-blue/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-3"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                {/* Office Hours */}
                <div className="glass-subtle rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                    <Clock className="w-8 h-8 text-blue-400" />
                    <span>Support Hours</span>
                  </h3>
                  <div className="space-y-4">
                    {officeHours.map((schedule, index) => (
                      <div key={index} className="flex items-center justify-between p-3 glass rounded-lg">
                        <span className="text-white font-medium">{schedule.day}</span>
                        <div className="flex items-center space-x-3">
                          <span className="text-white/70">{schedule.hours}</span>
                          <div className={`w-3 h-3 rounded-full ${schedule.available ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Response Time */}
                <div className="glass-subtle rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                    <MessageSquare className="w-8 h-8 text-green-400" />
                    <span>Response Time</span>
                  </h3>
                  <div className="space-y-4">
                    {responseTime.map((response, index) => (
                      <div key={index} className="flex items-center justify-between p-3 glass rounded-lg">
                        <span className="text-white font-medium">{response.type}</span>
                        <div className="flex items-center space-x-3">
                          <span className="text-white/70">{response.time}</span>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            response.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                            response.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {response.priority}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="glass-subtle rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
                    <AlertCircle className="w-8 h-8 text-yellow-400" />
                    <span>Quick Tips</span>
                  </h3>
                  <ul className="space-y-3 text-white/80">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>For faster support, include your browser version and any error messages</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Check our FAQ section first - your question might already be answered</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Join our Discord community for real-time help from other users</span>
                    </li>
                  </ul>
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