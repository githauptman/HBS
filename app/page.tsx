import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import CommunityFilter from "./CommunityFilter";


type SearchParams = {
  status?: string;
  community?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: "price" | "scraped_at";
  dir?: "asc" | "desc";
};

export default async function Page(
  props: { searchParams: Promise<SearchParams> } // <-- Promise
) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch distinct community list (simple approach)
  const { data: communityRows, error: communityErr } = await supabase
  .from("sales_table")
  .select("community_name");

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

  const searchParams = await props.searchParams; // <-- unwrap

  const status = searchParams.status?.trim();
  const community = searchParams.community?.trim();
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined;

  const sort =
    searchParams.sort === "price" || searchParams.sort === "scraped_at"
      ? searchParams.sort
      : "scraped_at";

  const dir = searchParams.dir === "asc" ? "asc" : "desc";

  let q = supabase.from("sales_table").select("*");

  if (status) q = q.eq("status", status);
  if (community) q = q.eq("community_name", community);
  if (!Number.isNaN(minPrice) && minPrice !== undefined) q = q.gte("price", minPrice);
  if (!Number.isNaN(maxPrice) && maxPrice !== undefined) q = q.lte("price", maxPrice);

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
        <h1 className="text-2xl font-semibold">Sales Dashboard</h1>
          <div className="flex items-center gap-4">
            <CommunityFilter communities={communities} />
            <div className="text-sm text-gray-600">
              Rows: <span className="font-medium">{data?.length ?? 0}</span>
            </div>
          </div>
      </div>

      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Community</th>
            <th className="p-2 border">Address</th>
            <th className="p-2 border">Price</th>
            <th className="p-2 border">Beds</th>
            <th className="p-2 border">Baths</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Last Scraped</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((row: any) => (
            <tr key={`${row.site}-${row.entity_key}`}>
              <td className="p-2 border">{row.community_name}</td>
              <td className="p-2 border">{row.address}</td>
              <td className="p-2 border">
                {row.price != null ? `$${Number(row.price).toLocaleString()}` : ""}
              </td>
              <td className="p-2 border">{row.beds}</td>
              <td className="p-2 border">{row.baths}</td>
              <td className="p-2 border">{row.status}</td>
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
