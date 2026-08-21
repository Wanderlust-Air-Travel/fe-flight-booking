"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axiosInstance from "@/lib/axios-instance";
import type { Airport } from "@/types/admin/airport-type";
import type { Route } from "@/types/admin/route-type";
import { ArrowRight, Pencil, Plus, Route as RouteIcon, Search, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

function transformKeysToCamelCase<T>(obj: any): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map((item) => transformKeysToCamelCase(item)) as T;
  if (typeof obj === "object" && obj.constructor === Object) {
    const transformed: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const camelKey = key.replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
        transformed[camelKey] = transformKeysToCamelCase(obj[key]);
      }
    }
    return transformed as T;
  }
  return obj;
}

export default function RoutesPage() {
  const t = useTranslations("admin.routes");
  const tCommon = useTranslations("common");
  const [routes, setRoutes] = useState<Route[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAirports, setLoadingAirports] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [formData, setFormData] = useState({
    originAirportId: "",
    destinationAirportId: "",
    distance: "",
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    if (isCreateDialogOpen || isEditDialogOpen) {
      fetchAirports();
    }
  }, [isCreateDialogOpen, isEditDialogOpen]);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/admin/routes");
      const rawData = Array.isArray(response.data) ? response.data : response.data?.data || [];
      const transformed = transformKeysToCamelCase<Route[]>(rawData);
      setRoutes(transformed);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching routes:", err);
      setError(err.response?.data?.message || "Failed to load routes");
    } finally {
      setLoading(false);
    }
  };

  const fetchAirports = async () => {
    try {
      setLoadingAirports(true);
      const response = await axiosInstance.get("/api/admin/airports");
      const rawData = Array.isArray(response.data) ? response.data : response.data?.data || [];
      const transformed = transformKeysToCamelCase<Airport[]>(rawData);
      setAirports(transformed);
    } catch (err: any) {
      console.error("Error fetching airports:", err);
    } finally {
      setLoadingAirports(false);
    }
  };

  const handleCreate = async () => {
    if (formData.originAirportId === formData.destinationAirportId) {
      setError("Origin and destination airports must be different");
      return;
    }
    try {
      await axiosInstance.post("/api/admin/routes", {
        originAirportId: formData.originAirportId,
        destinationAirportId: formData.destinationAirportId,
        distance: formData.distance ? Number(formData.distance) : undefined,
      });
      setIsCreateDialogOpen(false);
      resetForm();
      fetchRoutes();
    } catch (err: any) {
      console.error("Error creating route:", err);
      setError(err.response?.data?.message || "Failed to create route");
    }
  };

  const handleEdit = (route: Route) => {
    setEditingRoute(route);
    setFormData({
      originAirportId: route.originAirportId,
      destinationAirportId: route.destinationAirportId,
      distance: route.distance?.toString() || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingRoute) return;
    try {
      await axiosInstance.put(`/api/admin/routes/${editingRoute.routeId}`, {
        distance: formData.distance ? Number(formData.distance) : undefined,
      });
      setIsEditDialogOpen(false);
      resetForm();
      fetchRoutes();
    } catch (err: any) {
      console.error("Error updating route:", err);
      setError(err.response?.data?.message || "Failed to update route");
    }
  };

  const handleDelete = async (routeId: string) => {
    if (!confirm("Are you sure you want to delete this route?")) return;
    try {
      await axiosInstance.delete(`/api/admin/routes/${routeId}`);
      fetchRoutes();
    } catch (err: any) {
      console.error("Error deleting route:", err);
      setError(err.response?.data?.message || "Failed to delete route");
    }
  };

  const resetForm = () => {
    setFormData({
      originAirportId: "",
      destinationAirportId: "",
      distance: "",
    });
    setEditingRoute(null);
  };

  const filteredRoutes = routes.filter(
    (route) =>
      route.originAirport?.iataCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.destinationAirport?.iataCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.originAirport?.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.destinationAirport?.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <RouteIcon className="h-6 w-6" />
                Routes Management
              </CardTitle>
              <CardDescription>Manage flight routes and distances</CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Route
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by airport code or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Origin</TableHead>
                  <TableHead className="text-center">→</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Distance (km)</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoutes.map((route) => (
                  <TableRow key={route.routeId}>
                    <TableCell>
                      <div className="font-semibold">{route.originAirport?.iataCode}</div>
                      <div className="text-sm text-gray-500">{route.originAirport?.city}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <ArrowRight className="h-4 w-4 inline text-gray-400" />
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">{route.destinationAirport?.iataCode}</div>
                      <div className="text-sm text-gray-500">{route.destinationAirport?.city}</div>
                    </TableCell>
                    <TableCell>{route.distance || "-"}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          route.isDomestic
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {route.isDomestic ? "Domestic" : "International"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(route)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(route.routeId)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Route</DialogTitle>
            <DialogDescription>Define a new flight route</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Origin Airport *</Label>
              <Select
                value={formData.originAirportId}
                onValueChange={(value) => setFormData({ ...formData, originAirportId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select origin airport" />
                </SelectTrigger>
                <SelectContent>
                  {airports.map((airport) => (
                    <SelectItem key={airport.airportId} value={airport.airportId}>
                      {airport.iataCode} · {airport.city} · {airport.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Destination Airport *</Label>
              <Select
                value={formData.destinationAirportId}
                onValueChange={(value) => setFormData({ ...formData, destinationAirportId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination airport" />
                </SelectTrigger>
                <SelectContent>
                  {airports.map((airport) => (
                    <SelectItem key={airport.airportId} value={airport.airportId}>
                      {airport.iataCode} · {airport.city} · {airport.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Distance (km)</Label>
              <Input
                type="number"
                placeholder="1200"
                value={formData.distance}
                onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Route</DialogTitle>
            <DialogDescription>Update route distance</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Origin (cannot change)</Label>
              <Input value={editingRoute?.originAirport?.iataCode} disabled />
            </div>
            <div>
              <Label>Destination (cannot change)</Label>
              <Input value={editingRoute?.destinationAirport?.iataCode} disabled />
            </div>
            <div>
              <Label>Distance (km)</Label>
              <Input
                type="number"
                value={formData.distance}
                onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
