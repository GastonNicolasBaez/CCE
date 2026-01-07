'use client'

import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002C6F] to-[#001840]">
      {/* Header */}
      <header className="relative z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-white text-2xl font-bold">
              🏆 Club Manager
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-white/80 hover:text-white transition">
                Características
              </a>
              <a href="#pricing" className="text-white/80 hover:text-white transition">
                Planes
              </a>
              <a href="#contact" className="text-white/80 hover:text-white transition">
                Contacto
              </a>
            </div>
            <Link
              href="/register"
              className="bg-[#FFA500] hover:bg-[#FF8C00] text-white px-6 py-2 rounded-lg font-semibold transition transform hover:scale-105"
            >
              Comenzar Gratis
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Gestiona tu Club Deportivo
            <br />
            <span className="text-[#FFA500]">de forma Simple y Eficiente</span>
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            Sistema completo para administrar miembros, pagos, actividades y más.
            Ahorra tiempo y mejora la organización de tu club.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-[#FFA500] hover:bg-[#FF8C00] text-white px-8 py-4 rounded-lg font-semibold text-lg transition transform hover:scale-105 shadow-xl"
            >
              Probar Gratis 14 Días
            </Link>
            <a
              href="#features"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold text-lg transition backdrop-blur-sm border border-white/20"
            >
              Ver Características
            </a>
          </div>
          <p className="text-white/60 text-sm mt-4">
            ✓ Sin tarjeta de crédito &nbsp;&nbsp; ✓ Configuración en 5 minutos &nbsp;&nbsp; ✓ Soporte incluido
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
          Todo lo que necesitas en un solo lugar
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-white mb-3">Gestión de Socios</h3>
            <p className="text-white/70">
              Administra todos tus miembros, actividades, estados de pago y más desde un panel intuitivo.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-bold text-white mb-3">Pagos Automáticos</h3>
            <p className="text-white/70">
              Envía links de pago por email, recibe notificaciones automáticas y lleva control de cuotas.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-3">Reportes y Estadísticas</h3>
            <p className="text-white/70">
              Visualiza el estado de tu club con dashboards interactivos y reportes detallados.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-white mb-3">Multi-dispositivo</h3>
            <p className="text-white/70">
              Accede desde cualquier dispositivo: computadora, tablet o celular. Diseño responsive.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-white mb-3">Seguro y Privado</h3>
            <p className="text-white/70">
              Tus datos están protegidos con encriptación. Cada club tiene su propio espacio aislado.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-white mb-3">Rápido y Fácil</h3>
            <p className="text-white/70">
              Configuración en minutos. Interfaz intuitiva que no requiere capacitación técnica.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
          Planes para clubes de todos los tamaños
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-2">Gratis</h3>
            <p className="text-white/60 mb-6">Ideal para comenzar</p>
            <div className="text-4xl font-bold text-white mb-6">
              $0<span className="text-xl text-white/60">/mes</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="text-white/80">✓ Hasta 50 miembros</li>
              <li className="text-white/80">✓ Gestión básica</li>
              <li className="text-white/80">✓ Pagos online</li>
              <li className="text-white/80">✓ Soporte por email</li>
            </ul>
            <Link
              href="/register"
              className="block w-full bg-white/20 hover:bg-white/30 text-white text-center px-6 py-3 rounded-lg font-semibold transition"
            >
              Comenzar Gratis
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-[#FFA500] to-[#FF8C00] rounded-2xl p-8 border border-[#FFA500] shadow-2xl transform scale-105">
            <div className="bg-white text-[#FFA500] text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
              MÁS POPULAR
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
            <p className="text-white/90 mb-6">Para clubs en crecimiento</p>
            <div className="text-4xl font-bold text-white mb-6">
              $29<span className="text-xl text-white/80">/mes</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="text-white">✓ Hasta 500 miembros</li>
              <li className="text-white">✓ Todas las funciones</li>
              <li className="text-white">✓ Reportes avanzados</li>
              <li className="text-white">✓ Soporte prioritario</li>
              <li className="text-white">✓ Personalización</li>
            </ul>
            <Link
              href="/register"
              className="block w-full bg-white text-[#FFA500] text-center px-6 py-3 rounded-lg font-semibold transition hover:bg-white/90"
            >
              Probar 14 Días Gratis
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
            <p className="text-white/60 mb-6">Para clubs grandes</p>
            <div className="text-4xl font-bold text-white mb-6">
              A medida
            </div>
            <ul className="space-y-3 mb-8">
              <li className="text-white/80">✓ Miembros ilimitados</li>
              <li className="text-white/80">✓ Funciones premium</li>
              <li className="text-white/80">✓ API personalizada</li>
              <li className="text-white/80">✓ Soporte 24/7</li>
              <li className="text-white/80">✓ Implementación dedicada</li>
            </ul>
            <a
              href="#contact"
              className="block w-full bg-white/20 hover:bg-white/30 text-white text-center px-6 py-3 rounded-lg font-semibold transition"
            >
              Contactar Ventas
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-[#FFA500] to-[#FF8C00] rounded-3xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Listo para transformar tu club?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Únete a cientos de clubes que ya confían en nosotros
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-[#FFA500] px-10 py-4 rounded-lg font-bold text-lg transition transform hover:scale-105 shadow-xl"
          >
            Comenzar Ahora →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-white/10">
        <div className="text-center text-white/60">
          <p>© 2026 Club Manager. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
