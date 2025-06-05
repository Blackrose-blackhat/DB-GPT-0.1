import { Card, CardContent } from "../ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import React from "react";
function ResultViewer({ result, summary }: { result: any; summary: string }) {
  if (!result) return null;
  return (
    <Card className="mt-4">
      <CardContent>
        {summary && <div className="mb-4 text-base text-gray-800">{summary}</div>}
        {Array.isArray(result) && result.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                {Object.keys(result[0]).map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.map((row: any, i: number) => (
                <TableRow key={i}>
                  {Object.keys(result[0]).map((key) => (
                    <TableCell key={key}>
                      {typeof row[key] === "object"
                        ? JSON.stringify(row[key], null, 2)
                        : row[key]?.toString()}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <pre className="text-sm whitespace-pre-wrap break-words">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}
export default ResultViewer;