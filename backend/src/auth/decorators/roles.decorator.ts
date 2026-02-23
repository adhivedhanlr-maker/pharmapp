import { SetMetadata } from '@nestjs/common';

// Valid roles: ADMIN | DISTRIBUTOR | RETAILER | SALESMAN | CUSTOMER
export type AppRole = 'ADMIN' | 'DISTRIBUTOR' | 'RETAILER' | 'SALESMAN' | 'CUSTOMER';

export const Roles = (...roles: AppRole[]) => SetMetadata('roles', roles);
