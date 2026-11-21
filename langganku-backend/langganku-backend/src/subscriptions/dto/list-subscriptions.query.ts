import { IsIn, IsOptional, IsString } from 'class-validator';
import { SUBSCRIPTION_STATUSES, SubscriptionStatus } from '../../common/constants';
import { EmptyToUndefined } from '../../common/transforms';

/** Query opsional GET /subscriptions (frontend saat ini memfilter di sisi klien). */
export class ListSubscriptionsQuery {
  @EmptyToUndefined()
  @IsOptional()
  @IsIn(SUBSCRIPTION_STATUSES, { message: 'Status tidak valid.' })
  status?: SubscriptionStatus;

  /** id kategori, atau "none" untuk langganan tanpa kategori */
  @EmptyToUndefined()
  @IsOptional()
  @IsString()
  category_id?: string;

  /** kata kunci pada service_name dan notes */
  @EmptyToUndefined()
  @IsOptional()
  @IsString()
  q?: string;
}
