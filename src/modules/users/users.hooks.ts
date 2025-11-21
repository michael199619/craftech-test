import { User } from "./users.model.js";

User.afterCreate((instance: User) => {});

User.afterUpdate((instance: User) => {});

User.afterDestroy((instance: User) => {});
