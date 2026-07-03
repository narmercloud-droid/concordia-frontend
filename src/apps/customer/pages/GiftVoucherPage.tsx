import React, { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Trans, useTranslation } from "react-i18next"
import { getBranches } from "@/api/customer"
import { purchaseGiftCard } from "@/api/giftCards"
import { createGiftCardStripePaymentIntent, getPaymentConfig } from "@/api/payments"
import PayPalCheckout from "@/apps/customer/components/PayPalCheckout"
import StripeCheckout from "@/apps/customer/components/StripeCheckout"
import PaymentMethodPicker from "@/apps/customer/components/PaymentMethodPicker"
import { GIFT_VOUCHER_PAYMENT_METHOD_ORDER } from "@/apps/customer/components/checkoutPaymentMethods"
import type { PaymentMethodId } from "@/apps/customer/components/PaymentMethodOption"
import { formatCurrency } from "@/utils/format"
import CheckoutLegalFooter from "@/apps/customer/components/CheckoutLegalFooter"
import LegalTermsAcceptance from "@/apps/customer/components/LegalTermsAcceptance"
import PriceVatNote from "@/apps/customer/components/PriceVatNote"

const PRESET_AMOUNTS = [10, 20, 30, 50]

type PaymentChoice = "paypal" | "card" | "apple_pay" | "google_pay" | "cash"

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
  const [stripeSession, setStripeSession] = useState<{
    purchaseId: string
    clientSecret: string
    stripeAccountId: string
    publishableKey: string
  } | null>(null)
  const [issuedCode, setIssuedCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches
  })

  const { data: paymentConfig } = useQuery({
    queryKey: ["paymentConfig", branchId],
    queryFn: () => getPaymentConfig(branchId),
    enabled: !!branchId
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
    if (!acceptedTerms) {
      setError(t("legal.acceptTermsRequired"))
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
        paymentMethod: paymentChoice,
        termsAccepted: true
      })

      if (result.paymentRequired) {
        if (
          paymentChoice === "card" ||
          paymentChoice === "apple_pay" ||
          paymentChoice === "google_pay"
        ) {
          const session = await createGiftCardStripePaymentIntent(result.purchaseId)
          if (!session.publishableKey) {
            setError(t("checkout.paymentUnavailable"))
            return
          }
          setStripeSession({
            purchaseId: result.purchaseId,
            clientSecret: session.clientSecret,
            stripeAccountId: session.stripeAccountId,
            publishableKey: session.publishableKey
          })
          setPurchaseId(result.purchaseId)
          return
        }

        if (paymentChoice === "paypal") {
          if (!paymentConfig?.paypalClientId) {
            setError(t("checkout.paymentUnavailable"))
            return
          }
          setPurchaseId(result.purchaseId)
          return
        }

        setError(t("checkout.paymentUnavailable"))
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
          <CheckoutLegalFooter />
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
        <PaymentMethodPicker
          methods={{
            paypal: methods?.paypal ?? onlineEnabled,
            card: methods?.card ?? false,
            apple_pay: methods?.apple_pay ?? false,
            google_pay: methods?.google_pay ?? false,
            cash: true
          }}
          selected={paymentChoice}
          methodOrder={GIFT_VOUCHER_PAYMENT_METHOD_ORDER}
          isMethodEnabled={(method: PaymentMethodId) => {
            if (method === "cash") return true
            if (method === "paypal") return methods?.paypal ?? onlineEnabled
            return Boolean(methods?.[method])
          }}
          onSelect={(method) => setPaymentChoice(method as PaymentChoice)}
        />
        <p className="customer-hint">{t("giftVoucher.cashNote")}</p>
      </div>

      {error && <p className="customer-error">{error}</p>}

      <PriceVatNote className="customer-hint" />

      <LegalTermsAcceptance
        checked={acceptedTerms}
        onChange={(value) => {
          setAcceptedTerms(value)
          if (value) setError("")
        }}
      />

      {!purchaseId && (
        <button
          type="button"
          className="customer-btn customer-btn--primary"
          disabled={loading}
          onClick={() => void handleStartPurchase()}
        >
          {loading ? t("common.processing") : t("giftVoucher.continuePayable", { amount: formatCurrency(amount) })}
        </button>
      )}

      {stripeSession && paymentChoice !== "cash" && paymentChoice !== "paypal" && (
        <StripeCheckout
          giftPurchaseId={stripeSession.purchaseId}
          publishableKey={stripeSession.publishableKey}
          stripeAccountId={stripeSession.stripeAccountId}
          clientSecret={stripeSession.clientSecret}
          payableAmount={formatCurrency(amount)}
          onSuccess={(result) => {
            if (result?.code) setIssuedCode(result.code)
          }}
          onError={(message) => setError(message)}
        />
      )}

      {purchaseId && paymentConfig?.paypalClientId && paymentChoice === "paypal" && (
        <div className="customer-card" style={{ marginTop: 16 }}>
          <h3 className="customer-subtitle">{t("giftVoucher.payOnline")}</h3>
          <PayPalCheckout
            paypalClientId={paymentConfig.paypalClientId}
            paypalMode={paymentConfig.paypalMode}
            currency={paymentConfig.currency}
            fundingSource="paypal"
            giftPurchaseId={purchaseId}
            payableAmount={formatCurrency(amount)}
            onSuccess={(result) => {
              if (result?.code) setIssuedCode(result.code)
            }}
            onError={(message) => setError(message)}
          />
        </div>
      )}

      {purchaseId && paymentChoice === "paypal" && !paymentConfig?.paypalClientId && (
        <div className="customer-alert customer-alert--error" role="alert">
          {t("checkout.paymentUnavailable")}
        </div>
      )}

      {purchaseId && paymentChoice === "cash" && (
        <div className="customer-card" style={{ marginTop: 16 }}>
          <p>{t("giftVoucher.cashPending")}</p>
        </div>
      )}

      <p className="customer-hint checkout-terms-notice" style={{ marginTop: 20 }}>
        <Trans
          i18nKey="checkout.termsNotice"
          components={{
            agbLink: <Link to="/agb" className="checkout-terms-link" />,
            widerrufLink: <Link to="/widerruf" className="checkout-terms-link" />
          }}
        />
      </p>
      <CheckoutLegalFooter />
    </div>
  )
}

