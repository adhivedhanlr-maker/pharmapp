import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConnectorDto } from './dto/create-connector.dto';
import { SyncRecordInput } from './dto/sync-connector.dto';

type DistributorCandidate = {
  id: string;
  ptr: number;
  stock: number;
  expiry: Date;
  distributor: {
    id: string;
    companyName: string;
    district: string;
    user: {
      phone: string | null;
    };
  };
};

type AlertCreatePayload = {
  retailerId: string;
  stockId: string;
  type: string;
  severity: string;
  thresholdValue: number | null;
  message: string;
  status: string;
};

type ConnectorConfig = {
  source?: {
    type?: string;
    dbKind?: 'postgres' | 'mysql' | 'sqlserver' | 'sqlite' | string;
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    query?: string;
  };
  fieldMap?: Record<string, string>;
};

@Injectable()
export class IntelligenceService {
  private readonly logger = new Logger(IntelligenceService.name);

  constructor(private prisma: PrismaService) {}

  async createConnector(retailerId: string, dto: CreateConnectorDto) {
    return this.prisma.pharmacyConnector.create({
      data: {
        retailerId,
        name: dto.name,
        softwareType: dto.softwareType,
        syncIntervalMinutes: dto.syncIntervalMinutes ?? 15,
        config: JSON.stringify(dto.config ?? {}),
      },
    });
  }

  async listConnectors(retailerId: string) {
    return this.prisma.pharmacyConnector.findMany({
      where: { retailerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  getConnectorBlueprints() {
    return {
      universalDirectDb: {
        softwareType: 'UNIVERSAL_DIRECT_DB',
        configTemplate: {
          source: {
            type: 'direct_db',
            dbKind: 'postgres',
            host: 'db-host',
            port: 5432,
            database: 'pharmacy_db',
            username: 'readonly_user',
            password: 'readonly_password',
            query:
              'SELECT sku, product_name, generic_name, batch_no, qty, expiry_date, supplier_name, supplier_phone, supplier_location, updated_at FROM stock_table',
          },
          fieldMap: {
            sku: 'sku',
            productName: 'product_name',
            genericName: 'generic_name',
            batchNumber: 'batch_no',
            quantity: 'qty',
            expiry: 'expiry_date',
            distributorName: 'supplier_name',
            distributorContact: 'supplier_phone',
            distributorLocation: 'supplier_location',
          },
        },
      },
      margDirectDbPreset: {
        softwareType: 'MARG_DIRECT_DB',
        notes: [
          'Use read-only DB credentials.',
          'Use exact Marg table/column names from your installation.',
          'Start with daily sync, then move to 5-15 minute sync.',
        ],
        configTemplate: {
          source: {
            type: 'direct_db',
            dbKind: 'sqlserver',
            host: 'marg-db-host',
            port: 1433,
            database: 'MARGERP',
            username: 'readonly_user',
            password: 'readonly_password',
            query:
              'SELECT ItemCode AS sku, ItemName AS product_name, GenericName AS generic_name, BatchNo AS batch_no, StockQty AS qty, ExpiryDate AS expiry_date, SupplierName AS supplier_name, SupplierPhone AS supplier_phone, SupplierCity AS supplier_location FROM StockMaster',
          },
          fieldMap: {
            sku: 'sku',
            productName: 'product_name',
            genericName: 'generic_name',
            batchNumber: 'batch_no',
            quantity: 'qty',
            expiry: 'expiry_date',
            distributorName: 'supplier_name',
            distributorContact: 'supplier_phone',
            distributorLocation: 'supplier_location',
          },
        },
      },
    };
  }

  async syncConnector(retailerId: string, connectorId: string, records: SyncRecordInput[]) {
    const connector = await this.prisma.pharmacyConnector.findFirst({
      where: { id: connectorId, retailerId },
    });
    if (!connector) throw new NotFoundException('Connector not found');

    const run = await this.prisma.connectorSyncRun.create({
      data: {
        connectorId: connector.id,
        status: 'RUNNING',
        recordsReceived: records.length,
      },
    });

    try {
      let upserted = 0;

      for (const record of records) {
        const batchNumber = (record.batchNumber ?? '').trim();
        const product = await this.findProduct(record);
        await this.prisma.retailerStock.upsert({
          where: {
            retailerId_productName_batchNumber: {
              retailerId,
              productName: record.productName.trim(),
              batchNumber,
            },
          },
          update: {
            connectorId: connector.id,
            productId: product?.id,
            externalSku: record.sku?.trim(),
            genericName: record.genericName?.trim(),
            quantity: record.quantity,
            expiry: record.expiry ? new Date(record.expiry) : null,
            distributorName: record.distributorName?.trim(),
            distributorContact: record.distributorContact?.trim(),
            distributorLocation: record.distributorLocation?.trim(),
            lastSeenAt: new Date(),
          },
          create: {
            retailerId,
            connectorId: connector.id,
            productId: product?.id,
            externalSku: record.sku?.trim(),
            productName: record.productName.trim(),
            genericName: record.genericName?.trim(),
            batchNumber,
            quantity: record.quantity,
            expiry: record.expiry ? new Date(record.expiry) : null,
            distributorName: record.distributorName?.trim(),
            distributorContact: record.distributorContact?.trim(),
            distributorLocation: record.distributorLocation?.trim(),
          },
        });
        upserted += 1;
      }

      const { createdAlerts } = await this.rebuildAlertsAndMatches(retailerId);

      await this.prisma.connectorSyncRun.update({
        where: { id: run.id },
        data: {
          status: 'SUCCESS',
          recordsUpserted: upserted,
          endedAt: new Date(),
        },
      });

      await this.prisma.pharmacyConnector.update({
        where: { id: connector.id },
        data: { lastSyncedAt: new Date() },
      });

      return {
        syncRunId: run.id,
        recordsReceived: records.length,
        recordsUpserted: upserted,
        alertsGenerated: createdAlerts,
      };
    } catch (error) {
      await this.prisma.connectorSyncRun.update({
        where: { id: run.id },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Sync failed',
          endedAt: new Date(),
        },
      });
      throw error;
    }
  }

  async syncRawConnector(retailerId: string, connectorId: string, rows: Record<string, unknown>[]) {
    const connector = await this.prisma.pharmacyConnector.findFirst({
      where: { id: connectorId, retailerId },
      select: { config: true },
    });
    if (!connector) throw new NotFoundException('Connector not found');

    const normalized = this.normalizeRawRows(rows, this.parseConnectorConfig(connector.config));
    return this.syncConnector(retailerId, connectorId, normalized);
  }

  async runConnectorAutoSync(connectorId: string) {
    const connector = await this.prisma.pharmacyConnector.findUnique({
      where: { id: connectorId },
      select: {
        id: true,
        retailerId: true,
        name: true,
        config: true,
      },
    });

    if (!connector) throw new NotFoundException('Connector not found');

    const config = this.parseConnectorConfig(connector.config);
    const source = config.source;
    if (!source || source.type !== 'direct_db') {
      return { skipped: true, reason: 'Connector source.type is not direct_db' };
    }

    const rows = await this.pullRowsFromSource(source);
    const normalized = this.normalizeRawRows(rows, config);
    this.logger.log(
      `Auto-sync connector=${connector.name}(${connector.id}) rows=${rows.length} normalized=${normalized.length}`,
    );
    return this.syncConnector(connector.retailerId, connector.id, normalized);
  }

  async getConnectorRuns(retailerId: string, connectorId: string) {
    const connector = await this.prisma.pharmacyConnector.findFirst({
      where: { id: connectorId, retailerId },
      select: { id: true },
    });
    if (!connector) throw new NotFoundException('Connector not found');

    return this.prisma.connectorSyncRun.findMany({
      where: { connectorId },
      orderBy: { startedAt: 'desc' },
      take: 30,
    });
  }

  async listRetailerStocks(retailerId: string) {
    return this.prisma.retailerStock.findMany({
      where: { retailerId },
      include: { product: true, connector: true },
      orderBy: [{ quantity: 'asc' }, { expiry: 'asc' }],
    });
  }

  async listRetailerAlerts(retailerId: string) {
    return this.prisma.stockAlert.findMany({
      where: { retailerId, status: 'OPEN' },
      include: {
        stock: {
          include: {
            product: true,
          },
        },
      },
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getRetailerMatches(retailerId: string, stockId?: string) {
    return this.prisma.stockMatch.findMany({
      where: {
        stock: {
          retailerId,
        },
        ...(stockId ? { stockId } : {}),
      },
      include: {
        stock: true,
        distributorInventory: {
          include: {
            product: true,
            distributor: {
              include: {
                user: {
                  select: { phone: true },
                },
              },
            },
          },
        },
      },
      orderBy: { score: 'desc' },
      take: stockId ? 5 : 30,
    });
  }

  async getDistributorOpportunities(distributorId: string) {
    const matches = await this.prisma.stockMatch.findMany({
      where: {
        distributorInventory: {
          distributorId,
        },
      },
      include: {
        stock: {
          include: {
            retailer: {
              include: {
                user: {
                  select: { phone: true, email: true },
                },
              },
            },
          },
        },
        distributorInventory: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { score: 'desc' },
      take: 60,
    });

    return matches.map((match: any) => {
      const daysToExpiry = match.stock.expiry
        ? Math.max(
            0,
            Math.ceil((new Date(match.stock.expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
          )
        : null;

      return {
        matchId: match.id,
        score: match.score,
        product: match.distributorInventory.product.name,
        pharmacy: {
          id: match.stock.retailer.id,
          name: match.stock.retailer.shopName,
          district: match.stock.retailer.district,
          phone: match.stock.retailer.user.phone,
          email: match.stock.retailer.user.email,
        },
        demand: {
          currentQty: match.stock.quantity,
          batchNumber: match.stock.batchNumber,
          expiry: match.stock.expiry,
          daysToExpiry,
        },
        yourOffer: {
          ptr: match.distributorInventory.ptr,
          availableStock: match.distributorInventory.stock,
          batchNumber: match.distributorInventory.batchNumber,
          expiry: match.distributorInventory.expiry,
        },
        reason: match.reason,
      };
    });
  }

  private async findProduct(record: SyncRecordInput) {
    if (record.sku) {
      const bySku = await this.prisma.productMaster.findFirst({
        where: { hsnCode: record.sku.trim() },
      });
      if (bySku) return bySku;
    }

    return this.prisma.productMaster.findFirst({
      where: {
        OR: [
          { name: { equals: record.productName.trim() } },
          ...(record.genericName ? [{ genericName: { equals: record.genericName.trim() } }] : []),
        ],
      },
    });
  }

  private parseConnectorConfig(raw: string | null | undefined): ConnectorConfig {
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? (parsed as ConnectorConfig) : {};
    } catch {
      return {};
    }
  }

  private normalizeRawRows(rows: Record<string, unknown>[], config: ConnectorConfig): SyncRecordInput[] {
    const map = config.fieldMap ?? {};
    const mapped = rows
      .map((row) => ({
        sku: this.readString(row, map.sku),
        productName: this.readString(row, map.productName),
        genericName: this.readString(row, map.genericName),
        batchNumber: this.readString(row, map.batchNumber),
        quantity: this.readNumber(row, map.quantity),
        expiry: this.readDate(row, map.expiry),
        distributorName: this.readString(row, map.distributorName),
        distributorContact: this.readString(row, map.distributorContact),
        distributorLocation: this.readString(row, map.distributorLocation),
      }))
      .filter((entry) => entry.productName && Number.isFinite(entry.quantity));

    return mapped.map((entry) => ({
      sku: entry.sku ?? undefined,
      productName: entry.productName as string,
      genericName: entry.genericName ?? undefined,
      batchNumber: entry.batchNumber ?? undefined,
      quantity: Math.max(0, Math.floor(entry.quantity as number)),
      expiry: entry.expiry ?? undefined,
      distributorName: entry.distributorName ?? undefined,
      distributorContact: entry.distributorContact ?? undefined,
      distributorLocation: entry.distributorLocation ?? undefined,
    }));
  }

  private readString(row: Record<string, unknown>, key?: string): string | null {
    if (!key) return null;
    const value = row[key];
    if (value === null || value === undefined) return null;
    const text = String(value).trim();
    return text.length ? text : null;
  }

  private readNumber(row: Record<string, unknown>, key?: string): number {
    if (!key) return Number.NaN;
    const value = row[key];
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return Number(value);
    return Number.NaN;
  }

  private readDate(row: Record<string, unknown>, key?: string): string | null {
    if (!key) return null;
    const value = row[key];
    if (!value) return null;
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  }

  private async pullRowsFromSource(source: NonNullable<ConnectorConfig['source']>): Promise<Record<string, unknown>[]> {
    const dbKind = (source.dbKind || '').toLowerCase();
    const query = source.query?.trim();
    if (!query) throw new Error('Connector source.query is missing');

    if (dbKind === 'postgres') {
      const pg: any = await import('pg');
      const client = new pg.Client({
        host: source.host,
        port: source.port || 5432,
        database: source.database,
        user: source.username,
        password: source.password,
        ssl: { rejectUnauthorized: false },
      });
      await client.connect();
      try {
        const result = await client.query(query);
        return (result.rows || []) as Record<string, unknown>[];
      } finally {
        await client.end();
      }
    }

    if (dbKind === 'mysql') {
      const mysql: any = await import('mysql2/promise');
      const connection = await mysql.createConnection({
        host: source.host,
        port: source.port || 3306,
        database: source.database,
        user: source.username,
        password: source.password,
      });
      try {
        const [rows] = await connection.execute(query);
        return (rows || []) as Record<string, unknown>[];
      } finally {
        await connection.end();
      }
    }

    if (dbKind === 'sqlserver') {
      const sql: any = await import('mssql');
      const pool = await sql.connect({
        server: source.host,
        port: source.port || 1433,
        database: source.database,
        user: source.username,
        password: source.password,
        options: {
          encrypt: true,
          trustServerCertificate: true,
        },
      });
      try {
        const result = await pool.request().query(query);
        return (result.recordset || []) as Record<string, unknown>[];
      } finally {
        await pool.close();
      }
    }

    throw new Error(`Unsupported source.dbKind: ${source.dbKind}`);
  }

  private async rebuildAlertsAndMatches(retailerId: string) {
    const stocks = await this.prisma.retailerStock.findMany({
      where: { retailerId },
      include: { retailer: true },
    });

    await this.prisma.stockMatch.deleteMany({
      where: {
        stock: { retailerId },
      },
    });
    await this.prisma.stockAlert.deleteMany({
      where: { retailerId, status: 'OPEN' },
    });

    const now = Date.now();
    const nearExpiryMs = 45 * 24 * 60 * 60 * 1000;
    const lowStockThreshold = 20;
    const alertsToCreate: AlertCreatePayload[] = [];

    for (const stock of stocks) {
      if (stock.quantity <= lowStockThreshold) {
        alertsToCreate.push({
          retailerId,
          stockId: stock.id,
          type: 'LOW_STOCK',
          severity: stock.quantity <= 5 ? 'HIGH' : 'MEDIUM',
          thresholdValue: lowStockThreshold,
          message: `${stock.productName} is low (${stock.quantity} left)`,
          status: 'OPEN',
        });
      }

      if (stock.expiry) {
        const daysLeft = Math.ceil((new Date(stock.expiry).getTime() - now) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 45) {
          alertsToCreate.push({
            retailerId,
            stockId: stock.id,
            type: 'NEAR_EXPIRY',
            severity: daysLeft <= 15 ? 'HIGH' : 'MEDIUM',
            thresholdValue: 45,
            message: `${stock.productName} batch ${stock.batchNumber || '-'} expires in ${Math.max(daysLeft, 0)} day(s)`,
            status: 'OPEN',
          });
        }
      }

      const needsAttention =
        stock.quantity <= lowStockThreshold || (stock.expiry ? new Date(stock.expiry).getTime() - now <= nearExpiryMs : false);

      if (!needsAttention) continue;

      const candidates = await this.findDistributorCandidates(stock.productId, stock.productName);
      if (!candidates.length) continue;

      const sorted = this.rankCandidates(stock.quantity, stock.expiry, stock.retailer.district, candidates);
      const top = sorted.slice(0, 5);

      if (top.length) {
        await this.prisma.stockMatch.createMany({
          data: top.map((entry) => ({
            stockId: stock.id,
            distributorInventoryId: entry.id,
            score: entry.score,
            reason: entry.reason,
          })),
        });
      }
    }

    if (alertsToCreate.length) {
      await this.prisma.stockAlert.createMany({
        data: alertsToCreate,
      });
    }

    return { createdAlerts: alertsToCreate.length };
  }

  private async findDistributorCandidates(productId: string | null, productName: string): Promise<DistributorCandidate[]> {
    if (productId) {
      return this.prisma.distributorInventory.findMany({
        where: {
          productId,
          stock: { gt: 0 },
        },
        include: {
          distributor: {
            include: {
              user: {
                select: { phone: true },
              },
            },
          },
        },
        take: 40,
      });
    }

    return this.prisma.distributorInventory.findMany({
      where: {
        stock: { gt: 0 },
        product: {
          name: { contains: productName },
        },
      },
      include: {
        distributor: {
          include: {
            user: {
              select: { phone: true },
            },
          },
        },
      },
      take: 40,
    });
  }

  private rankCandidates(
    currentQty: number,
    stockExpiry: Date | null,
    retailerDistrict: string,
    candidates: DistributorCandidate[],
  ) {
    const need = Math.max(1, 20 - currentQty);
    const prices = candidates.map((c) => c.ptr);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceSpread = Math.max(0.01, maxPrice - minPrice);

    return candidates
      .map((candidate) => {
        const availabilityScore = Math.min(candidate.stock / need, 1) * 30;
        const priceScore = ((maxPrice - candidate.ptr) / priceSpread) * 30;
        const locationScore = candidate.distributor.district === retailerDistrict ? 20 : 10;

        const candidateDaysToExpiry = Math.ceil((new Date(candidate.expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const expiryScore = candidateDaysToExpiry > 180 ? 20 : candidateDaysToExpiry > 90 ? 12 : 5;

        const retailerExpiryPenalty = stockExpiry
          ? Math.max(0, 10 - Math.ceil((new Date(stockExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 5)))
          : 0;

        const total = availabilityScore + priceScore + locationScore + expiryScore + retailerExpiryPenalty;
        return {
          ...candidate,
          score: Number(total.toFixed(2)),
          reason: `availability=${availabilityScore.toFixed(1)},price=${priceScore.toFixed(1)},location=${locationScore.toFixed(1)},expiry=${expiryScore.toFixed(1)}`,
        };
      })
      .sort((a, b) => b.score - a.score);
  }
}
