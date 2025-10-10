import { ENDPOINTS, authApiCall } from "./api";
import { User } from "./auth";

export interface UsersResponse {
  success: boolean;
  users: User[];
  total: number;
  page: number;
  pages: number;
}

export const userService = {
  async getAllUsers(page: number = 1): Promise<UsersResponse> {
    return authApiCall(`${ENDPOINTS.users.all}?page=${page}`);
  },

  async getUsersWithReviews(page: number = 1): Promise<UsersResponse> {
    return authApiCall(`${ENDPOINTS.users.withReviews}?page=${page}`);
  },
};
