"use client";

import { DataTablePagination } from "@/components/TablePagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export type Participant = {
  id: string;
  name: string;
  role: string;
};

const mockParticipants: Participant[] = [
  {
    id: "part-1",
    name: "Alice Smith",
    role: "Cyber Analyst",
  },
  {
    id: "part-2",
    name: "Bob Johnson",
    role: "Network Engineer",
  },
  {
    id: "part-3",
    name: "Charlie Brown",
    role: "Incident Manager",
  },
  {
    id: "part-4",
    name: "David Green",
    role: "Security Consultant",
  },
  {
    id: "part-5",
    name: "Eve Adams",
    role: "Penetration Tester",
  },
  {
    id: "part-6",
    name: "Frank White",
    role: "Compliance Officer",
  },
];

const columns: ColumnDef<Participant>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0"
        >
          Nom
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <Link
        href={`/simulation/participants/${row.original.id}`}
        className="hover:underline font-medium"
      >
        {row.getValue("name")}
      </Link>
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0"
        >
          Rôle
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const participant = row.original;
      const handleDelete = (participantId: string) => {
        alert(`Supprimer le participant avec l'ID : ${participantId}`);
      };
      return (
        <div className="flex space-x-2">
          <Button asChild size="sm" variant="ghost">
            <Link href={`/simulation/participants/${participant.id}/edit`}>
              Éditer
            </Link>
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDelete(participant.id)}
          >
            Supprimer
          </Button>
        </div>
      );
    },
  },
];

export default function ParticipantsPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data: mockParticipants,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <h1 className="text-2xl font-bold">Gestion des Participants</h1>
        <Button asChild>
          <Link href="/simulation/participants/create">
            Ajouter un participant
          </Link>
        </Button>
      </div>
      <Card className="p-6">
        <div className="flex items-center py-4">
          <Input
            placeholder="Filtrer les participants..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
        </div>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Aucun résultat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="py-4">
          <DataTablePagination table={table} />
        </div>
      </Card>
    </div>
  );
}
