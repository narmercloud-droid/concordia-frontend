import React, { useEffect, useState } from "react"
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
import { KEMPEN_BRANCH_ID } from "@/lib/customerPaths"
import {
  EMPTY_DELIVERY_ADDRESS,
  formatDeliveryAddress,
  parseLegacyAddress,
  type DeliveryAddressFields
} from "@/lib/deliveryAddress"

type Tab = "profile" | "addresses" | "orders"

function tabFromPath(pathname: string): Tab {
  if (pathname.includes("/customer/orders")) return "orders"
  return "profile"
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
  const [tab, setTab] = useState<Tab>(() => tabFromPath(location.pathname))
  const [phone, setPhone] = useState(() => authUser?.phone ?? "")
  const [phoneSaved, setPhoneSaved] = useState(false)
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null)
  const [addressLabel, setAddressLabel] = useState("")
  const [addressFields, setAddressFields] = useState<DeliveryAddressFields>({
    ...EMPTY_DELIVERY_ADDRESS
  })
  const [addressError, setAddressError] = useState("")

  useEffect(() => {
    setTab(tabFromPath(location.pathname))
  }, [location.pathname])

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
    staleTime: 10 * 60_000
  })
  const geoBranchId =
    branches?.find((b: { id: string }) => b.id === KEMPEN_BRANCH_ID)?.id ??
    branches?.[0]?.id ??
    KEMPEN_BRANCH_ID

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile
  } = useQuery({
    queryKey: ["customerProfile"],
    queryFn: getCustomerProfile,
    retry: 1,
    staleTime: 60_000
  })

  const {
    data: addresses = [],
    isLoading: addressesLoading,
    isError: addressesError,
    refetch: refetchAddresses
  } = useQuery({
    queryKey: ["customerAddresses"],
    queryFn: listAddresses,
    retry: 1,
    enabled: tab === "addresses"
  })

  const {
    data: orders = [],
    isLoading: ordersLoading,
    isError: ordersError,
    refetch: refetchOrders
  } = useQuery({
    queryKey: ["my-orders"],
    queryFn: getMyOrders,
    enabled: tab === "orders",
    retry: 1
  })

  useEffect(() => {
    const nextPhone = profile?.phone ?? authUser?.phone ?? ""
    if (nextPhone) setPhone(nextPhone)
  }, [profile?.phone, authUser?.phone])

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

  const displayName = profile?.name ?? authUser?.name ?? ""
  const displayEmail = profile?.email ?? authUser?.email ?? ""
  const profilePending = profileLoading && !profile && !authUser

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
          {profilePending ? (
            <p className="customer-loading">{t("common.loading")}</p>
          ) : profileError && !authUser ? (
            <div>
              <p className="customer-error">{t("account.profileLoadError")}</p>
              <button type="button" className="customer-btn" onClick={() => void refetchProfile()}>
                {t("common.retry")}
              </button>
            </div>
          ) : (
            <>
              {profileError && (
                <p className="customer-hint customer-settings__sync-hint">{t("account.profileSyncError")}</p>
              )}
              <div className="customer-field">
                <label className="customer-label">{t("auth.name")}</label>
                <input className="customer-input customer-input--readonly" value={displayName} readOnly />
              </div>
              <div className="customer-field">
                <label className="customer-label">{t("auth.email")}</label>
                <input
                  className="customer-input customer-input--readonly"
                  value={displayEmail}
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
            <p className="customer-loading">{t("common.loading")}</p>
          ) : addressesError ? (
            <div>
              <p className="customer-error">{t("account.addressesLoadError")}</p>
              <button type="button" className="customer-btn" onClick={() => void refetchAddresses()}>
                {t("common.retry")}
              </button>
            </div>
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
            <p className="customer-loading">{t("account.ordersLoading")}</p>
          ) : ordersError ? (
            <div>
              <p className="customer-error">{t("account.ordersLoadError")}</p>
              <button type="button" className="customer-btn" onClick={() => void refetchOrders()}>
                {t("common.retry")}
              </button>
            </div>
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
