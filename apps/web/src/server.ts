import { runWithRuntimeEnv } from "@actnow/common/runtime-env";
import handler from "@tanstack/react-start/server-entry";

type WorkerBindings = Record<string, unknown>;

export default {
  fetch(request: Request, env: WorkerBindings) {
    return runWithRuntimeEnv(env, () => handler.fetch(request));
  },
};
