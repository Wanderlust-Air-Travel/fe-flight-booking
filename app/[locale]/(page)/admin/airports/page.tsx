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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axiosInstance from "@/lib/axios-instance";
import type { Airport } from "@/types/admin/airport-type";
import { Building2, Pencil, Plus, Search, Trash2 } from "lucide-react";
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

export default function AirportsPage() {
  const t = useTranslations("admin.airports");
  const tCommon = useTranslations("common");
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAirport, setEditingAirport] = useState<Airport | null>(null);
  const [formData, setFormData] = useState({
    iataCode: "",
    icaoCode: "",
    name: "",
    city: "",
    country: "",
    timezone: "",
  });

  useEffect(() => {
    fetchAirports();
  }, []);

  const fetchAirports = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/admin/airports");
      const rawData = Array.isArray(response.data) ? response.data : response.data?.data || [];
      const transformed = transformKeysToCamelCase<Airport[]>(rawData);
      setAirports(transformed);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching airports:", err);
      setError(err.response?.data?.message || "Failed to load airports");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await axiosInstance.post("/api/admin/airports", {
        iataCode: formData.iataCode.toUpperCase(),
        icaoCode: formData.icaoCode ? formData.icaoCode.toUpperCase() : undefined,
        name: formData.name,
        city: formData.city,
        country: formData.country,
        timezone: formData.timezone,
      });
      setIsCreateDialogOpen(false);
      resetForm();
      fetchAirports();
    } catch (err: any) {
      console.error("Error creating airport:", err);
      setError(err.response?.data?.message || "Failed to create airport");
    }
  };

  const handleEdit = (airport: Airport) => {
    setEditingAirport(airport);
    setFormData({
      iataCode: airport.iataCode,
      icaoCode: airport.icaoCode || "",
      name: airport.name,
      city: airport.city,
      country: airport.country,
      timezone: airport.timezone,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingAirport) return;
    try {
      await axiosInstance.put(`/api/admin/airports/${editingAirport.airportId}`, {
        icaoCode: formData.icaoCode ? formData.icaoCode.toUpperCase() : undefined,
        name: formData.name,
        city: formData.city,
        country: formData.country,
        timezone: formData.timezone,
      });
      setIsEditDialogOpen(false);
      resetForm();
      fetchAirports();
    } catch (err: any) {
      console.error("Error updating airport:", err);
      setError(err.response?.data?.message || "Failed to update airport");
    }
  };

  const handleDelete = async (airportId: string) => {
    if (!confirm("Are you sure you want to delete this airport?")) return;
    try {
      await axiosInstance.delete(`/api/admin/airports/${airportId}`);
      fetchAirports();
    } catch (err: any) {
      console.error("Error deleting airport:", err);
      setError(err.response?.data?.message || "Failed to delete airport");
    }
  };

  const resetForm = () => {
    setFormData({
      iataCode: "",
      icaoCode: "",
      name: "",
      city: "",
      country: "",
      timezone: "",
    });
    setEditingAirport(null);
  };

  const filteredAirports = airports.filter(
    (airport) =>
      airport.iataCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      airport.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      airport.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                Airports Management
              </CardTitle>
              <CardDescription>Manage airport information and locations</CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Airport
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by IATA, name, or city..."
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
                  <TableHead>IATA</TableHead>
                  <TableHead>ICAO</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Timezone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAirports.map((airport) => (
                  <TableRow key={airport.airportId}>
                    <TableCell className="font-mono font-semibold">{airport.iataCode}</TableCell>
                    <TableCell className="font-mono text-gray-500">
                      {airport.icaoCode || "-"}
                    </TableCell>
                    <TableCell>{airport.name}</TableCell>
                    <TableCell>{airport.city}</TableCell>
                    <TableCell>{airport.country}</TableCell>
                    <TableCell className="text-sm text-gray-600">{airport.timezone}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(airport)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(airport.airportId)}
                      >
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
            <DialogTitle>Add New Airport</DialogTitle>
            <DialogDescription>Enter airport information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>IATA Code *</Label>
              <Input
                placeholder="SGN"
                value={formData.iataCode}
                onChange={(e) =>
                  setFormData({ ...formData, iataCode: e.target.value.toUpperCase() })
                }
                maxLength={3}
              />
            </div>
            <div>
              <Label>ICAO Code</Label>
              <Input
                placeholder="VVTS"
                value={formData.icaoCode}
                onChange={(e) =>
                  setFormData({ ...formData, icaoCode: e.target.value.toUpperCase() })
                }
                maxLength={4}
              />
            </div>
            <div>
              <Label>Name *</Label>
              <Input
                placeholder="Tan Son Nhat International Airport"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>City *</Label>
              <Input
                placeholder="Ho Chi Minh City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div>
              <Label>Country *</Label>
              <Input
                placeholder="Vietnam"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
            <div>
              <Label>Timezone *</Label>
              <Input
                placeholder="Asia/Ho_Chi_Minh"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
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
            <DialogTitle>Edit Airport</DialogTitle>
            <DialogDescription>Update airport information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>IATA Code (cannot change)</Label>
              <Input value={formData.iataCode} disabled />
            </div>
            <div>
              <Label>ICAO Code</Label>
              <Input
                value={formData.icaoCode}
                onChange={(e) =>
                  setFormData({ ...formData, icaoCode: e.target.value.toUpperCase() })
                }
                maxLength={4}
              />
            </div>
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>City *</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div>
              <Label>Country *</Label>
              <Input
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
            <div>
              <Label>Timezone *</Label>
              <Input
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
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
