import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle, Search, Book, Zap, Database, Shield, Settings, TrendingUp } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [openItems, setOpenItems] = useState<number[]>([])

  const categories = [
    { id: 'all', name: 'All Questions', icon: HelpCircle },
    { id: 'general', name: 'General', icon: Book },
    { id: 'technical', name: 'Technical', icon: Settings },
    { id: 'data', name: 'Data & Analytics', icon: Database },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'performance', name: 'Performance', icon: TrendingUp }
  ]

  const faqData = [
    {
      category: 'general',
      question: 'What is MPAS and what does it do?',
      answer: 'MPAS (Monad Performance Analytics System) is a comprehensive real-time blockchain analytics platform specifically designed for the Monad network. It provides live performance metrics, transaction monitoring, network health analysis, and benchmarking tools to help users understand and optimize their interaction with the Monad blockchain.'
    },
    {
      category: 'general',
      question: 'Is MPAS free to use?',
      answer: 'Yes! MPAS offers all core analytics features completely free of charge. Our mission is to democratize blockchain analytics and provide the Monad community with professional-grade tools at no cost. We believe transparency and data access are fundamental to blockchain adoption.'
    },
    {
      category: 'general',
      question: 'Do I need to create an account to use MPAS?',
      answer: 'No account is required for basic analytics features. You can access real-time metrics, view transaction feeds, and use our dashboard immediately. Account creation is optional and provides additional features like custom alerts, data export, and personalized dashboards.'
    },
    {
      category: 'technical',
      question: 'What blockchain networks does MPAS support?',
      answer: 'MPAS is currently focused exclusively on the Monad blockchain network, including both testnet and mainnet (when available). Our platform is optimized specifically for Monad\'s unique architecture and high-performance capabilities. We may expand to other networks in the future based on community demand.'
    },
    {
      category: 'technical',
      question: 'How often is the data updated?',
      answer: 'Our data is updated in real-time with sub-second latency. TPS metrics refresh every 6 seconds, transaction feeds update every 3 seconds, and network health indicators are monitored continuously. We maintain multiple RPC connections to ensure reliable data delivery even during high network activity.'
    },
    {
      category: 'technical',
      question: 'What causes data discrepancies between different sources?',
      answer: 'Small variations between blockchain explorers are normal due to different data collection methods, caching strategies, and RPC endpoint differences. MPAS uses multiple data sources and validation techniques to provide the most accurate metrics possible, but minor discrepancies of 1-2% are typical in real-time blockchain analytics.'
    },
    {
      category: 'data',
      question: 'How accurate are the TPS (Transactions Per Second) measurements?',
      answer: 'Our TPS calculations are highly accurate, using real-time block data directly from Monad RPC endpoints. We calculate TPS using actual transaction counts over precise time windows, not estimates. The accuracy is typically within 2-3% of actual network performance, with any variations due to network latency or temporary RPC delays.'
    },
    {
      category: 'data',
      question: 'Can I export analytics data for my own analysis?',
      answer: 'Yes! MPAS provides multiple export options including CSV downloads, JSON API access, and real-time data streams. You can export historical metrics, transaction data, and custom analytics reports. All exports maintain full data integrity and include metadata for accurate analysis.'
    },
    {
      category: 'data',
      question: 'What historical data is available?',
      answer: 'We maintain comprehensive historical data going back to our platform launch. This includes TPS trends, gas price history, block time analysis, and transaction volume patterns. Historical data is available in various time granularities from minute-by-minute to daily aggregates.'
    },
    {
      category: 'security',
      question: 'How do you protect user privacy and data?',
      answer: 'MPAS is built with privacy-first principles. We only collect publicly available blockchain data and minimal analytics for platform improvement. We never store private keys, personal transactions details, or sensitive user information. All data transmission is encrypted, and we comply with international privacy standards including GDPR.'
    },
    {
      category: 'security',
      question: 'Is it safe to connect my wallet to MPAS?',
      answer: 'MPAS primarily operates as a read-only analytics platform that doesn\'t require wallet connections for basic functionality. If wallet connection is offered for advanced features, we use industry-standard security practices with read-only permissions and never request private keys or signing of transactions without explicit user consent.'
    },
    {
      category: 'performance',
      question: 'Why do I see different TPS values compared to other explorers?',
      answer: 'TPS calculation methods vary between platforms. MPAS uses real-time block analysis with actual transaction counts, while some explorers use estimates or different time windows. Our method provides the most accurate real-time representation of network performance, accounting for both simple transfers and complex smart contract interactions.'
    },
    {
      category: 'performance',
      question: 'What makes Monad special compared to other blockchains?',
      answer: 'Monad is designed as a high-performance EVM-compatible blockchain capable of processing thousands of transactions per second with sub-second finality. Unlike traditional blockchains limited to 15-50 TPS, Monad\'s parallel execution and optimized consensus mechanism enable enterprise-scale throughput while maintaining full Ethereum compatibility.'
    },
    {
      category: 'technical',
      question: 'How can I integrate MPAS data into my own application?',
      answer: 'MPAS provides comprehensive API endpoints for developers. You can access real-time metrics, historical data, and subscribe to WebSocket feeds for live updates. Our API documentation includes examples in multiple programming languages, rate limiting information, and best practices for integration.'
    },
    {
      category: 'general',
      question: 'How can I contribute to MPAS development?',
      answer: 'We welcome community contributions! You can contribute by reporting bugs on GitHub, suggesting features, contributing code improvements, helping with documentation, or participating in our Discord community. MPAS is built for the community, and we value all forms of contribution.'
    }
  ]

  const filteredFAQ = faqData.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory
    const matchesSearch = searchTerm === '' || 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-800">
      <Header />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10"></div>
          
          <div className="container mx-auto px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <HelpCircle className="w-20 h-20 text-purple-400 mx-auto mb-8" />
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-6">
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-white/80 leading-relaxed mb-8">
                Find answers to the most common questions about MPAS, Monad analytics, and blockchain performance monitoring.
              </p>
              
              {/* Search */}
              <div className="relative max-w-2xl mx-auto mb-8">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                <input
                  type="text"
                  placeholder="Search questions and answers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 glass rounded-2xl text-white placeholder-white/50 border border-white/20 focus:border-purple-400 focus:outline-none transition-colors text-lg"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap justify-center gap-4 mb-12"
            >
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeCategory === category.id
                      ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                      : 'glass text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ List */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              {filteredFAQ.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <Search className="w-16 h-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">No Results Found</h3>
                  <p className="text-white/60">Try adjusting your search terms or browse different categories.</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {filteredFAQ.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                      className="glass-subtle rounded-2xl overflow-hidden hover:bg-white/10 transition-colors"
                    >
                      <button
                        onClick={() => toggleItem(index)}
                        className="w-full p-6 text-left flex items-center justify-between"
                      >
                        <h3 className="text-lg font-semibold text-white pr-8">{item.question}</h3>
                        <ChevronDown 
                          className={`w-6 h-6 text-white/60 transition-transform flex-shrink-0 ${
                            openItems.includes(index) ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      
                      <AnimatePresence>
                        {openItems.includes(index) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6">
                              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4"></div>
                              <p className="text-white/80 leading-relaxed">{item.answer}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-black/20">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Still Have Questions?</h2>
              <p className="text-xl text-white/80 mb-8">
                Can't find what you're looking for? Our support team is here to help!
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <a
                  href="/contact"
                  className="px-8 py-4 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl transition-colors"
                >
                  Contact Support
                </a>
                <a
                  href="/user-guide"
                  className="px-8 py-4 glass border border-white/20 text-white hover:bg-white/10 rounded-xl transition-colors"
                >
                  View User Guide
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
} 