import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ListSubscriptionsQuery } from './dto/list-subscriptions.query';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionsService } from './subscriptions.service';

// id yang bukan UUID pasti bukan milik siapa pun -> 404, bukan 500 dari PostgreSQL
const subscriptionIdPipe = new ParseUUIDPipe({
  exceptionFactory: () => new NotFoundException('Langganan tidak ditemukan.'),
});

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly service: SubscriptionsService) {}

  @Get()
  list(@CurrentUser() user: User, @Query() query: ListSubscriptionsQuery) {
    return this.service.list(user.id, query);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateSubscriptionDto) {
    return this.service.create(user.id, dto); // 201
  }

  // Frontend memakai PUT; PATCH disediakan sesuai rancangan awal (perubahan sebagian)
  @Put(':id')
  replace(@CurrentUser() user: User, @Param('id', subscriptionIdPipe) id: string, @Body() dto: CreateSubscriptionDto) {
    return this.service.replace(user.id, id, dto);
  }

  @Patch(':id')
  patch(@CurrentUser() user: User, @Param('id', subscriptionIdPipe) id: string, @Body() dto: UpdateSubscriptionDto) {
    return this.service.patch(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@CurrentUser() user: User, @Param('id', subscriptionIdPipe) id: string) {
    await this.service.remove(user.id, id);
  }
}
