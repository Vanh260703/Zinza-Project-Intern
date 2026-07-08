import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from 'src/shared/guards';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { CreatePaymentOrderDto } from './dto/create-payment-order.dto';
import { SepayWebhookDto } from './dto/sepay-webhook.dto';
import { User } from 'src/modules/users/entities/user.entity';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // [GET] /api/v1/payments/candy-packages
  @Get('candy-packages')
  getCandyPackages() {
    return this.paymentsService.getCandyPackages();
  }

  // [POST] /api/v1/payments/orders
  @Post('orders')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  createOrder(@CurrentUser() user: User, @Body() dto: CreatePaymentOrderDto) {
    return this.paymentsService.createOrder(user.id, dto);
  }

  // [POST] /api/v1/payments/webhook/sepay
  @Post('webhook/sepay')
  @HttpCode(HttpStatus.OK)
  handleSepayWebhook(
    @Headers('x-sepay-signature') signature: string | undefined,
    @Headers('x-sepay-timestamp') timestamp: string | undefined,
    @Req() req: RawBodyRequest<Request>,
    @Body() dto: SepayWebhookDto,
  ) {
    const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(dto));
    return this.paymentsService.handleSepayWebhook(
      signature,
      timestamp,
      rawBody,
      dto,
    );
  }

  // [GET] /api/v1/payments/orders/:orderId
  @Get('orders/:orderId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  findOrderById(
    @CurrentUser() user: User,
    @Param('orderId', ParseUUIDPipe) id: string,
  ) {
    return this.paymentsService.findOrderById(user.id, id);
  }
}
