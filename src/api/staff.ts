import {
  createSuperAdminStaff,
  deleteSuperAdminStaff,
  getSuperAdminStaff,
  updateSuperAdminStaff
} from "./superAdmin.js"

export const getStaff = async () => {
  const result = await getSuperAdminStaff()
  return { data: result.staff }
}

export const createStaff = (data: any) => createSuperAdminStaff(data)
export const updateStaff = (id: string, data: any) => updateSuperAdminStaff(id, data)
export const deleteStaff = (id: string) => deleteSuperAdminStaff(id)
