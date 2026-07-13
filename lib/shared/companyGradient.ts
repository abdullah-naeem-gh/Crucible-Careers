const GRADIENTS = [
  'from-[#FF6B00] to-[#FF914D]',
  'from-blue-500 to-blue-400',
  'from-purple-600 to-purple-500',
  'from-green-500 to-green-400',
  'from-red-500 to-red-400',
  'from-teal-500 to-teal-400',
]

export function pickCompanyGradient(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
}
