export interface CreateWorkspaceDto {
  name: string;
}

export interface UpdateWorkspaceDto {
  name?: string;
}

export interface WorkspaceResponse {
  id: string;
  name: string;
  authorId: string;
  createdAt?: Date;
  updatedAt?: Date;
}
