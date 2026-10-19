import { Database, type SQLQueryBindings } from "bun:sqlite";
import { RATE_LIMIT_SCHEMA } from "../../lib/rate-limit.ts";

export function startRateLimitServer() {
    const db = new Database(":memory:");
    for (const sql of RATE_LIMIT_SCHEMA) db.exec(sql);
    const state = {
        unavailable: false,
        invalidResult: false,
        statementFails: false,
        now: undefined as number | undefined
    };
    const server = Bun.serve({
        hostname: "127.0.0.1",
        port: 0,
        async fetch(request) {
            if (state.unavailable) return new Response(null, { status: 503 });
            if (request.headers.get("Authorization") !== "Bearer fixture-token") {
                return new Response(null, { status: 401 });
            }
            if (new URL(request.url).pathname !== "/v2/pipeline") {
                return new Response(null, { status: 404 });
            }
            if (state.invalidResult) return Response.json({ results: [] });
            const { requests } = await request.json();
            const results = requests.map(
                ({ type, stmt }: { type: string; stmt?: { sql: string; args?: { value: SQLQueryBindings }[] } }) => {
                    if (type === "close") return { type: "ok", response: { type: "close" } };
                    try {
                        if (state.statementFails) throw new Error("Fixture SQL failure");
                        const values = db
                            .prepare(
                                stmt!.sql.replaceAll("unixepoch('subsec')", String((state.now ?? Date.now()) / 1000))
                            )
                            .values(...(stmt!.args ?? []).map(arg => arg.value));
                        const rows = (values ?? []).map(row =>
                            row.map(value => ({ type: "integer", value: String(value) }))
                        );
                        return { type: "ok", response: { type: "execute", result: { rows } } };
                    } catch {
                        return { type: "error", error: { message: "Fixture SQL failure" } };
                    }
                }
            );
            return Response.json({ results });
        }
    });
    return {
        url: server.url.origin,
        db,
        state,
        stop() {
            server.stop(true);
            db.close();
        }
    };
}
