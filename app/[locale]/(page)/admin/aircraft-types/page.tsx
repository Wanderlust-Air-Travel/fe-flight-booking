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
import type { AircraftType } from "@/types/admin/aircraft-type";
import { Pencil, Plane, Plus, Search, Trash2 } from "lucide-react";
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

export default function AircraftTypesPage() {
  const t = useTranslations("admin.aircraftTypes");
  const tCommon = useTranslations("common");
  const [aircraftTypes, setAircraftTypes] = useState<AircraftType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAircraftType, setEditingAircraftType] = useState<AircraftType | null>(null);
  const [formData, setFormData] = useState({
    typeCode: "",
    manufacturer: "",
    model: "",
    totalSeats: "",
  });

  useEffect(() => {
    fetchAircraftTypes();
  }, []);

  const fetchAircraftTypes = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/admin/aircraft-types");
      const rawData = Array.isArray(response.data) ? response.data : response.data?.data || [];
      const transformed = transformKeysToCamelCase<AircraftType[]>(rawData);
      setAircraftTypes(transformed);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching aircraft types:", err);
      setError(err.response?.data?.message || "Failed to load aircraft types");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await axiosInstance.post("/api/admin/aircraft-types", {
        typeCode: formData.typeCode.toUpperCase(),
        manufacturer: formData.manufacturer,
        model: formData.model,
        totalSeats: Number(formData.totalSeats),
      });
      setIsCreateDialogOpen(false);
      resetForm();
      fetchAircraftTypes();
    } catch (err: any) {
      console.error("Error creating aircraft type:", err);
      setError(err.response?.data?.message || "Failed to create aircraft type");
    }
  };

  const handleEdit = (aircraftType: AircraftType) => {
    setEditingAircraftType(aircraftType);
    setFormData({
      typeCode: aircraftType.typeCode,
      manufacturer: aircraftType.manufacturer,
      model: aircraftType.model,
      totalSeats: aircraftType.totalSeats.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingAircraftType) return;
    try {
      await axiosInstance.put(`/api/admin/aircraft-types/${editingAircraftType.aircraftTypeId}`, {
        manufacturer: formData.manufacturer,
        model: formData.model,
        totalSeats: Number(formData.totalSeats),
      });
      setIsEditDialogOpen(false);
      resetForm();
      fetchAircraftTypes();
    } catch (err: any) {
      console.error("Error updating aircraft type:", err);
      setError(err.response?.data?.message || "Failed to update aircraft type");
    }
  };

  const handleDelete = async (aircraftTypeId: string) => {
    if (!confirm("Are you sure you want to delete this aircraft type?")) return;
    try {
      await axiosInstance.delete(`/api/admin/aircraft-types/${aircraftTypeId}`);
      fetchAircraftTypes();
    } catch (err: any) {
      console.error("Error deleting aircraft type:", err);
      setError(err.response?.data?.message || "Failed to delete aircraft type");
    }
  };

  const resetForm = () => {
    setFormData({
      typeCode: "",
      manufacturer: "",
      model: "",
      totalSeats: "",
    });
    setEditingAircraftType(null);
  };

  const filteredAircraftTypes = aircraftTypes.filter(
    (type) =>
      type.typeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Plane className="h-6 w-6" />
                Aircraft Types Management
              </CardTitle>
              <CardDescription>Manage aircraft types and configurations</CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Aircraft Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by type code, manufacturer, or model..."
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
                  <TableHead>Type Code</TableHead>
                  <TableHead>Manufacturer</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Total Seats</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAircraftTypes.map((type) => (
                  <TableRow key={type.aircraftTypeId}>
                    <TableCell className="font-mono font-semibold">{type.typeCode}</TableCell>
                    <TableCell>{type.manufacturer}</TableCell>
                    <TableCell>{type.model}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                        {type.totalSeats} seats
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(type)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(type.aircraftTypeId)}
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
            <DialogTitle>Add New Aircraft Type</DialogTitle>
            <DialogDescription>Enter aircraft type information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Type Code *</Label>
              <Input
                placeholder="A320"
                value={formData.typeCode}
                onChange={(e) =>
                  setFormData({ ...formData, typeCode: e.target.value.toUpperCase() })
                }
              />
            </div>
            <div>
              <Label>Manufacturer *</Label>
              <Input
                placeholder="Airbus"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              />
            </div>
            <div>
              <Label>Model *</Label>
              <Input
                placeholder="A320neo"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
            <div>
              <Label>Total Seats *</Label>
              <Input
                type="number"
                placeholder="186"
                value={formData.totalSeats}
                onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
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
            <DialogTitle>Edit Aircraft Type</DialogTitle>
            <DialogDescription>Update aircraft type information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Type Code (cannot change)</Label>
              <Input value={formData.typeCode} disabled />
            </div>
            <div>
              <Label>Manufacturer *</Label>
              <Input
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              />
            </div>
            <div>
              <Label>Model *</Label>
              <Input
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
            <div>
              <Label>Total Seats *</Label>
              <Input
                type="number"
                value={formData.totalSeats}
                onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
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
