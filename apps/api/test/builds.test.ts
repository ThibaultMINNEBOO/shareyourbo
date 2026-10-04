import { describe, expect, it } from "vitest";
import { createBuild, request, sampleBuild, signUp } from "./helpers";

type ListBody = { items: { slug: string; title: string; likesCount: number }[]; nextCursor: string | null };

describe("builds API", () => {
  it("rejects anonymous creation", async () => {
    const res = await request("/api/builds", { method: "POST", body: JSON.stringify(sampleBuild()) });
    expect(res.status).toBe(401);
  });

  it("validates the payload", async () => {
    const { cookie } = await signUp();
    const res = await request("/api/builds", {
      method: "POST",
      cookie,
      body: JSON.stringify(sampleBuild({ title: "x" })),
    });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: string }).error).toMatch(/title/);
  });

  it("creates and reads a build", async () => {
    const { cookie, username } = await signUp();
    const { slug } = await createBuild(cookie);
    expect(slug).toMatch(/^pvz-stargate-opener-[a-z0-9]{6}$/);

    const res = await request(`/api/builds/${slug}`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { build: { steps: unknown[]; author: { username: string } }; isOwner: boolean };
    expect(body.build.steps).toHaveLength(2);
    expect(body.build.author.username).toBe(username);
    expect(body.isOwner).toBe(false);
  });

  it("hides private builds from other users", async () => {
    const owner = await signUp();
    const other = await signUp();
    const { slug } = await createBuild(owner.cookie, { visibility: "private" });

    expect((await request(`/api/builds/${slug}`, { cookie: other.cookie })).status).toBe(404);
    expect((await request(`/api/builds/${slug}`, { cookie: owner.cookie })).status).toBe(200);
  });

  it("only lets the author update or delete", async () => {
    const owner = await signUp();
    const other = await signUp();
    const { id, slug } = await createBuild(owner.cookie);
    const update = JSON.stringify(sampleBuild({ title: "Renamed build" }));

    expect((await request(`/api/builds/${id}`, { method: "PATCH", cookie: other.cookie, body: update })).status).toBe(403);
    expect((await request(`/api/builds/${id}`, { method: "PATCH", cookie: owner.cookie, body: update })).status).toBe(200);
    const read = (await (await request(`/api/builds/${slug}`)).json()) as { build: { title: string } };
    expect(read.build.title).toBe("Renamed build");

    expect((await request(`/api/builds/${id}`, { method: "DELETE", cookie: other.cookie })).status).toBe(403);
    expect((await request(`/api/builds/${id}`, { method: "DELETE", cookie: owner.cookie })).status).toBe(200);
    expect((await request(`/api/builds/${slug}`)).status).toBe(404);
  });

  it("counts likes once per user", async () => {
    const owner = await signUp();
    const fan = await signUp();
    const { id, slug } = await createBuild(owner.cookie);

    await request(`/api/builds/${id}/like`, { method: "POST", cookie: fan.cookie });
    await request(`/api/builds/${id}/like`, { method: "POST", cookie: fan.cookie });
    let body = (await (await request(`/api/builds/${slug}`, { cookie: fan.cookie })).json()) as {
      build: { likesCount: number };
      likedByMe: boolean;
    };
    expect(body.build.likesCount).toBe(1);
    expect(body.likedByMe).toBe(true);

    await request(`/api/builds/${id}/like`, { method: "DELETE", cookie: fan.cookie });
    body = (await (await request(`/api/builds/${slug}`, { cookie: fan.cookie })).json()) as typeof body;
    expect(body.build.likesCount).toBe(0);
    expect(body.likedByMe).toBe(false);
  });

  it("filters and paginates the public list", async () => {
    const { cookie } = await signUp();
    for (let i = 0; i < 3; i++) await createBuild(cookie, { title: `ZvT roach push ${i}`, race: "Z", vsRace: "T", tags: ["timing"] });
    await createBuild(cookie, { title: "Hidden ZvT", race: "Z", vsRace: "T", visibility: "unlisted" });

    const first = (await (await request("/api/builds?race=Z&vs=T&limit=2")).json()) as ListBody;
    expect(first.items).toHaveLength(2);
    expect(first.nextCursor).toBeTruthy();

    const second = (await (await request(`/api/builds?race=Z&vs=T&limit=2&cursor=${first.nextCursor}`)).json()) as ListBody;
    const titles = [...first.items, ...second.items].map((b) => b.title);
    expect(new Set(titles).size).toBe(titles.length);
    expect(titles).not.toContain("Hidden ZvT");

    const tagged = (await (await request("/api/builds?tag=timing&q=roach")).json()) as ListBody;
    expect(tagged.items.length).toBeGreaterThanOrEqual(3);
    expect(tagged.items.every((b) => b.title.includes("roach"))).toBe(true);
  });

  it("sorts by likes", async () => {
    const owner = await signUp();
    const fan = await signUp();
    const a = await createBuild(owner.cookie, { title: "Top sorted build", race: "T", vsRace: "P" });
    await createBuild(owner.cookie, { title: "Less liked build", race: "T", vsRace: "P" });
    await request(`/api/builds/${a.id}/like`, { method: "POST", cookie: fan.cookie });

    const body = (await (await request("/api/builds?race=T&vs=P&sort=top")).json()) as ListBody;
    expect(body.items[0]?.title).toBe("Top sorted build");
  });
});

describe("users API", () => {
  it("lists a user's public builds, and private ones to themselves", async () => {
    const { cookie, username } = await signUp();
    await createBuild(cookie, { title: "Public one" });
    await createBuild(cookie, { title: "Private one", visibility: "private" });

    const asGuest = (await (await request(`/api/users/${username}`)).json()) as { builds: unknown[]; isSelf: boolean };
    expect(asGuest.builds).toHaveLength(1);
    expect(asGuest.isSelf).toBe(false);

    const asSelf = (await (await request(`/api/users/${username}`, { cookie })).json()) as { builds: unknown[] };
    expect(asSelf.builds).toHaveLength(2);
  });

  it("returns 404 for unknown users", async () => {
    expect((await request("/api/users/nobody_here")).status).toBe(404);
  });
});
