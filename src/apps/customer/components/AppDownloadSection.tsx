import React from "react"
import { useTranslation } from "react-i18next"
import "./AppDownloadSection.css"

type Props = {
  variant?: "full" | "compact"
}

function StoreButton({
  platform,
  label,
  comingSoon
}: {
  platform: "ios" | "android"
  label: string
  comingSoon: string
}) {
  return (
    <button
      type="button"
      className={`app-download__store app-download__store--${platform}`}
      disabled
      aria-disabled="true"
      aria-label={`${label} — ${comingSoon}`}
    >
      <span className="app-download__store-icon" aria-hidden="true">
        {platform === "ios" ? "iOS" : "Play"}
      </span>
      <span className="app-download__store-copy">
        <span className="app-download__store-kicker">
          {platform === "ios" ? "App Store" : "Google Play"}
        </span>
        <span className="app-download__store-label">{label}</span>
      </span>
      <span className="app-download__store-badge">{comingSoon}</span>
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
        <StoreButton platform="ios" label={t("appDownload.ios")} comingSoon={comingSoon} />
        <StoreButton platform="android" label={t("appDownload.android")} comingSoon={comingSoon} />
      </div>

      <p className="app-download__note">{t("appDownload.comingSoonNote")}</p>
    </section>
  )
}
