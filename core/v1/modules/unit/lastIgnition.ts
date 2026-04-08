import {dayStartAndEnd} from "../../../utils/unixTime.ts";
import { wialonSession } from "../../helpers/wialonSession.ts";

interface ILastIgnition {
    unit: string;
    vin: string;
    ignition: number;
    time: string;
}

export const lastKnownIgnition = async (
    ref: string,
    unitName: string
): Promise<ILastIgnition> => {
    if (!ref || !unitName) throw new Error("ref and unit name are required");

    const { dayStart, dayEnd } = dayStartAndEnd();

    return wialonSession(ref, async (wialon, sid, resourceId, user) => {
        const unitId = await wialon.unit.findUnitByName(sid, unitName);
        const reportId = await wialon.report.findReportId(
            sid,
            user,
            "api_ignition",
        );

        await wialon.report.execReport(
            resourceId,
            reportId,
            unitId,
            dayStart,
            dayEnd,
            sid,
        );

        const reportData = await wialon.report.getData(100, sid);
        if (!reportData.length)
            throw new Error(`no ignition data found for unit: ${unitName}`);

        const data = reportData[0].r;
        const lastObject = data[data.length -1];

        const row = lastObject.c;
        return {
            unit: unitName,
            vin: row[1],
            ignition: Number(row[4]),
            time: row[2].t,
        };
    })
}
