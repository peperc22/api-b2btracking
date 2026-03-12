import { getSecret } from "../../services/aws/secretsManager.ts";
import { dayStartAndEnd } from "../../../utils/unixTime.ts";
import { WialonApi } from "wialon-ts";

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

  const wialon = new WialonApi();

  const secretData = await getSecret(`prod/wialon/env-${ref}`);
  if (!secretData?.token) throw new Error(`no token for ref: ${ref}`);

  const { token } = secretData;
  let sid: string | undefined;

  const { dayStart, dayEnd } = dayStartAndEnd();

  try {
    const data = await wialon.auth.login(token);
    sid = data.sid;
    const { resourceId, user } = data;

    const unitId = await wialon.unit.findUnitByName(sid, unitName);
    const reportId = await wialon.report.ReportId(
      sid,
      user,
      "webservice_lastPos_apiv2",
    );

    await wialon.report.ExecReport(
      resourceId,
      reportId,
      unitId,
      dayStart,
      dayEnd,
      sid,
    );

    const reportData = await wialon.report.GetData(1000, sid);
    if (!reportData?.length || !reportData[0]?.c?.length)
      throw new Error(`no report data for unit: ${unitName}`);

    const row = reportData[0].c;

    const lastPos: ILastPos = {
      unit: unitName,
      vin: row[1],
      latitude: row[2].y,
      longitude: row[2].x,
      time: row[2].t,
    };

    console.debug(lastPos);
    return lastPos;
  } catch (error) {
    throw new Error(`lastPos error for ${unitName}`, { cause: error });
  } finally {
    if (sid) await wialon.auth.logout(sid);
  }
};
