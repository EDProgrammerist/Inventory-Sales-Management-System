import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowDownIcon, ArrowRightIcon, ArrowUpRightIcon, MinusIcon, PlusIcon } from '@phosphor-icons/react'
import logo from '@/assets/shenban-logo.png'
import { PaperNote, PetalMark, Scribble, LoopMark } from '@/components/features/landing/landing-artwork'
import LandingIllustration from '@/components/features/landing/landing-illustration'
import { useLandingMotion } from '@/components/features/landing/use-landing-motion'
import WorkspaceFeatures from '@/components/features/landing/workspace-features'
import WorkflowCapabilities from '@/components/features/landing/workflow-capabilities'
import '@/styles/landing.css'

export default function LandingPage() {
  const motionRef = useLandingMotion()
  const [count, setCount] = useState(0)
  return (
    <div className="landing-page" ref={motionRef}>
      <title>Shenban | Inventory, in order.</title>
      <meta name="description" content="Shenban brings inventory, suppliers, orders, stores, and reports into one workspace." />
      <a className="landing-skip" href="#landing-main">Skip to content</a>
      <header className="landing-nav landing-container">
        <Link to="/" className="landing-brand" aria-label="Shenban home"><img src={logo} alt="" width="38" height="38" /><span>Shenban</span></Link>
        <div className="nav-action"><Link className="landing-button landing-button-ghost" to="/login">Log in / Sign up</Link></div>
      </header>
      <main id="landing-main" tabIndex={-1}>
        <section className="landing-hero landing-container" aria-labelledby="landing-heading">
          <p className="process-note" aria-hidden="true"><span>add</span><ArrowRightIcon />check<ArrowRightIcon />organize</p>
          <div className="hero-heading-group">
            <h1 id="landing-heading"><span>Inventory, <i className="hero-word-gap" aria-hidden="true"><LandingIllustration name="inventory" className="hero-stock" /></i>in order.</span><span>A little <em>clearer.</em></span></h1>
            <div className="count-playground">
              <div className="count-widget">
                <Link className="landing-button landing-button-primary hero-signup" to="/signup">Create an account <ArrowRightIcon size={18} /></Link>
                <div className="count-controls" role="group" aria-label="Try a stock count"><span className="count-label">Preview stock</span><div className="count-stepper">
                  <button type="button" aria-label="Decrease preview stock" disabled={count === 0} onClick={() => setCount(value => Math.max(0, value - 1))}><MinusIcon size={17} /></button>
                  <output key={count} aria-live="polite" aria-atomic="true">{count}</output>
                  <button type="button" aria-label="Increase preview stock" disabled={count === 99} onClick={() => setCount(value => Math.min(99, value + 1))}><PlusIcon size={18} /></button>
                </div></div>
              </div>
            </div>
          </div>
          <p className="hero-description">An inventory-management workspace. Give products, suppliers, orders, and stores a little more clarity.</p>
          <a className="hero-look landing-text-link" href="#explore">Take a look around <ArrowDownIcon size={17} /></a>
          <PaperNote className="hero-note hero-note-left" /><PaperNote className="hero-note hero-note-right" />
          <PetalMark className="hero-petal hero-petal-left" /><PetalMark className="hero-petal hero-petal-right" />
          <Scribble className="hero-divider" />
        </section>

        <section id="explore" className="landing-container landing-overview" aria-labelledby="inventory-feature-heading">
          <div className="section-heading"><h2 id="inventory-feature-heading">Every item, in its place.</h2><p>Take a look inside. Your inventory story starts with your first entry.</p></div>
          <div className="inventory-illustration-stage">
            <LandingIllustration name="overview" /><PetalMark className="overview-petal" />
          </div>
        </section>

        <section className="landing-container landing-workflow" aria-labelledby="workflow-heading">
          <div className="section-heading"><h2 id="workflow-heading">A place for your<br /><em>whole inventory.</em></h2><p>From the first supplier to the next order. Bring the details together.</p></div>
          <div className="workflow-visual">
            <div className="workflow-illustration-stage"><LandingIllustration name="workflow" /></div>
          </div>
        </section>

        <WorkflowCapabilities />

        <section className="landing-container landing-feature landing-report-feature" aria-labelledby="report-feature-heading">
          <div className="feature-copy"><h2 id="report-feature-heading">The numbers.<br /><em>In plain sight.</em></h2><Scribble /><p>Find the dashboard and reports in one workspace, with prices in Philippine pesos and zero states that say exactly what they mean.</p><Link to="/reports" className="landing-button landing-button-inverse">Explore reports <ArrowUpRightIcon size={18} /></Link></div>
          <div className="landing-scene-art"><LandingIllustration name="reports" /></div>
        </section>

        <WorkspaceFeatures />

        <section id="about-project" className="landing-container landing-project" aria-labelledby="project-heading">
          <h2 id="project-heading">Your inventory.<br />All together.</h2>
          <div className="project-proof">
            <div className="project-art"><LandingIllustration name="together" /><LoopMark /></div>
            <div className="project-paper">
              <h3>Everything has its place.</h3>
              <p>Products, suppliers, orders, stores, and reports. Bring the details together in one inventory workspace.</p>
              <Link className="landing-text-link" to="/signup">Explore Shenban <ArrowUpRightIcon size={18} /></Link>
            </div>
            <PaperNote className="proof-note" />
          </div>
        </section>

        <section className="landing-close" aria-labelledby="closing-heading">
          <div className="closing-invitation landing-container"><LandingIllustration name="closing" className="closing-stock" /><p>Let's put things in order.</p></div>
          <div className="closing-statement landing-container"><h2 id="closing-heading">A little more <em>Shenban.</em></h2></div>
          <Link className="landing-button landing-button-primary" to="/signup">Create an account <ArrowRightIcon size={18} /></Link>
        </section>
      </main>
      <footer className="landing-footer landing-container"><Link to="/" className="landing-brand"><img src={logo} alt="" width="28" height="28" /><span>Shenban</span></Link><p>Keep your inventory in order.</p><a href="#landing-main">Back to top <ArrowUpRightIcon size={16} /></a></footer>
    </div>
  )
}
