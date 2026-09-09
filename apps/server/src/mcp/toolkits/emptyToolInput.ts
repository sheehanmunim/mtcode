import * as Schema from "effect/Schema";

/**
 * Parameters schema for MCP tools that take no arguments.
 *
 * `Schema.Struct({})` renders as `anyOf: [object, array]` in Effect 4 rc.112's
 * JSON Schema output, and the MCP `Tool.inputSchema` contract requires a
 * top-level `type`, so `McpServer.toolkit` fails with `Missing key at ["type"]`.
 * A failed toolkit registration then fails the routes layer build behind the
 * activation gate, and the desktop times out waiting for the backend instead
 * of seeing an error. A closed record renders as
 * `{ type: "object", additionalProperties: false }` and still decodes `{}`.
 */
export const EmptyToolInput = Schema.Record(Schema.String, Schema.Never);
