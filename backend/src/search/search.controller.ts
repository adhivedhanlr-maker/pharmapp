import { Controller, Get, Post, Query, UseGuards, Request } from '@nestjs/common';
import { SearchService } from './search.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('search')
@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @Get()
    @ApiOperation({ summary: 'Full-text fuzzy search medicines' })
    @ApiQuery({ name: 'q', required: true })
    @ApiQuery({ name: 'page', required: false })
    async search(
        @Query('q') query: string,
        @Query('page') page = '1',
        @Request() req: any,
    ) {
        const results = await this.searchService.searchProducts(query, parseInt(page));
        // Log asynchronously
        const userId = req?.user?.id;
        this.searchService.logSearchQuery(userId, query, results.total).catch(() => { });
        return results;
    }

    @Get('suggest')
    @ApiOperation({ summary: 'Autocomplete suggestions' })
    async suggest(@Query('q') query: string) {
        return this.searchService.getSearchSuggestions(query);
    }

    @Post('sync')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Sync all products from DB to Elasticsearch (Admin only)' })
    async syncAll() {
        return this.searchService.syncAllProducts();
    }
}
