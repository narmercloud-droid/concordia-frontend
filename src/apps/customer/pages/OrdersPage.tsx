import { useTranslation } from "react-i18next"

export default function OrdersPage() {
  const { t } = useTranslation()
  return <div>{t("account.ordersTitle")}</div>
}
