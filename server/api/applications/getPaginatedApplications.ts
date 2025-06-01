import { eq, ilike, and, sql } from 'drizzle-orm';
import { db } from '../../db';
import { applications } from '../../../shared/schema';
import { Request, Response } from 'express';

export const getPaginatedApplications = async (req: Request, res: Response) => {
  const body = req.body;

  const {
    page = 1,
    pageSize = 20,
    filters = {},
    sort = { field: 'dateApplied', direction: 'desc' },
  } = body;

  const offset = (page - 1) * pageSize;

  const whereClauses = [];

  if (filters.status) {
    whereClauses.push(eq(applications.jobStatus, filters.status));
  }

  if (filters.stage) {
    whereClauses.push(eq(applications.applicationStage, filters.stage));
  }

  if (filters.jobTitle) {
    whereClauses.push(ilike(applications.roleTitle, `%${filters.jobTitle}%`));
  }

  if (filters.dateApplied) {
    whereClauses.push(eq(applications.dateApplied, filters.dateApplied));
  }

  const whereCondition = whereClauses.length > 0 ? and(...whereClauses) : undefined;

  try {
    const data = await db
      .select({
        id: applications.id,
        roleTitle: applications.roleTitle,
        companyName: applications.companyName,
        jobStatus: applications.jobStatus,
        applicationStage: applications.applicationStage,
        dateApplied: applications.dateApplied,
      })
      .from(applications)
      .where(whereCondition)
      .orderBy(
        sort.direction === 'asc'
          ? sql.raw(`"${sort.field}" ASC`)
          : sql.raw(`"${sort.field}" DESC`)
      )
      .limit(pageSize)
      .offset(offset);

    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(applications)
      .where(whereCondition);

    res.json({
      data,
      pagination: {
        page,
        pageSize,
        total: total[0].count,
      },
    });
  } catch (error) {
    console.error('[GET_PAGINATED_APPLICATIONS]', error);
    res.status(500).send('Internal Error');
  }
};
