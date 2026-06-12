import React, { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { getBranches } from "@/api/customer"
import {
  addAddress,
  deleteAddress,
  listAddresses,
  updateAddress,
  type SavedAddress
} from "@/api/addresses"
import { getCustomerProfile, updateCustomerPhone } from "@/api/customerAuth"
import { getMyOrders } from "@/api/order"
import DeliveryAddressForm from "@/components/DeliveryAddressForm"
import OrderHistoryItem from "@/apps/customer/components/order/OrderHistoryItem"
import { useAuthStore } from "@/context/authStore"
import {
  EMPTY_DELIVERY_ADDRESS,
  formatDeliveryAddress,
  parseLegacyAddress,
  type DeliveryAddressFields
} from "@/lib/deliveryAddress"

type Tab = "profile" | "addresses" | "orders"

function unwrapOrders(res: any) {
  const body = res?.data
  if (body?.data) return body.data
  if (Array.isArray(body)) return body
  return []
}

function addressToFields(address: SavedAddress): DeliveryAddressFields {
  const parsed = parseLegacyAddress(address.street)
  return {
    ...EMPTY_DELIVERY_ADDRESS,
    street: parsed.houseNumber ? parsed.street : address.street,
    houseNumber: parsed.houseNumber,
    city: address.city,
    postalCode: address.postalCode,
    floor: address.instructions ?? "",
    lat: address.lat ?? undefined,
    lng: address.lng ?? undefined
  }
}

function fieldsToStreetLine(fields: DeliveryAddressFields): string {
  return [fields.street.trim(), fields.houseNumber.trim()].filter(Boolean).join(" ")
}

export default function CustomerSettingsPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const queryClient = useQueryClient()
  const authUser = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const initialTab: Tab =
    location.pathname.includes("/orders") && !location.pathname.includes("/orders/")
      ? "orders"
      : "profile"
  const [tab, setTab] = useState<Tab>(initialTab)
  const [phone, setPhone] = useState("")
  const [phoneSaved, setPhoneSaved] = useState(false)
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null)
  const [addressLabel, setAddressLabel] = useState("")
  const [addressFields, setAddressFields] = useState<DeliveryAddressFields>({
    ...EMPTY_DELIVERY_ADDRESS
  })
  const [addressError, setAddressError] = useState("")

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
    staleTime: 10 * 60_000
  })
  const geoBranchId = branches?.[0]?.id ?? "kempen"

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["customerProfile"],
    queryFn: getCustomerProfile
  })

  const { data: addresses = [], isLoading: addressesLoading } = useQuery({
    queryKey: ["customerAddresses"],
    queryFn: listAddresses
  })

  const { data: ordersResponse, isLoading: ordersLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: getMyOrders,
    enabled: tab === "orders"
  })

  React.useEffect(() => {
    if (profile?.phone && !phone) {
      setPhone(profile.phone)
    }
  }, [profile?.phone, phone])

  const phoneMutation = useMutation({
    mutationFn: updateCustomerPhone,
    onSuccess: (user) => {
      if (authUser) {
        setUser({ ...authUser, phone: user.phone ?? phone })
      }
      setPhoneSaved(true)
      window.setTimeout(() => setPhoneSaved(false), 2500)
      queryClient.invalidateQueries({ queryKey: ["customerProfile"] })
    }
  })

  const saveAddressMutation = useMutation({
    mutationFn: async () => {
      const street = fieldsToStreetLine(addressFields)
      if (!street || !addressFields.postalCode || !addressFields.city) {
        throw new Error(t("checkout.completeAddress"))
      }
      const payload = {
        label: addressLabel.trim() || t("account.addressDefaultLabel"),
        street,
        city: addressFields.city.trim(),
        postalCode: addressFields.postalCode.trim(),
        lat: addressFields.lat,
        lng: addressFields.lng,
        instructions: addressFields.floor.trim() || undefined,
        isDefault: addresses.length === 0
      }
      if (editingAddress) {
        await updateAddress(editingAddress.id, payload)
      } else {
        await addAddress(payload)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customerAddresses"] })
      queryClient.invalidateQueries({ queryKey: ["customerProfile"] })
      closeAddressModal()
    },
    onError: (err: Error) => {
      setAddressError(err.message || t("account.addressSaveFailed"))
    }
  })

  const removeAddressMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customerAddresses"] })
      queryClient.invalidateQueries({ queryKey: ["customerProfile"] })
    }
  })

  const openAddAddress = () => {
    setEditingAddress(null)
    setAddressLabel("")
    setAddressFields({ ...EMPTY_DELIVERY_ADDRESS })
    setAddressError("")
    setAddressModalOpen(true)
  }

  const openEditAddress = (address: SavedAddress) => {
    setEditingAddress(address)
    setAddressLabel(address.label)
    setAddressFields(addressToFields(address))
    setAddressError("")
    setAddressModalOpen(true)
  }

  const closeAddressModal = () => {
    setAddressModalOpen(false)
    setEditingAddress(null)
    setAddressError("")
  }

  const orders = ordersResponse ? unwrapOrders(ordersResponse) : []
  const displayName = profile?.name ?? authUser?.name ?? ""

  return (
    <div className="customer-page customer-settings">
      <h2 className="customer-title">{t("account.settingsTitle")}</h2>
      <p className="customer-hint">{t("account.settingsLead")}</p>

      <div className="customer-settings__tabs" role="tablist">
        {(["profile", "addresses", "orders"] as Tab[]).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={`customer-toggle${tab === key ? " customer-toggle--active" : ""}`}
            onClick={() => setTab(key)}
          >
            {t(`account.tab${key.charAt(0).toUpperCase()}${key.slice(1)}`)}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="customer-card customer-settings__panel">
          {profileLoading ? (
            <p>{t("common.loading")}</p>
          ) : (
            <>
              <div className="customer-field">
                <label className="customer-label">{t("auth.name")}</label>
                <input className="customer-input customer-input--readonly" value={displayName} readOnly />
              </div>
              <div className="customer-field">
                <label className="customer-label">{t("auth.email")}</label>
                <input
                  className="customer-input customer-input--readonly"
                  value={profile?.email ?? authUser?.email ?? ""}
                  readOnly
                />
              </div>
              <div className="customer-field">
                <label className="customer-label">{t("checkout.phone")}</label>
                <input
                  className="customer-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("checkout.phonePlaceholder")}
                />
              </div>
              <button
                type="button"
                className="customer-btn customer-btn--primary"
                disabled={phoneMutation.isPending || !phone.trim()}
                onClick={() => phoneMutation.mutate(phone.trim())}
              >
                {phoneMutation.isPending ? t("common.processing") : t("account.savePhone")}
              </button>
              {phoneSaved && (
                <p className="customer-hint" style={{ color: "var(--c-success)" }}>
                  {t("account.phoneSaved")}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {tab === "addresses" && (
        <div className="customer-settings__panel">
          <div className="customer-settings__panel-head">
            <h3 className="customer-subtitle">{t("account.addressesTitle")}</h3>
            <button type="button" className="customer-btn customer-btn--primary" onClick={openAddAddress}>
              {t("account.addAddress")}
            </button>
          </div>

          {addressesLoading ? (
            <p>{t("common.loading")}</p>
          ) : addresses.length === 0 ? (
            <p className="customer-hint">{t("account.noAddresses")}</p>
          ) : (
            <div className="customer-settings__address-list">
              {addresses.map((address) => (
                <div key={address.id} className="customer-card customer-settings__address-card">
                  <div>
                    <strong>{address.label}</strong>
                    {address.isDefault && (
                      <span className="customer-settings__default-badge">
                        {t("account.defaultAddress")}
                      </span>
                    )}
                    <p className="customer-hint" style={{ marginTop: 8 }}>
                      {formatDeliveryAddress(addressToFields(address))}
                    </p>
                  </div>
                  <div className="customer-btn-row">
                    <button
                      type="button"
                      className="customer-btn"
                      onClick={() => openEditAddress(address)}
                    >
                      {t("account.editAddress")}
                    </button>
                    <button
                      type="button"
                      className="customer-btn customer-btn--danger"
                      disabled={removeAddressMutation.isPending}
                      onClick={() => removeAddressMutation.mutate(address.id)}
                    >
                      {t("common.remove")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "orders" && (
        <div className="customer-settings__panel">
          <h3 className="customer-subtitle">{t("account.ordersTitle")}</h3>
          {ordersLoading ? (
            <p>{t("account.ordersLoading")}</p>
          ) : orders.length === 0 ? (
            <p className="customer-hint">{t("account.noOrders")}</p>
          ) : (
            <div className="customer-settings__orders">
              {orders.map((order: any) => (
                <OrderHistoryItem key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      )}

      {addressModalOpen && (
        <div className="customer-modal-backdrop" role="presentation" onClick={closeAddressModal}>
          <div
            className="customer-modal customer-settings__modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="customer-subtitle">
              {editingAddress ? t("account.editAddress") : t("account.addAddress")}
            </h3>
            <div className="customer-field">
              <label className="customer-label">{t("account.addressLabel")}</label>
              <input
                className="customer-input"
                value={addressLabel}
                onChange={(e) => setAddressLabel(e.target.value)}
                placeholder={t("account.addressLabelPlaceholder")}
              />
            </div>
            <DeliveryAddressForm
              branchId={geoBranchId}
              value={addressFields}
              onChange={setAddressFields}
              error={addressError}
            />
            <div className="customer-btn-row" style={{ marginTop: 16 }}>
              <button
                type="button"
                className="customer-btn customer-btn--primary"
                disabled={saveAddressMutation.isPending}
                onClick={() => saveAddressMutation.mutate()}
              >
                {saveAddressMutation.isPending ? t("common.processing") : t("account.saveAddress")}
              </button>
              <button type="button" className="customer-btn" onClick={closeAddressModal}>
                {t("common.close")}
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="customer-hint" style={{ marginTop: 24 }}>
        <Link to="/">{t("pages.backHome")}</Link>
      </p>
    </div>
  )
}
