import { apiFetch } from "./api";

// Shape returned to UI matches the legacy Supabase-based fields
export interface ProfileUiShape {
  full_name?: string;
  phone?: string;
  address?: string;
  emergency_contact?: string;
  medical_conditions?: string[];
  is_profile_complete: boolean;
  email: string;
  role: string;
}

export const getProfile = async (): Promise<ProfileUiShape> => {
  const res = await apiFetch("/api/profiles");
  // Translate API fields to UI-expected snake_case keys
  return {
    full_name: res.fullName || "",
    phone: res.phoneNumber || "",
    address: "",
    emergency_contact: "",
    medical_conditions: [],
    is_profile_complete: !!res.isProfileComplete,
    email: res.email,
    role: res.role,
  };
};

export const updateProfile = async (payload: {
  full_name?: string;
  phone?: string;
  address?: string;
  emergency_contact?: string;
  medical_conditions?: string[];
  is_profile_complete?: boolean;
  role?: string;
}): Promise<ProfileUiShape> => {
  // Map UI payload to API fields
  const body: any = {};
  if (payload.full_name !== undefined) body.fullName = payload.full_name;
  if (payload.phone !== undefined) body.phoneNumber = payload.phone;
  if (payload.is_profile_complete !== undefined)
    body.isProfileComplete = payload.is_profile_complete;
  if (payload.role !== undefined) body.role = payload.role;

  const res = await apiFetch("/api/profiles", {
    method: "PUT",
    body: JSON.stringify(body),
  });

  return {
    full_name: res.fullName || "",
    phone: res.phoneNumber || "",
    address: "",
    emergency_contact: "",
    medical_conditions: [],
    is_profile_complete: !!res.isProfileComplete,
    email: res.email,
    role: res.role,
  };
};
