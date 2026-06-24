'use client'

interface TemplateSelectorProps {
  value: string
  onChange: (template: string) => void
}

const TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern',
    headerBg: '#1e3a5f',
    headerAccent: '#4f86f7',
    bodyBg: '#f5f7ff',
    description: 'Two-column with navy sidebar',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    headerBg: '#1a1a1a',
    headerAccent: '#555555',
    bodyBg: '#ffffff',
    description: 'Clean ATS-friendly layout',
  },
  {
    id: 'creative',
    name: 'Creative',
    headerBg: 'linear-gradient(135deg, #a855f7, #ec4899)',
    headerAccent: '#f97316',
    bodyBg: '#fafafa',
    description: 'Bold gradient header',
  },
  {
    id: 'developer',
    name: 'Developer',
    headerBg: '#1a1a2e',
    headerAccent: '#00d4ff',
    bodyBg: '#f8f9fc',
    description: 'Terminal-style tech resume',
  },
  {
    id: 'executive',
    name: 'Executive',
    headerBg: '#111111',
    headerAccent: '#444444',
    bodyBg: '#ffffff',
    description: 'Classic C-suite format',
  },
]

function TemplateThumbnail({
  template,
  selected,
  onClick,
}: {
  template: (typeof TEMPLATES)[0]
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        width: 120,
        cursor: 'pointer',
        background: 'transparent',
        border: 'none',
        padding: 0,
        outline: 'none',
      }}
    >
      <div
        style={{
          width: 120,
          height: 170,
          borderRadius: 8,
          overflow: 'hidden',
          border: selected ? '2px solid #3b82f6' : '2px solid #e5e7eb',
          boxShadow: selected
            ? '0 0 0 2px #3b82f6, 0 4px 16px rgba(59,130,246,0.25)'
            : '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'all 0.18s ease',
          transform: selected ? 'scale(1.04)' : 'scale(1)',
          background: template.bodyBg,
        }}
        onMouseEnter={(e) => {
          if (!selected) {
            ;(e.currentTarget as HTMLDivElement).style.transform = 'scale(1.05)'
            ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.14)'
          }
        }}
        onMouseLeave={(e) => {
          if (!selected) {
            ;(e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'
            ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
          }
        }}
      >
        {/* Header bar */}
        <div
          style={{
            height: 48,
            background: template.headerBg,
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '0 8px 6px',
          }}
        >
          {/* Decorative dots for developer */}
          {template.id === 'developer' && (
            <div style={{ display: 'flex', gap: 3, position: 'absolute', top: 6, left: 8 }}>
              {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
                <div key={c} style={{ width: 5, height: 5, borderRadius: '50%', background: c }} />
              ))}
            </div>
          )}
          {/* Profile circle for modern/creative */}
          {(template.id === 'modern' || template.id === 'creative') && (
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: template.headerAccent,
                border: '2px solid rgba(255,255,255,0.5)',
                position: 'absolute',
                right: 8,
                top: 8,
                opacity: 0.9,
              }}
            />
          )}
          {/* Name bar */}
          <div
            style={{
              width: template.id === 'executive' ? '70%' : '55%',
              height: 5,
              background: 'rgba(255,255,255,0.7)',
              borderRadius: 2,
            }}
          />
        </div>

        {/* Body lines */}
        <div style={{ padding: '8px 8px', flex: 1 }}>
          {/* Simulate content lines */}
          {template.id === 'modern' ? (
            <div style={{ display: 'flex', gap: 5, height: '100%' }}>
              {/* Sidebar */}
              <div style={{ width: 35, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[40, 30, 35, 30, 25, 20, 28].map((w, i) => (
                  <div
                    key={i}
                    style={{
                      width: `${w}px`,
                      height: 4,
                      background: i < 2 ? template.headerAccent + '90' : '#c8d8f080',
                      borderRadius: 2,
                    }}
                  />
                ))}
              </div>
              {/* Main */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[70, 55, 60, 50, 65, 48, 55, 50].map((w, i) => (
                  <div
                    key={i}
                    style={{
                      width: `${w}%`,
                      height: 3.5,
                      background: i % 4 === 0 ? '#1e3a5f60' : '#33333320',
                      borderRadius: 2,
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              {[80, 60, 70, 55, 65, 50, 60, 45, 55, 40, 50, 38].map((w, i) => (
                <div
                  key={i}
                  style={{
                    width: `${w}%`,
                    height: 3.5,
                    background:
                      template.id === 'developer'
                        ? i % 4 === 0
                          ? '#00d4ff40'
                          : '#1e293b30'
                        : template.id === 'creative'
                        ? i % 4 === 0
                          ? '#a855f730'
                          : '#33333318'
                        : '#33333320',
                    borderRadius: 2,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Label */}
      <div
        style={{
          marginTop: 8,
          textAlign: 'center',
          fontSize: 12,
          fontWeight: selected ? 600 : 500,
          color: selected ? '#3b82f6' : '#374151',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {template.name}
      </div>
    </button>
  )
}

export function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          paddingBottom: 8,
          paddingTop: 4,
          // Hide scrollbar on webkit
          scrollbarWidth: 'thin',
        }}
      >
        {TEMPLATES.map((t) => (
          <TemplateThumbnail
            key={t.id}
            template={t}
            selected={value === t.id}
            onClick={() => onChange(t.id)}
          />
        ))}
      </div>
    </div>
  )
}
