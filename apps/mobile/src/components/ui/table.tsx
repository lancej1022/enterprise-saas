import * as React from "react";
import * as TablePrimitive from "@rn-primitives/table";

import { TextClassContext } from "#/components/ui/text";
import { cn } from "#/lib/utils";

function Table({
  className,
  ...props
}: TablePrimitive.RootProps & {
  ref?: React.RefObject<TablePrimitive.RootRef>;
}) {
  return (
    <TablePrimitive.Root
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  );
}

function TableHeader({
  className,
  ...props
}: TablePrimitive.HeaderProps & {
  ref?: React.RefObject<TablePrimitive.HeaderRef>;
}) {
  return (
    <TablePrimitive.Header
      className={cn("border-border [&_tr]:border-b", className)}
      {...props}
    />
  );
}

function TableBody({
  className,
  style,
  ...props
}: TablePrimitive.BodyProps & {
  ref?: React.RefObject<TablePrimitive.BodyRef>;
}) {
  return (
    <TablePrimitive.Body
      className={cn(
        "border-border flex-1 [&_tr:last-child]:border-0",
        className,
      )}
      style={[{ minHeight: 2 }, style]}
      {...props}
    />
  );
}

function TableFooter({
  className,
  ...props
}: TablePrimitive.FooterProps & {
  ref?: React.RefObject<TablePrimitive.FooterRef>;
}) {
  return (
    <TablePrimitive.Footer
      className={cn(
        "bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableRow({
  className,
  ...props
}: TablePrimitive.RowProps & {
  ref?: React.RefObject<TablePrimitive.RowRef>;
}) {
  return (
    <TablePrimitive.Row
      className={cn(
        "web:transition-colors web:hover:bg-muted/50 web:data-[state=selected]:bg-muted border-border flex-row border-b",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({
  className,
  ...props
}: TablePrimitive.HeadProps & {
  ref?: React.RefObject<TablePrimitive.HeadRef>;
}) {
  return (
    <TextClassContext.Provider value="text-muted-foreground">
      <TablePrimitive.Head
        className={cn(
          "h-12 justify-center px-4 text-left font-medium [&:has([role=checkbox])]:pr-0",
          className,
        )}
        {...props}
      />
    </TextClassContext.Provider>
  );
}

function TableCell({
  className,
  ...props
}: TablePrimitive.CellProps & {
  ref?: React.RefObject<TablePrimitive.CellRef>;
}) {
  return (
    <TablePrimitive.Cell
      className={cn(
        "p-4 align-middle [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  );
}

export {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
};
