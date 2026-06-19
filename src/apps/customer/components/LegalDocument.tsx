import React from "react"
import { useTranslation } from "react-i18next"
import legalDe from "@/data/legal/de.json"

export type LegalDocKey = "impressum" | "datenschutz" | "agb"

type LegalSection = {
  title: string
  paragraphs?: string[]
  subsections?: { title: string; paragraphs: string[] }[]
}

function linkify(text: string) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g)
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer">
        {part}
      </a>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  )
}

function renderParagraph(text: string, key: string) {
  return (
    <p key={key} className="info-legal__paragraph">
      {linkify(text)}
    </p>
  )
}

function renderSection(section: LegalSection, index: number) {
  return (
    <div key={section.title || index} className="info-block info-legal__section">
      {section.title ? <h2 className="info-block__title">{section.title}</h2> : null}
      {section.paragraphs?.map((p, i) => renderParagraph(p, `${index}-p-${i}`))}
      {section.subsections?.map((sub, i) => (
        <div key={sub.title || i} className="info-legal__subsection">
          <h3 className="info-legal__subtitle">{sub.title}</h3>
          {sub.paragraphs.map((p, j) => renderParagraph(p, `${index}-s-${i}-${j}`))}
        </div>
      ))}
    </div>
  )
}

type LegalContent = {
  intro?: string
  updated?: string
  sections: LegalSection[]
}

export default function LegalDocument({ doc }: { doc: LegalDocKey }) {
  const { i18n, t } = useTranslation()
  const isGerman = i18n.language.split("-")[0] === "de"
  const content = legalDe[doc] as LegalContent

  return (
    <>
      {!isGerman && (
        <div className="info-block info-legal__locale-note">
          <p>{t("legal.localeNote")}</p>
        </div>
      )}
      {content.intro ? (
        <div className="info-block">
          <p>{content.intro}</p>
        </div>
      ) : null}
      {content.updated ? (
        <p className="info-legal__updated">{content.updated}</p>
      ) : null}
      {content.sections.map((section, index) => renderSection(section as LegalSection, index))}
    </>
  )
}
