import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  WorkspaceResponse,
} from './workspaces.dto.js';
import { Workspace } from './workspaces.model.js';
import { WorkspacesRepository } from './workspaces.repository.js';

export class WorkspacesService {
  constructor(private repo: WorkspacesRepository) {}

  async getAll(page: number = 1, limit: number = 20) {
    const result = await this.repo.findAll(page, limit);

    return {
      data: result.data.map(this.mapToResponse),
      pagination: result.pagination,
    };
  }

  async getById(id: string): Promise<WorkspaceResponse | null> {
    const workspace = await this.repo.findById(id);
    return workspace ? this.mapToResponse(workspace) : null;
  }

  async create(
    data: CreateWorkspaceDto & { authorId: string },
  ): Promise<WorkspaceResponse> {
    const workspace = await this.repo.create(data);
    return this.mapToResponse(workspace);
  }

  async update(
    id: string,
    data: UpdateWorkspaceDto,
  ): Promise<WorkspaceResponse | null> {
    const workspace = await this.repo.update(id, data);
    return workspace ? this.mapToResponse(workspace) : null;
  }

  async delete(id: string): Promise<WorkspaceResponse | null> {
    const workspace = await this.repo.delete(id);
    return workspace ? this.mapToResponse(workspace) : null;
  }

  private mapToResponse(workspace: Workspace): WorkspaceResponse {
    return workspace.toJSON() as WorkspaceResponse;
  }
}
