import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";

export default function AdminOptions() {
  const { toast } = useToast();
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [banks, setBanks] = useState<string[]>([]);
  const [workingHours, setWorkingHours] = useState<string[]>([]);
  const [newBank, setNewBank] = useState<string>("");
  const [newHour, setNewHour] = useState<string>("");
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Load countries
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/countries");
        const data = await res.json();
        setCountries(data.countries || []);
        if (!selectedCountry && data.countries?.length) {
          setSelectedCountry(data.countries[0]);
        }
      } catch (error) {
        toast({ title: "Error", description: "Gagal memuat negara", variant: "destructive" });
      }
    })();
  }, []);

  // Load options when country changes
  useEffect(() => {
    if (!selectedCountry) return;
    (async () => {
      try {
        setLoadingOptions(true);
        const res = await fetch(`/api/options?country=${encodeURIComponent(selectedCountry)}`);
        const data = await res.json();
        setBanks(data.bankOptions || []);
        setWorkingHours(data.workingHoursOptions || []);
      } catch (error) {
        toast({ title: "Error", description: "Gagal memuat opsi", variant: "destructive" });
      } finally {
        setLoadingOptions(false);
      }
    })();
  }, [selectedCountry]);

  const handleAddBank = async () => {
    if (!selectedCountry || !newBank.trim()) return;
    try {
      const res = await apiRequest("POST", `/api/admin/options/banks?country=${encodeURIComponent(selectedCountry)}`, { name: newBank.trim() });
      const data = await res.json();
      setBanks(data.banks || []);
      setNewBank("");
      toast({ title: "Berhasil", description: "Bank ditambahkan" });
    } catch (error) {
      toast({ title: "Error", description: "Gagal menambah bank", variant: "destructive" });
    }
  };

  const handleRemoveBank = async (name: string) => {
    if (!selectedCountry) return;
    try {
      const res = await apiRequest("DELETE", `/api/admin/options/banks?country=${encodeURIComponent(selectedCountry)}`, { name });
      const data = await res.json();
      setBanks(data.banks || []);
      toast({ title: "Berhasil", description: "Bank dihapus" });
    } catch (error) {
      toast({ title: "Error", description: "Gagal menghapus bank", variant: "destructive" });
    }
  };

  const handleAddHour = async () => {
    if (!selectedCountry || !newHour.trim()) return;
    try {
      const res = await apiRequest("POST", `/api/admin/options/working-hours?country=${encodeURIComponent(selectedCountry)}`, { value: newHour.trim() });
      const data = await res.json();
      setWorkingHours(data.workingHours || []);
      setNewHour("");
      toast({ title: "Berhasil", description: "Jam kerja ditambahkan" });
    } catch (error) {
      toast({ title: "Error", description: "Gagal menambah jam kerja", variant: "destructive" });
    }
  };

  const handleRemoveHour = async (value: string) => {
    if (!selectedCountry) return;
    try {
      const res = await apiRequest("DELETE", `/api/admin/options/working-hours?country=${encodeURIComponent(selectedCountry)}`, { value });
      const data = await res.json();
      setWorkingHours(data.workingHours || []);
      toast({ title: "Berhasil", description: "Jam kerja dihapus" });
    } catch (error) {
      toast({ title: "Error", description: "Gagal menghapus jam kerja", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Admin Options</h1>

        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Pilih Negara</label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Pilih negara" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Bank</h2>
              <div className="flex gap-2">
                <Input
                  value={newBank}
                  onChange={(e) => setNewBank(e.target.value)}
                  placeholder="Nama bank baru"
                  className="h-12"
                  disabled={!selectedCountry}
                />
                <Button onClick={handleAddBank} className="h-12" disabled={!selectedCountry || !newBank.trim()}>
                  Tambah
                </Button>
              </div>
              <div className="space-y-2">
                {loadingOptions ? (
                  <p className="text-sm text-muted-foreground">Memuat opsi…</p>
                ) : banks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum ada bank</p>
                ) : (
                  banks.map((b) => (
                    <div key={b} className="flex items-center justify-between rounded border p-2">
                      <span className="text-sm">{b}</span>
                      <Button variant="destructive" size="sm" onClick={() => handleRemoveBank(b)}>
                        Hapus
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Jam Kerja</h2>
              <div className="flex gap-2">
                <Input
                  value={newHour}
                  onChange={(e) => setNewHour(e.target.value)}
                  placeholder="cth: 08:00-17:00"
                  className="h-12"
                  disabled={!selectedCountry}
                />
                <Button onClick={handleAddHour} className="h-12" disabled={!selectedCountry || !newHour.trim()}>
                  Tambah
                </Button>
              </div>
              <div className="space-y-2">
                {loadingOptions ? (
                  <p className="text-sm text-muted-foreground">Memuat opsi…</p>
                ) : workingHours.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum ada jam kerja</p>
                ) : (
                  workingHours.map((h) => (
                    <div key={h} className="flex items-center justify-between rounded border p-2">
                      <span className="text-sm">{h}</span>
                      <Button variant="destructive" size="sm" onClick={() => handleRemoveHour(h)}>
                        Hapus
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}