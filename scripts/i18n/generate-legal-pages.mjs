/**
 * Generates scripts/i18n/legal-pages.json
 * Run: node scripts/i18n/generate-legal-pages.mjs
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.join(__dirname, "legal-pages.json")

const UPDATED = {
  de: "Zuletzt aktualisiert: 8. Juni 2026",
  en: "Last updated: 8 June 2026",
  nl: "Laatst bijgewerkt: 8 juni 2026",
  pl: "Ostatnia aktualizacja: 8 czerwca 2026",
  ru: "Последнее обновление: 8 июня 2026 г.",
  ro: "Ultima actualizare: 8 iunie 2026",
  hi: "अंतिम अद्यतन: 8 जून 2026",
  ar: "آخر تحديث: ٨ يونيو ٢٠٢٦",
  ku: "Dawî hate nûkirin: 8'ê Hezîranê 2026",
  tr: "Son güncelleme: 8 Haziran 2026",
  ckb: "دوایین نوێکردنەوە: ٨ی حوزەیرانی ٢٠٢٦"
}

const CONTACT = {
  de: "Fragen zu diesen Bedingungen: Kontakt über unsere Kontaktseite (/contact) oder direkt im Restaurant, Concordienplatz 1, Kempen.",
  en: "Questions about these terms: contact us via our contact page (/contact) or visit the restaurant at Concordienplatz 1, Kempen.",
  nl: "Vragen over deze voorwaarden: neem contact op via onze contactpagina (/contact) of bezoek het restaurant aan Concordienplatz 1, Kempen.",
  pl: "Pytania dotyczące tych warunków: skontaktuj się przez stronę kontaktową (/contact) lub odwiedź restaurację przy Concordienplatz 1, Kempen.",
  ru: "Вопросы по этим условиям: свяжитесь с нами через страницу контактов (/contact) или посетите ресторан по адресу Concordienplatz 1, Kempen.",
  ro: "Întrebări despre acești termeni: contactați-ne prin pagina de contact (/contact) sau vizitați restaurantul la Concordienplatz 1, Kempen.",
  hi: "इन शर्तों के बारे में प्रश्न: हमारे संपर्क पृष्ठ (/contact) के माध्यम से संपर्क करें या Concordienplatz 1, Kempen पर रेस्तरां में आएं।",
  ar: "أسئلة حول هذه الشروط: تواصل معنا عبر صفحة الاتصال (/contact) أو زر المطعم في Concordienplatz 1، Kempen.",
  ku: "Pirsên li ser van şertan: bi rêya rûpela têkiliyê (/contact) têkilî daynin an jî bi ser Concordienplatz 1, Kempen serdana restorana bikin.",
  tr: "Bu şartlarla ilgili sorular: iletişim sayfamız (/contact) üzerinden bize ulaşın veya Concordienplatz 1, Kempen adresindeki restoranı ziyaret edin.",
  ckb: "پرسیار دەربارەی ئەم مەرجانە: پەیوەندی لە ڕێگەی پەڕەی پەیوەندی (/contact) یان سەردانی ڕێستۆرانتەکە لە Concordienplatz 1، Kempen."
}

const NAV = {
  de: { terms: "AGB", loyaltyTerms: "Treueprogramm" },
  en: { terms: "Terms of Service", loyaltyTerms: "Loyalty Programme Terms" },
  nl: { terms: "Algemene voorwaarden", loyaltyTerms: "Voorwaarden loyaliteitsprogramma" },
  pl: { terms: "Regulamin", loyaltyTerms: "Regulamin programu lojalnościowego" },
  ru: { terms: "Условия использования", loyaltyTerms: "Условия программы лояльности" },
  ro: { terms: "Termeni și condiții", loyaltyTerms: "Termeni program de fidelitate" },
  hi: { terms: "सेवा की शर्तें", loyaltyTerms: "लॉयल्टी कार्यक्रम की शर्तें" },
  ar: { terms: "الشروط والأحكام", loyaltyTerms: "شروط برنامج الولاء" },
  ku: { terms: "Mercên xizmetê", loyaltyTerms: "Mercên bernameya dilsohiyê" },
  tr: { terms: "Hizmet Şartları", loyaltyTerms: "Sadakat Programı Şartları" },
  ckb: { terms: "مەرجەکانی خزمەتگوزاری", loyaltyTerms: "مەرجەکانی بەرنامەی دڵسۆزی" }
}

const TERMS = {
  de: {
    eyebrow: "Rechtliches",
    title: "Allgemeine Geschäftsbedingungen",
    lead: "Diese Allgemeinen Geschäftsbedingungen (AGB) regeln die Nutzung unserer Website sowie Online-Bestellungen bei Concordia Restaurant, einem familiengeführten italienischen Restaurant am Concordienplatz 1, 47906 Kempen, Deutschland. Die nachfolgenden Informationen dienen der Transparenz und stellen keine individuelle Rechtsberatung dar.",
    sections: {
      operator: {
        title: "1. Anbieter und Geltungsbereich",
        body: "Anbieter der Website und des Online-Bestellsystems ist Concordia Restaurant (familiengeführt), Concordienplatz 1, 47906 Kempen, Deutschland. Diese AGB gelten für alle Bestellungen über unsere Website sowie für damit verbundene Leistungen wie Abholung, Lieferung, Gutscheine und das Treueprogramm, soweit nicht ausdrücklich etwas anderes vereinbart wurde. Abweichende Bedingungen des Kunden werden nicht anerkannt, es sei denn, wir stimmen ihrer Geltung ausdrücklich schriftlich zu."
      },
      ordering: {
        title: "2. Vertragsschluss und Bestellablauf",
        body: "Die Darstellung von Speisen und Getränken auf unserer Website stellt kein rechtlich bindendes Angebot dar, sondern eine unverbindliche Aufforderung zur Bestellung. Mit Absenden einer Bestellung geben Sie ein verbindliches Angebot zum Kauf der ausgewählten Waren ab. Der Vertrag kommt zustande, wenn wir Ihre Bestellung per E-Mail oder in der Bestellbestätigung im System annehmen. Wir behalten uns vor, Bestellungen bei erkennbaren Fehlern, technischen Störungen, Lieferengpässen oder Verdacht auf Missbrauch abzulehnen."
      },
      prices: {
        title: "3. Preise, Zahlung und Website-Rabatt",
        body: "Alle angegebenen Preise verstehen sich in Euro und enthalten die gesetzliche Mehrwertsteuer, sofern nicht anders ausgewiesen. Zusätzliche Kosten (z. B. Liefergebühren) werden vor Abschluss der Bestellung transparent ausgewiesen. Für berechtigte Online-Bestellungen über unsere Website kann ein Website-Rabatt von 10 % gewährt werden, sofern dieser zum Zeitpunkt der Bestellung aktiv ist und die jeweiligen Aktionsbedingungen erfüllt sind. Rabatte, Gutscheine und Treuevorteile sind grundsätzlich nicht kombinierbar, sofern nicht ausdrücklich anders angegeben."
      },
      delivery: {
        title: "4. Abholung, Lieferung und Lieferzeiten",
        body: "Sie können Bestellungen zur Abholung im Restaurant oder zur Lieferung in die von uns angegebenen Liefergebiete aufgeben. Angezeigte Zeiten sind Richtwerte und können je nach Auslastung, Wetter oder Verkehrslage variieren. Bei Abholung liegt die Verfügbarkeit zum vereinbarten Zeitpunkt in unserer Verantwortung; bei Lieferung übernehmen wir die Zustellung bis zur Haustür, sofern Zugang und Adressangaben korrekt sind. Bitte prüfen Sie Ihre Bestellung bei Erhalt unverzüglich auf Vollständigkeit und melden Sie offensichtliche Mängel umgehend."
      },
      cancellation: {
        title: "5. Stornierung, Änderungen und Rücktritt",
        body: "Kurzfristige Stornierungen oder Änderungen sind nur möglich, solange die Zubereitung noch nicht begonnen hat. Kontaktieren Sie uns dafür unverzüglich telefonisch oder über die in der Bestellbestätigung genannten Kanäle. Bei berechtigtem Rücktritt oder Stornierung erstatten wir bereits geleistete Zahlungen für nicht erbrachte Leistungen. Gesetzliche Widerrufsrechte für Fernabsatzverträge bleiben unberührt, soweit anwendbar; bei verderblichen Lebensmitteln können gesetzliche Ausnahmen gelten."
      },
      promotions: {
        title: "6. Aktionen, Gutscheine und Marketing",
        body: "Aktionsangebote, Rabattcodes, Geschenkgutscheine und Treuevorteile unterliegen den jeweils veröffentlichten Bedingungen, Gültigkeitszeiträumen und Verfügbarkeiten. Gutscheine sind grundsätzlich nicht bar auszahlbar und können nur im Rahmen des angegebenen Wertes eingelöst werden. Mit freiwilliger Anmeldung zu Marketing-Mitteilungen (z. B. Newsletter) willigen Sie in den Erhalt von Informationen zu Angeboten und Neuigkeiten ein; Sie können diese Einwilligung jederzeit widerrufen."
      },
      liability: {
        title: "7. Haftung",
        body: "Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben, Körper oder Gesundheit. Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten ist die Haftung auf den vorhersehbaren, vertragstypischen Schaden begrenzt. Eine weitergehende Haftung ist ausgeschlossen, soweit gesetzlich zulässig. Für Störungen, die außerhalb unseres Einflussbereichs liegen (z. B. höhere Gewalt, Ausfall von Zahlungs- oder Kommunikationssystemen), übernehmen wir keine Haftung."
      },
      privacy: {
        title: "8. Datenschutz",
        body: "Zur Abwicklung von Bestellungen, Zahlungen, Lieferungen, Gutscheinen, Treuepunkten und optionalen Marketing-Mitteilungen verarbeiten wir personenbezogene Daten gemäß den geltenden Datenschutzvorschriften. Welche Daten erhoben werden, zu welchen Zwecken und welche Rechte Sie haben, entnehmen Sie bitte unserer Datenschutzerklärung auf der Website. Eine Bestellung ist auch ohne Marketing-Einwilligung möglich."
      },
      law: {
        title: "9. Anwendbares Recht und Gerichtsstand",
        body: "Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts (CISG), soweit dem keine zwingenden verbraucherschutzrechtlichen Vorschriften des Staates entgegenstehen, in dem der Verbraucher seinen gewöhnlichen Aufenthalt hat. Ist der Kunde Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen, ist ausschließlicher Gerichtsstand für alle Streitigkeiten Kempen, sofern gesetzlich zulässig."
      }
    }
  },
  en: {
    eyebrow: "Legal",
    title: "Terms of Service",
    lead: "These Terms of Service govern use of our website and online orders at Concordia Restaurant, a family-run Italian restaurant at Concordienplatz 1, 47906 Kempen, Germany. The information below is provided for transparency and does not constitute individual legal advice.",
    sections: {
      operator: {
        title: "1. Operator and scope",
        body: "The website and online ordering system are operated by Concordia Restaurant (family-run), Concordienplatz 1, 47906 Kempen, Germany. These terms apply to all orders placed through our website and related services such as pickup, delivery, gift vouchers, and the loyalty programme, unless expressly agreed otherwise. Conflicting customer terms are not accepted unless we expressly agree to them in writing."
      },
      ordering: {
        title: "2. Contract formation and order process",
        body: "Menu items displayed on our website do not constitute a binding offer but an invitation to order. By submitting an order, you make a binding offer to purchase the selected items. The contract is formed when we accept your order by email or order confirmation in the system. We may refuse orders in cases of obvious errors, technical failures, capacity constraints, or suspected misuse."
      },
      prices: {
        title: "3. Prices, payment, and website discount",
        body: "All prices are shown in euros and include statutory VAT unless stated otherwise. Additional costs (e.g. delivery fees) are displayed transparently before checkout. Eligible online orders through our website may receive a 10% website discount when active at the time of order and subject to the applicable promotion terms. Discounts, vouchers, and loyalty benefits are generally not combinable unless expressly stated."
      },
      delivery: {
        title: "4. Pickup, delivery, and timing",
        body: "You may place orders for pickup at the restaurant or delivery within our published delivery areas. Displayed times are estimates and may vary due to demand, weather, or traffic. For pickup, we are responsible for availability at the agreed time; for delivery, we deliver to your door provided access details and address information are correct. Please check your order promptly on receipt and report obvious issues without delay."
      },
      cancellation: {
        title: "5. Cancellation, changes, and withdrawal",
        body: "Short-notice cancellations or changes are only possible while preparation has not yet started. Contact us immediately by phone or via the channels stated in your order confirmation. Where cancellation or withdrawal is justified, we refund payments for services not provided. Statutory withdrawal rights for distance contracts remain unaffected where applicable; exceptions may apply to perishable food."
      },
      promotions: {
        title: "6. Promotions, vouchers, and marketing",
        body: "Promotional offers, discount codes, gift vouchers, and loyalty benefits are subject to published terms, validity periods, and availability. Vouchers are generally not redeemable for cash and may only be used up to their stated value. By voluntarily opting in to marketing communications (e.g. newsletter), you consent to receive information about offers and news; you may withdraw consent at any time."
      },
      liability: {
        title: "7. Liability",
        body: "We are fully liable for intent and gross negligence and for injury to life, body, or health. For slight negligence in breach of essential contractual obligations, liability is limited to foreseeable, typical contract damage. Further liability is excluded to the extent permitted by law. We are not liable for disruptions outside our control (e.g. force majeure, failure of payment or communication systems)."
      },
      privacy: {
        title: "8. Privacy",
        body: "To process orders, payments, deliveries, vouchers, loyalty points, and optional marketing communications, we process personal data in accordance with applicable data protection law. Please see our privacy policy on the website for details on data collected, purposes, and your rights. You may place orders without marketing consent."
      },
      law: {
        title: "9. Governing law and jurisdiction",
        body: "German law applies, excluding the UN Convention on Contracts for the International Sale of Goods (CISG), subject to mandatory consumer protection rules of the country where the consumer habitually resides. If the customer is a merchant, legal entity under public law, or special fund under public law, Kempen shall be the exclusive place of jurisdiction for all disputes where permitted by law."
      }
    }
  }
}

const LOYALTY = {
  de: {
    eyebrow: "Treueprogramm",
    title: "Bedingungen des Treueprogramms",
    lead: "Diese Bedingungen regeln die Teilnahme am Concordia-Treueprogramm für registrierte Kunden. Sie ergänzen unsere Allgemeinen Geschäftsbedingungen und stellen keine Rechtsberatung dar.",
    sections: {
      overview: {
        title: "1. Überblick",
        body: "Das Concordia-Treueprogramm belohnt wiederkehrende Bestellungen mit Punkten, Statusvorteilen und ausgewählten Aktionen. Teilnahme setzt ein Kundenkonto voraus. Das Programm wird von Concordia Restaurant, Concordienplatz 1, 47906 Kempen, betrieben und kann jederzeit angepasst oder beendet werden, soweit gesetzlich zulässig."
      },
      membership: {
        title: "2. Mitgliedschaft und Konto",
        body: "Zur Teilnahme benötigen Sie ein persönliches Kundenkonto mit korrekten Kontaktdaten. Sie sind verpflichtet, Ihre Angaben aktuell zu halten. Ein Konto ist nicht übertragbar. Wir können Konten bei Verstößen gegen diese Bedingungen, bei Betrugsverdacht oder bei längerer Inaktivität sperren oder löschen."
      },
      points: {
        title: "3. Punkte und Einlösung",
        body: "Punkte werden nach den jeweils gültigen Programmregeln für qualifizierte Bestellungen gutgeschrieben, in der Regel nach abgeschlossener und bezahlter Bestellung. Nicht eingelöste Punkte können verfallen, wenn dies in den Programmhinweisen angegeben ist. Punkte haben keinen Bargeldwert und sind nicht übertragbar, sofern nicht ausdrücklich anders kommuniziert."
      },
      tiers: {
        title: "4. Stufen und Vorteile",
        body: "Je nach gesammelter Aktivität können Sie verschiedene Treuestufen erreichen, die mit zusätzlichen Vorteilen verbunden sein können. Stufen, Schwellenwerte und Vorteile werden in der App bzw. auf der Website dargestellt und können angepasst werden. Ein Anspruch auf bestimmte Vorteile besteht nur im Rahmen der jeweils aktiven Programmregeln."
      },
      birthday: {
        title: "5. Geburtstagsvorteil",
        body: "Als Geburtstagsvorteil gewähren wir einmal pro Kalenderjahr einen Rabatt mit dem Code BIRTHDAY. Bei Abholung oder Lieferung ist ein gültiger Lichtbildausweis vorzuzeigen; das Geburtsdatum muss mit dem im Kundenkonto hinterlegten Datum übereinstimmen. Bei Missbrauch oder offensichtlichem Betrug behalten wir uns vor, den Vorteil zu verweigern. Der Geburtstagsrabatt ist nicht mit anderen Angeboten kombinierbar, sofern nicht ausdrücklich anders angegeben."
      },
      promotions: {
        title: "6. Aktionen im Treueprogramm",
        body: "Zusätzliche Treueaktionen, Bonuspunkte oder zeitlich begrenzte Angebote können veröffentlicht werden und unterliegen den jeweiligen Aktionsbedingungen. Website-Rabatte, Gutscheine und Treuevorteile sind grundsätzlich nicht kombinierbar, sofern nicht ausdrücklich anders angegeben. Geschenkgutscheine und Marketing-Angebote bleiben von den allgemeinen AGB unberührt."
      },
      misuse: {
        title: "7. Missbrauch und Sanktionen",
        body: "Manipulation von Konten, mehrfache Konten für dieselbe Person, falsche Identitätsangaben oder der Versuch, Punkte oder Rabatte unrechtmäßig zu erlangen, sind untersagt. Bei Verstößen können wir Punkte entziehen, Vorteile sperren, Bestellungen ablehnen und Konten dauerhaft schließen. Bereits gewährte Vorteile können zurückgefordert werden, soweit gesetzlich zulässig."
      },
      changes: {
        title: "8. Änderungen und Beendigung",
        body: "Wir können diese Programmbedingungen, Punkteregeln, Stufen und Vorteile mit Wirkung für die Zukunft ändern. Wesentliche Änderungen werden über die Website oder per E-Mail kommuniziert, soweit möglich. Die fortgesetzte Nutzung des Programms nach Inkrafttreten gilt als Zustimmung, sofern keine Widerspruchsmöglichkeit angeboten wird. Das Programm kann insgesamt beendet werden; in diesem Fall werden offene Punkte nach den dann geltenden Regeln behandelt."
      }
    }
  },
  en: {
    eyebrow: "Loyalty programme",
    title: "Loyalty Programme Terms",
    lead: "These terms govern participation in the Concordia loyalty programme for registered customers. They supplement our Terms of Service and do not constitute legal advice.",
    sections: {
      overview: {
        title: "1. Overview",
        body: "The Concordia loyalty programme rewards repeat orders with points, tier benefits, and selected promotions. Participation requires a customer account. The programme is operated by Concordia Restaurant, Concordienplatz 1, 47906 Kempen, and may be adjusted or discontinued at any time where permitted by law."
      },
      membership: {
        title: "2. Membership and account",
        body: "Participation requires a personal customer account with accurate contact details. You must keep your information up to date. Accounts are non-transferable. We may suspend or delete accounts for breaches of these terms, suspected fraud, or prolonged inactivity."
      },
      points: {
        title: "3. Points and redemption",
        body: "Points are credited for qualifying orders according to current programme rules, typically after an order is completed and paid. Unused points may expire if stated in programme notices. Points have no cash value and are non-transferable unless expressly stated otherwise."
      },
      tiers: {
        title: "4. Tiers and benefits",
        body: "Depending on your activity, you may reach loyalty tiers with additional benefits. Tiers, thresholds, and benefits are shown in the app or on the website and may be updated. Entitlement to specific benefits exists only within the active programme rules."
      },
      birthday: {
        title: "5. Birthday benefit",
        body: "As a birthday benefit, we offer a discount with code BIRTHDAY once per calendar year. Valid photo ID must be shown at pickup or delivery; the date of birth must match the date stored in your account. Fraud or abuse may result in refusal of the benefit. The birthday discount is not combinable with other offers unless expressly stated."
      },
      promotions: {
        title: "6. Loyalty promotions",
        body: "Additional loyalty promotions, bonus points, or limited-time offers may be published and are subject to their specific terms. Website discounts, vouchers, and loyalty benefits are generally not combinable unless expressly stated. Gift vouchers and marketing offers remain governed by the general Terms of Service."
      },
      misuse: {
        title: "7. Misuse and sanctions",
        body: "Account manipulation, multiple accounts for the same person, false identity details, or attempts to obtain points or discounts unlawfully are prohibited. We may revoke points, block benefits, refuse orders, and permanently close accounts for violations. Benefits already granted may be reclaimed where permitted by law."
      },
      changes: {
        title: "8. Changes and termination",
        body: "We may change these programme terms, point rules, tiers, and benefits with future effect. Material changes will be communicated via the website or email where possible. Continued use after changes take effect constitutes acceptance unless an opt-out is offered. The programme may be discontinued entirely; any remaining points will be handled under the rules then in force."
      }
    }
  }
}

// Additional languages appended below via separate module
import { TERMS_EXTRA, LOYALTY_EXTRA } from "./legal-pages-extra.mjs"

const LANGS = ["de", "en", "nl", "pl", "ru", "ro", "hi", "ar", "ku", "tr", "ckb"]

const out = {}
for (const lang of LANGS) {
  const terms = TERMS[lang] || TERMS_EXTRA[lang]
  const loyalty = LOYALTY[lang] || LOYALTY_EXTRA[lang]
  out[lang] = {
    nav: NAV[lang],
    terms: {
      ...terms,
      updated: UPDATED[lang],
      contact: CONTACT[lang]
    },
    loyaltyTerms: {
      ...loyalty,
      updated: UPDATED[lang],
      contact: CONTACT[lang]
    }
  }
}

fs.writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`)
console.log(`Wrote ${outPath}`)
