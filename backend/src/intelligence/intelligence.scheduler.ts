import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { IntelligenceService } from './intelligence.service';

@Injectable()
export class IntelligenceScheduler {
  private readonly logger = new Logger(IntelligenceScheduler.name);
  private readonly running = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly intelligenceService: IntelligenceService,
  ) {}

  @Cron('0 * * * * *')
  async runDueConnectorSyncs() {
    const connectors = await this.prisma.pharmacyConnector.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        syncIntervalMinutes: true,
        lastSyncedAt: true,
        config: true,
      },
      take: 500,
    });

    const now = Date.now();
    for (const connector of connectors) {
      if (this.running.has(connector.id)) continue;
      const last = connector.lastSyncedAt ? new Date(connector.lastSyncedAt).getTime() : 0;
      const intervalMs = Math.max(1, connector.syncIntervalMinutes) * 60 * 1000;
      const due = !last || now - last >= intervalMs;

      if (!due) continue;
      const config = this.parseConnectorConfig(connector.config);
      const source = (config.source ?? {}) as Record<string, unknown>;
      if (source.type !== 'direct_db') continue;

      this.running.add(connector.id);
      this.intelligenceService
        .runConnectorAutoSync(connector.id)
        .then(() => this.logger.log(`Auto-sync completed for connector ${connector.name}`))
        .catch((error) =>
          this.logger.error(
            `Auto-sync failed for connector ${connector.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ),
        )
        .finally(() => this.running.delete(connector.id));
    }
  }

  private parseConnectorConfig(raw: string | null | undefined): Record<string, unknown> {
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
}
