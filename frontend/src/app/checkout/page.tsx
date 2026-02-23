'use client';

import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Minus, CheckCircle, Package, Truck, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";

export default function CheckoutPage() {
    const { items, removeItem, updateQuantity, clearCart } = useCartStore();
    const router = useRouter();

    const total = items.reduce((sum, i) => sum + i.ptr * i.quantity, 0);
    const gst = total * 0.12; // Flat 12% for demo

    const handlePlaceOrder = async () => {
        try {
            const orderItems = items.map(i => ({
                distributorProductId: i.distributorProductId,
                quantity: i.quantity,
            }));

            await api.post('/orders', { items: orderItems });

            toast.success("Order Placed Successfully!");
            clearCart();
            router.push('/dashboard/retailer');
        } catch (error) {
            toast.error("Failed to place order. Please try again.");
        }
    };

    if (items.length === 0) {
        return (
            <div className="container mx-auto py-24 text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
                <p className="text-muted-foreground mb-8">Add components from the marketplace to place an order.</p>
                <Button onClick={() => router.push('/search')}>Browse Medicines</Button>
            </div>
        );
    }

    // Group by distributor
    const groups = items.reduce((acc, item) => {
        if (!acc[item.distributorName]) acc[item.distributorName] = [];
        acc[item.distributorName].push(item);
        return acc;
    }, {} as Record<string, typeof items>);

    return (
        <div className="container mx-auto py-12 px-4 max-w-5xl">
            <h1 className="text-3xl font-bold mb-8">Confirm Your Order</h1>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    {Object.entries(groups).map(([distName, distItems]) => (
                        <Card key={distName} className="border-primary/10">
                            <CardHeader className="bg-slate-50 py-3">
                                <CardTitle className="text-md font-semibold flex items-center">
                                    <Truck className="h-4 w-4 mr-2 text-primary" /> {distName}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {distItems.map((item) => (
                                    <div key={item.distributorProductId} className="flex items-center justify-between p-4 border-b last:border-0">
                                        <div className="flex-1">
                                            <h4 className="font-medium">{item.name}</h4>
                                            <p className="text-sm text-muted-foreground">₹ {item.ptr} / unit</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center border rounded-md">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => updateQuantity(item.distributorProductId, Math.max(1, item.quantity - 1))}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-8 text-center text-sm">{item.quantity}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => updateQuantity(item.distributorProductId, item.quantity + 1)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => removeItem(item.distributorProductId)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <div className="w-20 text-right font-semibold">
                                                ₹ {(item.ptr * item.quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="space-y-6">
                    <Card className="sticky top-24 shadow-lg border-2 border-primary/5">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal ({items.length} items)</span>
                                <span>₹ {total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>GST (12%)</span>
                                <span>₹ {gst.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-green-600 font-medium">
                                <span>Delivery</span>
                                <span>FREE</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-xl font-bold text-primary">
                                <span>Total Amount</span>
                                <span>₹ {(total + gst).toFixed(2)}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3">
                            <Button className="w-full h-12 text-lg" onClick={handlePlaceOrder}>
                                Place Order <CheckCircle className="ml-2 h-5 w-5" />
                            </Button>
                            <p className="text-[10px] text-center text-muted-foreground group">
                                By clicking, you agree to the marketplace terms. Payments will be handled via <span className="font-bold text-blue-600">Razorpay</span>.
                            </p>
                        </CardFooter>
                    </Card>

                    <Card className="bg-blue-50/50 border-none">
                        <CardContent className="p-4 flex gap-4">
                            <CreditCard className="h-5 w-5 text-primary shrink-0" />
                            <div className="text-xs">
                                <p className="font-bold mb-1">Credit Period Applicable</p>
                                <p className="text-muted-foreground">You are eligible for a 15-day credit period with Kerala Medicos Ltd.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
