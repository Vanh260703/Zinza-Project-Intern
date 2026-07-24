import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard, AdminGuard } from 'src/shared/guards';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { QueryUsersDto } from './dto/query-users.dto';
import { TopupCandyDto } from './dto/topup-candy.dto';
import { CreateCandyPackageDto } from './dto/create-candy-package.dto';
import { UpdateCandyPackageDto } from './dto/update-candy-package.dto';
import { QuerySuspenseTransactionsDto } from './dto/query-suspense-transactions.dto';
import { ResolveSuspenseTransactionDto } from './dto/resolve-suspense-transaction.dto';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // [GET] /api/v1/admin/stats
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  // [GET] /api/v1/admin/users?q=name&page=1&limit=20
  @Get('users')
  getUsers(@Query() dto: QueryUsersDto) {
    return this.adminService.getUsers(dto);
  }

  // [GET] /api/v1/admin/users/:id
  @Get('users/:id')
  getUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.getUserById(id);
  }

  // [GET] /api/v1/admin/candy-packages?page=1&limit=10
  @Get('candy-packages')
  getCandyPackages(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.adminService.getCandyPackages(page, limit);
  }

  // [POST] /api/v1/admin/candy-packages
  @Post('candy-packages')
  @HttpCode(HttpStatus.CREATED)
  createCandyPackage(@Body() dto: CreateCandyPackageDto) {
    return this.adminService.createCandyPackage(dto);
  }

  // [PATCH] /api/v1/admin/candy-packages/:id
  @Patch('candy-packages/:id')
  updateCandyPackage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCandyPackageDto,
  ) {
    return this.adminService.updateCandyPackage(id, dto);
  }

  // [DELETE] /api/v1/admin/candy-packages/:id
  @Delete('candy-packages/:id')
  @HttpCode(HttpStatus.OK)
  deleteCandyPackage(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteCandyPackage(id);
  }

  // [POST] /api/v1/admin/users/:id/topup
  @Post('users/:id/topup')
  @HttpCode(HttpStatus.OK)
  topupCandy(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TopupCandyDto,
  ) {
    return this.adminService.topupCandy(id, dto);
  }

  // [GET] /api/v1/admin/suspense-transactions?status=unresolved&reason=missing_pair&page=1&limit=20
  @Get('suspense-transactions')
  getSuspenseTransactions(@Query() dto: QuerySuspenseTransactionsDto) {
    return this.adminService.getSuspenseTransactions(dto);
  }

  // [PATCH] /api/v1/admin/suspense-transactions/:id/resolve
  @Patch('suspense-transactions/:id/resolve')
  resolveSuspenseTransaction(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResolveSuspenseTransactionDto,
    @CurrentUser() admin: User,
  ) {
    return this.adminService.resolveSuspenseTransaction(id, admin.id, dto);
  }
}
