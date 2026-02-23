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
        const normalizedEmail = dto.email.trim().toLowerCase();

        const existingUser = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: normalizedEmail,
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

        return this.login({ email: normalizedEmail, password: dto.password });
    }

    async login(dto: LoginDto) {
        const normalizedEmail = dto.email.trim().toLowerCase();
        const user = await this.prisma.user.findUnique({
            where: { email: normalizedEmail },
            include: {
                distributor: { select: { id: true } },
                retailer: { select: { id: true } },
                salesman: { select: { id: true } },
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(user.password);
        const passwordOk = isBcryptHash
            ? await bcrypt.compare(dto.password, user.password)
            : dto.password === user.password;

        if (!passwordOk) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Auto-migrate legacy plaintext passwords to bcrypt in production databases.
        if (!isBcryptHash) {
            const hashed = await bcrypt.hash(dto.password, 10);
            await this.prisma.user.update({
                where: { id: user.id },
                data: { password: hashed },
            });
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
