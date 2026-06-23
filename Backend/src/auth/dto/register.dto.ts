import {
  IsString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@ValidatorConstraint({ name: 'MatchPassword' })
export class MatchPasswordConstraint implements ValidatorConstraintInterface {
  validate(confirmPassword: string, args: ValidationArguments): boolean {
    const dto = args.object as RegisterDto;
    return dto.password === confirmPassword;
  }

  defaultMessage(): string {
    return 'Mật khẩu xác nhận không khớp';
  }
}

// Kế thừa CreateUserDto (đã có email, name, password + validation)
// Chỉ thêm confirmPassword — field chỉ cần ở HTTP layer, không cần ở service
export class RegisterDto extends CreateUserDto {
  @IsString({ message: 'Mật khẩu xác nhận phải là chuỗi' })
  @Validate(MatchPasswordConstraint)
  confirmPassword: string;
}
