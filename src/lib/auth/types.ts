import type { Session, User } from "@supabase/supabase-js";
import type {
  ACCESS_TYPES,
  ACCOUNT_STATUSES,
  CLIENT_TYPES,
} from "@/lib/domain/constants";

export type AccessType = (typeof ACCESS_TYPES)[number];
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];
export type ClientType = (typeof CLIENT_TYPES)[number];

export type UserProfile = {
  id: string;
  auth_user_id: string;
  full_name: string | null;
  login_email: string;
  avatar_url: string | null;
  access_type: AccessType;
  account_status: AccountStatus;
};

export type ClientMembership = {
  id: string;
  client_id: string;
  membership_status: AccountStatus;
  client: {
    id: string;
    name: string;
    client_type: ClientType;
  } | null;
};

export type InterpretAccess = {
  id: string;
  interpreter_id: string;
  access_status: AccountStatus;
  interpreter: {
    id: string;
    name: string;
    owner_client_id: string;
  } | null;
};

export type AuthContext = {
  session: Session;
  user: User;
  profile: UserProfile;
  memberships: ClientMembership[];
  interpretAccess: InterpretAccess | null;
};
