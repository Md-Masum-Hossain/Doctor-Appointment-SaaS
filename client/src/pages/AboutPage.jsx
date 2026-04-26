import { motion } from 'framer-motion'
import Container from '../components/ui/Container'
import SectionHeader from '../components/ui/SectionHeader'
import Card from '../components/ui/Card'

const values = [
  {
    title: 'Patient-first design',
    description: 'Every flow is built to reduce waiting time and remove appointment friction.',
  },
  {
    title: 'Doctor efficiency',
    description: 'Operational workflows are simplified so providers can focus on patient care.',
  },
  {
    title: 'Reliable platform',
    description: 'Security-oriented architecture and scalable foundations for long-term growth.',
  },
]

function AboutPage() {
  return (
    <div className="py-10">
      <Container>
        <SectionHeader
          eyebrow="About Docvexa"
          title="Building the modern operating system for healthcare scheduling"
          description="Docvexa is focused on making access to care easier for patients and daily operations smoother for clinics and hospitals."
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="mt-10 grid gap-4 md:grid-cols-3"
        >
          {values.map((value) => (
            <Card key={value.title}>
              <h3 className="text-lg font-semibold text-text">{value.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{value.description}</p>
            </Card>
          ))}
        </motion.div>
      </Container>
    </div>
  )
}

export default AboutPage
