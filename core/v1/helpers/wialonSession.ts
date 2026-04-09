import { WialonApi } from "wialon-ts";
import { getSecret } from "../services/aws/secretsManager";

export const wialonSession = async <T>(
  ref: string,
  fn: (
    wialon: WialonApi,
    sid: string,
    resourceId: string,
    user: string,
  ) => Promise<T>,
): Promise<T> => {
  const wialon = new WialonApi();
  const secretData = await getSecret(`prod/wialon/env-${ref}`);

  if (!secretData?.token) throw new Error(`no token for ref: ${ref}`);

  let sid: string | undefined;

  try {
    const data = await wialon.auth.login(secretData.token);
    sid = data.sid;

    return await fn(wialon, sid, data.resourceId, data.user);
  } finally {
    if (sid) await wialon.auth.logout(sid);
  }
};
