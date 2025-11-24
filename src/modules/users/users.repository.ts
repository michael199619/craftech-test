import { FindOptions, Op } from 'sequelize';
import { PaginationResponse } from '../../core/pagination.dto.js';
import { UpsertUserDto } from './users.dto.js';
import { User } from './users.model.js';

export class UsersRepository {
  async findAll(
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginationResponse<User>> {
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      attributes: ['name', 'login', 'status', 'loginedAt'],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
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

  async findById(id: string, selectPassword: boolean = true) {
    return User.findByPk(id, {
      attributes: {
        include: ['id', 'name', 'login'],
        exclude: selectPassword ? ['password'] : [],
      },
    });
  }

  async findByLogin(login: string, id?: string) {
    const where: FindOptions['where'] = {
      login,
    };

    if (id) {
      where.id = {
        [Op.ne]: id,
      };
    }

    return User.findOne({
      where,
    });
  }

  async findByRegistrationCode(registrationCode: string) {
    return User.findOne({ where: { registrationCode } });
  }

  async upsert({ id, ...data }: UpsertUserDto) {
    let userId: string | undefined = id;

    if (userId) {
      await User.update(data, {
        where: { id: userId },
      });
    } else {
      const user = await User.create(data);
      userId = user.id;
    }

    const user = await this.findById(userId);

    return user!;
  }

  async delete(id: string) {
    await User.destroy({ where: { id } });
  }
}
