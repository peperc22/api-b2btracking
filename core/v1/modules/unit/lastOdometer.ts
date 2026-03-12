import { dayStartAndEnd } from "../../../utils/unixTime";
import { wialonSession } from "../../helpers/wialonSession";
import type { IUnitOdometerData } from "../interfaces/unit.interface";

export const lastKnownOdometer = async (
  ref: string,
  unitName: string,
): Promise<IUnitOdometerData> => {
  if (!ref || !unitName) throw new Error("ref and unit name are required");
  const { dayStart, dayEnd } = dayStartAndEnd();

  return wialonSession(ref, async (wialon, sid, resourceId, user) => {
    const unitId = await wialon.unit.findUnitByName(sid, unitName);
    const reportId = await wialon.report.findReportId(
      sid,
      user,
      "api_odometer",
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
    if (!reportData.length || !reportData[0]?.c?.length)
      throw new Error(`no odometer data found for unit: ${unitName}`);

    const row = reportData[0].c;
    return {
      unit: unitName,
      vin: row[1],
      odometer: row[2].t,
    };
  });
};

export const groupLastKnownOdometer = async (
  ref: string,
  groupName: string,
) => {
  if (!ref || !groupName) throw new Error("ref and unit name are required");
  const { dayStart, dayEnd } = dayStartAndEnd();

  return wialonSession(ref, async (wialon, sid, resourceId, user) => {
    const { groupId } = await wialon.unit.getUnitGroup(sid, groupName);
    const reportId = await wialon.report.findReportId(
      sid,
      user,
      "api_odometer",
    );

    await wialon.report.execReport(
      resourceId,
      reportId,
      Number(groupId),
      dayStart,
      dayEnd,
      sid,
    );

    const reportData = await wialon.report.getData(1000000, sid);
    if (!reportData?.length || !reportData[0]?.c?.length)
      throw new Error(`no odometer data found for: ${groupName}`);

    const units = reportData.map((item) => {
      const row = item.c;

      return {
        unit: row[0],
        vin: row[1],
        odometer: row[2].t,
      };
    });

    return { total: units.length, units };
  });
};
