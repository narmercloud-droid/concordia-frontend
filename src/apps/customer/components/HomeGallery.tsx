import React from "react"
import { useTranslation } from "react-i18next"
import { GALLERY_IMAGES } from "@/lib/foodImagery"

export default function HomeGallery() {
  const { t } = useTranslation()

  return (
    <section className="home-gallery">
      <p className="home-section-label">{t("home.galleryLabel")}</p>
      <h2 className="home-section-title">{t("home.galleryTitle")}</h2>
      <p className="home-gallery__lead">{t("home.galleryLead")}</p>
      <div className="home-gallery__grid">
        {GALLERY_IMAGES.map((img, index) => (
          <figure
            key={img.key}
            className={`home-gallery__item home-gallery__item--${index + 1}`}
          >
            <img src={img.src} alt={t(`home.gallery.${img.key}`)} loading="lazy" />
            <figcaption>{t(`home.gallery.${img.key}`)}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
