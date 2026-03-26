export class UserResponseDto {
  id: string;
  name: string;
  alias: string | null;
  profileImageUrl: string | null;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
