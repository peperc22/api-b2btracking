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

export const groupLastKnownIgnition = async (
    ref: string,
    groupName: string
) => {
    if (!ref || !groupName) 
        throw new Error("ref and unit name are required");
    const { dayStart, dayEnd } = dayStartAndEnd();

    return wialonSession(ref, async (wialon, sid, resourceId, user) => {
        const { groupId } = await wialon.unit.getUnitGroup(sid, groupName);
        const reportId = await wialon.report.findReportId(
            sid,
            user,
            "api_ignition",
        );

        await wialon.report.execReport(
            resourceId,
            reportId,
            Number(groupId),
            dayStart,
            dayEnd,
            sid,
        );

        const reportData = await wialon.report.getData(100000, sid);
        if (!reportData?.length)
            throw new Error(`no ignition data found for: ${groupName}`);

        const units = reportData.map((item) => {
            const data = item.r;
            if (!Array.isArray(data) || !data.length) return null;

            const lastObject = data[data.length -1];
            const row = lastObject.c;
            if (!row)
                return null;

            return {
                unit: row[0],
                vin: row[1],
                ignition: Number(row[4]),
                time: row[2].t,
            };
        }).filter((u): u is { unit: string; vin: string; ignition: number; time: string } => Boolean(u));

        if (!units.length)
            throw new Error(`no ignition data found for: ${groupName}`);

        return { total: units.length, units };
    });
}
