import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import CommunityFilter from "./CommunityFilter";

type SearchParams = {
  status?: string;
  community?: string | string[]; // <-- allow multi
  minPrice?: string;
  maxPrice?: string;
  sort?: "price" | "scraped_at";
  dir?: "asc" | "desc";
};

function asNonEmptyString(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length ? t : undefined;
}

function toNumber(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function parseCommunityParam(v: string | string[] | undefined): string[] {
  if (!v) return [];
  const arr = Array.isArray(v) ? v : [v];

  // Support both comma-separated and repeated params
  const split = arr.flatMap((s) => s.split(","));

  return Array.from(
    new Set(
      split
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    )
  );
}

export default async function Page(props: { searchParams: Promise<SearchParams> }) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const searchParams = await props.searchParams;

  const status = asNonEmptyString(searchParams.status);
  const selectedCommunities = parseCommunityParam(searchParams.community);

  const minPrice = toNumber(searchParams.minPrice);
  const maxPrice = toNumber(searchParams.maxPrice);

  const sort: "price" | "scraped_at" =
    searchParams.sort === "price" || searchParams.sort === "scraped_at"
      ? searchParams.sort
      : "scraped_at";

  const dir: "asc" | "desc" = searchParams.dir === "asc" ? "asc" : "desc";

  /**
   * Denver-only constraint (no UI filter)
   * This will apply to both the community picklist and the main results query.
   */
  const DENVER_METRO = "Denver";

  /**
   * Build distinct community list for Denver metro only
   */
  const { data: communityRows, error: communityErr } = await supabase
    .from("sales_table")
    .select("community_name")
    .eq("metro_area", DENVER_METRO);

  if (communityErr) {
    return (
      <main className="p-6">
        <pre className="bg-gray-100 p-3 rounded">{JSON.stringify(communityErr, null, 2)}</pre>
      </main>
    );
  }

  const communities = Array.from(
    new Set(
      (communityRows ?? [])
        .map((r: any) => r.community_name)
        .filter((v: any) => typeof v === "string" && v.trim().length > 0)
    )
  ).sort((a, b) => a.localeCompare(b));

  /**
   * Main query (Denver only + optional filters)
   */
  let q = supabase
    .from("sales_table")
    .select(
      [
        "site",
        "entity_key",
        "scraped_at",
        "community_name",
        "metro_area",
        "address",
        "price",
        "was_price",
        "beds",
        "baths",
        "sqft",
        "status",
        "url",
      ].join(",")
    )
    .eq("metro_area", DENVER_METRO);

  if (status) q = q.eq("status", status);

  // Multi-community filter
  if (selectedCommunities.length > 0) {
    q = q.in("community_name", selectedCommunities);
  }

  if (minPrice !== undefined) q = q.gte("price", minPrice);
  if (maxPrice !== undefined) q = q.lte("price", maxPrice);

  q = q.order(sort, { ascending: dir === "asc" });

  const { data, error } = await q;

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Sales Dashboard</h1>
        <pre className="bg-gray-100 p-3 rounded">{JSON.stringify(error, null, 2)}</pre>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Sales Dashboard</h1>
          <div className="text-sm text-gray-600">Metro: {DENVER_METRO}</div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <CommunityFilter
            communities={communities}
            selected={selectedCommunities}
          />

          <div className="text-sm text-gray-600">
            Rows: <span className="font-medium">{data?.length ?? 0}</span>
          </div>
        </div>
      </div>

      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Site</th>
            <th className="p-2 border">Community</th>
            <th className="p-2 border">Address</th>
            <th className="p-2 border">Price</th>
            <th className="p-2 border">Was Price</th>
            <th className="p-2 border">Beds</th>
            <th className="p-2 border">Baths</th>
            <th className="p-2 border">SqFt</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Last Scraped</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((row: any) => (
            <tr key={`${row.site}-${row.entity_key}`}>
              <td className="p-2 border">{row.site ?? ""}</td>
              <td className="p-2 border">{row.community_name ?? ""}</td>

              <td className="p-2 border">
                {row.url ? (
                  <a
                    href={row.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {row.address ?? ""}
                  </a>
                ) : (
                  row.address ?? ""
                )}
              </td>

              <td className="p-2 border">
                {row.price != null && !Number.isNaN(Number(row.price))
                  ? `$${Number(row.price).toLocaleString()}`
                  : ""}
              </td>

              <td className="p-2 border">
                {row.was_price != null && !Number.isNaN(Number(row.was_price))
                  ? `$${Number(row.was_price).toLocaleString()}`
                  : ""}
              </td>

              <td className="p-2 border">{row.beds ?? ""}</td>
              <td className="p-2 border">{row.baths ?? ""}</td>

              <td className="p-2 border">
                {row.sqft != null && !Number.isNaN(Number(row.sqft))
                  ? Number(row.sqft).toLocaleString()
                  : ""}
              </td>

              <td className="p-2 border">{row.status ?? ""}</td>

              <td className="p-2 border">
                {row.scraped_at ? new Date(row.scraped_at).toLocaleString() : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
