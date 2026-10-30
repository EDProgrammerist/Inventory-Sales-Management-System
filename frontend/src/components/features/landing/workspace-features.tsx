import { Link } from 'react-router'
import { ArrowUpRightIcon, CheckIcon } from '@phosphor-icons/react'
import LandingIllustration from './landing-illustration'

export default function WorkspaceFeatures() {
  return (
    <>
      <section id="supplier-story" className="landing-container landing-story" aria-labelledby="supplier-story-heading">
        <div className="story-copy">
          <h2 id="supplier-story-heading">Keep good<br /><em>company.</em></h2>
          <p>Names, contact details, and the products they supply. Give every supplier a place in your inventory story.</p>
          <ul><li><CheckIcon size={19} /> Supplier and product details</li><li><CheckIcon size={19} /> Contact information in one view</li></ul>
          <Link to="/suppliers" className="landing-text-link">Explore suppliers <ArrowUpRightIcon size={19} /></Link>
        </div>
        <div className="landing-scene-art"><LandingIllustration name="suppliers" /></div>
      </section>
      <section id="order-story" className="landing-container landing-feature landing-order-story" aria-labelledby="order-story-heading">
        <div className="feature-copy">
          <h2 id="order-story-heading">Every order.<br /><em>All the details.</em></h2>
          <p>Record quantities, buying prices, and expected delivery dates. Keep your next order easy to find and review.</p>
          <Link to="/orders" className="landing-button landing-button-inverse">Explore orders <ArrowUpRightIcon size={18} /></Link>
        </div>
        <div className="landing-scene-art"><LandingIllustration name="orders" /></div>
      </section>
      <section id="store-story" className="landing-container landing-story landing-store-story" aria-labelledby="store-story-heading">
        <div className="story-copy">
          <h2 id="store-story-heading">Every store.<br />A <em>home.</em></h2>
          <p>Keep branch addresses and contact information together. Find the places behind your products, without the scattered notes.</p>
          <Link to="/manage-store" className="landing-text-link">Explore stores <ArrowUpRightIcon size={19} /></Link>
        </div>
        <div className="landing-scene-art"><LandingIllustration name="stores" /></div>
      </section>
    </>
  )
}
