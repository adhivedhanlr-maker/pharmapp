import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const VALID_ROLES = ['ADMIN', 'DISTRIBUTOR', 'RETAILER', 'SALESMAN', 'CUSTOMER'] as const;
export type AppRole = typeof VALID_ROLES[number];

export class RegisterDto {
    @ApiProperty({ example: 'user@pharma.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'securepass123', minLength: 6 })
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiProperty({ enum: VALID_ROLES, example: 'RETAILER' })
    @IsIn(VALID_ROLES)
    role: AppRole;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    // Role specific
    @IsOptional() @IsString() companyName?: string;
    @IsOptional() @IsString() shopName?: string;
    @IsOptional() @IsString() address?: string;
    @IsOptional() @IsString() district?: string;
    @IsOptional() @IsString() pincode?: string;
}
