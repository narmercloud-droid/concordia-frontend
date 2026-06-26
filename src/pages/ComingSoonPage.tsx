import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import ConcordiaWordmark from "@/apps/customer/components/ConcordiaWordmark"
import LanguageSwitcher from "@/apps/customer/components/LanguageSwitcher"
import { getLaunchDate } from "@/lib/comingSoon"
import { localeForLanguage } from "@/i18n/languages"
import "./ComingSoonPage.css"

const HERO_IMAGE = "/images/food/concordia-hero-oven-pizza.webp?v=20260622"

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  return useMemo(() => {
    const diff = Math.max(0, target.getTime() - now)
    const days = Math.floor(diff / 86_400_000)
    const hours = Math.floor((diff % 86_400_000) / 3_600_000)
    const minutes = Math.floor((diff % 3_600_000) / 60_000)
    return { days, hours, minutes, done: diff <= 0 }
  }, [now, target])
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  const padded = String(value).padStart(2, "0")
  return (
    <div className="coming-soon__countdown-item">
      <span className="coming-soon__countdown-value" aria-hidden="true">
        {padded}
      </span>
      <span className="coming-soon__countdown-unit">{label}</span>
    </div>
  )
}

export default function ComingSoonPage() {
  const { t, i18n } = useTranslation()
  const launch = getLaunchDate()
  const { days, hours, minutes } = useCountdown(launch)

  const launchLabel = useMemo(() => {
    const lang = (i18n.language ?? "de").split("-")[0]
    return new Intl.DateTimeFormat(localeForLanguage(lang), {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Europe/Berlin"
    }).format(launch)
  }, [i18n.language, launch])

  useEffect(() => {
    const previous = document.title
    document.title = t("comingSoon.documentTitle")
    const meta = document.querySelector('meta[name="robots"]')
    const created = !meta
    const robots = created ? document.createElement("meta") : meta
    if (created) {
      robots.setAttribute("name", "robots")
      document.head.appendChild(robots)
    }
    const previousContent = robots.getAttribute("content")
    robots.setAttribute("content", "noindex, nofollow")

    return () => {
      document.title = previous
      if (created) {
        robots.remove()
      } else if (previousContent) {
        robots.setAttribute("content", previousContent)
      } else {
        robots.removeAttribute("content")
      }
    }
  }, [t])

  const highlights = [
    { icon: "🛵", text: t("comingSoon.highlight2") },
    { icon: "✨", text: t("comingSoon.highlight3") }
  ]

  return (
    <div className="coming-soon">
      <div className="coming-soon__backdrop" aria-hidden="true">
        <img
          className="coming-soon__hero-img"
          src={HERO_IMAGE}
          alt=""
          width={1200}
          height={800}
          decoding="async"
          fetchPriority="high"
        />
        <div className="coming-soon__hero-overlay" />
        <div className="coming-soon__glow coming-soon__glow--green" />
        <div className="coming-soon__glow coming-soon__glow--red" />
      </div>

      <div className="coming-soon__lang">
        <LanguageSwitcher />
      </div>

      <div className="coming-soon__content">
        <div className="coming-soon__tricolor" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <main className="coming-soon__card">
          <div className="coming-soon__logo">
            <ConcordiaWordmark variant="hero" />
          </div>

          <p className="coming-soon__eyebrow">{t("comingSoon.eyebrow")}</p>
          <h1 className="coming-soon__title">{t("comingSoon.title")}</h1>
          <p className="coming-soon__lead">{t("comingSoon.lead")}</p>

          <ul className="coming-soon__highlights">
            {highlights.map((item) => (
              <li key={item.text}>
                <span className="coming-soon__highlight-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>

          <div className="coming-soon__launch">
            <span className="coming-soon__launch-label">{t("comingSoon.opensOn")}</span>
            <strong className="coming-soon__launch-date">{launchLabel}</strong>
          </div>

          {days > 0 || hours > 0 || minutes > 0 ? (
            <div
              className="coming-soon__countdown"
              aria-label={t("comingSoon.countdownAria", { days, hours, minutes })}
            >
              <CountdownUnit value={days} label={t("comingSoon.days")} />
              <span className="coming-soon__countdown-sep" aria-hidden="true">
                :
              </span>
              <CountdownUnit value={hours} label={t("comingSoon.hours")} />
              <span className="coming-soon__countdown-sep" aria-hidden="true">
                :
              </span>
              <CountdownUnit value={minutes} label={t("comingSoon.minutes")} />
            </div>
          ) : null}

          <p className="coming-soon__note">{t("comingSoon.note")}</p>
        </main>

        <footer className="coming-soon__footer">
          <p>{t("comingSoon.footer")}</p>
        </footer>
      </div>
    </div>
  )
}
