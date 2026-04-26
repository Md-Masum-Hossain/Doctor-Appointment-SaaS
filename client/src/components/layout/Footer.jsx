import { Link } from 'react-router-dom'
import Container from '../ui/Container'

function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <Container className="py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-bold text-primary">Docvexa</h3>
            <p className="mt-2 text-sm text-slate-600">
              Premium healthcare SaaS for smoother appointments and better care coordination.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text">Product</h4>
            <ul className="mt-2 space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/" className="hover:text-primary">
                  Landing
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-primary">
                  Doctors
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text">Company</h4>
            <ul className="mt-2 space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/about" className="hover:text-primary">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text">Legal</h4>
            <p className="mt-2 text-sm text-slate-600">Privacy-first design. HIPAA-ready architecture roadmap.</p>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-5 text-sm text-slate-500">
          © {new Date().getFullYear()} Docvexa. All rights reserved.
        </div>
      </Container>
    </footer>
  )
}

export default Footer
