import type { WialonApi } from "wialon-ts"

export const cleanReportResult = async (sid: string, wialon: WialonApi): Promise<void> => {
    const isClean = await wialon.report.cleanResult(sid);
    if (!isClean) console.error(`failed to clean report result for sid: ${sid}`);
}