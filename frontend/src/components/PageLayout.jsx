import Navbar from './Navbar'
import TabsNav from './TabsNav'

export default function PageLayout({ children, maxWidth = 'max-w-5xl' }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <TabsNav />
      <main className={`${maxWidth} mx-auto px-4 py-8`}>
        {children}
      </main>
    </div>
  )
}
