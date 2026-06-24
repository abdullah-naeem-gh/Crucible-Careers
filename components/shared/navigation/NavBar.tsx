"use client";
import { motion } from 'framer-motion'
import Link from 'next/link'

interface NavBarProps {
  isVisible: boolean
}

const NavBar = ({ isVisible }: NavBarProps) => {
  const scrollToFAQ = () => {
    const faqSection = document.getElementById('faq-section')
    if (faqSection) {
      faqSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }
  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-4"
      style={{ 
        backgroundImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.05) 100%)'
      }}
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ 
        duration: 0.3, 
        ease: "easeInOut" 
      }}
    >
      <Link href="/" className="text-2xl font-bold text-white hover:text-gray-200 transition-colors">
        Crucible
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/waitlist">
          <motion.div
            className="relative overflow-hidden rounded-full px-4 py-2"
            initial="rest"
            whileHover="hover"
            animate="rest"
          >
            <motion.div
              className="absolute inset-0 bg-white rounded-full"
              variants={{
                rest: { scaleX: 0, originX: 0 },
                hover: { scaleX: 1, originX: 0 }
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
            <motion.span
              className="relative z-10 cursor-pointer font-manrope text-[14px] font-semibold tracking-[-0.028em] leading-[21px] block"
              variants={{
                rest: { color: '#ffffff' },
                hover: { color: '#000000' }
              }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              Learn
            </motion.span>
          </motion.div>
        </Link>
        <motion.div
          className="relative overflow-hidden rounded-full px-4 py-2 cursor-pointer"
          initial="rest"
          whileHover="hover"
          animate="rest"
          onClick={scrollToFAQ}
        >
          <motion.div
            className="absolute inset-0 bg-white rounded-full"
            variants={{
              rest: { scaleX: 0, originX: 0 },
              hover: { scaleX: 1, originX: 0 }
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
          <motion.span
            className="relative z-10 font-manrope text-[14px] font-semibold tracking-[-0.028em] leading-[21px] block"
            variants={{
              rest: { color: '#ffffff' },
              hover: { color: '#000000' }
            }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            FAQ
          </motion.span>
        </motion.div>
        <Link href="/gateway">
          <motion.button 
            className="w-[120px] h-[40px] bg-black text-white rounded-full font-manrope text-[14px] font-semibold tracking-[-0.028em] leading-[21px] flex items-center justify-center relative overflow-hidden"
            initial="rest"
            whileHover="hover"
            animate="rest"
          >
            <motion.div
              className="absolute inset-0 bg-white rounded-full"
              variants={{
                rest: { scaleX: 0, originX: 0 },
                hover: { scaleX: 1, originX: 0 }
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
            <motion.span
              className="relative z-10"
              variants={{
                rest: { color: '#ffffff' },
                hover: { color: '#000000' }
              }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              Get Started
            </motion.span>
          </motion.button>
        </Link>
      </div>
    </motion.nav>
  )
}

export default NavBar
