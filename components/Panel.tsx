import React from 'react'

type PanelProps = {
  title: string
  tagline?: string
  backgroundClassName?: string
  children?: React.ReactNode
}

export default function Panel({ title, tagline, backgroundClassName, children }: PanelProps) {
  return (
    <section className={`flex-1 relative overflow-hidden group panel-base`}>
      <div
        className={`absolute inset-0 -z-10 scale-100 transition-transform duration-500 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
          backgroundClassName ?? ''
        }`}
      />
      <div className="panel-content">
        <h1 className="headline">{title}</h1>
        {tagline ? <p className="tagline">{tagline}</p> : null}
        {children}
      </div>
    </section>
  )
}
