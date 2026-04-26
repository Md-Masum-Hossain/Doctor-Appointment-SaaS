import { useState } from 'react'
import { motion } from 'framer-motion'
import Container from '../components/ui/Container'
import SectionHeader from '../components/ui/SectionHeader'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const onChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }))
  }

  const onSubmit = (event) => {
    event.preventDefault()
  }

  return (
    <div className="py-10">
      <Container>
        <SectionHeader
          eyebrow="Contact"
          title="Let’s discuss your healthcare organization"
          description="Have questions about Docvexa? Reach out and our team will get back to you shortly."
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr]"
        >
          <Card>
            <h3 className="text-lg font-semibold text-text">Contact information</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>Email: hello@docvexa.com</p>
              <p>Phone: +1 (800) 555-0299</p>
              <p>Address: 120 Healthcare Avenue, Suite 8, Boston, MA</p>
            </div>
          </Card>

          <Card>
            <form onSubmit={onSubmit} className="space-y-4">
              <Input
                label="Full name"
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Enter your name"
                required
              />
              <Input
                label="Work email"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="name@company.com"
                required
              />
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-slate-700">Message</span>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={onChange}
                  rows={5}
                  placeholder="Tell us about your clinic or hospital needs"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-primary"
                  required
                />
              </label>

              <Button type="submit" variant="primary" className="w-full sm:w-auto">
                Send message
              </Button>
            </form>
          </Card>
        </motion.div>
      </Container>
    </div>
  )
}

export default ContactPage
