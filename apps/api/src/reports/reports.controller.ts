import {
  BadGatewayException,
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import type { Response } from 'express';
import { Role } from '@equiprent/db';
import { assertRole } from '../common/authorization';

const REPORT_ROLES = [Role.EQUIPMENT_MANAGER, Role.ADMIN];
const REPORT_FORBIDDEN_MESSAGE =
  'Only equipment managers and admins can access reports';

@Controller('reports')
@UseGuards(AuthGuard)
export class ReportsController {
  private readonly reportServiceUrl =
    process.env.REPORT_SERVICE_URL ?? 'http://localhost:3002';

  @Get('csv')
  async getCsvReport(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('status') status: string,
    @Res() res: Response,
    @Session() session: UserSession,
  ) {
    assertRole(session, REPORT_ROLES, REPORT_FORBIDDEN_MESSAGE);
    const response = await this.fetchReportService('/report/csv', {
      from,
      to,
      status,
    });
    const csv = await response.text();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=report.csv');
    res.send(csv);
  }

  @Get('pdf')
  async getPdfReport(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('status') status: string,
    @Res() res: Response,
    @Session() session: UserSession,
  ) {
    assertRole(session, REPORT_ROLES, REPORT_FORBIDDEN_MESSAGE);
    const response = await this.fetchReportService('/report/pdf', {
      from,
      to,
      status,
    });
    const pdf = Buffer.from(await response.arrayBuffer());

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=equiprent-report.pdf',
    );
    res.send(pdf);
  }

  @Get('stats')
  async getStats(
    @Query('from') from: string,
    @Query('to') to: string,
    @Session() session: UserSession,
  ) {
    assertRole(session, REPORT_ROLES, REPORT_FORBIDDEN_MESSAGE);
    const response = await this.fetchReportService('/report/stats', {
      from,
      to,
    });
    return response.json();
  }

  private async fetchReportService(
    path: string,
    query: Record<string, string | undefined>,
  ) {
    const url = new URL(path, this.reportServiceUrl);

    for (const [key, value] of Object.entries(query)) {
      if (value) {
        url.searchParams.set(key, value);
      }
    }

    let response: globalThis.Response;

    try {
      response = await fetch(url.toString());
    } catch {
      throw new BadGatewayException('Report service is unavailable');
    }

    if (!response.ok) {
      throw new BadGatewayException('Report service returned an error');
    }

    return response;
  }
}
