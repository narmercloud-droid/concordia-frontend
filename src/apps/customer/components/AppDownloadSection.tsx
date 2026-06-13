import React from "react"
import { useTranslation } from "react-i18next"
import "./AppDownloadSection.css"

type Props = {
  variant?: "full" | "compact"
}

function StoreBadge({
  platform,
  comingSoon
}: {
  platform: "ios" | "android"
  comingSoon: string
}) {
  const label = platform === "ios" ? "App Store" : "Google Play"
  const src =
    platform === "ios"
      ? "/brand/svg/app-store-coming-soon.svg"
      : "/brand/svg/google-play-coming-soon.svg"

  return (
    <button
      type="button"
      className={`app-download__badge app-download__badge--${platform}`}
      disabled
      aria-disabled="true"
      aria-label={`${label} — ${comingSoon}`}
    >
      <img src={src} alt="" className="app-download__badge-img" width={220} height={64} />
    </button>
  )
}

export default function AppDownloadSection({ variant = "full" }: Props) {
  const { t } = useTranslation()
  const comingSoon = t("home.comingSoonLabel")

  return (
    <section
      className={`app-download app-download--${variant}`}
      aria-label={t("appDownload.title")}
    >
      {variant === "full" ? (
        <>
          <p className="app-download__eyebrow">{t("appDownload.eyebrow")}</p>
          <h2 className="app-download__title">{t("appDownload.title")}</h2>
          <p className="app-download__lead">{t("appDownload.lead")}</p>
        </>
      ) : (
        <p className="app-download__compact-title">{t("appDownload.title")}</p>
      )}

      <div className="app-download__stores">
        <StoreBadge platform="ios" comingSoon={comingSoon} />
        <StoreBadge platform="android" comingSoon={comingSoon} />
      </div>

      <p className="app-download__note">{t("appDownload.comingSoonNote")}</p>
    </section>
  )
}
