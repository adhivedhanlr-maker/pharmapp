import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                role: dto.role,
                name: dto.name,
                phone: dto.phone,
            },
        });

        // Create profile based on role
        if (dto.role === 'DISTRIBUTOR' && dto.companyName) {
            await this.prisma.distributor.create({
                data: {
                    userId: user.id,
                    companyName: dto.companyName,
                    address: dto.address || '',
                    district: dto.district || '',
                },
            });
        } else if (dto.role === 'RETAILER' && dto.shopName) {
            await this.prisma.retailer.create({
                data: {
                    userId: user.id,
                    shopName: dto.shopName,
                    address: dto.address || '',
                    district: dto.district || '',
                    pincode: dto.pincode || '',
                },
            });
        }

        return this.login({ email: dto.email, password: dto.password });
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: {
                distributor: { select: { id: true } },
                retailer: { select: { id: true } },
                salesman: { select: { id: true } },
            },
        });

        if (!user || !(await bcrypt.compare(dto.password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            access_token: await this.jwtService.signAsync(payload),
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                distributor: user.distributor ?? undefined,
                retailer: user.retailer ?? undefined,
                salesman: user.salesman ?? undefined,
            },
        };
    }
}
