import { motion } from 'framer-motion'
import { Zap, TrendingUp, BarChart3, Database, Clock, Users, Code, Heart, Github, ExternalLink, Globe, Cpu, Activity, Shield, Target, Award, Lightbulb } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function About() {
  const stats = [
    { value: '100+', label: 'TPS Monitored', icon: Activity },
    { value: '24M+', label: 'Blocks Analyzed', icon: Database },
    { value: '0.6s', label: 'Block Time', icon: Clock },
    { value: '99.9%', label: 'Uptime', icon: Shield }
  ]

  const features = [
    {
      icon: TrendingUp,
      title: 'Real-time Analytics',
      description: 'Live performance metrics and blockchain analytics with sub-second updates'
    },
    {
      icon: BarChart3,
      title: 'Advanced Visualization',
      description: 'Interactive charts and graphs for comprehensive data analysis'
    },
    {
      icon: Database,
      title: 'Historical Data',
      description: 'Deep historical analysis and trend identification'
    },
    {
      icon: Cpu,
      title: 'Performance Benchmarks',
      description: 'Comprehensive benchmarking tools for network performance testing'
    },
    {
      icon: Globe,
      title: 'Multi-network Support',
      description: 'Built for Monad with extensible architecture for other networks'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade security with advanced monitoring and alerting'
    }
  ]

  const team = [
    {
      name: 'Leknax',
      role: 'Lead Developer & Founder',
      description: 'Blockchain enthusiast and full-stack developer passionate about Monad ecosystem',
      github: 'https://github.com/Lesnak1',
      avatar: '🚀'
    }
  ]

  const milestones = [
    { date: '2024 Q1', title: 'Project Inception', description: 'Initial concept and development started' },
    { date: '2024 Q2', title: 'Alpha Release', description: 'First version with basic monitoring capabilities' },
    { date: '2024 Q3', title: 'Beta Launch', description: 'Advanced analytics and benchmarking tools' },
    { date: '2024 Q4', title: 'Production Ready', description: 'Full-scale deployment and community adoption' }
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
              <div className="flex items-center justify-center space-x-4 mb-8">
                <div className="w-20 h-20 bg-cyber-gradient rounded-3xl flex items-center justify-center shadow-2xl shadow-cyber-blue/30">
                  <Zap className="w-12 h-12 text-white animate-pulse" />
                </div>
                <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyber-blue via-monad-300 to-purple-400 bg-clip-text text-transparent">
                  MPAS
                </h1>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                Monad Performance Analytics System
              </h2>
              
              <p className="text-xl text-white/80 leading-relaxed mb-8">
                The ultimate real-time performance analytics platform for the Monad blockchain ecosystem. 
                Built to provide deep insights, live metrics, and comprehensive benchmarking tools for 
                the world's fastest EVM blockchain.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="glass-strong rounded-2xl p-6 hover:scale-105 transition-transform"
                  >
                    <stat.icon className="w-8 h-8 text-cyber-blue mx-auto mb-3" />
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-white/60">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto text-center mb-16"
            >
              <Target className="w-16 h-16 text-monad-300 mx-auto mb-6" />
              <h2 className="text-4xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-xl text-white/80 leading-relaxed">
                To democratize blockchain performance insights and empower the Monad community with 
                professional-grade analytics tools. We believe that transparency and real-time data 
                access are fundamental to building trust and advancing the blockchain ecosystem.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Lightbulb,
                  title: 'Innovation',
                  description: 'Pushing the boundaries of blockchain analytics with cutting-edge technology'
                },
                {
                  icon: Users,
                  title: 'Community',
                  description: 'Building tools that serve the entire Monad ecosystem and beyond'
                },
                {
                  icon: Heart,
                  title: 'Passion',
                  description: 'Driven by genuine love for blockchain technology and its potential'
                }
              ].map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="glass-subtle rounded-2xl p-8 text-center hover:bg-white/10 transition-colors"
                >
                  <value.icon className="w-12 h-12 text-cyber-blue mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
                  <p className="text-white/70">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-black/20">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Platform Features</h2>
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                Comprehensive suite of tools designed to provide unparalleled insights into Monad network performance
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-subtle rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 group"
                >
                  <feature.icon className="w-12 h-12 text-cyber-blue mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-white/70">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Meet the Team</h2>
              <p className="text-xl text-white/70">Passionate developers building the future of blockchain analytics</p>
            </motion.div>

            <div className="max-w-md mx-auto">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="glass-strong rounded-3xl p-8 text-center hover:scale-105 transition-transform"
                >
                  <div className="text-6xl mb-4">{member.avatar}</div>
                  <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>
                  <p className="text-cyber-blue font-medium mb-4">{member.role}</p>
                  <p className="text-white/70 mb-6">{member.description}</p>
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-cyber-blue hover:text-monad-300 transition-colors"
                  >
                    <Github className="w-5 h-5" />
                    <span>GitHub Profile</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 bg-black/20">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-white mb-6">Development Timeline</h2>
              <p className="text-xl text-white/70">Our journey building the ultimate Monad analytics platform</p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-full bg-gradient-to-b from-cyber-blue to-monad-300"></div>
                
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    className={`relative flex items-center mb-12 ${
                      index % 2 === 0 ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                      <div className="glass-subtle rounded-2xl p-6 hover:bg-white/10 transition-colors">
                        <div className="text-cyber-blue font-bold mb-2">{milestone.date}</div>
                        <h3 className="text-xl font-bold text-white mb-2">{milestone.title}</h3>
                        <p className="text-white/70">{milestone.description}</p>
                      </div>
                    </div>
                    
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-cyber-blue rounded-full border-4 border-gray-900"></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <Award className="w-16 h-16 text-monad-300 mx-auto mb-6" />
              <h2 className="text-4xl font-bold text-white mb-6">Join the Analytics Revolution</h2>
              <p className="text-xl text-white/80 mb-8">
                Experience the power of real-time blockchain analytics and help shape the future of Monad ecosystem monitoring.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <a
                  href="/"
                  className="px-8 py-4 bg-cyber-gradient text-white font-bold rounded-2xl hover:scale-105 transition-transform shadow-xl shadow-cyber-blue/30"
                >
                  Explore Dashboard
                </a>
                <a
                  href="https://github.com/Lesnak1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 glass border border-white/20 text-white font-bold rounded-2xl hover:bg-white/10 transition-colors flex items-center space-x-2"
                >
                  <Github className="w-5 h-5" />
                  <span>View Source</span>
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