import { PaginationResponse } from '../../core/pagination.dto.js';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './workspaces.dto.js';
import { Workspace } from './workspaces.model.js';

export class WorkspacesRepository {
  // todo: доделать выборку только юзера
  async findAll(
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginationResponse<Workspace>> {
    const offset = (page - 1) * limit;

    const { count, rows } = await Workspace.findAndCountAll({
      limit,
      offset,
      //  order: [['createdAt', 'DESC']],
    });

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findById(id: string) {
    return Workspace.findByPk(id, {
      include: ['boards'],
    });
  }

  async create(data: CreateWorkspaceDto) {
    return Workspace.create(data);
  }

  async update(id: string, data: UpdateWorkspaceDto) {
    await Workspace.update(data, {
      where: { id },
    });

    return Workspace.findByPk(id, {
      attributes: ['id', 'name', 'authorId', 'createdAt'],
    });
  }

  async delete(id: string) {
    await Workspace.destroy({ where: { id } });
  }
}
