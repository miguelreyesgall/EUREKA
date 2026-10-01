export default function Logo({ className = '', mark = false }) {
  return (
    <span className={`inline-flex items-center gap-2 font-extrabold tracking-tight ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-600 text-white shadow-lift">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            d="M12 3.5c-3.6 0-6.4 2.7-6.4 6.4 0 2.3 1.3 4 2.6 5 .6.5.9 1 1 1.7l.2 1.3c.05.5.5.9 1 .9h3.2c.5 0 .95-.4 1-.9l.2-1.3c.1-.7.4-1.2 1-1.7 1.3-1 2.6-2.7 2.6-5 0-3.7-2.8-6.4-6.4-6.4Z"
            fill="#fbbf24"
          />
          <path d="M9.5 20h5M10.3 22h3.4" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
      {!mark && <span>Eureka</span>}
    </span>
  )
}
