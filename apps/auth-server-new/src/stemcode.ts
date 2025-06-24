import { Provider } from "@openauthjs/openauth/provider/provider"
import { timingSafeCompare } from "@openauthjs/openauth/random"
import { Storage } from "@openauthjs/openauth/storage/storage"

export interface StemcodeProviderConfig {
  /**
   * The request handler to generate the UI for the code flow.
   *
   * Takes the standard [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request)
   * and optionally [`FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
   * ojects.
   *
   * Also passes in the current `state` of the flow and any `error` that occurred.
   *
   * Expects the [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) object
   * in return.
   */
  request: (
    req: Request,
    form?: FormData,
    error?: StemcodeProviderError,
  ) => Promise<Response>
}

/**
 * The errors that can happen on the code flow.
 *
 * | Error | Description |
 * | ----- | ----------- |
 * | `invalid_code` | The code is invalid. |
 */
export type StemcodeProviderError =
  {
      type: "invalid_stemcode"
    }

export type Stemcode = string;

export function StemcodeProvider(config: StemcodeProviderConfig): Provider<{ stemcode: string }> {
  return {
    type: "code",
    init(routes, ctx) {
      routes.get("/authorize", async (c) =>
        ctx.forward(c, await config.request(c.req.raw)),
      )

      routes.post("/authorize", async (c) => {
        const fd = await c.req.formData()
        async function error(err: StemcodeProviderError) {
          return ctx.forward(c, await config.request(c.req.raw, fd, err))
        }
        const stemcode = fd.get("stemcode")?.toString()?.toLowerCase()
        if (!stemcode) return error({ type: "invalid_stemcode" })

        const foundStemcode = await Storage.get<Stemcode>(ctx.storage, [
          "stemcode",
          stemcode,
        ])
        if (!foundStemcode || !(timingSafeCompare(stemcode, foundStemcode)))
          return error({ type: "invalid_stemcode" })

        return ctx.success(
          c,
          {
            stemcode,
          },
          {
            invalidate: async (subject) => {
              await Storage.set(
                ctx.storage,
                ["stemcode", stemcode, "subject"],
                subject,
              )
            },
          },
        )
      })
    },
  }
}

/**
 * @internal
 */
export type StemcodeProviderOptions = Parameters<typeof StemcodeProvider>[0]
