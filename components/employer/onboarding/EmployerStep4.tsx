'use client'

const L = 'mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-white/40'
const TA = 'w-full rounded-xl border border-white/[0.08] bg-[#121212] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#FF6B00]/50 focus:ring-2 focus:ring-[#FF6B00]/10 transition-colors resize-none custom-scrollbar'

export interface Step4Data {
  overview: string
  culture: string
}

interface Props {
  data: Step4Data
  onChange: (d: Step4Data) => void
}

export default function EmployerStep4({ data, onChange }: Props) {
  const set = <K extends keyof Step4Data>(k: K, v: Step4Data[K]) =>
    onChange({ ...data, [k]: v })

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Overview & culture</h2>
        <p className="mt-1 text-sm text-white/40">Help candidates understand your mission and team.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className={L}>Company overview</label>
          <textarea
            value={data.overview}
            onChange={(e) => set('overview', e.target.value)}
            rows={4}
            className={TA}
            placeholder="What does your company do? What problems do you solve? What makes you different?"
          />
          <p className="mt-1 text-[11px] text-white/25">
            {data.overview.length}/500 characters
          </p>
        </div>

        <div>
          <label className={L}>Culture & values</label>
          <textarea
            value={data.culture}
            onChange={(e) => set('culture', e.target.value)}
            rows={3}
            className={TA}
            placeholder="Describe your team culture, working style, and the values you live by"
          />
        </div>
      </div>

      <div className="rounded-xl border border-[#FF6B00]/15 bg-[#FF6B00]/[0.06] p-3.5">
        <p className="text-xs font-medium text-[#FF914D]">💡 Pro tip</p>
        <p className="mt-1 text-xs text-white/35 leading-relaxed">
          Companies with detailed profiles get up to 3× more qualified applicants. You can always fill this in later from your dashboard.
        </p>
      </div>
    </div>
  )
}
