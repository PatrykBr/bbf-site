export async function startNextServer(mode: "dev" | "start", env: Record<string, string> = {}) {
    const reservation = Bun.serve({
        hostname: "127.0.0.1",
        port: 0,
        fetch: () => new Response(null, { status: 503 })
    });
    const port = reservation.port;
    await reservation.stop(true);

    const child = Bun.spawn({
        cmd: [process.execPath, "run", mode, "--hostname", "127.0.0.1", "--port", String(port)],
        detached: process.platform !== "win32",
        env: {
            ...process.env,
            NODE_ENV: mode === "dev" ? "development" : "production",
            VERCEL: "",
            CONTACT_IP_HEADER: "",
            RESEND_API_KEY: "",
            POSTHOG_KEY: "",
            NEXT_PUBLIC_POSTHOG_KEY: "",
            TURSO_DATABASE_URL: "",
            TURSO_AUTH_TOKEN: "",
            VERCEL_ENV: "test",
            ...env
        },
        stdin: "ignore",
        stdout: "ignore",
        stderr: "pipe"
    });
    const diagnostics = new Response(child.stderr).text();
    const stop = async () => {
        if (child.exitCode !== null) return;
        if (process.platform === "win32") {
            // Next's development worker must be stopped with its parent.
            Bun.spawnSync(["taskkill", "/PID", String(child.pid), "/T", "/F"], {
                stdout: "ignore",
                stderr: "ignore"
            });
        } else {
            process.kill(-child.pid, "SIGKILL");
        }
        await child.exited;
    };
    const url = `http://127.0.0.1:${port}`;
    const deadline = Date.now() + (mode === "dev" ? 60_000 : 10_000);
    try {
        while (Date.now() < deadline) {
            if (child.exitCode !== null) throw new Error(`The test ${mode} server exited with code ${child.exitCode}`);
            try {
                const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
                await response.body?.cancel();
                if (response.ok) return { url, stop };
            } catch {
                // The server may still be starting or compiling its first page.
            }
            await Bun.sleep(100);
        }
        throw new Error(`The test ${mode} server did not become ready`);
    } catch (error) {
        await stop();
        throw new Error(`${error instanceof Error ? error.message : String(error)}\n${await diagnostics}`);
    }
}
