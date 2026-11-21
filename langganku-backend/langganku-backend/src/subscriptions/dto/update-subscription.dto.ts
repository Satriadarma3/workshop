import { PartialType } from '@nestjs/mapped-types';
import { CreateSubscriptionDto } from './create-subscription.dto';

/** Badan PATCH: semua field opsional, hanya yang dikirim yang diubah. */
export class UpdateSubscriptionDto extends PartialType(CreateSubscriptionDto) {}
