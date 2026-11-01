import { StarIcon, ChatCircleTextIcon } from '@phosphor-icons/react'

export default function ProductReviews() {
  return <section className="shop-container product-reviews" aria-labelledby="reviews-heading" data-reveal>
    <h2 id="reviews-heading">Reviews</h2>
    <div className="product-review-summary"><div className="product-rating"><strong>—</strong><span>No ratings yet</span><div aria-label="No rating">{Array.from({ length: 5 }, (_, index) => <StarIcon key={index} size={20} aria-hidden="true" />)}</div></div>
      <div className="product-rating-bars" aria-label="Rating distribution: no reviews">{['Excellent', 'Good', 'Average', 'Below average', 'Poor'].map(label => <div key={label}><span>{label}</span><div className="product-rating-track" /><span>0</span></div>)}</div>
    </div>
    <div className="product-reviews-empty"><ChatCircleTextIcon size={28} weight="light" /><div><h3>No reviews yet</h3><p>Customer reviews are not available in this display catalog.</p></div></div>
  </section>
}
