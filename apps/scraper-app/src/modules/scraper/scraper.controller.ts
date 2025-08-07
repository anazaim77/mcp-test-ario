import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ScraperService } from './scraper.service';

@ApiTags('scraper')
@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get('amazon')
  @ApiOperation({ summary: 'Scrape 5 produk teratas dari Amazon' })
  @ApiQuery({
    name: 'keyword',
    description: 'Kata kunci produk yang ingin dicari di Amazon',
    example: 'playstation 5',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar 5 produk teratas berhasil didapatkan.',
  })
  @ApiResponse({ status: 400, description: 'Keyword tidak disediakan.' })
  async scrapeAmazon(@Query('keyword') keyword: string) {
    if (!keyword) {
      throw new BadRequestException('Please provide a keyword to search for.');
    }
    const products = await this.scraperService.scrapeAmazon(keyword);
    return {
      source: 'Amazon',
      keyword,
      results: products,
    };
  }

  @Get('tokopedia')
  @ApiOperation({ summary: 'Scrape 5 produk teratas dari Tokopedia' })
  @ApiQuery({
    name: 'keyword',
    description: 'Kata kunci produk yang ingin dicari di Tokopedia',
    example: 'playstation 5',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Daftar 5 produk teratas berhasil didapatkan.',
  })
  @ApiResponse({ status: 400, description: 'Keyword tidak disediakan.' })
  async scrapeTokopedia(@Query('keyword') keyword: string) {
    if (!keyword) {
      throw new BadRequestException('Please provide a keyword to search for.');
    }
    const products = await this.scraperService.scrapeTokopedia(keyword);
    return {
      source: 'Tokopedia',
      keyword,
      results: products,
    };
  }
}
