import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService implements OnModuleInit {
    private readonly logger = new Logger(SearchService.name);
    private readonly INDEX = 'pharma_products';

    constructor(
        private readonly elasticsearchService: ElasticsearchService,
        private readonly prisma: PrismaService,
    ) { }

    async onModuleInit() {
        try {
            const exists = await this.elasticsearchService.indices.exists({ index: this.INDEX });
            if (!exists) {
                await this.createIndex();
                this.logger.log(`Elasticsearch index "${this.INDEX}" created`);
            }
        } catch (err) {
            this.logger.warn('Elasticsearch not available - search will fallback to DB');
        }
    }

    private async createIndex() {
        await this.elasticsearchService.indices.create({
            index: this.INDEX,
            settings: {
                number_of_shards: 1,
                number_of_replicas: 0,
                analysis: {
                    analyzer: {
                        pharma_autocomplete: {
                            type: 'custom',
                            tokenizer: 'pharma_edge_ngram',
                            filter: ['lowercase', 'asciifolding'],
                        },
                        pharma_search: {
                            type: 'custom',
                            tokenizer: 'standard',
                            filter: ['lowercase', 'asciifolding'],
                        },
                    },
                    tokenizer: {
                        pharma_edge_ngram: {
                            type: 'edge_ngram',
                            min_gram: 2,
                            max_gram: 25,
                            token_chars: ['letter', 'digit'],
                        },
                    },
                },
            },
            mappings: {
                properties: {
                    id: { type: 'keyword' },
                    name: { type: 'text', analyzer: 'pharma_autocomplete', search_analyzer: 'pharma_search' },
                    genericName: { type: 'text', analyzer: 'pharma_autocomplete', search_analyzer: 'pharma_search' },
                    company: { type: 'text', analyzer: 'pharma_search' },
                    composition: { type: 'text', analyzer: 'pharma_search' },
                    form: { type: 'keyword' },
                    schedule: { type: 'keyword' },
                    gstPercentage: { type: 'float' },
                },
            },
        } as any);
    }

    async indexProduct(product: any) {
        try {
            await this.elasticsearchService.index({
                index: this.INDEX,
                id: product.id,
                document: {
                    id: product.id,
                    name: product.name,
                    genericName: product.genericName,
                    composition: product.composition,
                    company: product.company,
                    form: product.form,
                    schedule: product.schedule,
                    gstPercentage: product.gstPercentage,
                },
            } as any);
        } catch (err) {
            this.logger.warn(`Failed to index product ${product.id}`);
        }
    }

    async bulkIndexProducts(products: any[]) {
        const operations = products.flatMap((p) => [
            { index: { _index: this.INDEX, _id: p.id } },
            {
                id: p.id,
                name: p.name,
                genericName: p.genericName,
                composition: p.composition,
                company: p.company,
                form: p.form,
                schedule: p.schedule,
                gstPercentage: p.gstPercentage,
            },
        ]);

        if (operations.length > 0) {
            const result = await this.elasticsearchService.bulk({ operations } as any);
            if (result.errors) {
                this.logger.error('Bulk indexing had errors');
            }
        }
        return { indexed: products.length };
    }

    async searchProducts(query: string, page = 1, limit = 20) {
        try {
            const result = await this.elasticsearchService.search({
                index: this.INDEX,
                from: (page - 1) * limit,
                size: limit,
                query: {
                    bool: {
                        should: [
                            {
                                multi_match: {
                                    query,
                                    fields: ['name^5', 'genericName^3', 'composition^2', 'company^1'],
                                    type: 'best_fields',
                                    fuzziness: 'AUTO',
                                    prefix_length: 1,
                                },
                            },
                            {
                                multi_match: {
                                    query,
                                    fields: ['name^4', 'genericName^2'],
                                    type: 'phrase_prefix',
                                    boost: 2,
                                },
                            },
                        ],
                        minimum_should_match: 1,
                    },
                },
                highlight: {
                    fields: {
                        name: {},
                        genericName: {},
                    },
                },
                sort: [
                    { _score: { order: 'desc' } },
                ],
            } as any);

            const hits = result.hits.hits;
            return {
                total: (result.hits.total as any).value,
                results: hits.map((hit: any) => ({
                    ...hit._source,
                    highlights: hit.highlight,
                    score: hit._score,
                })),
            };
        } catch (err) {
            this.logger.warn('ES search failed, falling back to DB');
            return this.fallbackSearch(query);
        }
    }

    private async fallbackSearch(query: string) {
        const products = await this.prisma.productMaster.findMany({
            where: {
                OR: [
                    { name: { contains: query } },
                    { genericName: { contains: query } },
                    { composition: { contains: query } },
                ],
            },
            take: 20,
        });
        return { total: products.length, results: products };
    }

    async syncAllProducts() {
        this.logger.log('Starting full product sync to Elasticsearch...');
        const BATCH_SIZE = 5000;
        let skip = 0;
        let total = 0;

        while (true) {
            const batch = await this.prisma.productMaster.findMany({ take: BATCH_SIZE, skip });
            if (batch.length === 0) break;
            await this.bulkIndexProducts(batch);
            total += batch.length;
            skip += BATCH_SIZE;
            this.logger.log(`Synced ${total} products to Elasticsearch`);
        }

        return { success: true, total };
    }

    async getSearchSuggestions(query: string) {
        try {
            const result = await this.elasticsearchService.search({
                index: this.INDEX,
                size: 8,
                query: {
                    multi_match: {
                        query,
                        fields: ['name^3', 'genericName^2'],
                        type: 'phrase_prefix',
                    },
                },
                _source: ['id', 'name', 'genericName', 'company'],
            } as any);
            return result.hits.hits.map((h: any) => h._source);
        } catch {
            return [];
        }
    }

    async logSearchQuery(userId: string | undefined, query: string, resultsCount: number) {
        try {
            await this.prisma.searchLog.create({
                data: { userId, query, resultsCount },
            });
        } catch { }
    }
}
