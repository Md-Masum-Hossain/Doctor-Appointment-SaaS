import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Container from '../components/ui/Container'
import SectionHeader from '../components/ui/SectionHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

const stats = [
  { value: '250+', label: 'Clinics onboarded' },
  { value: '1.2M+', label: 'Appointments coordinated' },
  { value: '98.9%', label: 'Platform uptime' },
  { value: '35%', label: 'Lower no-show rate' },
]

const howItWorks = [
  {
    step: '01',
    title: 'Patients discover and schedule',
    description: 'Patients browse specialties and request slots from a clear public interface.',
  },
  {
    step: '02',
    title: 'Doctors manage demand',
    description: 'Doctors review requests, confirm visits, and keep their schedule streamlined.',
  },
  {
    step: '03',
    title: 'Care teams stay aligned',
    description: 'Operations teams get better visibility and coordination across locations.',
  },
]

const features = [
  'Role-based access and secure sessions',
  'Responsive patient booking experience',
  'Smart scheduling workflow foundation',
  'Centralized clinic operations panel',
  'Reliable communication architecture',
  'Scalable multi-role SaaS structure',
]

const specializations = [
  'Cardiology',
  'Dermatology',
  'Orthopedics',
  'Pediatrics',
  'Neurology',
  'ENT',
  'Psychiatry',
  'Gynecology',
]

const patientBenefits = [
  'Book appointments in minutes, from any device',
  'Find the right specialty with confidence',
  'Stay informed with clear appointment updates',
]

const doctorBenefits = [
  'Reduce admin overhead with simpler scheduling',
  'Minimize missed appointments with better flow',
  'Protect time with role-aware platform controls',
]

function HomePage() {
  return (
    <div className="pb-8">
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-background to-background">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

        <Container className="relative py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]"
          >
            <div>
              <Badge className="mb-4 bg-accent/10 text-accent border-accent/15">Healthcare SaaS Platform</Badge>
              <h1 className="text-4xl font-bold leading-tight text-text sm:text-5xl">
                Premium scheduling experience for modern care teams
              </h1>
              <p className="mt-5 max-w-xl text-base text-slate-600 sm:text-lg">
                Docvexa helps patients book faster, doctors manage smarter, and healthcare organizations operate with confidence.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/register">
                  <Button variant="primary" className="px-6 py-3 text-sm sm:text-base">
                    Start Free
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="ghost" className="px-6 py-3 text-sm sm:text-base">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>

            <Card className="bg-gradient-to-br from-primary to-blue-700 text-white shadow-lg">
              <p className="text-sm text-blue-100">Live snapshot</p>
              <h3 className="mt-2 text-2xl font-semibold">Operational visibility in one place</h3>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white/15 p-4">
                  <p className="text-xs uppercase tracking-wide text-blue-100">Today visits</p>
                  <p className="mt-1 text-2xl font-bold">1,248</p>
                </div>
                <div className="rounded-xl bg-white/15 p-4">
                  <p className="text-xs uppercase tracking-wide text-blue-100">Avg wait</p>
                  <p className="mt-1 text-2xl font-bold">09m</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          <SectionHeader
            eyebrow="Trusted outcomes"
            title="Built for high-performance healthcare organizations"
            description="Measured impact across clinics and care teams."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <Card key={item.label} className="text-center">
                <p className="text-3xl font-bold text-primary">{item.value}</p>
                <p className="mt-2 text-sm text-slate-600">{item.label}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          <SectionHeader
            eyebrow="How it works"
            title="Three steps to smoother healthcare operations"
            description="Simple workflow from discovery to confirmed care delivery."
          />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {howItWorks.map((item) => (
              <Card key={item.step}>
                <p className="text-sm font-semibold text-accent">Step {item.step}</p>
                <h3 className="mt-2 text-lg font-semibold text-text">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          <SectionHeader
            eyebrow="Core features"
            title="Everything you need for a premium patient journey"
            description="A clean, secure foundation designed for healthcare SaaS growth."
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature} className="border-primary/15">
                <p className="text-sm font-medium text-text">{feature}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          <SectionHeader
            eyebrow="Specializations"
            title="Discover care across popular doctor categories"
            description="Public-facing specialty browsing designed for quick patient decisions."
          />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="mt-8 flex flex-wrap justify-center gap-2"
          >
            {specializations.map((item) => (
              <Badge key={item} className="bg-white text-slate-700 border-slate-300">
                {item}
              </Badge>
            ))}
          </motion.div>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <SectionHeader
                eyebrow="Patient benefits"
                title="Comfort, speed, and confidence for every booking"
                description="Patients get a simple, transparent, mobile-ready booking experience."
                centered={false}
              />
              <div className="mt-6 space-y-3">
                {patientBenefits.map((item) => (
                  <Card key={item}>
                    <p className="text-sm text-slate-700">{item}</p>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <SectionHeader
                eyebrow="Doctor benefits"
                title="More clinical focus, less operational stress"
                description="Doctors and staff can coordinate schedules without workflow clutter."
                centered={false}
              />
              <div className="mt-6 space-y-3">
                {doctorBenefits.map((item) => (
                  <Card key={item}>
                    <p className="text-sm text-slate-700">{item}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="rounded-3xl bg-gradient-to-r from-primary to-accent p-8 text-white sm:p-10"
          >
            <h2 className="text-2xl font-bold sm:text-3xl">Ready to modernize your healthcare experience?</h2>
            <p className="mt-3 max-w-2xl text-sm text-blue-50 sm:text-base">
              Launch your care platform with Docvexa and deliver faster booking, cleaner operations, and better patient engagement.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/register">
                <Button variant="ghost" className="bg-white text-primary hover:bg-slate-100">
                  Create account
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="ghost" className="bg-white/15 text-white ring-white/30 hover:bg-white/20">
                  Talk to sales
                </Button>
              </Link>
            </div>
          </motion.div>
        </Container>
      </section>
    </div>
  )
}

export default HomePage
