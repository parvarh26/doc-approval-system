"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { UploadCloud, File, Download, RefreshCw } from "lucide-react";

export type DocumentData = {
    id: number;
    title: string;
    filename: string;
    status: string;
    createdAt: string;
};

export default function UserDashboard() {
    const queryClient = useQueryClient();
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");

    const { data: documents, isLoading, refetch } = useQuery({
        queryKey: ["my-documents"],
        queryFn: () => fetchApi<DocumentData[]>("/documents/my"),
    });

    const uploadMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/documents/upload`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });
            if (!res.ok) throw new Error("Failed to upload document");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-documents"] });
            toast.success("Document uploaded successfully");
            setFile(null);
            setTitle("");
            // reset file input visually
            const fileInput = document.getElementById("file-upload") as HTMLInputElement;
            if (fileInput) fileInput.value = "";
        },
        onError: (error: unknown) => {
            toast.error((error as Error).message || "Upload failed");
        },
    });

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !title) {
            toast.error("Please provide a title and select a PDF file.");
            return;
        }
        const formData = new FormData();
        formData.append("title", title);
        formData.append("file", file);
        uploadMutation.mutate(formData);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "APPROVED":
                return <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">Approved</Badge>;
            case "REJECTED":
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="outline" className="text-amber-500 border-amber-500/50">Pending</Badge>;
        }
    };

    const handleDownload = async (id: number, filename: string) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/documents/${id}/download`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to download");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `STAMPED_${filename}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch {
            toast.error("Could not download the file");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Section */}
            <Card className="lg:col-span-1 border-border shadow-md h-fit">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UploadCloud className="h-5 w-5 text-accent" /> Upload Document
                    </CardTitle>
                    <CardDescription>
                        Submit a new PDF document for approval.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Document Title</label>
                            <Input
                                placeholder="Enter title (e.g., Q1 Financial Report)"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                disabled={uploadMutation.isPending}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">PDF File</label>
                            <Input
                                id="file-upload"
                                type="file"
                                accept="application/pdf"
                                onChange={e => setFile(e.target.files?.[0] || null)}
                                disabled={uploadMutation.isPending}
                                className="file:bg-secondary file:text-secondary-foreground file:border-0 file:mr-4 file:px-4 file:py-2 file:rounded-md file:text-sm file:font-medium hover:file:bg-secondary/80"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={uploadMutation.isPending || !file || !title}
                        >
                            {uploadMutation.isPending ? "Uploading..." : "Submit for Approval"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Documents List */}
            <Card className="lg:col-span-2 border-border shadow-md">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>My Documents</CardTitle>
                        <CardDescription>Track the status of your uploaded files.</CardDescription>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8 text-muted-foreground animate-pulse">
                            Loading documents...
                        </div>
                    ) : !documents || documents.length === 0 ? (
                        <div className="text-center p-8 border border-dashed border-border rounded-lg bg-secondary/20">
                            <File className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                            <h3 className="text-lg font-medium">No documents yet</h3>
                            <p className="text-sm text-muted-foreground">Upload your first document to see it here.</p>
                        </div>
                    ) : (
                        <div className="rounded-md border border-border overflow-hidden">
                            <Table>
                                <TableHeader className="bg-secondary/50">
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Date Uploaded</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {documents.map((doc) => (
                                        <TableRow key={doc.id} className="hover:bg-muted/50 transition-colors">
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <File className="h-4 w-4 text-muted-foreground" />
                                                    {doc.title}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {new Date(doc.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(doc.status)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {doc.status === "APPROVED" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-primary hover:text-accent hover:bg-accent/10"
                                                        onClick={() => handleDownload(doc.id, doc.filename)}
                                                    >
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
