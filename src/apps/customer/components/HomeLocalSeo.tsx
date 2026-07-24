import { Link } from "react-router-dom"
import { BRANCH_CONTACT } from "@/lib/branchContact"
import { BRANCH_SEO } from "@/lib/branchSeo"
import "./HomeLocalSeo.css"

/** Crawlable local SEO copy for Kempen & Straelen pizza searches. */
export default function HomeLocalSeo() {
  const kempen = BRANCH_SEO["concordia-kempen"]
  const straelen = BRANCH_SEO["concordia-straelen"]

  return (
    <section className="home-local-seo" aria-labelledby="home-local-seo-title">
      <h2 id="home-local-seo-title" className="home-local-seo__title">
        Pizza &amp; Pizzeria in Kempen und Straelen
      </h2>
      <p className="home-local-seo__lead">
        Bei Pizzeria Concordia bestellen Sie Pizza, Pasta und mehr bequem online – zur Abholung
        oder Lieferung. Wählen Sie Ihre Filiale und öffnen Sie die Speisekarte.
      </p>
      <div className="home-local-seo__grid">
        <article className="home-local-seo__card">
          <h3>Pizza bestellen in Kempen</h3>
          <p>
            {kempen.name}, {kempen.streetAddress}, {kempen.postalCode} {kempen.addressLocality}.
            Telefon: {BRANCH_CONTACT["concordia-kempen"].phoneDisplay}.
          </p>
          <Link to="/branch/concordia-kempen">Zur Speisekarte Kempen</Link>
        </article>
        <article className="home-local-seo__card">
          <h3>Pizza bestellen in Straelen</h3>
          <p>
            {straelen.name}, {straelen.streetAddress}, {straelen.postalCode}{" "}
            {straelen.addressLocality}. Telefon: {BRANCH_CONTACT["concordia-straelen"].phoneDisplay}.
          </p>
          <Link to="/branch/concordia-straelen">Zur Speisekarte Straelen</Link>
        </article>
      </div>
    </section>
  )
}
