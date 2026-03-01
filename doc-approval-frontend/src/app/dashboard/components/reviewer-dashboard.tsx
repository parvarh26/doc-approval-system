"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

export type ReviewDocumentData = {
    id: number;
    title: string;
    filename: string;
    status: string;
    createdAt: string;
    uploadedBy?: { email: string };
};

export default function ReviewerDashboard() {
    const queryClient = useQueryClient();

    const { data: documents, isLoading, refetch } = useQuery({
        queryKey: ["pending-documents"],
        queryFn: () => fetchApi<ReviewDocumentData[]>("/documents/pending"),
    });

    const reviewMutation = useMutation({
        mutationFn: async ({ id, status }: { id: number, status: "APPROVED" | "REJECTED" }) => {
            // Intentionally waiting a bit for UI feels
            await new Promise(r => setTimeout(r, 600));
            return fetchApi(`/documents/${id}/review`, {
                method: "PUT",
                body: JSON.stringify({ status }),
            });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["pending-documents"] });
            toast.success(`Document has been ${variables.status.toLowerCase()}`);
        },
        onError: (error: unknown) => {
            toast.error((error as Error).message || "Failed to submit review");
        },
    });

    return (
        <Card className="border-border shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50 mb-4">
                <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Clock className="h-5 w-5 text-accent" /> Pending Approvals
                    </CardTitle>
                    <CardDescription>
                        Documents submitted by users requiring your review.
                    </CardDescription>
                </div>
                <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center p-12 text-muted-foreground animate-pulse">
                        Loading queue...
                    </div>
                ) : !documents || documents.length === 0 ? (
                    <div className="text-center p-16 border border-dashed border-border rounded-xl bg-secondary/10">
                        <CheckCircle className="h-12 w-12 mx-auto text-emerald-500/60 mb-4 opacity-70" />
                        <h3 className="text-xl font-medium">All caught up!</h3>
                        <p className="text-muted-foreground mt-1">There are no pending documents in the queue.</p>
                    </div>
                ) : (
                    <div className="rounded-lg border border-border overflow-hidden shadow-inner">
                        <Table>
                            <TableHeader className="bg-secondary/40">
                                <TableRow>
                                    <TableHead>Document Details</TableHead>
                                    <TableHead>Uploader</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents.map((doc) => {
                                    const isProcessing = reviewMutation.isPending && reviewMutation.variables?.id === doc.id;

                                    return (
                                        <TableRow key={doc.id} className="hover:bg-muted/30 transition-colors">
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span className="text-base">{doc.title}</span>
                                                    <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={doc.filename}>
                                                        {doc.filename}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-normal text-muted-foreground">
                                                    {doc.uploadedBy?.email || "Unknown"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(doc.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-amber-500 border-amber-500/50">
                                                    {doc.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="bg-emerald-500 text-white hover:bg-emerald-600 px-4"
                                                        onClick={() => reviewMutation.mutate({ id: doc.id, status: "APPROVED" })}
                                                        disabled={isProcessing}
                                                    >
                                                        {isProcessing && reviewMutation.variables?.status === "APPROVED" ? (
                                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                        ) : (
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                        )}
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => reviewMutation.mutate({ id: doc.id, status: "REJECTED" })}
                                                        disabled={isProcessing}
                                                    >
                                                        {isProcessing && reviewMutation.variables?.status === "REJECTED" ? (
                                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                        ) : (
                                                            <XCircle className="h-4 w-4 mr-2" />
                                                        )}
                                                        Reject
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
