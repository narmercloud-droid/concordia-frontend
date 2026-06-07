import { useTranslation } from "react-i18next"

export default function MenuPage() {
  const { t } = useTranslation()
  return <div>{t("menu.title")}</div>
}
