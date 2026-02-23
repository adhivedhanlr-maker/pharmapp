'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
    Search,
    ShoppingCart,
    Mic,
    Maximize,
    Filter,
    MapPin,
    ChevronRight,
    Zap,
    Clock,
    ArrowUpDown,
    Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";

export default function EnterpriseSearchPage() {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const addItem = useCartStore((state) => state.addItem);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 200);
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const initialQuery = new URLSearchParams(window.location.search).get("q");
        if (initialQuery) {
            setQuery(initialQuery);
        }
    }, []);

    const { data: results, isLoading } = useQuery({
        queryKey: ['search', debouncedQuery],
        queryFn: async () => {
            if (!debouncedQuery) return [];
            const res = await api.get(`/inventory/search/marketplace?query=${debouncedQuery}`);
            return res.data;
        },
        enabled: debouncedQuery.length > 1,
    });

    const handleAddToCart = (item: any) => {
        addItem({
            distributorProductId: item.id,
            productId: item.product.id,
            name: item.product.name,
            ptr: item.ptr,
            quantity: 1,
            distributorId: item.distributorId,
            distributorName: item.distributor.companyName,
        });
        toast.success(`${item.product.name} added to cart`);
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <div className="bg-white border-b sticky top-0 z-40 py-6 px-4 shadow-sm">
                <div className="container mx-auto max-w-7xl">
                    <div className="relative max-w-3xl mx-auto group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-6 w-6 text-primary group-focus-within:text-secondary transition-colors" />
                        </div>
                        <Input
                            placeholder="Search 500,000+ medicines, generics or companies..."
                            className="pl-12 pr-24 h-16 text-xl rounded-2xl border-2 border-primary/10 shadow-lg focus-visible:ring-secondary focus-visible:border-secondary transition-all"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                                <Mic className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                                <Maximize className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-center gap-6 mt-4 overflow-x-auto pb-2">
                        <Badge variant="secondary" className="px-3 py-1 cursor-pointer hover:bg-primary/10 transition-colors">
                            <Zap className="h-3 w-3 mr-1 text-orange-500" /> Fast Moving
                        </Badge>
                        <Badge variant="secondary" className="px-3 py-1 cursor-pointer hover:bg-primary/10 transition-colors">
                            <MapPin className="h-3 w-3 mr-1 text-primary" /> Near Me
                        </Badge>
                        <Badge variant="secondary" className="px-3 py-1 cursor-pointer hover:bg-primary/10 transition-colors">
                            <Clock className="h-3 w-3 mr-1 text-green-500" /> Long Expiry
                        </Badge>
                        <Badge variant="secondary" className="px-3 py-1 cursor-pointer hover:bg-primary/10 transition-colors">
                            <ArrowUpDown className="h-3 w-3 mr-1 text-secondary" /> Lowest Price
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-4 py-8 flex gap-8">
                <aside className="w-64 shrink-0 hidden lg:block space-y-8">
                    <div>
                        <h3 className="font-bold flex items-center mb-4"><Filter className="h-4 w-4 mr-2" /> Filters</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-medium">District</label>
                                <div className="mt-2 space-y-2">
                                    {['Ernakulam', 'Kozhikode', 'Trivandrum', 'Thrissur'].map(d => (
                                        <div key={d} className="flex items-center gap-2">
                                            <Checkbox id={d} />
                                            <label htmlFor={d} className="text-sm">{d}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Price Range (PTR)</label>
                                <Slider defaultValue={[0, 1000]} max={5000} step={100} className="mt-4" />
                                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                                    <span>Rs 0</span>
                                    <span>Rs 5000+</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">GST (%)</label>
                                <div className="mt-2 flex gap-2">
                                    <Badge variant="outline" className="cursor-pointer">5%</Badge>
                                    <Badge variant="outline" className="cursor-pointer hover:bg-primary/5">12%</Badge>
                                    <Badge variant="outline" className="cursor-pointer">18%</Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                <section className="flex-1">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold">
                            {isLoading ? "Searching..." : `${results?.length || 0} Products Found`}
                        </h2>
                        <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                            Sort by: <span className="text-primary cursor-pointer border-b border-primary">Best Match</span>
                            <span className="cursor-pointer hover:text-primary transition-colors">Price</span>
                            <span className="cursor-pointer hover:text-primary transition-colors">Stock</span>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {results?.map((item: any) => (
                            <Card key={item.id} className="group hover:shadow-xl hover:border-primary/20 transition-all border-slate-200">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                                                    {item.product.name}
                                                </CardTitle>
                                                <Badge variant="outline" className="text-[10px] h-5">{item.product.form}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                                                Generic: {item.product.genericName}
                                            </p>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 pt-2 font-medium">
                                                <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> Dist: {item.distributor.companyName}</span>
                                                <span className="flex items-center"><ChevronRight className="h-3 w-3 mr-1" /> Area: {item.distributor.district}</span>
                                                <span className="flex items-center text-blue-600 font-bold underline decoration-dotted">15 Day Credit</span>
                                            </div>
                                        </div>

                                        <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 shrink-0 bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-xl">
                                            <div className="text-right">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-3xl font-black text-primary">Rs {item.ptr}</span>
                                                    <span className="text-sm text-muted-foreground line-through">MRP Rs {item.mrp}</span>
                                                </div>
                                                <p className="text-[10px] text-green-600 font-bold uppercase">Margin: {Math.round((item.mrp - item.ptr) / item.mrp * 100)}%</p>
                                            </div>

                                            <div className="text-right flex flex-col items-end">
                                                <Badge variant={item.stock > 100 ? "default" : "destructive"} className="mb-1 text-[10px]">
                                                    {item.stock > 100 ? `Stock: ${item.stock}` : `Only ${item.stock} left`}
                                                </Badge>
                                                <span className="text-[10px] text-muted-foreground font-bold">Expiry: {new Date(item.expiry).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                                            </div>
                                        </div>

                                        <div className="w-full sm:w-auto shrink-0 flex gap-2">
                                            <Button variant="outline" className="flex-1 py-6"><Info className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Details</span></Button>
                                            <Button className="flex-1 py-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" onClick={() => handleAddToCart(item)}>
                                                <ShoppingCart className="h-4 w-4 mr-2" /> Add
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {!isLoading && results?.length === 0 && query.length > 1 && (
                            <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                                <Search className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                                <h3 className="text-xl font-bold">No exact matches found</h3>
                                <p className="text-muted-foreground">Try generic names or check spelling.</p>
                                <Button variant="link" className="mt-4" onClick={() => setQuery("")}>Clear search</Button>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
