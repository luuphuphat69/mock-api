interface IMember {
  userId: string;
  username: string;
  email: string;
  role: string;
  permissions:{
    canEdit: boolean,
    canDelete: boolean,
    canInvite: boolean
  }
}