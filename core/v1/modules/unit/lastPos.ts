import { getSecret } from "../../services/aws/secretsManager.ts";
import { dayStartAndEnd } from "../../../utils/unixTime.ts";
import { WialonApi } from "wialon-ts";
import { wialonSession } from "../../helpers/wialonSession.ts";

interface ILastPos {
  unit: string;
  vin: string;
  latitude: number;
  longitude: number;
  time: string;
}

export const lastKnownPosition = async (
  ref: string,
  unitName: string,
): Promise<ILastPos> => {
  if (!ref || !unitName) throw new Error("ref and unit name are required");
  const { dayStart, dayEnd } = dayStartAndEnd();

  return wialonSession(ref, async (wialon, sid, resourceId, user) => {
    const unitId = await wialon.unit.findUnitByName(sid, unitName);
    const reportId = await wialon.report.findReportId(sid, user, "api_lastPos");

    await wialon.report.execReport(
      resourceId,
      reportId,
      unitId,
      dayStart,
      dayEnd,
      sid,
    );

    const reportData = await wialon.report.getData(1000000, sid);
    if (!reportData.length || !reportData[0]?.c?.length)
      throw new Error("no report data for unit: ${unitName}");

    const row = reportData[0].c;
    return {
      unit: unitName,
      vin: row[1],
      latitude: row[2].y,
      longitude: row[2].x,
      time: row[2].t,
    };
  });
};

export const groupLastKnownPosition = async (
  ref: string,
  groupName: string,
) => {
  if (!ref || !groupName) throw new Error("ref and unit name are required");
  const { dayStart, dayEnd } = dayStartAndEnd();

  return wialonSession(ref, async (wialon, sid, resourceId, user) => {
    const { groupId } = await wialon.unit.getUnitGroup(sid, groupName);
    const reportId = await wialon.report.findReportId(sid, user, "api_lastPos");

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
      throw new Error(`no report data for group: ${groupName}`);

    const units = reportData.map((item) => {
      const row = item.c;

      return {
        unit: row[0],
        vin: row[1],
        latitude: row[2].y,
        longitude: row[2].x,
        time: row[2].t,
      };
    });

    return { total: units.length, units };
  });
};
