"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import StatusBadge from "./status-badge";
import ConfirmButton from "./confirm-button";
import {
  deleteListing,
  duplicateListing,
  setListingStatus,
  bulkSetStatus,
  bulkDeleteListings,
} from "@/actions/listing-actions";

type Listing = {
  id: string;
  reference: string;
  title_en: string;
  status: string;
  price: number | null;
  governorate: string | null;
  wilayat: string | null;
  featured: boolean;
};

export default function BulkListingsTable({ listings }: { listings: Listing[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const allSelected = listings.length > 0 && selected.size === listings.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(listings.map((l) => l.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function runBulkStatus(status: string) {
    const ids = Array.from(selected);
    startTransition(async () => {
      await bulkSetStatus(ids, status);
      window.location.reload();
    });
  }

  function runBulkDelete() {
    if (!window.confirm(`Delete ${selected.size} listing(s)? This can't be undone.`)) return;
    const ids = Array.from(selected);
    startTransition(async () => {
      await bulkDeleteListings(ids);
      window.location.reload();
    });
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm">
          <span className="font-medium">{selected.size} selected</span>
          <button
            disabled={isPending}
            onClick={() => runBulkStatus("published")}
            className="text-emerald-700 hover:underline disabled:opacity-50"
          >
            Publish
          </button>
          <button
            disabled={isPending}
            onClick={() => runBulkStatus("reserved")}
            className="text-amber-700 hover:underline disabled:opacity-50"
          >
            Mark reserved
          </button>
          <button
            disabled={isPending}
            onClick={() => runBulkStatus("sold")}
            className="text-red-700 hover:underline disabled:opacity-50"
          >
            Mark sold
          </button>
          <button
            disabled={isPending}
            onClick={runBulkDelete}
            className="text-red-700 hover:underline disabled:opacity-50"
          >
            Delete
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-base-900/50 hover:underline">
            Clear selection
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-base-900/10">
        <table className="w-full text-sm">
          <thead className="bg-base-900/5 text-left">
            <tr>
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4" />
              </th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-base-900/50">
                  No listings yet.
                </td>
              </tr>
            )}
            {listings.map((listing) => (
              <tr key={listing.id} className="border-t border-base-900/10">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(listing.id)}
                    onChange={() => toggleOne(listing.id)}
                    className="h-4 w-4"
                  />
                </td>
                <td className="px-4 py-3 font-mono text-xs">{listing.reference}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/listings/${listing.id}/edit`} className="hover:underline">
                    {listing.title_en}
                  </Link>
                  {listing.featured && (
                    <span className="ml-2 rounded-full bg-gold/20 px-2 py-0.5 text-xs text-gold">★ Featured</span>
                  )}
                </td>
                <td className="px-4 py-3"><StatusBadge status={listing.status} /></td>
                <td className="px-4 py-3">{listing.price ? `OMR ${listing.price}` : "—"}</td>
                <td className="px-4 py-3">{listing.wilayat}, {listing.governorate}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {listing.status !== "published" && (
                      <form action={setListingStatus.bind(null, listing.id, "published")}>
                        <button className="text-xs text-emerald-700 hover:underline">Publish</button>
                      </form>
                    )}
                    {listing.status !== "reserved" && (
                      <form action={setListingStatus.bind(null, listing.id, "reserved")}>
                        <button className="text-xs text-amber-700 hover:underline">Mark reserved</button>
                      </form>
                    )}
                    {listing.status !== "sold" && (
                      <form action={setListingStatus.bind(null, listing.id, "sold")}>
                        <button className="text-xs text-red-700 hover:underline">Mark sold</button>
                      </form>
                    )}
                    <form action={duplicateListing.bind(null, listing.id)}>
                      <button className="text-xs text-base-900/60 hover:underline">Duplicate</button>
                    </form>
                    <form action={deleteListing.bind(null, listing.id)}>
                      <ConfirmButton
                        confirmMessage={`Delete "${listing.title_en}"? This can't be undone.`}
                        className="text-xs text-red-700 hover:underline"
                      >
                        Delete
                      </ConfirmButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
