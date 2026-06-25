import React from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

type Props = {
  itemCount: number
  active?: boolean
}

export default function NativeCartButton({ itemCount, active }: Props) {
  const { t } = useTranslation()

  return (
    <Link
      to="/customer/cart"
      className={`native-cart-btn${active ? " native-cart-btn--active" : ""}${
        itemCount > 0 ? " native-cart-btn--filled" : ""
      }`}
      aria-label={
        itemCount > 0 ? t("layout.cartWithCount", { count: itemCount }) : t("layout.cart")
      }
    >
      <svg className="native-cart-btn__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6 7.5h15l-1.4 8.4a1.5 1.5 0 0 1-1.48 1.3H8.12a1.5 1.5 0 0 1-1.48-1.3L5 7.5Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path d="M9 4.5h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="9.5" cy="19" r="1.2" fill="currentColor" />
        <circle cx="17.5" cy="19" r="1.2" fill="currentColor" />
      </svg>
      {itemCount > 0 ? <span className="native-cart-btn__badge">{itemCount}</span> : null}
    </Link>
  )
}
