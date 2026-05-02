export default function ClaudeStrip() {
  return (
    <div style={{
      background: 'var(--grad-soft)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-card)',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    }}>
      {/* Star icon with gradient bg */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        background: 'var(--grad)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.25rem',
        flexShrink: 0,
      }}>
        ✦
      </div>
      <div>
        <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem' }}>
          Análisis impulsado por Claude · Anthropic
        </p>
        <p style={{ color: 'var(--text2)', fontSize: '0.78rem', marginTop: 3, lineHeight: 1.5 }}>
          Usamos Claude, el modelo de IA de Anthropic, para analizar tus datos y generar
          insights precisos, contextualizados y accionables.
        </p>
      </div>
    </div>
  )
}
