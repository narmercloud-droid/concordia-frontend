import React, { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { getBranches } from "@/api/customer"
import { purchaseGiftCard } from "@/api/giftCards"
import { getPaymentConfig } from "@/api/payments"
import PayPalCheckout from "@/apps/customer/components/PayPalCheckout"
import { formatCurrency } from "@/utils/format"

const PRESET_AMOUNTS = [10, 20, 30, 50]

type PaymentChoice = "paypal" | "card" | "cash"

export default function GiftVoucherPage() {
  const { t } = useTranslation()
  const { branchId: routeBranchId } = useParams<{ branchId: string }>()
  const [branchId, setBranchId] = useState(routeBranchId ?? "")
  const [amountChoice, setAmountChoice] = useState<number | "custom">(20)
  const [customAmount, setCustomAmount] = useState("25")
  const [purchaserName, setPurchaserName] = useState("")
  const [purchaserEmail, setPurchaserEmail] = useState("")
  const [purchaserPhone, setPurchaserPhone] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [message, setMessage] = useState("")
  const [paymentChoice, setPaymentChoice] = useState<PaymentChoice>("paypal")
  const [error, setError] = useState("")
  const [purchaseId, setPurchaseId] = useState<string | null>(null)
  const [issuedCode, setIssuedCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches
  })

  const { data: paymentConfig } = useQuery({
    queryKey: ["paymentConfig"],
    queryFn: getPaymentConfig
  })

  const selectedBranch = branches?.find((b: { id: string }) => b.id === branchId)
  const amount =
    amountChoice === "custom" ? Number(customAmount.replace(",", ".")) : amountChoice
  const methods = paymentConfig?.methods
  const onlineEnabled = paymentConfig?.onlinePaymentsEnabled ?? false

  const handleStartPurchase = async () => {
    setError("")
    if (!branchId) {
      setError(t("giftVoucher.branchRequired"))
      return
    }
    if (!purchaserName.trim()) {
      setError(t("giftVoucher.nameRequired"))
      return
    }
    if (!Number.isFinite(amount) || amount < 5) {
      setError(t("giftVoucher.amountInvalid"))
      return
    }

    setLoading(true)
    try {
      const result = await purchaseGiftCard(branchId, {
        amount,
        purchaserName: purchaserName.trim(),
        purchaserEmail: purchaserEmail.trim() || undefined,
        purchaserPhone: purchaserPhone.trim() || undefined,
        recipientName: recipientName.trim() || undefined,
        message: message.trim() || undefined,
        paymentMethod: paymentChoice
      })

      if (result.paymentRequired) {
        setPurchaseId(result.purchaseId)
        return
      }

      if (result.payAtBranch) {
        setPurchaseId(result.purchaseId)
        return
      }

      if (result.code) {
        setIssuedCode(result.code)
        return
      }

      setError(t("giftVoucher.purchaseFailed"))
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ??
        err?.response?.data?.message ??
        t("giftVoucher.purchaseFailed")
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (issuedCode) {
    return (
      <div className="customer-page gift-voucher-page">
        <div className="customer-card gift-voucher-success">
          <h1 className="customer-title">{t("giftVoucher.successTitle")}</h1>
          <p>{t("giftVoucher.successText")}</p>
          <p className="gift-voucher-success__code">{issuedCode}</p>
          <p className="customer-hint">
            {t("giftVoucher.branchNote", { branch: selectedBranch?.name ?? branchId })}
          </p>
          <Link className="customer-btn customer-btn--primary" to={`/branch/${branchId}`}>
            {t("giftVoucher.orderNow")}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="customer-page gift-voucher-page">
      <h1 className="customer-title">{t("giftVoucher.title")}</h1>
      <p className="customer-hint">{t("giftVoucher.lead")}</p>

      {!routeBranchId && (
        <div className="customer-field">
          <label className="customer-label">{t("giftVoucher.chooseBranch")}</label>
          <select
            className="customer-input"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
          >
            <option value="">{t("giftVoucher.selectBranch")}</option>
            {(branches ?? []).map((b: { id: string; name?: string }) => (
              <option key={b.id} value={b.id}>
                {b.name ?? b.id}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="customer-field">
        <label className="customer-label">{t("giftVoucher.amount")}</label>
        <div className="gift-voucher-amounts">
          {PRESET_AMOUNTS.map((value) => (
            <button
              key={value}
              type="button"
              className={`customer-toggle${amountChoice === value ? " customer-toggle--active" : ""}`}
              onClick={() => setAmountChoice(value)}
            >
              {formatCurrency(value)}
            </button>
          ))}
          <button
            type="button"
            className={`customer-toggle${amountChoice === "custom" ? " customer-toggle--active" : ""}`}
            onClick={() => setAmountChoice("custom")}
          >
            {t("giftVoucher.customAmount")}
          </button>
        </div>
        {amountChoice === "custom" && (
          <input
            className="customer-input"
            type="number"
            min={5}
            max={500}
            step="1"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            style={{ marginTop: 12 }}
          />
        )}
      </div>

      <div className="customer-field">
        <label className="customer-label">{t("giftVoucher.yourName")}</label>
        <input
          className="customer-input"
          value={purchaserName}
          onChange={(e) => setPurchaserName(e.target.value)}
        />
      </div>

      <div className="customer-field">
        <label className="customer-label">
          {t("giftVoucher.email")} ({t("common.optional")})
        </label>
        <input
          className="customer-input"
          type="email"
          value={purchaserEmail}
          onChange={(e) => setPurchaserEmail(e.target.value)}
        />
      </div>

      <div className="customer-field">
        <label className="customer-label">
          {t("giftVoucher.phone")} ({t("common.optional")})
        </label>
        <input
          className="customer-input"
          value={purchaserPhone}
          onChange={(e) => setPurchaserPhone(e.target.value)}
        />
      </div>

      <div className="customer-field">
        <label className="customer-label">
          {t("giftVoucher.recipient")} ({t("common.optional")})
        </label>
        <input
          className="customer-input"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
        />
      </div>

      <div className="customer-field">
        <label className="customer-label">
          {t("giftVoucher.message")} ({t("common.optional")})
        </label>
        <textarea
          className="customer-textarea"
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <div className="customer-field">
        <label className="customer-label">{t("checkout.paymentMethod")}</label>
        <div className="checkout-payment-grid">
          <PaymentOption
            label={t("checkout.payPayPal")}
            active={paymentChoice === "paypal"}
            enabled={methods?.paypal ?? onlineEnabled}
            comingSoonLabel={t("checkout.comingSoon")}
            onClick={() => setPaymentChoice("paypal")}
          />
          <PaymentOption
            label={t("checkout.payCard")}
            active={paymentChoice === "card"}
            enabled={methods?.card ?? onlineEnabled}
            comingSoonLabel={t("checkout.comingSoon")}
            onClick={() => setPaymentChoice("card")}
          />
          <PaymentOption
            label={t("checkout.payCash")}
            active={paymentChoice === "cash"}
            enabled
            comingSoonLabel={t("checkout.comingSoon")}
            onClick={() => setPaymentChoice("cash")}
          />
        </div>
        <p className="customer-hint">{t("giftVoucher.cashNote")}</p>
      </div>

      {error && <p className="customer-error">{error}</p>}

      {!purchaseId && (
        <button
          type="button"
          className="customer-btn customer-btn--primary"
          disabled={loading}
          onClick={() => void handleStartPurchase()}
        >
          {loading ? t("common.processing") : t("giftVoucher.continue", { amount: formatCurrency(amount) })}
        </button>
      )}

      {purchaseId && paymentConfig?.paypalClientId && paymentChoice !== "cash" && (
        <div className="customer-card" style={{ marginTop: 16 }}>
          <h3 className="customer-subtitle">{t("giftVoucher.payOnline")}</h3>
          <PayPalCheckout
            paypalClientId={paymentConfig.paypalClientId}
            currency={paymentConfig.currency}
            fundingSource={paymentChoice === "card" ? "card" : "paypal"}
            giftPurchaseId={purchaseId}
            onSuccess={(result) => {
              if (result?.code) setIssuedCode(result.code)
            }}
            onError={(message) => setError(message)}
          />
        </div>
      )}

      {purchaseId && paymentChoice === "cash" && (
        <div className="customer-card" style={{ marginTop: 16 }}>
          <p>{t("giftVoucher.cashPending")}</p>
        </div>
      )}
    </div>
  )
}

function PaymentOption({
  label,
  active,
  enabled,
  comingSoonLabel,
  onClick
}: {
  label: string
  active: boolean
  enabled: boolean
  comingSoonLabel: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={!enabled}
      className={`checkout-payment-option${active ? " checkout-payment-option--active" : ""}${
        !enabled ? " checkout-payment-option--disabled" : ""
      }`}
      onClick={onClick}
      title={!enabled ? comingSoonLabel : undefined}
    >
      <span>{label}</span>
      {!enabled && <small>{comingSoonLabel}</small>}
    </button>
  )
}
