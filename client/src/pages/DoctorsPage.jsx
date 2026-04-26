import { motion } from 'framer-motion'
import Container from '../components/ui/Container'
import SectionHeader from '../components/ui/SectionHeader'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'

const placeholders = [
  'Cardiology',
  'Dermatology',
  'Orthopedics',
  'Pediatrics',
  'Neurology',
  'Gynecology',
]

function DoctorsPage() {
  return (
    <div className="py-10">
      <Container>
        <SectionHeader
          eyebrow="Doctors"
          title="Explore available doctors and specialties"
          description="This is a public placeholder listing. Real doctor data integration will be added in the next phase."
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="mt-10"
        >
          <Card>
            <div className="flex flex-wrap gap-2">
              {placeholders.map((item) => (
                <Badge key={item} className="bg-accent/10 text-accent border-accent/15">
                  {item}
                </Badge>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-600">
              Public doctor discovery UI is ready. API connection, search, filters, and profile cards are intentionally deferred.
            </p>
          </Card>
        </motion.div>
      </Container>
    </div>
  )
}

export default DoctorsPage
