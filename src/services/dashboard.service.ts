import { logger } from '@/lib/logger';
import { ServiceUnavailableError } from '@/lib/errors';
import type { DashboardDTO } from '@/lib/domain';
import { getDashboardData } from '@/services/reservation.service';

export { getDashboardData } from '@/services/reservation.service';

export async function getDashboardDataOrNull(): Promise<DashboardDTO | null> {
	try {
		return await getDashboardData();
	} catch (error) {
		if (error instanceof ServiceUnavailableError) {
			logger.warn('Dashboard data unavailable during render', {
				code: error.code,
				message: error.message,
			});
			return null;
		}

		throw error;
	}
}
