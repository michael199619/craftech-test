import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../core/database.js";

export enum UserStatus {
  AUTHORIZED = "AUTHORIZED",
  ANONYMOUS = "ANONYMOUS",
}

export class User extends Model {
  declare id: string;
  declare name: string;
  declare login: string;
  declare password: string;
  declare status: UserStatus;
  declare registrationCode: string | null;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    name: {
      type: DataTypes.STRING,
    },

    login: {
      type: DataTypes.STRING,
    },

    password: {
      type: DataTypes.STRING,
    },

    status: {
      type: DataTypes.ENUM(...Object.values(UserStatus)),
      defaultValue: UserStatus.ANONYMOUS,
      allowNull: false,
    },

    registrationCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  { sequelize, modelName: "User" },
);
