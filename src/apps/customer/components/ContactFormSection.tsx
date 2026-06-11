import React, { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { submitContactForm } from "@/api/customer"

type BranchOption = {
  id: string
  name: string
}

type Props = {
  branches: BranchOption[]
}

function branchDisplayName(name: string) {
  return name.replace(/^Concordia\s+/i, "")
}

export default function ContactFormSection({ branches }: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [branchId, setBranchId] = useState("")
  const [orderNumber, setOrderNumber] = useState("")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const mutation = useMutation({
    mutationFn: () =>
      submitContactForm({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        phone: phone.trim() || undefined,
        branchId: branchId || undefined,
        orderNumber: orderNumber.trim() || undefined
      }),
    onSuccess: () => {
      setSubmitted(true)
      setName("")
      setEmail("")
      setPhone("")
      setBranchId("")
      setOrderNumber("")
      setMessage("")
    }
  })

  if (submitted && !mutation.isPending) {
    return (
      <div className="info-block info-contact-form">
        <h3>{t("pages.contact.form.successTitle")}</h3>
        <p>{t("pages.contact.form.successBody")}</p>
        <button
          type="button"
          className="customer-btn customer-btn--secondary"
          onClick={() => setSubmitted(false)}
        >
          {t("pages.contact.form.sendAnother")}
        </button>
      </div>
    )
  }

  return (
    <div className="info-block info-contact-form">
      <h3>{t("pages.contact.form.title")}</h3>
      <p className="info-contact-form__lead">{t("pages.contact.form.lead")}</p>

      <form
        className="info-contact-form__grid"
        onSubmit={(e) => {
          e.preventDefault()
          mutation.mutate()
        }}
      >
        <label className="info-contact-form__field">
          <span>{t("pages.contact.form.name")}</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label className="info-contact-form__field">
          <span>{t("pages.contact.form.email")}</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="info-contact-form__field">
          <span>{t("pages.contact.form.phone")}</span>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>

        <label className="info-contact-form__field">
          <span>{t("pages.contact.form.branch")}</span>
          <select name="branchId" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
            <option value="">{t("pages.contact.form.branchAny")}</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branchDisplayName(branch.name)}
              </option>
            ))}
          </select>
        </label>

        <label className="info-contact-form__field info-contact-form__field--full">
          <span>{t("pages.contact.form.orderNumber")}</span>
          <input
            type="text"
            name="orderNumber"
            inputMode="text"
            placeholder={t("pages.contact.form.orderNumberPlaceholder")}
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
          />
          <span className="info-contact-form__hint">{t("pages.contact.form.orderNumberHint")}</span>
        </label>

        <label className="info-contact-form__field info-contact-form__field--full">
          <span>{t("pages.contact.form.message")}</span>
          <textarea
            name="message"
            rows={5}
            required
            minLength={10}
            maxLength={4000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>

        <input
          type="text"
          name="_hp"
          value=""
          readOnly
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="info-contact-form__hp"
        />

        {mutation.isError && (
          <p className="info-contact-form__error info-contact-form__field--full">
            {(mutation.error as any)?.response?.data?.message ??
              (mutation.error as any)?.response?.data?.error ??
              t("pages.contact.form.error")}
          </p>
        )}

        <div className="info-contact-form__actions info-contact-form__field--full">
          <button
            type="submit"
            className="customer-btn customer-btn--primary"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? t("pages.contact.form.sending") : t("pages.contact.form.submit")}
          </button>
        </div>
      </form>
    </div>
  )
}
