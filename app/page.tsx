"use client";
import NavBar from '@/components/shared/navigation/NavBar'
import { motion, useInView } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const AnimatedBackground = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
      <video
        src="https://framerusercontent.com/assets/G0UWG98BsiVXS2JVBb1831n0g.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: '50% 50%',
          pointerEvents: 'none'
        }}
      />
      <div 
        className="absolute inset-0 w-full h-full flex pointer-events-none md:pointer-events-auto"
        style={{
          backdropFilter: 'blur(92px)',
          WebkitBackdropFilter: 'blur(92px)',
          width: '106%',
          left: '-3%',
          top: '0%'
        }}
      >
        {Array.from({ length: 32 }).map((_, index) => {
          const isHovered = hoveredIndex === index
          const isRightOfHovered = hoveredIndex !== null && index === hoveredIndex + 1
          return (
            <motion.div
              key={index}
              initial={{ flex: 1 }}
              animate={{ flex: isHovered ? 2 : isRightOfHovered ? 0.5 : 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 40, duration: 0.8 }}
              className="h-full relative cursor-pointer pointer-events-none md:pointer-events-auto"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                background: 'linear-gradient(269.9999999999974deg, rgba(255, 255, 255, 0.3) 0%, rgba(59, 59, 59, 0.3) 87.88478417439504%, rgba(255, 255, 255, 0.3) 100%)',
                minWidth: 0
              }}
            />
          )
        })}
      </div>
      <div 
        className="absolute inset-0"
        style={{
          width: '110%',
          height: '110%',
          top: '-5%',
          left: '-5%',
          backgroundColor: 'rgb(255, 72, 14)',
          mixBlendMode: 'color',
          pointerEvents: 'none'
        }}
      />
    </div>
  )
}

const HeroContent = () => {
  const line1 = "Job Search Ends."
  const line2 = "New Role Begins!"
  const line1Words = line1.split(' ')
  const line2Words = line2.split(' ')
  
  return (
    <div className="flex flex-col items-center justify-center pt-24 md:pt-40 pb-16 md:pb-24 text-center text-white relative z-10 px-4" style={{ pointerEvents: 'none' }}>
      <motion.div 
        className="flex items-center justify-center gap-2 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="flex -space-x-2">
          <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="avatar" className="w-7 h-7 rounded-full border-2 border-white" />
          <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="avatar" className="w-7 h-7 rounded-full border-2 border-white" />
          <img src="https://randomuser.me/api/portraits/men/45.jpg" alt="avatar" className="w-7 h-7 rounded-full border-2 border-white" />
          <img src="https://randomuser.me/api/portraits/women/46.jpg" alt="avatar" className="w-7 h-7 rounded-full border-2 border-white" />
        </div>
        <span className="ml-3 text-base font-medium">Trusted by industry professionals</span>
      </motion.div>
      <h1 className="mb-4" style={{ 
        fontSize: 'clamp(36px, 8vw, 96px)',
        fontWeight: 500, 
        fontFamily: 'Manrope, sans-serif',
        letterSpacing: '-0.06em',
        lineHeight: '1.05'
      }}>
        {line1Words.map((word, index) => (
          <motion.span
            key={`line1-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
            className="inline-block mr-4"
          >
            {word}
          </motion.span>
        ))}
        <br />
        {line2Words.map((word, index) => (
          <motion.span
            key={`line2-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: (line1Words.length + index) * 0.15, ease: "easeOut" }}
            className="inline-block mr-4"
          >
            {word}
          </motion.span>
        ))}
      </h1>
      <motion.p 
        className="text-base md:text-lg font-medium mb-8 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        Apply to roles from companies that are<br />very interested in hiring you.
      </motion.p>
      <motion.div 
        className="flex items-center gap-4 md:gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.6 }}
      >
        <motion.div
          className="relative overflow-hidden rounded-full"
          initial="rest"
          whileHover="hover"
          animate="rest"
        >
          <motion.div
            className="absolute inset-0 bg-white rounded-full"
            variants={{ rest: { scaleX: 0, originX: 0 }, hover: { scaleX: 1, originX: 0 } }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
          <Link
            href="/employers"
            className="px-6 md:px-8 py-3 border border-white/30 text-white rounded-full font-semibold text-base md:text-lg whitespace-nowrap relative z-10 block"
            style={{ pointerEvents: 'auto' }}
          >
            <motion.span
              variants={{ rest: { color: '#ffffff' }, hover: { color: '#000000' } }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              For Employers
            </motion.span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

const HeroSection = ({ scrollY }: { scrollY: number }) => (
  <section 
    className="sticky top-0 left-0 w-full h-screen flex flex-col items-center justify-center overflow-hidden z-10"
    style={{ transform: `translateY(${-scrollY * 0.3}px)` }}
  >
    <AnimatedBackground />
    <HeroContent />
  </section>
)

const ApplySection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0, margin: "-50% 0px -50% 0px" })
  const line1 = "Does This Sound"
  const line2 = "Familiar?"
  const line1Words = line1.split(' ')
  const line2Words = line2.split(' ')
  
  return (
    <section ref={ref} className="w-full min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
        <div className="space-y-6 md:space-y-10">
          <h2 style={{ fontSize: 'clamp(32px, 7vw, 96px)', fontWeight: 500, fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.06em', lineHeight: '1.08' }}>
            {line1Words.map((word, index) => (
              <motion.span key={`line1-${index}`} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }} className="inline-block mr-4">{word}</motion.span>
            ))}
            <br />
            {line2Words.map((word, index) => (
              <motion.span key={`line2-${index}`} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.6, delay: (line1Words.length + index) * 0.15, ease: "easeOut" }} className="inline-block mr-4">{word}</motion.span>
            ))}
          </h2>
          <p className="text-base md:text-lg text-gray-500 leading-relaxed">We get it. We've been there. The career launch is tough, and the system often feels broken. It's like you're shouting into the void.</p>
          <p className="text-2xl font-bold text-gray-900">Enough is enough.</p>
        </div>
        <div className="space-y-6 md:space-y-8">
          <div className="space-y-6">
            <div><h3 className="text-xl font-bold text-gray-900 mb-3">The CV Black Hole</h3><p className="text-gray-500">You send out dozens of applications, perfectly tailored, only to hear nothing back.</p></div>
            <div><h3 className="text-xl font-bold text-gray-900 mb-3">The Experience Paradox</h3><p className="text-gray-500">You can't get a job without experience, and you can't get experience without a job.</p></div>
            <div><h3 className="text-xl font-bold text-gray-900 mb-3">The Skills Gap</h3><p className="text-gray-500">Your degree taught you the theory, but companies want job-ready skills you were never taught.</p></div>
            <div><h3 className="text-xl font-bold text-gray-900 mb-3">The Unfair Advantage</h3><p className="text-gray-500">It feels like it's not about what you know, but who you know.</p></div>
          </div>
        </div>
      </div>
    </section>
  )
}

const ScrutinizedSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0, margin: "-50% 0px -50% 0px" })
  const line1 = "The Crucible"
  const line2 = "Method"
  const line1Words = line1.split(' ')
  const line2Words = line2.split(' ')
  
  return (
    <section ref={ref} className="w-full min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
        <div className="space-y-8">
          <p className="text-base md:text-xl text-gray-500 leading-relaxed">Crucible Careers isn't another job board. We are your launchpad. Our method is simple, powerful, and built to make you undeniable to employers.</p>
          <p className="text-base md:text-lg text-gray-500 leading-relaxed">We start by teaching you what actually matters - industry-designed tracks that focus on job-ready skills companies need right now, not outdated theory. Then comes our core: rigorous, proctored certification that proves you can do the job, not just complete a course.</p>
          <p className="text-base md:text-lg text-gray-500 leading-relaxed">Finally, we connect you directly with Pakistan's top companies who are actively seeking certified talent. No more black hole applications - just direct access to employers who trust our certification process.</p>
          <Link href="/waitlist" className="inline-flex items-center px-6 md:px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold text-base md:text-lg hover:shadow-lg transition group">
            Start Your Journey
            <svg className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
        <div className="space-y-6 md:space-y-8">
          <h2 className="text-gray-900" style={{ fontSize: 'clamp(32px, 7vw, 96px)', fontWeight: 500, fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.06em', lineHeight: '1.08' }}>
            {line1Words.map((word, index) => (
              <motion.span key={`line1-${index}`} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }} className="inline-block mr-4">
                {word === "Crucible" ? (<Link href="/waitlist" className="text-gray-900 hover:text-orange-500 transition-colors">{word}</Link>) : word}
              </motion.span>
            ))}
            <br />
            {line2Words.map((word, index) => (
              <motion.span key={`line2-${index}`} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.6, delay: (line1Words.length + index) * 0.15, ease: "easeOut" }} className="inline-block mr-4">{word}</motion.span>
            ))}
          </h2>
          <p className="text-xl md:text-2xl font-semibold text-orange-500">The Unfair Advantage You Deserve.</p>
        </div>
      </div>
    </section>
  )
}

const CardsSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1, margin: "-100px" })
  return (
    <section ref={ref} className="w-full flex items-center justify-center bg-black py-10 md:py-12" style={{ minHeight: 'calc(100vh + 250px)' }}>
      <div className="flex flex-col lg:flex-row gap-8 md:gap-12 items-center justify-center px-4">
        <motion.div className="rounded-3xl p-6 md:p-8 flex flex-col w-full max-w-sm md:max-w-none" style={{ backgroundColor: '#1f2124', width: '493px', height: '723px' }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: isInView ? 1 : 0, scale: isInView ? 1 : 0.8 }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}>
          <div className="flex-1 text-center">
            <p className="text-gray-300 text-xs md:text-sm font-medium mb-4 md:mb-6">Skill Development</p>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 leading-tight">Master job-ready skills that employers actually need</h3>
            <Link href="/waitlist" className="px-6 md:px-8 py-3 border border-gray-500 text-white rounded-full font-semibold hover:bg-white hover:text-black transition text-sm md:text-base">Start Learning</Link>
          </div>
          <div className="flex-1 relative -mx-6 md:-mx-8 -mb-6 md:-mb-8">
            <img src="/left_card_bottom.png" alt="Skill development visualization" className="w-full h-full object-cover rounded-b-3xl" />
          </div>
        </motion.div>
        <motion.div className="rounded-3xl p-6 md:p-8 flex flex-col w-full max-w-sm md:max-w-none" style={{ backgroundColor: '#1f2124', width: '493px', height: '723px' }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: isInView ? 1 : 0, scale: isInView ? 1 : 0.8 }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}>
          <div className="flex-1 text-center">
            <p className="text-gray-300 text-xs md:text-sm font-medium mb-4 md:mb-6">Career Growth</p>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 leading-tight">Access global opportunities with your certification</h3>
            <Link href="/waitlist" className="px-6 md:px-8 py-3 border border-gray-500 text-white rounded-full font-semibold hover:bg-white hover:text-black transition text-sm md:text-base">Explore Careers</Link>
          </div>
          <div className="flex-1 relative -mx-6 md:-mx-8 -mb-6 md:-mb-8">
            <img src="/globe_card_bottom.png" alt="Global career opportunities" className="w-full h-full object-cover rounded-b-3xl" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

const JobListingsSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1, margin: "-100px" })
  const lines = ["In-Demand Roles From", "the Best Recruiters."]
  return (
    <section ref={ref} className="w-full bg-gray-50 py-12 md:py-16" style={{ minHeight: 'calc(100vh + 200px)' }}>
      <div className="max-w-4xl mx-auto text-center mb-12 md:mb-20 pt-12 md:pt-16 px-4">
        <h2 className="text-gray-900 mb-6 md:mb-8 font-semibold leading-tight" style={{ fontSize: 'clamp(28px, 6vw, 48px)' }}>
          {lines[0].split(' ').map((word, index) => (
            <motion.span key={`line1-${index}`} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }} className="inline-block mr-4">{word}</motion.span>
          ))}
          <br />
          {lines[1].split(' ').map((word, index) => (
            <motion.span key={`line2-${index}`} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.6, delay: (4 + index) * 0.15, ease: "easeOut" }} className="inline-block mr-4">{word}</motion.span>
          ))}
        </h2>
        <Link href="/apply/frontend-developer" className="px-6 md:px-8 py-3 border border-gray-300 text-gray-900 rounded-full font-semibold text-base md:text-lg hover:bg-gray-100 transition">Apply Now (Demo)</Link>
      </div>
      <div className="relative flex items-center justify-center mt-12 md:mt-24 px-4">
        <motion.div className="relative flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: isInView ? 1 : 0 }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}>
          <motion.div className="rounded-2xl p-6 w-72 md:w-80 h-80 md:h-96 relative z-10 transform -rotate-6 cursor-pointer shadow-2xl" style={{ backgroundColor: '#1f2124', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)' }} variants={{ initial: { backgroundColor: '#1f2124' }, hover: { backgroundColor: '#000000' } }} whileHover="hover" initial="initial" transition={{ duration: 0.4, ease: "easeInOut" }}>
            <motion.div className="absolute -top-10 md:-top-12 -right-8 w-20 md:w-24 h-20 md:h-24 bg-black rounded-full flex items-center justify-center z-20 shadow-lg" variants={{ initial: { rotate: 0 }, hover: { rotate: -45 } }} transition={{ duration: 0.3, ease: "easeInOut" }}>
              <svg className="w-10 md:w-12 h-10 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </motion.div>
            <div className="mb-4">
              <div>
                <h3 className="text-3xl md:text-4xl font-semibold text-gray-200 mb-3 leading-tight">Product<br />Engineer</h3>
                <p className="text-gray-300 text-sm md:text-base font-medium">Ontario</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 md:px-4 py-2 bg-gray text-gray-400 text-xs md:text-sm font-medium rounded-full border border-gray-600">UX/UI</span>
              <span className="px-3 md:px-4 py-2 bg-gray text-gray-400 text-xs md:text-sm font-medium rounded-full border border-gray-600">Prototyping</span>
              <span className="px-3 md:px-4 py-2 bg-gray text-gray-400 text-xs md:text-sm font-medium rounded-full border border-gray-600">Wireframing</span>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-32 overflow-hidden rounded-b-2xl">
              <img src="/pattern.png" alt="Pattern" className="w-full h-full object-cover opacity-20" />
            </div>
          </motion.div>
          <motion.div className="rounded-2xl p-6 relative z-20 transform rotate-6 -ml-8 md:-ml-16 cursor-pointer shadow-2xl" style={{ width: '300px', height: '360px', backgroundColor: '#1f2124', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)' }} variants={{ initial: { backgroundColor: '#1f2124' }, hover: { backgroundColor: '#000000' } }} whileHover="hover" initial="initial" transition={{ duration: 0.4, ease: "easeInOut" }}>
            <motion.div className="absolute -top-8 -right-8 w-20 md:w-24 h-20 md:h-24 bg-black rounded-full flex items-center justify-center z-30 shadow-lg" variants={{ initial: { rotate: 0 }, hover: { rotate: -45 } }} transition={{ duration: 0.3, ease: "easeInOut" }}>
              <svg className="w-10 md:w-12 h-10 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </motion.div>
            <div className="mb-4">
              <div>
                <h3 className="text-3xl md:text-4xl font-semibold text-gray-200 mb-3 leading-tight">Frontend<br />Developer</h3>
                <p className="text-gray-300 text-sm md:text-base font-medium">Remote, Europe</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 md:px-4 py-2 bg-gray text-gray-400 text-xs md:text-sm font-medium rounded-full border border-gray-600">Django</span>
              <span className="px-3 md:px-4 py-2 bg-gray text-gray-400 text-xs md:text-sm font-medium rounded-full border border-gray-600">PostgreSQL</span>
              <span className="px-3 md:px-4 py-2 bg-gray text-gray-400 text-xs md:text-sm font-medium rounded-full border border-gray-600">SQL</span>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-32 overflow-hidden rounded-b-2xl">
              <img src="/pattern.png" alt="Pattern" className="w-full h-full object-cover opacity-20" />
            </div>
          </motion.div>
        </motion.div>
        <motion.div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-24 md:w-32 h-24 md:h-32 bg-orange-500 rounded-full flex items-center justify-center z-30" animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
          <svg viewBox="0 0 170 170" className="w-26 h-26">
            <path d="M 80.152 39.669 C 81.544 34.777 88.456 34.777 89.848 39.669 L 95.535 59.66 C 96.281 62.285 98.969 63.842 101.608 63.178 L 121.71 58.123 C 126.63 56.886 130.085 62.891 126.558 66.546 L 112.143 81.483 C 110.251 83.443 110.251 86.557 112.143 88.517 L 126.558 103.454 C 130.085 107.109 126.63 113.114 121.71 111.877 L 101.608 106.822 C 98.969 106.158 96.281 107.715 95.535 110.34 L 89.848 130.331 C 88.456 135.223 81.544 135.223 80.152 130.331 L 74.465 110.34 C 73.719 107.715 71.031 106.158 68.392 106.822 L 48.29 111.877 C 43.37 113.114 39.915 107.109 43.442 103.454 L 57.857 88.517 C 59.749 86.557 59.749 83.443 57.857 81.483 L 43.442 66.546 C 39.915 62.891 43.37 56.886 48.29 58.123 L 68.392 63.178 C 71.031 63.842 73.719 62.285 74.465 59.66 Z" fill="rgb(255,255,254)"></path>
          </svg>
        </motion.div>
      </div>
    </section>
  )
}

const TalentPoolSection = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1, margin: "-100px" })
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null)
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null)
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null)
  const domains = [
    { name: "Software Engineering", skills: ["Frontend", "Backend", "Full Stack", "Mobile", "React", "Node.js", "Python", "TypeScript"] },
    { name: "AI & Machine Learning", skills: ["NLP", "Computer Vision", "TensorFlow", "PyTorch", "Deep Learning", "Neural Networks"] },
    { name: "Data Science", skills: ["Python", "SQL", "Tableau", "Analytics", "Pandas", "NumPy", "R", "Statistics"] },
    { name: "DevOps & Cloud", skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "GCP", "Azure", "Jenkins", "Terraform"] },
    { name: "Cybersecurity", skills: ["Penetration Testing", "Network Security", "Compliance", "Ethical Hacking", "Risk Management", "CISSP"] },
    { name: "Business & Growth", skills: ["Digital Marketing", "Strategy", "Finance", "HR", "Analytics", "Growth Hacking"] }
  ]

  return (
    <section ref={ref} className="w-full bg-white py-10 md:py-12" style={{ minHeight: '100vh' }}>
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-gray-900 mb-4 md:mb-6" style={{ fontSize: 'clamp(28px, 7vw, 96px)', fontWeight: 500, fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.06em', lineHeight: '1.08' }}>
            {"Choose Your Launchpad".split(' ').map((word, index) => (
              <motion.span key={index} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }} className="inline-block mr-4">{word}</motion.span>
            ))}
          </h2>
          <p className="text-base md:text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed px-1">Master the most in-demand skills and build a career that excites you. Whether you're a coder, a creative, a data wizard, or a business strategist, your journey starts here.</p>
        </div>
        <motion.div className="max-w-5xl mx-auto" style={{ opacity: isInView ? 1 : 0 }} transition={{ duration: 0.5 }}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 relative">
            <div className="md:col-span-3 relative hidden md:block">
              {domains.map((domain, domainIndex) => (
                <div key={domain.name} className="h-20 flex items-center justify-end pr-6 relative cursor-pointer" style={{ borderRight: '3px solid #FF6B35', borderBottom: domainIndex < domains.length - 1 ? '1px solid rgba(255, 107, 53, 0.2)' : 'none' }} onMouseEnter={() => setHoveredDomain(domain.name)} onMouseLeave={() => setHoveredDomain(null)}>
                  <h3 className="text-lg font-bold text-gray-800 text-right leading-tight">{domain.name}</h3>
                </div>
              ))}
            </div>
            <div className="md:col-span-7 relative">
              <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, rgba(255, 107, 53, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 107, 53, 0.2) 1px, transparent 1px)', backgroundSize: '120px 80px' }} />
              {domains.map((domain, domainIndex) => (
                <motion.div key={domain.name} className="h-16 md:h-20 flex items-center justify-start gap-2 md:gap-3 px-2 md:px-4 relative" style={{ borderBottom: domainIndex < domains.length - 1 ? '1px solid rgba(255, 107, 53, 0.2)' : 'none' }} animate={{ backgroundColor: hoveredDomain === domain.name ? 'rgba(255, 107, 53, 0.05)' : 'transparent' }} transition={{ duration: 0.3 }}>
                  {domain.skills.slice(0, 5).map((skill) => (
                    <div key={skill} className="relative" onMouseEnter={() => setHoveredSkill(skill)} onMouseLeave={() => setHoveredSkill(null)}>
                      <motion.div className="text-[11px] md:text-xs font-medium rounded-md cursor-pointer relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: hoveredSkill === skill ? '#FF6B35' : '#f8f9fa', color: hoveredSkill === skill ? 'white' : '#374151', minWidth: '68px', height: '30px', padding: '0 6px', boxShadow: hoveredDomain === domain.name && hoveredSkill !== skill ? '0 4px 15px rgba(255, 107, 53, 0.2), 0 0 0 1px rgba(255, 107, 53, 0.3)' : 'none' }} animate={{ scale: hoveredDomain === domain.name && hoveredSkill !== skill ? 1.02 : 1 }} whileHover={{ scale: 1.1, rotateZ: 5, boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)' }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
                        <motion.div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500" initial={{ x: '-100%' }} animate={{ x: hoveredSkill === skill ? '0%' : '-100%' }} transition={{ duration: 0.3, ease: "easeOut" }} />
                        <span className="relative z-10">{skill}</span>
                        <motion.div className="absolute inset-0 bg-black opacity-0" whileHover={{ opacity: 0.1 }} transition={{ duration: 0.2 }} />
                      </motion.div>
                    </div>
                  ))}
                  {domain.skills.length > 5 && (
                    <motion.div className="relative" onMouseEnter={() => setExpandedDomain(domain.name)} onMouseLeave={() => setExpandedDomain(null)}>
                      <motion.div className="text-[11px] md:text-xs font-medium rounded-md cursor-pointer relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: expandedDomain === domain.name ? '#FF6B35' : '#e5e7eb', color: expandedDomain === domain.name ? 'white' : '#6b7280', minWidth: '44px', height: '30px', padding: '0 6px', boxShadow: hoveredDomain === domain.name && expandedDomain !== domain.name ? '0 4px 15px rgba(255, 107, 53, 0.2), 0 0 0 1px rgba(255, 107, 53, 0.3)' : 'none' }} animate={{ scale: hoveredDomain === domain.name && expandedDomain !== domain.name ? 1.02 : 1 }} whileHover={{ scale: 1.1, rotateZ: 3, boxShadow: '0 6px 20px rgba(255, 107, 53, 0.25)' }} transition={{ duration: 0.2 }}>
                        <span className="relative z-10">+{domain.skills.length - 5}</span>
                        <motion.div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500" initial={{ scale: 0 }} animate={{ scale: expandedDomain === domain.name ? 1 : 0 }} transition={{ duration: 0.3, ease: "easeOut" }} />
                      </motion.div>
                      <motion.div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50" initial={{ opacity: 0, y: -10, scale: 0.9 }} animate={{ opacity: expandedDomain === domain.name ? 1 : 0, y: expandedDomain === domain.name ? 0 : -10, scale: expandedDomain === domain.name ? 1 : 0.9 }} transition={{ duration: 0.3, ease: "easeOut" }} style={{ pointerEvents: expandedDomain === domain.name ? 'auto' : 'none' }}>
                        <div className="bg-white border-2 border-orange-200 rounded-xl p-3 md:p-4 shadow-xl max-w-xs">
                          <div className="flex flex-wrap gap-2">
                            {domain.skills.slice(5).map((skill, index) => (
                              <motion.div key={skill} className="px-2 md:px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-[11px] md:text-xs font-medium flex items-center justify-center" style={{ minHeight: '24px' }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: expandedDomain === domain.name ? 1 : 0, scale: expandedDomain === domain.name ? 1 : 0.8 }} transition={{ delay: index * 0.05, duration: 0.2, ease: "easeOut" }} whileHover={{ backgroundColor: '#FF6B35', color: 'white', scale: 1.05 }}>{skill}</motion.div>
                            ))}
                          </div>
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l-2 border-t-2 border-orange-200 rotate-45" />
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
            <div className="md:col-span-2 relative flex items-center justify-center mt-8 md:mt-0">
              <motion.div className="relative w-24 h-24" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                <motion.div className="absolute inset-0 rounded-full border-2 border-orange-200" animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => (
                  <motion.div key={angle} className="absolute w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full" style={{ top: '50%', left: '50%', transformOrigin: '0 0', transform: `rotate(${angle}deg) translate(40px, -6px)` }} animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }} />
                ))}
                <motion.div className="absolute inset-0 flex items-center justify-center" animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  </div>
                </motion.div>
              </motion.div>
              <motion.div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-center" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.6 }}>
                <div className="text-xl font-bold text-orange-500">500+</div>
                <div className="text-xs text-gray-500">Certified</div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

const FinalCTASection = () => (
  <section className="w-full bg-white py-20">
    <div className="max-w-4xl mx-auto px-6 text-center">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <h2 className="text-gray-900 mb-8" style={{ fontSize: '96px', fontWeight: 500, fontFamily: 'Manrope, sans-serif', letterSpacing: '-5.76px', lineHeight: '115px' }}>Ready to Launch<br />Your Dream Career?</h2>
        <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-2xl mx-auto">Stop waiting for opportunities to find you. Start building the skills and certification that will make you undeniable to employers. Your career transformation begins today.</p>
        <Link href="/waitlist">
          <motion.button className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold text-lg hover:shadow-xl transition-all duration-300" whileHover={{ scale: 1.05, boxShadow: '0 15px 35px rgba(255, 107, 53, 0.4)' }} whileTap={{ scale: 0.98 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}>Start Your Journey</motion.button>
        </Link>
      </motion.div>
    </div>
  </section>
)

const FAQSection = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)
  const faqs = [
    { question: "What makes Crucible Certification different from other certificates?", answer: "Crucible Certification is rigorously proctored and evidence-based. Unlike course completion certificates, ours proves you can actually do the job through practical assessments designed with industry leaders." },
    { question: "How long does it take to get certified?", answer: "It depends on your chosen track and current skill level. Most candidates complete certification within 3-6 months, including learning, practice, and assessment phases." },
    { question: "Do employers really trust Crucible Certification?", answer: "Yes. We work directly with Pakistan's top companies to design our assessments. Our certification eliminates their screening time and reduces hiring risk, which is why they actively seek our certified candidates." },
    { question: "What if I don't have any technical background?", answer: "Our tracks are designed for all levels. We start with fundamentals and build up to job-ready skills. Many of our successful candidates started with no technical background." },
    { question: "Is there job placement support after certification?", answer: "Absolutely. Our employer network actively recruits Crucible Certified professionals. We connect you directly with companies looking for your specific skill set." }
  ]

  return (
    <section id="faq-section" className="w-full bg-gray-50 py-20" style={{ minHeight: '100vh' }}>
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="space-y-10">
          <h2 className="text-gray-900" style={{ fontSize: '96px', fontWeight: 500, fontFamily: 'Manrope, sans-serif', letterSpacing: '-5.76px', lineHeight: '115px' }}>Frequently<br />Asked<br />Questions</h2>
          <div className="space-y-4">
            <p className="text-lg text-gray-500 leading-relaxed">Have more questions or want to learn more about Crucible Careers?</p>
            <Link href="/waitlist"><button className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition group">Send A Message<svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></button></Link>
          </div>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200">
              <button className="w-full py-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors" onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}>
                <span className="text-lg font-medium text-gray-900 pr-4">{faq.question}</span>
                <div className="flex-shrink-0"><svg className={`w-6 h-6 text-gray-500 transition-transform ${expandedFAQ === index ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg></div>
              </button>
              {expandedFAQ === index && <div className="pb-6"><p className="text-gray-500 leading-relaxed">{faq.answer}</p></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const FooterSection = () => (
  <footer className="w-full bg-black text-white py-16">
    <div className="max-w-6xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="space-y-6">
          <Link href="/waitlist"><h3 className="text-xl font-bold hover:text-gray-300 transition-colors">Crucible Careers</h3></Link>
          <p className="text-gray-400 leading-relaxed">Your degree got you this far. We get you hired through rigorous certification that proves you're job-ready.</p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white transition"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></a>
            <a href="#" className="text-gray-400 hover:text-white transition"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">For Job Seekers</h4>
          <ul className="space-y-2 text-gray-400"><li><a href="#" className="hover:text-white transition">Get Certified</a></li><li><a href="#" className="hover:text-white transition">Browse Jobs</a></li><li><a href="#" className="hover:text-white transition">Skill Tracks</a></li><li><a href="#" className="hover:text-white transition">Success Stories</a></li></ul>
        </div>
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">For Employers</h4>
          <ul className="space-y-2 text-gray-400"><li><a href="#" className="hover:text-white transition">Hire Talent</a></li><li><a href="#" className="hover:text-white transition">Post Jobs</a></li><li><a href="#" className="hover:text-white transition">Enterprise Solutions</a></li><li><a href="#" className="hover:text-white transition">Pricing</a></li></ul>
        </div>
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Company</h4>
          <ul className="space-y-2 text-gray-400"><li><a href="#" className="hover:text-white transition">About Us</a></li><li><a href="#" className="hover:text-white transition">Contact</a></li><li><a href="#" className="hover:text-white transition">Privacy Policy</a></li><li><a href="#" className="hover:text-white transition">Terms of Service</a></li></ul>
        </div>
      </div>
      <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-gray-400 text-sm">© 2024 Crucible Careers. All rights reserved.</p>
        <p className="text-gray-400 text-sm mt-4 md:mt-0">Built by <span className="text-white font-medium">Salik Labs</span></p>
      </div>
    </div>
  </footer>
)

const LandingPage = () => {
  const [isNavBarVisible, setIsNavBarVisible] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const heroSectionHeight = window.innerHeight
      setScrollY(currentScrollY)
      const isInHeroSection = currentScrollY < heroSectionHeight
      const isScrollingUp = currentScrollY < lastScrollY.current
      const isScrollingDown = currentScrollY > lastScrollY.current
      if (currentScrollY <= 50) { setIsNavBarVisible(true) }
      else if (isInHeroSection && isScrollingUp) { setIsNavBarVisible(true) }
      else if (!isInHeroSection) { setIsNavBarVisible(false) }
      else if (isScrollingDown) { setIsNavBarVisible(false) }
      lastScrollY.current = currentScrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => { window.removeEventListener('scroll', handleScroll) }
  }, [])

  return (
    <div className="relative w-full min-h-screen">
      <NavBar isVisible={isNavBarVisible} />
      <HeroSection scrollY={scrollY} />
      <div className="relative z-20 bg-white">
        <ApplySection />
        <ScrutinizedSection />
        <CardsSection />
        <JobListingsSection />
        <TalentPoolSection />
        <FinalCTASection />
        <FAQSection />
        <FooterSection />
      </div>
    </div>
  )
}

export default LandingPage
