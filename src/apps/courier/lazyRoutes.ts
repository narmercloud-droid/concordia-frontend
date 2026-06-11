export async function courierRouteLazy() {
  const [{ default: CourierLayout }, { default: CourierScanPage }, { default: CourierOrderPage }] =
    await Promise.all([
      import("./layouts/CourierLayout"),
      import("./pages/CourierScanPage"),
      import("./pages/CourierOrderPage")
    ])

  return {
    Component: CourierLayout,
    children: [
      { path: "scan", Component: CourierScanPage },
      { path: "order", Component: CourierOrderPage }
    ]
  }
}
